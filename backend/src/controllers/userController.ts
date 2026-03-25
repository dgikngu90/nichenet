import { Response, NextFunction } from 'express';
import { prisma } from '../app';
import { createError } from '../middleware/errorHandler';
import { JwtPayload } from '../middleware/auth';

interface ExtendedRequest extends any {
  user?: JwtPayload;
}

export const getProfile = async (req: ExtendedRequest, res: Response, next: NextFunction) => {
  try {
    const { username } = req.params;

    // Check if viewing own profile (optional auth)
    const isOwnProfile = req.user?.username === username;

    const user = await prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        username: true,
        name: true,
        bio: true,
        image: true,
        createdAt: true,
        _count: {
          select: {
            posts: true,
            comments: true,
            ownedCommunities: true,
            followers: true,
            following: true,
          },
        },
      },
    });

    if (!user) {
      throw createError('User not found', 404);
    }

    // Privacy check: hide some info if not own profile
    // TODO: Add privacy level checking

    res.json({
      success: true,
      data: { user, isOwnProfile },
    });
  } catch (error) {
    next(error);
  }
};

export const getUserCommunities = async (req: ExtendedRequest, res: Response, next: NextFunction) => {
  try {
    const { username } = req.params;
    const { page = 1, limit = 20, role } = req.query;

    const user = await prisma.user.findUnique({
      where: { username },
      select: { id: true },
    });

    if (!user) {
      throw createError('User not found', 404);
    }

    const where: any = { userId: user.id };

    if (role) {
      where.role = role;
    }

    const [memberships, total] = await Promise.all([
      prisma.communityMember.findMany({
        where,
        include: {
          community: {
            select: {
              id: true,
              name: true,
              slug: true,
              description: true,
              icon: true,
              isPrivate: true,
              _count: { select: { members: true, posts: true } },
            },
          },
        },
        orderBy: { joinedAt: 'desc' },
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
      }),
      prisma.communityMember.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        communities: memberships.map((m) => m.community),
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

export const getUserPosts = async (req: ExtendedRequest, res: Response, next: NextFunction) => {
  try {
    const { username } = req.params;
    const { page = 1, limit = 25, sort = 'createdAt' } = req.query;

    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      throw createError('User not found', 404);
    }

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where: { authorId: user.id },
        include: {
          community: { select: { id: true, name: true, slug: true } },
          _count: { select: { comments: true } },
        },
        orderBy: { [sort as string]: 'desc' },
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
      }),
      prisma.post.count({ where: { authorId: user.id } }),
    ]);

    res.json({
      success: true,
      data: {
        posts,
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

export const followUser = async (req: ExtendedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const { username } = req.params;

    if (!userId) {
      throw createError('Not authenticated', 401);
    }

    if (req.user?.username === username) {
      throw createError('Cannot follow yourself', 400);
    }

    const targetUser = await prisma.user.findUnique({
      where: { username },
    });

    if (!targetUser) {
      throw createError('User not found', 404);
    }

    // Check if already following
    const existing = await prisma.follow.findUnique({
      where: {
        followerId_followingId_type: {
          followerId: userId,
          followingId: targetUser.id,
          type: 'USER',
        },
      },
    });

    if (existing) {
      throw createError('Already following this user', 400);
    }

    await prisma.follow.create({
      data: {
        followerId: userId,
        followingId: targetUser.id,
        type: 'USER',
      },
    });

    res.json({
      success: true,
      message: 'User followed',
    });
  } catch (error) {
    next(error);
  }
};

export const unfollowUser = async (req: ExtendedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const { username } = req.params;

    if (!userId) {
      throw createError('Not authenticated', 401);
    }

    const targetUser = await prisma.user.findUnique({
      where: { username },
    });

    if (!targetUser) {
      throw createError('User not found', 404);
    }

    const result = await prisma.follow.delete({
      where: {
        followerId_followingId_type: {
          followerId: userId,
          followingId: targetUser.id,
          type: 'USER',
        },
      },
    });

    if (!result) {
      throw createError('Not following this user', 404);
    }

    res.json({
      success: true,
      message: 'User unfollowed',
    });
  } catch (error) {
    next(error);
  }
};

export const blockUser = async (req: ExtendedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const { username } = req.params;

    if (!userId) {
      throw createError('Not authenticated', 401);
    }

    const targetUser = await prisma.user.findUnique({
      where: { username },
    });

    if (!targetUser) {
      throw createError('User not found', 404);
    }

    await prisma.follow.create({
      data: {
        followerId: userId,
        followingId: targetUser.id,
        type: 'BLOCK',
      },
    });

    res.json({
      success: true,
      message: 'User blocked',
    });
  } catch (error) {
    next(error);
  }
};

export const unblockUser = async (req: ExtendedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const { username } = req.params;

    if (!userId) {
      throw createError('Not authenticated', 401);
    }

    const targetUser = await prisma.user.findUnique({
      where: { username },
    });

    if (!targetUser) {
      throw createError('User not found', 404);
    }

    const result = await prisma.follow.delete({
      where: {
        followerId_followingId_type: {
          followerId: userId,
          followingId: targetUser.id,
          type: 'BLOCK',
        },
      },
    });

    if (!result) {
      throw createError('User not blocked', 404);
    }

    res.json({
      success: true,
      message: 'User unblocked',
    });
  } catch (error) {
    next(error);
  }
};
