import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.js';
import profileController from '../../controllers/profile.controller.js';

const router = Router();

// Get current user's profile (public, but requires authentication)
router.get('/me', requireAuth, profileController.getMe);

// Protected routes (require authentication)
router.use(requireAuth);

// Get current user's profile (legacy, redirects to /me)
router.get('/', (req, res) => res.redirect('/api/profile/me'));

// Update current user's profile
router.patch('/', profileController.updateProfile);

export default router;
