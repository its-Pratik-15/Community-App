import { Router } from 'express';
import { requireAuth, requireRole } from '../../middleware/auth.js';
import noticeController from '../../controllers/notice.controller.js';

const router = Router();

// Public routes
router.get('/', noticeController.getAllNotices);

// Protected routes (require authentication)
router.use(requireAuth);

// Secretary routes
router.post('/', requireRole('SECRETARY'), noticeController.createNotice);
router.delete('/:id', requireRole('SECRETARY'), noticeController.deleteNotice);

export default router;
