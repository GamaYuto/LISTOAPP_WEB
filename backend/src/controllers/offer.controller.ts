import { Response } from 'express';
import { Role, OfferStatus, ServiceStatus } from '../types/enums';
import { AuthRequest } from '../middlewares/auth.middleware';
import { prisma } from '../lib/prisma';

interface CreateOfferBody {
  serviceRequestId?: string;
  priceOffered?: number | string;
  comment?: string;
}

export const createOffer = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user;

    // 1. Asegurar rol de técnico
    if (!user || user.role !== Role.PROVIDER) {
      res.status(403).json({ message: 'Forbidden: Only providers can make offers.' });
      return;
    }

    const { serviceRequestId, priceOffered, comment }: CreateOfferBody = req.body;

    if (!serviceRequestId || priceOffered === undefined) {
      res.status(400).json({ message: 'serviceRequestId y priceOffered son obligatorios.' });
      return;
    }

    const numericPrice = parseFloat(String(priceOffered));
    if (isNaN(numericPrice) || numericPrice <= 0) {
      res.status(400).json({ message: 'El precio ofrecido debe ser un número positivo.' });
      return;
    }

    // 2. Verificar que la solicitud de servicio exista y esté PENDING
    const serviceRequest = await prisma.serviceRequest.findUnique({
      where: { id: serviceRequestId },
    });

    if (!serviceRequest) {
      res.status(404).json({ message: 'Service request not found' });
      return;
    }

    if (serviceRequest.status !== ServiceStatus.PENDING) {
      res.status(400).json({ message: 'Esta solicitud de servicio ya no acepta nuevas ofertas.' });
      return;
    }

    // 3. Verificar que el técnico no haya enviado ya una oferta previa a esta misma solicitud
    const existingOffer = await prisma.offer.findFirst({
      where: {
        serviceRequestId,
        providerId: user.id,
      },
    });

    if (existingOffer) {
      res.status(400).json({ message: 'Ya has enviado una oferta previa para esta solicitud de servicio.' });
      return;
    }

    // 4. Verificar créditos del técnico (mínimo 1 crédito disponible)
    const technician = await prisma.user.findUnique({
      where: { id: user.id },
      select: { availableCredits: true, frozenCredits: true },
    });

    if (!technician || technician.availableCredits < 1) {
      res.status(402).json({
        message: 'Saldo insuficiente. Necesitas al menos 1 crédito (4 €) para postularte a este servicio.',
      });
      return;
    }

    // 5. Transacción atómica: crear oferta PENDING y retener crédito (availableCredits - 1, frozenCredits + 1)
    const [offer, updatedProvider] = await prisma.$transaction([
      prisma.offer.create({
        data: {
          serviceRequestId,
          providerId: user.id,
          priceOffered: numericPrice,
          comment: comment ? String(comment).trim() : null,
          status: OfferStatus.PENDING,
        },
      }),
      prisma.user.update({
        where: { id: user.id },
        data: {
          availableCredits: { decrement: 1 },
          frozenCredits: { increment: 1 },
        },
        select: {
          id: true,
          availableCredits: true,
          frozenCredits: true,
        },
      }),
    ]);

    res.status(201).json({
      message: 'Oferta enviada exitosamente. Se ha retenido 1 crédito.',
      offer,
      availableCredits: updatedProvider.availableCredits,
      frozenCredits: updatedProvider.frozenCredits,
    });
  } catch (error) {
    const err = error as Error;
    console.error('Error in createOffer:', err.message);
    res.status(500).json({ message: 'Internal server error', details: err.message });
  }
};

export const getMyOffers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user;

    if (!user || user.role !== Role.PROVIDER) {
      res.status(403).json({ message: 'Forbidden: Only providers can view their offers.' });
      return;
    }

    const offers = await prisma.offer.findMany({
      where: { providerId: user.id },
      include: {
        serviceRequest: {
          include: {
            client: {
              select: {
                id: true,
                email: true,
                fullName: true,
                firstName: true,
                lastName: true,
                phone: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json(offers);
  } catch (error) {
    const err = error as Error;
    console.error('Error in getMyOffers:', err.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const acceptOffer = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user;
    const id = req.params.id as string;

    if (!user || user.role !== Role.CLIENT) {
      res.status(403).json({ message: 'Forbidden: Only clients can accept offers.' });
      return;
    }

    const offer = await prisma.offer.findUnique({
      where: { id },
      include: { serviceRequest: true },
    });

    if (!offer) {
      res.status(404).json({ message: 'Oferta no encontrada.' });
      return;
    }

    if (offer.serviceRequest.clientId !== user.id) {
      res.status(403).json({ message: 'Forbidden: Esta solicitud no pertenece a tu cuenta.' });
      return;
    }

    if (offer.serviceRequest.status !== ServiceStatus.PENDING) {
      res.status(400).json({ message: 'La solicitud de servicio ya no está en estado pendiente.' });
      return;
    }

    if (offer.status !== OfferStatus.PENDING) {
      res.status(400).json({ message: 'Esta oferta ya no se encuentra en estado pendiente.' });
      return;
    }

    // Transacción interactiva completa:
    // 1. Marca la oferta seleccionada como ACCEPTED
    // 2. Marca ServiceRequest como ACCEPTED y asigna providerId
    // 3. Descuenta definitivamente el crédito retenido al ganador (frozenCredits - 1)
    // 4. Busca las ofertas PENDING rivales
    // 5. Reembolsa el crédito retenido a cada rival (frozenCredits - 1, availableCredits + 1) y marca REJECTED
    await prisma.$transaction(async (tx) => {
      // 1. Marcar la oferta seleccionada como ACCEPTED
      await tx.offer.update({
        where: { id },
        data: { status: OfferStatus.ACCEPTED },
      });

      // 2. Marcar ServiceRequest como ACCEPTED y vincular técnico ganador
      await tx.serviceRequest.update({
        where: { id: offer.serviceRequestId },
        data: {
          status: ServiceStatus.ACCEPTED,
          providerId: offer.providerId,
        },
      });

      // 3. Descontar definitivamente el crédito congelado del técnico seleccionado
      await tx.user.update({
        where: { id: offer.providerId },
        data: {
          frozenCredits: { decrement: 1 },
        },
      });

      // 4. Buscar ofertas rivales pendientes
      const rivalOffers = await tx.offer.findMany({
        where: {
          serviceRequestId: offer.serviceRequestId,
          id: { not: id },
          status: OfferStatus.PENDING,
        },
      });

      // 5. Devolver créditos a los rivales no seleccionados y marcarlas REJECTED
      for (const rival of rivalOffers) {
        await tx.user.update({
          where: { id: rival.providerId },
          data: {
            frozenCredits: { decrement: 1 },
            availableCredits: { increment: 1 },
          },
        });

        await tx.offer.update({
          where: { id: rival.id },
          data: { status: OfferStatus.REJECTED },
        });
      }
    });

    res.status(200).json({
      message: 'Oferta aceptada con éxito. Crédito cobrado al técnico ganador y reembolsado a los demás postulantes.',
    });
  } catch (error) {
    const err = error as Error;
    console.error('Error in acceptOffer:', err.message);
    res.status(500).json({ message: 'Internal server error', details: err.message });
  }
};
