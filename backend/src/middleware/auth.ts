import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../app';

export interface JwtPayload {
  userId: string;
  email: string;
  username: string;
}

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw createError('No token provided', 401);
    }

    const token = authHeader.substring(7);

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw createError('JWT secret not configured', 500);
    }

    const payload = jwt.verify(token, secret) as JwtPayload;

    // Fetch user from database
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        image: true,
        bio: true,
        privacyLevel: true,
        isActive: true,
        isBanned: true,
      },
    });

    if (!user) {
      throw createError('User no longer exists', 401);
    }

    if (!user.isActive) {
      throw createError('Account is deactivated', 401);
    }

    if (user.isBanned) {
      throw createError('Account is banned', 403);
    }

    (req as any).user = user;
    next();
  } catch (error: any) {
    if (error.name === 'JsonWebTokenError') {
      next(createError('Invalid token', 401));
    } else if (error.name === 'TokenExpiredError') {
      next(createError('Token expired', 401));
    } else {
      next(error);
    }
  }
};

export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const secret = process.env.JWT_SECRET;

      if (secret) {
        const payload = jwt.verify(token, secret) as JwtPayload;
        const user = await prisma.user.findUnique({
          where: { id: payload.userId },
          select: {
            id: true,
            email: true,
            username: true,
            name: true,
            image: true,
          },
        });

        if (user) {
          (req as any).user = user;
        }
      }
    }
    next();
  } catch (error) {
    // Silent fail for optional auth
    next();
  }
};
