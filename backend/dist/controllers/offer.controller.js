"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.acceptOffer = exports.createOffer = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const createOffer = async (req, res) => {
    try {
        const user = req.user;
        // Ensure the user has PROVIDER role
        if (!user || user.role !== client_1.Role.PROVIDER) {
            res.status(403).json({ message: 'Forbidden: Only providers can make offers.' });
            return;
        }
        const { serviceRequestId, priceOffered, comment } = req.body;
        if (!serviceRequestId || priceOffered === undefined) {
            res.status(400).json({ message: 'Missing required fields' });
            return;
        }
        // Verify service request exists and is pending
        const serviceRequest = await prisma.serviceRequest.findUnique({
            where: { id: serviceRequestId }
        });
        if (!serviceRequest) {
            res.status(404).json({ message: 'Service request not found' });
            return;
        }
        if (serviceRequest.status !== 'PENDING') {
            res.status(400).json({ message: 'Service request is no longer accepting offers' });
            return;
        }
        const offer = await prisma.offer.create({
            data: {
                serviceRequestId,
                providerId: user.id,
                priceOffered: parseFloat(priceOffered),
                comment
            }
        });
        res.status(201).json({
            message: 'Offer submitted successfully',
            offer
        });
    }
    catch (error) {
        console.error('Error in createOffer:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.createOffer = createOffer;
const acceptOffer = async (req, res) => {
    try {
        const user = req.user;
        const id = req.params.id;
        if (!user || user.role !== client_1.Role.CLIENT) {
            res.status(403).json({ message: 'Forbidden: Only clients can accept offers.' });
            return;
        }
        const offer = await prisma.offer.findUnique({
            where: { id },
            include: { serviceRequest: true }
        });
        if (!offer) {
            res.status(404).json({ message: 'Offer not found' });
            return;
        }
        if (offer.serviceRequest.clientId !== user.id) {
            res.status(403).json({ message: 'Forbidden: This is not your service request.' });
            return;
        }
        if (offer.serviceRequest.status !== client_1.ServiceStatus.PENDING) {
            res.status(400).json({ message: 'Service request is not in PENDING status.' });
            return;
        }
        // Transaction to update offer and service request atomically
        await prisma.$transaction([
            // 1. Mark this offer as ACCEPTED
            prisma.offer.update({
                where: { id },
                data: { status: client_1.OfferStatus.ACCEPTED }
            }),
            // 2. Mark the service request as ACCEPTED and set providerId
            prisma.serviceRequest.update({
                where: { id: offer.serviceRequestId },
                data: {
                    status: client_1.ServiceStatus.ACCEPTED,
                    providerId: offer.providerId
                }
            }),
            // 3. Mark all OTHER offers for this request as REJECTED
            prisma.offer.updateMany({
                where: {
                    serviceRequestId: offer.serviceRequestId,
                    id: { not: id }
                },
                data: { status: client_1.OfferStatus.REJECTED }
            })
        ]);
        res.status(200).json({ message: 'Offer accepted successfully' });
    }
    catch (error) {
        console.error('Error in acceptOffer:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.acceptOffer = acceptOffer;
