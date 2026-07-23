import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { createWindowQuote, getWindowQuotes, exportWindowQuotesExcel, updateWindowQuoteStatus } from '../controllers/windowQuote.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();
const upload = multer({
  storage: multer.diskStorage({
    destination: path.join(__dirname, '../../uploads'),
    filename: (_req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
  }),
  limits: { fileSize: 5 * 1024 * 1024 }
});

router.post('/', upload.single('image'), createWindowQuote);
router.get('/', authenticateToken, getWindowQuotes);
router.get('/export-excel', authenticateToken, exportWindowQuotesExcel);
router.patch('/:id/status', authenticateToken, updateWindowQuoteStatus);

export default router;
