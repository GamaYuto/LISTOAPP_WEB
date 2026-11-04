import { Response } from 'express';
import { Role, ServiceStatus } from '../types/enums';
import { AuthRequest } from '../middlewares/auth.middleware';

import { prisma } from '../lib/prisma';

export const createServiceRequest = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user;

    // Ensure the user has CLIENT role
    if (!user || user.role !== Role.CLIENT) {
      res.status(403).json({ message: 'Forbidden: Only clients can create service requests.' });
      return;
    }

    const { title, description, category, priceSuggested } = req.body;

    // Validate inputs
    if (!title || !description || !category || priceSuggested === undefined) {
      res.status(400).json({ message: 'All fields are required' });
      return;
    }

    const newRequest = await prisma.serviceRequest.create({
      data: {
        clientId: user.id,
        title,
        description,
        category,
        priceSuggested: parseFloat(priceSuggested),
        status: ServiceStatus.PENDING,
      },
    });

    res.status(201).json({
      message: 'Service request created successfully',
      serviceRequest: newRequest,
    });
  } catch (error) {
    console.error('Error in createServiceRequest:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getPendingServices = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const services = await prisma.serviceRequest.findMany({
      where: { status: ServiceStatus.PENDING },
      include: {
        client: {
          select: { id: true, email: true, firstName: true, lastName: true, phone: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json(services);
  } catch (error) {
    console.error('Error in getPendingServices:', error);
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
        provider: { select: { id: true, email: true, firstName: true, lastName: true, phone: true, rating: true } },
        offers: {
          include: {
            provider: { select: { id: true, email: true, firstName: true, lastName: true, phone: true, rating: true } }
          },
          orderBy: { createdAt: 'desc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json(requests);
  } catch (error) {
    console.error('Error in getMyRequests:', error);
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
        client: { select: { id: true, email: true, firstName: true, lastName: true, phone: true } },
        offers: {
          where: { providerId: user.id, status: 'ACCEPTED' }
        }
      },
      orderBy: { updatedAt: 'desc' }
    });

    res.status(200).json(jobs);
  } catch (error) {
    console.error('Error in getMyJobs:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateServiceStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user;
    const id = req.params.id as string;
    const { status } = req.body;

    const validStatuses = [ServiceStatus.ACCEPTED, ServiceStatus.IN_PROGRESS, ServiceStatus.COMPLETED];
    if (!status || !validStatuses.includes(status)) {
      res.status(400).json({ message: 'Invalid status provided.' });
      return;
    }

    const service = await prisma.serviceRequest.findUnique({
      where: { id }
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
      data: { status }
    });

    res.status(200).json(updated);
  } catch (error) {
    console.error('Error in updateServiceStatus:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
