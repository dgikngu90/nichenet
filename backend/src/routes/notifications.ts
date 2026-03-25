import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import * as notificationController from '../controllers/notificationController';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get all notifications
router.get('/', notificationController.getNotifications);

// Get unread count
router.get('/unread/count', notificationController.getUnreadCount);

// Mark as read
router.patch('/:id/read', notificationController.markAsRead);
router.post('/read/all', notificationController.markAllAsRead);

// Delete notification
router.delete('/:id', notificationController.deleteNotification);

export default router;
