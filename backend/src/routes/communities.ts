import { Router } from 'express';
import { body, param } from 'express-validator';
import { authenticate } from '../middleware/auth';
import { validateRequest, sanitizeInput } from '../middleware/validation';
import * as communityController from '../controllers/communityController';

const router = Router();

// Public routes
router.get('/', communityController.listCommunities);
router.get('/search', communityController.searchCommunities);
router.get('/trending', communityController.getTrendingCommunities);
router.get('/discover', communityController.getDiscoverCommunities);
router.get('/:slug', communityController.getCommunity);
router.get('/:slug/members', communityController.getMembers);

// Protected routes
router.use(authenticate);

// Create, update, delete
router.post(
  '/',
  sanitizeInput,
  [
    body('name').isLength({ min: 3, max: 50 }).matches(/^[a-zA-Z0-9\s]+$/),
    body('description').optional().isLength({ max: 1000 }),
    body('rules').optional().isLength({ max: 2000 }),
    body('isPrivate').optional().isBoolean(),
    body('requiresApproval').optional().isBoolean(),
  ],
  validateRequest,
  communityController.createCommunity
);

router.put(
  '/:slug',
  sanitizeInput,
  [
    param('slug').isSlug(),
    body('description').optional().isLength({ max: 1000 }),
    body('rules').optional().isLength({ max: 2000 }),
    body('isPrivate').optional().isBoolean(),
    body('requiresApproval').optional().isBoolean(),
    body('icon').optional().isURL(),
    body('banner').optional().isURL(),
  ],
  validateRequest,
  communityController.updateCommunity
);

router.delete('/:slug', communityController.deleteCommunity);

// Membership
router.post('/:slug/join', communityController.joinCommunity);
router.post('/:slug/leave', communityController.leaveCommunity);
router.get('/:slug/requests', communityController.getJoinRequests);

// Invites
router.post('/:slug/invite', communityController.createInvite);
router.post('/invite/:token/accept', communityController.acceptInvite);
router.get('/invites', communityController.getMyInvites);
router.delete('/invite/:inviteId', communityController.revokeInvite);

// Moderation
router.post('/:slug/mods', communityController.addModerator);
router.delete('/:slug/mods/:userId', communityController.removeModerator);
router.get('/:slug/mod-actions', communityController.getModActions);
router.post('/:slug/ban', communityController.banUser);
router.post('/:slug/unban', communityController.unbanUser);

// Reports
router.post('/:slug/report', communityController.reportCommunity);

export default router;
