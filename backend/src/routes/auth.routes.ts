import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import {
  register,
  login,
  getMe,
  updateProfile,
  rechargeCredits,
  createExperience,
  verifyProvider,
} from '../controllers/auth.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();

const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (_req, file, cb) => {
    const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    cb(null, `${Date.now()}-${sanitizedName}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
});

router.post('/register', upload.single('documentImage'), register);
router.post('/login', login);
router.get('/me', authenticateToken, getMe);
router.put('/profile', authenticateToken, upload.single('avatar'), updateProfile);
router.post('/credits/recharge', authenticateToken, rechargeCredits);
router.post('/experiences', authenticateToken, upload.array('photos', 4), createExperience);
router.patch('/verify-provider/:id', authenticateToken, verifyProvider);

export default router;
