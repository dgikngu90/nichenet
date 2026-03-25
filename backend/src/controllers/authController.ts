import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { prisma } from '../app';
import { createError } from '../middleware/errorHandler';
import { JwtPayload } from '../middleware/auth';

interface ExtendedRequest extends Request {
  user?: JwtPayload;
}

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, username, password, name } = req.body;

    // Check if user exists
    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ email }, { username }] },
    });

    if (existingUser) {
      throw createError('User with this email or username already exists', 409);
    }

    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        username,
        passwordHash,
        name,
      },
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        bio: true,
        image: true,
        createdAt: true,
      },
    });

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token: verificationToken,
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      },
    });

    // TODO: Send verification email
    // await sendVerificationEmail(email, verificationToken);

    // Generate JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email, username: user.username },
      JWT_SECRET!,
      { expiresIn: JWT_EXPIRES_IN }
    );

    const refreshToken = jwt.sign(
      { userId: user.id },
      JWT_REFRESH_SECRET!,
      { expiresIn: JWT_REFRESH_EXPIRES_IN }
    );

    res.status(201).json({
      success: true,
      data: {
        user,
        token,
        refreshToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw createError('Invalid credentials', 401);
    }

    // Check password
    const validPassword = user.passwordHash
      ? await bcrypt.compare(password, user.passwordHash)
      : false;

    if (!validPassword) {
      throw createError('Invalid credentials', 401);
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { updatedAt: new Date() },
    });

    // Generate tokens
    const token = jwt.sign(
      { userId: user.id, email: user.email, username: user.username },
      JWT_SECRET!,
      { expiresIn: JWT_EXPIRES_IN }
    );

    const refreshToken = jwt.sign(
      { userId: user.id },
      JWT_REFRESH_SECRET!,
      { expiresIn: JWT_REFRESH_EXPIRES_IN }
    );

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          name: user.name,
          bio: user.bio,
          image: user.image,
        },
        token,
        refreshToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Optionally blacklist token in Redis
    res.json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const refresh = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw createError('Refresh token required', 400);
    }

    const payload = jwt.verify(refreshToken, JWT_REFRESH_SECRET!) as JwtPayload;

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        bio: true,
        image: true,
      },
    });

    if (!user) {
      throw createError('User not found', 404);
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, username: user.username },
      JWT_SECRET!,
      { expiresIn: JWT_EXPIRES_IN }
    );

    const newRefreshToken = jwt.sign(
      { userId: user.id },
      JWT_REFRESH_SECRET!,
      { expiresIn: JWT_REFRESH_EXPIRES_IN }
    );

    res.json({
      success: true,
      data: {
        user,
        token,
        refreshToken: newRefreshToken,
      },
    });
  } catch (error: any) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      next(createError('Invalid refresh token', 401));
    } else {
      next(error);
    }
  }
};

export const getMe = async (req: ExtendedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw createError('Not authenticated', 401);
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        bio: true,
        image: true,
        privacyLevel: true,
        createdAt: true,
        _count: {
          select: {
            posts: true,
            comments: true,
            ownedCommunities: true,
          },
        },
      },
    });

    res.json({
      success: true,
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req: ExtendedRequest, res: Response, next: NextFunction) => {
  try {
    const { bio, name } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      throw createError('Not authenticated', 401);
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: { bio, name },
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        bio: true,
        image: true,
      },
    });

    res.json({
      success: true,
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (req: ExtendedRequest, res: Response, next: NextFunction) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      throw createError('Not authenticated', 401);
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user?.passwordHash) {
      throw createError('No password set for this account', 400);
    }

    const validPassword = await bcrypt.compare(currentPassword, user.passwordHash);

    if (!validPassword) {
      throw createError('Current password is incorrect', 401);
    }

    const newPasswordHash = await bcrypt.hash(newPassword, 12);

    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newPasswordHash },
    });

    res.json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const requestPasswordReset = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Don't reveal if user exists
      return res.json({
        success: true,
        message: 'If an account exists, a reset email has been sent',
      });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');

    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token: resetToken,
        expires: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
      },
    });

    // TODO: Send reset email
    // await sendResetEmail(email, resetToken);

    res.json({
      success: true,
      message: 'If an account exists, a reset email has been sent',
    });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const tokenRecord = await prisma.verificationToken.findFirst({
      where: { token, identifier: req.params.token },
    });

    if (!tokenRecord || tokenRecord.expires < new Date()) {
      throw createError('Invalid or expired reset token', 400);
    }

    const userId = await prisma.user.findFirst({
      where: { email: tokenRecord.identifier },
      select: { id: true },
    });

    if (!userId) {
      throw createError('User not found', 404);
    }

    const passwordHash = await bcrypt.hash(password, 12);

    await prisma.user.update({
      where: { id: userId.id },
      data: { passwordHash },
    });

    // Delete used token
    await prisma.verificationToken.delete({
      where: { id: tokenRecord.id },
    });

    res.json({
      success: true,
      message: 'Password reset successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const verifyEmail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token } = req.params;

    const tokenRecord = await prisma.verificationToken.findFirst({
      where: { token },
    });

    if (!tokenRecord || tokenRecord.expires < new Date()) {
      throw createError('Invalid or expired verification token', 400);
    }

    await prisma.user.update({
      where: { email: tokenRecord.identifier },
      data: { emailVerified: new Date() },
    });

    await prisma.verificationToken.delete({
      where: { id: tokenRecord.id },
    });

    res.json({
      success: true,
      message: 'Email verified successfully',
    });
  } catch (error) {
    next(error);
  }
};
