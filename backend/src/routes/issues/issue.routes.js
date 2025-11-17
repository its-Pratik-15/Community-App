import { Router } from 'express';
import { requireAuth, requireRole } from '../../middleware/auth.js';
import issueController from '../../controllers/issue.controller.js';

const router = Router();

// Public routes
router.get('/', issueController.getAllIssues);
router.post('/', issueController.createIssue);

// Protected routes (require authentication)
router.use(requireAuth);

// Issue operations
router.delete('/:id', issueController.deleteIssue);
router.patch('/:id', issueController.updateIssueStatus);
router.post('/:id/take', issueController.takeIssue);
router.post('/:id/resolve', issueController.completeIssue); // Frontend uses /resolve

// Alias for backward compatibility
router.post('/:id/complete', issueController.completeIssue);

export default router;
