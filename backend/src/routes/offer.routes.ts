import { Router } from 'express';
import { createOffer, getMyOffers, acceptOffer } from '../controllers/offer.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();

router.post('/', authenticateToken, createOffer);
router.get('/my-offers', authenticateToken, getMyOffers);
router.put('/:id/accept', authenticateToken, acceptOffer);
router.patch('/:id/accept', authenticateToken, acceptOffer);

export default router;
