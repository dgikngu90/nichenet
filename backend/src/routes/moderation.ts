import { Router } from 'express';
import { body, query } from 'express-validator';
import { authenticate } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import * as moderationController from '../controllers/moderationController';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Reports
router.get('/reports', moderationController.getReports);
router.get('/reports/:id', moderationController.getReport);
router.post('/reports/:id/resolve', moderationController.resolveReport);
router.post('/reports/:id/dismiss', moderationController.dismissReport);

// Mod queue (for community-specific reports)
router.get('/communities/:slug/queue', moderationController.getModerationQueue);

// Global moderation (admin only - placeholder for super admin)
// router.get('/admin/users', adminController.getUsers);
// router.post('/admin/users/:id/ban', adminController.banUser);

export default router;
