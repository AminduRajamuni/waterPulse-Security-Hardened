import express from 'express';
import rateLimit from 'express-rate-limit';
import { register, login, createAdminOrAuthority, getCurrentUser } from '../controllers/authController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

const authRateLimitOptions = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: { message: 'Too many attempts, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
};

const loginLimiter = rateLimit(authRateLimitOptions);
const createAdminLimiter = rateLimit(authRateLimitOptions);

// Public routes
router.post('/register', register);
router.post('/login', loginLimiter, login);
router.post('/create-admin-authority', createAdminLimiter, createAdminOrAuthority);

// Protected routes
router.get('/me', verifyToken, getCurrentUser);

export default router;
