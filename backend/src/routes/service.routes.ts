import { Router } from 'express';
import { createServiceRequest, getPendingServices, getMyRequests } from '../controllers/service.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();

router.get('/pending', authenticateToken, getPendingServices);
router.get('/my-requests', authenticateToken, getMyRequests);
router.post('/', authenticateToken, createServiceRequest);

export default router;
