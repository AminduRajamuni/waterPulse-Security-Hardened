import express from 'express';
import rateLimit from 'express-rate-limit';
import { register, login, createAdminOrAuthority, getCurrentUser, googleAuthRedirect, googleAuthCallback, googleAuthExchange } from '../controllers/authController.js';
import { verifyToken, checkRole } from '../middleware/authMiddleware.js';

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
const googleExchangeLimiter = rateLimit(authRateLimitOptions);

// Public routes
router.post('/register', register);

// V7: rate limited login (registered once only)
router.post('/login', loginLimiter, login);

// Google Sign-In/Sign-Up (OAuth2 Authorization Code + OIDC)
router.get('/google', googleAuthRedirect);
router.get('/google/callback', googleAuthCallback);
router.post('/google/exchange', googleExchangeLimiter, googleAuthExchange);

// V1 + V7: admin-only route for creating admin/authority, also rate limited (registered once only)
router.post('/create-admin-authority', createAdminLimiter, verifyToken, checkRole('admin'), createAdminOrAuthority);

// Protected routes
router.get('/me', verifyToken, getCurrentUser);

export default router;