import { Router } from 'express';
import { body } from 'express-validator';
import * as authController from '../controllers/authController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Register
router.post(
  '/register',
  [
    body('email').isEmail().normalizeEmail(),
    body('username').isLength({ min: 3, max: 30 }).matches(/^[a-zA-Z0-9_]+$/),
    body('password').isLength({ min: 8 }),
    body('name').optional().isLength({ max: 100 }),
  ],
  authController.register
);

// Login
router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').exists(),
  ],
  authController.login
);

// Logout
router.post('/logout', authController.logout);

// Refresh token
router.post('/refresh', authController.refresh);

// Get current user
router.get('/me', authController.getMe);

// Request password reset
router.post(
  '/reset-password',
  [body('email').isEmail().normalizeEmail()],
  authController.requestPasswordReset
);

// Reset password with token
router.put(
  '/reset-password/:token',
  [
    body('password').isLength({ min: 8 }),
  ],
  authController.resetPassword
);

// Verify email
router.get('/verify-email/:token', authController.verifyEmail);

// Update profile
router.put(
  '/profile',
  authenticate,
  [
    body('bio').optional().isLength({ max: 500 }),
    body('name').optional().isLength({ max: 100 }),
  ],
  authController.updateProfile
);

// Change password
router.put(
  '/change-password',
  authenticate,
  [
    body('currentPassword').exists(),
    body('newPassword').isLength({ min: 8 }),
  ],
  authController.changePassword
);

export default router;
