"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMyRequests = exports.getPendingServices = exports.createServiceRequest = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const createServiceRequest = async (req, res) => {
    try {
        const user = req.user;
        // Ensure the user has CLIENT role
        if (!user || user.role !== client_1.Role.CLIENT) {
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
    }
    catch (error) {
        console.error('Error in createServiceRequest:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.createServiceRequest = createServiceRequest;
const getPendingServices = async (req, res) => {
    try {
        const services = await prisma.serviceRequest.findMany({
            where: { status: client_1.ServiceStatus.PENDING },
            include: {
                client: {
                    select: { id: true, email: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.status(200).json(services);
    }
    catch (error) {
        console.error('Error in getPendingServices:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.getPendingServices = getPendingServices;
const getMyRequests = async (req, res) => {
    try {
        const user = req.user;
        if (!user || user.role !== client_1.Role.CLIENT) {
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
    }
    catch (error) {
        console.error('Error in getMyRequests:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.getMyRequests = getMyRequests;
