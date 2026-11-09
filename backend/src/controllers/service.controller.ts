import { Response } from 'express';
import { Role, ServiceStatus, OfferStatus } from '../types/enums';
import { AuthRequest } from '../middlewares/auth.middleware';
import { prisma } from '../lib/prisma';

interface CreateServiceRequestBody {
  title?: string;
  description?: string;
  category?: string;
  priceSuggested?: number | string;
}

interface UpdateServiceStatusBody {
  status?: string;
}

export const createServiceRequest = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user;

    if (!user || user.role !== Role.CLIENT) {
      res.status(403).json({ message: 'Forbidden: Only clients can create service requests.' });
      return;
    }

    const { title, description, category, priceSuggested }: CreateServiceRequestBody = req.body;

    if (!title || !description || !category || priceSuggested === undefined) {
      res.status(400).json({ message: 'title, description, category y priceSuggested son requeridos.' });
      return;
    }

    const numericPrice = parseFloat(String(priceSuggested));
    if (isNaN(numericPrice) || numericPrice <= 0) {
      res.status(400).json({ message: 'El presupuesto sugerido debe ser un número positivo.' });
      return;
    }

    const newRequest = await prisma.serviceRequest.create({
      data: {
        clientId: user.id,
        title: title.trim(),
        description: description.trim(),
        category: category.trim(),
        priceSuggested: numericPrice,
        status: ServiceStatus.PENDING,
      },
    });

    res.status(201).json({
      message: 'Service request created successfully',
      serviceRequest: newRequest,
    });
  } catch (error) {
    const err = error as Error;
    console.error('Error in createServiceRequest:', err.message);
    res.status(500).json({ message: 'Internal server error', details: err.message });
  }
};

export const getPendingServices = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const services = await prisma.serviceRequest.findMany({
      where: { status: ServiceStatus.PENDING },
      include: {
        client: {
          select: {
            id: true,
            email: true,
            fullName: true,
            firstName: true,
            lastName: true,
            phone: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json(services);
  } catch (error) {
    const err = error as Error;
    console.error('Error in getPendingServices:', err.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getMyRequests = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user;

    if (!user || user.role !== Role.CLIENT) {
      res.status(403).json({ message: 'Forbidden: Only clients can view their requests.' });
      return;
    }

    const requests = await prisma.serviceRequest.findMany({
      where: { clientId: user.id },
      include: {
        provider: {
          select: {
            id: true,
            email: true,
            fullName: true,
            firstName: true,
            lastName: true,
            phone: true,
            rating: true,
            avatarUrl: true,
            isVerified: true,
          },
        },
        offers: {
          include: {
            provider: {
              select: {
                id: true,
                fullName: true,
                phone: true,
                email: true,
                avatarUrl: true,
                isVerified: true,
                rating: true,
                experiences: {
                  orderBy: { createdAt: 'desc' },
                },
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json(requests);
  } catch (error) {
    const err = error as Error;
    console.error('Error in getMyRequests:', err.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getMyJobs = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user;

    if (!user || user.role !== Role.PROVIDER) {
      res.status(403).json({ message: 'Forbidden: Only providers can view their jobs.' });
      return;
    }

    const jobs = await prisma.serviceRequest.findMany({
      where: { providerId: user.id },
      include: {
        client: {
          select: {
            id: true,
            email: true,
            fullName: true,
            firstName: true,
            lastName: true,
            phone: true,
            avatarUrl: true,
          },
        },
        offers: {
          where: { providerId: user.id, status: OfferStatus.ACCEPTED },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    res.status(200).json(jobs);
  } catch (error) {
    const err = error as Error;
    console.error('Error in getMyJobs:', err.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateServiceStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user;
    const id = req.params.id as string;
    const { status }: UpdateServiceStatusBody = req.body;

    const validStatuses: string[] = [
      ServiceStatus.ACCEPTED,
      ServiceStatus.IN_PROGRESS,
      ServiceStatus.COMPLETED,
      ServiceStatus.CANCELLED,
    ];
    if (!status || !validStatuses.includes(status)) {
      res.status(400).json({ message: 'Invalid status provided.' });
      return;
    }

    const service = await prisma.serviceRequest.findUnique({
      where: { id },
    });

    if (!service) {
      res.status(404).json({ message: 'Service request not found.' });
      return;
    }

    if (service.providerId !== user?.id && service.clientId !== user?.id) {
      res.status(403).json({ message: 'Forbidden: You cannot modify this service request.' });
      return;
    }

    const updated = await prisma.serviceRequest.update({
      where: { id },
      data: { status },
    });

    res.status(200).json(updated);
  } catch (error) {
    const err = error as Error;
    console.error('Error in updateServiceStatus:', err.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};
