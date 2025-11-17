import { Router } from 'express';
import { requireAuth, requireRole } from '../../middleware/auth.js';
import staffController from '../../controllers/staff.controller.js';

const router = Router();

// Public routes
router.get('/', staffController.getAllStaff);

// Protected routes (Secretary only)
router.use(requireAuth);
router.use(requireRole('SECRETARY'));

router.post('/', staffController.createStaff);
router.patch('/:id', staffController.updateStaffDuty);

export default router;
