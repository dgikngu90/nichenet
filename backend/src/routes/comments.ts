import { Router } from 'express';
import { body, param } from 'express-validator';
import { authenticate } from '../middleware/auth';
import { validateRequest, sanitizeInput } from '../middleware/validation';
import * as commentController from '../controllers/commentController';

const router = Router();

// Get comments for a post
router.get('/posts/:postId/comments', commentController.getComments);

// Create comment
router.post(
  '/posts/:postId/comments',
  authenticate,
  sanitizeInput,
  [
    body('content').isLength({ min: 1, max: 5000 }),
    body('parentId').optional().isLength(24),
  ],
  validateRequest,
  commentController.createComment
);

// Update comment
router.put(
  '/:id',
  authenticate,
  sanitizeInput,
  [param('id').isLength(24), body('content').isLength({ min: 1, max: 5000 })],
  validateRequest,
  commentController.updateComment
);

// Delete comment
router.delete('/:id', authenticate, commentController.deleteComment);

// Vote on comment
router.post('/:id/vote', authenticate, commentController.voteComment);

// Report comment
router.post('/:id/report', authenticate, commentController.reportComment);

export default router;
