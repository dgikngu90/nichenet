import { Request, Response, NextFunction } from 'express';
import { prisma } from '../app';
import { createError } from '../middleware/errorHandler';

export const search = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { q, type = 'all', limit = 20 } = req.query;
    const searchQuery = typeof q === 'string' ? q.trim() : '';

    if (!searchQuery) {
      throw createError('Search query required', 400);
    }

    const results: any = {};

    // Search communities
    if (type === 'all' || type === 'communities') {
      const communities = await prisma.community.findMany({
        where: {
          OR: [
            { name: { contains: searchQuery, mode: 'insensitive' } },
            { description: { contains: searchQuery, mode: 'insensitive' } },
          ],
          isPrivate: false,
        },
        include: {
          owner: { select: { id: true, username: true, name: true, image: true } },
          _count: { select: { members: true, posts: true } },
        },
        take: Number(limit),
      });
      results.communities = communities;
    }

    // Search posts
    if (type === 'all' || type === 'posts') {
      const posts = await prisma.post.findMany({
        where: {
          OR: [
            { title: { contains: searchQuery, mode: 'insensitive' } },
            { content: { contains: searchQuery, mode: 'insensitive' } },
          ],
        },
        include: {
          author: { select: { id: true, username: true, name: true, image: true } },
          community: { select: { id: true, name: true, slug: true } },
          _count: { select: { comments: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: Number(limit),
      });
      results.posts = posts;
    }

    // Search users
    if (type === 'all' || type === 'users') {
      const users = await prisma.user.findMany({
        where: {
          OR: [
            { username: { contains: searchQuery, mode: 'insensitive' } },
            { name: { contains: searchQuery, mode: 'insensitive' } },
          ],
        },
        select: {
          id: true,
          username: true,
          name: true,
          image: true,
          bio: true,
          createdAt: true,
          _count: {
            select: {
              posts: true,
              comments: true,
              ownedCommunities: true,
            },
          },
        },
        take: Number(limit),
      });
      results.users = users;
    }

    res.json({
      success: true,
      data: { ...results, query: searchQuery },
    });
  } catch (error) {
    next(error);
  }
};
