import express from 'express';
import { register, login, createAdminOrAuthority, getCurrentUser } from '../controllers/authController.js';
import { verifyToken, checkRole } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);

// V1 fix admin only route for creating admin 
router.post('/create-admin-authority', verifyToken, checkRole('admin'), createAdminOrAuthority);

// Protected routes
router.get('/me', verifyToken, getCurrentUser);

export default router;
