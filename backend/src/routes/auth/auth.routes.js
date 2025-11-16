import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.js';
import authController from '../../controllers/auth.controller.js';

const router = Router();

// Public routes
router.post('/login', authController.login);
router.post('/register', authController.register);

// Protected routes
router.get('/me', requireAuth, authController.getMe);
router.post('/logout', requireAuth, authController.logout);

export default router;
