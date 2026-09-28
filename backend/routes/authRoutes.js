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
router.post('/login', login);

// Google Sign-In/Sign-Up (OAuth2 Authorization Code + OIDC)
router.get('/google', googleAuthRedirect);
router.get('/google/callback', googleAuthCallback);
router.post('/google/exchange', googleExchangeLimiter, googleAuthExchange);

// V1 fix admin only route for creating admin 
router.post('/create-admin-authority', verifyToken, checkRole('admin'), createAdminOrAuthority);
router.post('/login', loginLimiter, login);
router.post('/create-admin-authority', createAdminLimiter, createAdminOrAuthority);

// Protected routes
router.get('/me', verifyToken, getCurrentUser);

export default router;
