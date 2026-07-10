import { Router } from 'express';
import { createOffer, acceptOffer } from '../controllers/offer.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();

router.post('/', authenticateToken, createOffer);
router.put('/:id/accept', authenticateToken, acceptOffer);

export default router;
