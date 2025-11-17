import { Router } from 'express';
import { requireAuth, requireRole } from '../../middleware/auth.js';
import maintenanceController from '../../controllers/maintenance.controller.js';

const router = Router();

// Public routes
router.get('/', maintenanceController.getAllMaintenance);

// Protected routes (Secretary only)
router.use(requireAuth);
router.use(requireRole('SECRETARY'));

router.post('/', maintenanceController.createMaintenance);

export default router;
