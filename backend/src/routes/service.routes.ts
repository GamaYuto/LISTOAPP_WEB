import { Router } from 'express';
import { 
  createServiceRequest, 
  getPendingServices, 
  getMyRequests, 
  getMyJobs, 
  updateServiceStatus 
} from '../controllers/service.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();

router.get('/pending', authenticateToken, getPendingServices);
router.get('/my-requests', authenticateToken, getMyRequests);
router.get('/my-jobs', authenticateToken, getMyJobs);
router.post('/', authenticateToken, createServiceRequest);
router.patch('/:id/status', authenticateToken, updateServiceStatus);

export default router;
