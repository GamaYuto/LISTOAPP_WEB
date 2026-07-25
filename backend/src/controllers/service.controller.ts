import { Request, Response } from 'express';
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

    if (!title || !description || !category || priceSuggested === undefined) {
      res.status(400).json({ message: 'Missing required fields' });
      return;
    }

    const serviceRequest = await prisma.serviceRequest.create({
      data: {
        title,
        description,
        category,
        priceSuggested: parseFloat(priceSuggested),
        clientId: user.id
      }
    });

    res.status(201).json({
      message: 'Service request created successfully',
      serviceRequest
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
          select: { id: true, email: true }
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
        offers: {
          include: {
            provider: { select: { id: true, email: true } }
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
