import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { authenticate } from '../middleware/auth';
import { validateRequest, sanitizeInput } from '../middleware/validation';
import * as postController from '../controllers/postController';

const router = Router();

// Public routes
router.get('/communities/:slug/posts', postController.listPosts);
router.get('/:id', postController.getPost);

// Protected routes
router.use(authenticate);

// Create, update, delete
router.post(
  '/communities/:slug/posts',
  sanitizeInput,
  [
    body('title').isLength({ min: 1, max: 300 }),
    body('content').optional().isLength({ max: 10000 }),
    body('type').isIn(['TEXT', 'LINK', 'IMAGE']),
    body('url').optional().isURL(),
    body('category').optional().isLength({ max: 100 }),
    body('isNsfw').optional().isBoolean(),
    body('isSpoiler').optional().isBoolean(),
  ],
  validateRequest,
  postController.createPost
);

router.put(
  '/:id',
  sanitizeInput,
  [
    param('id').isLength(24),
    body('title').optional().isLength({ min: 1, max: 300 }),
    body('content').optional().isLength({ max: 10000 }),
    body('category').optional().isLength({ max: 100 }),
    body('isNsfw').optional().isBoolean(),
    body('isSpoiler').optional().isBoolean(),
  ],
  validateRequest,
  postController.updatePost
);

router.delete('/:id', postController.deletePost);

// Voting
router.post('/:id/vote', postController.votePost);
router.get('/:id/vote', postController.getMyVote);

// Save/Favorite
router.post('/:id/save', postController.savePost);
router.delete('/:id/save', postController.unsavePost);

// Reports
router.post('/:id/report', postController.reportPost);

// Sorting
router.get('/communities/:slug/posts/hot', postController.getHotPosts);
router.get('/communities/:slug/posts/top', postController.getTopPosts);
router.get('/communities/:slug/posts/new', postController.listPosts);

export default router;
