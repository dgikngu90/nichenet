import { Router } from 'express';
import { param, query } from 'express-validator';
import { authenticate, optionalAuth } from '../middleware/auth';
import * as userController from '../controllers/userController';

const router = Router();

// Get user profile
router.get('/:username', optionalAuth, userController.getProfile);

// Get user's communities
router.get('/:username/communities', userController.getUserCommunities);

// Get user's posts
router.get('/:username/posts', userController.getUserPosts);

// Follow/unfollow user
router.post('/:username/follow', authenticate, userController.followUser);
router.delete('/:username/follow', authenticate, userController.unfollowUser);

// Block/unblock user
router.post('/:username/block', authenticate, userController.blockUser);
router.delete('/:username/block', authenticate, userController.unblockUser);

export default router;
