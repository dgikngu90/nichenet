import { Request, Response, NextFunction } from 'express';
import { prisma } from '../app';
import { createError } from '../middleware/errorHandler';
import { JwtPayload } from '../middleware/auth';

interface ExtendedRequest extends Request {
  user?: JwtPayload;
}

export const getNotifications = async (req: ExtendedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const { page = 1, limit = 50, unreadOnly = false } = req.query;

    const where: any = { userId };

    if (unreadOnly === 'true') {
      where.isRead = false;
    }

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
      }),
      prisma.notification.count({ where }),
    ]);

    const unreadCount = await prisma.notification.count({
      where: { userId, isRead: false },
    });

    res.json({
      success: true,
      data: {
        notifications,
        unreadCount,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit)),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getUnreadCount = async (req: ExtendedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;

    const count = await prisma.notification.count({
      where: { userId, isRead: false },
    });

    res.json({
      success: true,
      data: { count },
    });
  } catch (error) {
    next(error);
  }
};

export const markAsRead = async (req: ExtendedRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const notification = await prisma.notification.findFirst({
      where: { id, userId },
    });

    if (!notification) {
      throw createError('Notification not found', 404);
    }

    await prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });

    res.json({
      success: true,
      message: 'Marked as read',
    });
  } catch (error) {
    next(error);
  }
};

export const markAllAsRead = async (req: ExtendedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;

    await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });

    res.json({
      success: true,
      message: 'All notifications marked as read',
    });
  } catch (error) {
    next(error);
  }
};

export const deleteNotification = async (req: ExtendedRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const notification = await prisma.notification.findFirst({
      where: { id, userId },
    });

    if (!notification) {
      throw createError('Notification not found', 404);
    }

    await prisma.notification.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: 'Notification deleted',
    });
  } catch (error) {
    next(error);
  }
};
