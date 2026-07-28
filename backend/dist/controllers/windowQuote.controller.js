"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateWindowQuoteStatus = exports.exportWindowQuotesExcel = exports.getWindowQuotes = exports.createWindowQuote = void 0;
const exceljs_1 = __importDefault(require("exceljs"));
const prisma_1 = require("../lib/prisma");
const createWindowQuote = async (req, res) => {
    try {
        const { fullName, email, phone, serviceCategory, details, dimensions } = req.body;
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        const imageUrl = req.file ? `${baseUrl}/uploads/${req.file.filename}` : null;
        if (!fullName || !email || !phone || !serviceCategory || !details) {
            res.status(400).json({ message: 'Missing required fields' });
            return;
        }
        const windowQuote = await prisma_1.prisma.windowQuoteRequest.create({
            data: {
                fullName,
                email,
                phone,
                serviceCategory,
                details,
                dimensions: dimensions || null,
                imageUrl,
            }
        });
        res.status(201).json({ message: 'Window quote saved successfully', windowQuote });
    }
    catch (error) {
        console.error('Error in createWindowQuote:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.createWindowQuote = createWindowQuote;
const getWindowQuotes = async (_req, res) => {
    try {
        const windowQuotes = await prisma_1.prisma.windowQuoteRequest.findMany({
            orderBy: { createdAt: 'desc' }
        });
        res.status(200).json(windowQuotes);
    }
    catch (error) {
        console.error('Error in getWindowQuotes:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.getWindowQuotes = getWindowQuotes;
const exportWindowQuotesExcel = async (_req, res) => {
    try {
        const windowQuotes = await prisma_1.prisma.windowQuoteRequest.findMany({
            orderBy: { createdAt: 'desc' }
        });
        const workbook = new exceljs_1.default.Workbook();
        const sheet = workbook.addWorksheet('WindowQuotes');
        sheet.columns = [
            { header: 'ID', key: 'id', width: 38 },
            { header: 'Nombre completo', key: 'fullName', width: 24 },
            { header: 'Email', key: 'email', width: 28 },
            { header: 'Teléfono', key: 'phone', width: 16 },
            { header: 'Categoría', key: 'serviceCategory', width: 24 },
            { header: 'Detalles', key: 'details', width: 48 },
            { header: 'Medidas', key: 'dimensions', width: 18 },
            { header: 'URL imagen', key: 'imageUrl', width: 36 },
            { header: 'Estado', key: 'status', width: 12 },
            { header: 'Fecha', key: 'createdAt', width: 22 }
        ];
        windowQuotes.forEach(quote => {
            sheet.addRow({
                id: quote.id,
                fullName: quote.fullName,
                email: quote.email,
                phone: quote.phone,
                serviceCategory: quote.serviceCategory,
                details: quote.details,
                dimensions: quote.dimensions || 'N/A',
                imageUrl: quote.imageUrl || 'N/A',
                status: quote.status,
                createdAt: quote.createdAt.toISOString()
            });
        });
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=window-quotes.xlsx');
        await workbook.xlsx.write(res);
        res.end();
    }
    catch (error) {
        console.error('Error in exportWindowQuotesExcel:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.exportWindowQuotesExcel = exportWindowQuotesExcel;
const updateWindowQuoteStatus = async (req, res) => {
    try {
        const id = req.params.id;
        const { status } = req.body;
        const validStatuses = ['PENDING', 'QUOTED', 'ACCEPTED', 'REJECTED'];
        if (!validStatuses.includes(status)) {
            res.status(400).json({ message: 'Invalid status' });
            return;
        }
        const updatedQuote = await prisma_1.prisma.windowQuoteRequest.update({
            where: { id },
            data: { status }
        });
        res.status(200).json({ message: 'Status updated successfully', windowQuote: updatedQuote });
    }
    catch (error) {
        console.error('Error in updateWindowQuoteStatus:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.updateWindowQuoteStatus = updateWindowQuoteStatus;
