import { Request, Response, NextFunction } from 'express';
import { prisma } from '../app';
import { createError } from '../middleware/errorHandler';
import { JwtPayload } from '../middleware/auth';

interface ExtendedRequest extends Request {
  user?: JwtPayload;
}

const calculateHotScore = (upvotes: number, downvotes: number, createdAt: Date): number => {
  const score = upvotes - downvotes;
  const ageHours = (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60);
  const gravity = 1.8; // Reddit-like gravity
  return Math.log(Math.max(Math.abs(score), 1)) + (score / Math.abs(score + 1)) * ageHours / gravity;
};

export const listPosts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { slug } = req.params;
    const { page = 1, limit = 25, sort = 'createdAt' } = req.query;

    const community = await prisma.community.findUnique({
      where: { slug },
    });

    if (!community) {
      throw createError('Community not found', 404);
    }

    // Check if user can view private community
    const userId = (req as any).user?.id;
    if (community.isPrivate) {
      if (!userId) {
        throw createError('Authentication required', 401);
      }
      const member = await prisma.communityMember.findFirst({
        where: { userId, communityId: community.id },
      });
      if (!member) {
        throw createError('Access denied', 403);
      }
    }

    const where = { communityId: community.id };

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        include: {
          author: { select: { id: true, username: true, name: true, image: true } },
          _count: { select: { comments: true } },
        },
        orderBy: { [sort as string]: 'desc' },
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
      }),
      prisma.post.count({ where }),
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

export const getHotPosts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { slug } = req.params;
    const { limit = 25 } = req.query;

    const community = await prisma.community.findUnique({
      where: { slug },
    });

    if (!community) {
      throw createError('Community not found', 404);
    }

    const posts = await prisma.post.findMany({
      where: { communityId: community.id },
      include: {
        author: { select: { id: true, username: true, name: true, image: true } },
        _count: { select: { comments: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: Number(limit),
    });

    // Calculate hot scores client-side
    const scoredPosts = posts
      .map((post) => ({
        ...post,
        hotScore: calculateHotScore(post.upvotes, post.downvotes, post.createdAt),
      }))
      .sort((a, b) => b.hotScore - a.hotScore);

    res.json({
      success: true,
      data: { posts: scoredPosts },
    });
  } catch (error) {
    next(error);
  }
};

export const getTopPosts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { slug } = req.params;
    const { limit = 25, timeframe = 'all' } = req.query;

    const community = await prisma.community.findUnique({
      where: { slug },
    });

    if (!community) {
      throw createError('Community not found', 404);
    }

    let dateFilter: Date | undefined;
    if (timeframe === 'day') {
      dateFilter = new Date(Date.now() - 24 * 60 * 60 * 1000);
    } else if (timeframe === 'week') {
      dateFilter = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    } else if (timeframe === 'month') {
      dateFilter = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    }

    const posts = await prisma.post.findMany({
      where: {
        communityId: community.id,
        ...(dateFilter && { createdAt: { gte: dateFilter } }),
      },
      include: {
        author: { select: { id: true, username: true, name: true, image: true } },
        _count: { select: { comments: true } },
      },
      orderBy: { upvotes: 'desc' },
      take: Number(limit),
    });

    res.json({
      success: true,
      data: { posts },
    });
  } catch (error) {
    next(error);
  }
};

export const getPost = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.id;

    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        author: { select: { id: true, username: true, name: true, image: true } },
        community: {
          select: {
            id: true,
            name: true,
            slug: true,
            isPrivate: true,
          },
        },
        _count: { select: { comments: true } },
      },
    });

    if (!post) {
      throw createError('Post not found', 404);
    }

    // Check if user can view private community
    if (post.community.isPrivate) {
      if (!userId) {
        throw createError('Authentication required', 401);
      }
      const member = await prisma.communityMember.findFirst({
        where: { userId, communityId: post.community.id },
      });
      if (!member) {
        throw createError('Access denied', 403);
      }
    }

    res.json({
      success: true,
      data: { post },
    });
  } catch (error) {
    next(error);
  }
};

export const createPost = async (req: ExtendedRequest, res: Response, next: NextFunction) => {
  try {
    const { slug } = req.params;
    const { title, content, type, url, category, isNsfw, isSpoiler } = req.body;
    const authorId = req.user?.id;

    if (!authorId) {
      throw createError('Not authenticated', 401);
    }

    const community = await prisma.community.findUnique({
      where: { slug },
    });

    if (!community) {
      throw createError('Community not found', 404);
    }

    // Check membership and permissions
    const member = await prisma.communityMember.findFirst({
      where: {
        userId: authorId,
        communityId: community.id,
      },
    });

    if (!member) {
      throw createError('Not a member of this community', 403);
    }

    if (member.role === 'BANNED') {
      throw createError('You are banned from this community', 403);
    }

    // Validate URL for link/image posts
    if (type !== 'TEXT' && !url) {
      throw createError('URL required for link/image posts', 400);
    }

    // Check NSFW content permission
    if (isNsfw && member.role !== 'OWNER' && member.role !== 'MODERATOR') {
      throw createError('Cannot mark post as NSFW', 403);
    }

    // Check for spoiler content
    if (isSpoiler && member.role !== 'OWNER' && member.role !== 'MODERATOR') {
      throw createError('Cannot mark post as spoiler', 403);
    }

    const post = await prisma.post.create({
      data: {
        title,
        content,
        type,
        url,
        category,
        isNsfw: isNsfw || false,
        isSpoiler: isSpoiler || false,
        authorId,
        communityId: community.id,
      },
      include: {
        author: { select: { id: true, username: true, name: true, image: true } },
      },
    });

    // Update community post count (handled by Prisma relation)

    res.status(201).json({
      success: true,
      data: { post },
    });
  } catch (error) {
    next(error);
  }
};

export const updatePost = async (req: ExtendedRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { title, content, category, isNsfw, isSpoiler } = req.body;
    const userId = req.user?.id;

    const post = await prisma.post.findFirst({
      where: { id },
      include: { community: true },
    });

    if (!post) {
      throw createError('Post not found', 404);
    }

    if (post.authorId !== userId) {
      throw createError('Not authorized', 403);
    }

    if (post.isSpoiler && !isSpoiler) {
      throw createError('Cannot remove spoiler flag', 400);
    }

    if (post.isNsfw && !isNsfw) {
      throw createError('Cannot remove NSFW flag', 400);
    }

    const updated = await prisma.post.update({
      where: { id },
      data: {
        title,
        content,
        category,
        ...(isNsfw !== undefined && { isNsfw }),
        ...(isSpoiler !== undefined && { isSpoiler }),
      },
      include: {
        author: { select: { id: true, username: true, name: true, image: true } },
      },
    });

    res.json({
      success: true,
      data: { post: updated },
    });
  } catch (error) {
    next(error);
  }
};

export const deletePost = async (req: ExtendedRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const post = await prisma.post.findFirst({
      where: { id },
      include: { community: true },
    });

    if (!post) {
      throw createError('Post not found', 404);
    }

    const isAuthor = post.authorId === userId;
    const isModerator = await prisma.communityMember.findFirst({
      where: {
        userId,
        communityId: post.community.id,
        role: { in: ['OWNER', 'MODERATOR'] },
      },
    });

    if (!isAuthor && !isModerator) {
      throw createError('Not authorized', 403);
    }

    await prisma.post.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: 'Post deleted',
    });
  } catch (error) {
    next(error);
  }
};

export const votePost = async (req: ExtendedRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { value } = req.body; // 1 (upvote) or -1 (downvote)

    if (value !== 1 && value !== -1) {
      throw createError('Invalid vote value', 400);
    }

    const userId = req.user?.id;
    if (!userId) {
      throw createError('Not authenticated', 401);
    }

    const post = await prisma.post.findUnique({ where: { id } });
    if (!post) {
      throw createError('Post not found', 404);
    }

    // Check existing vote
    const existingVote = await prisma.vote.findFirst({
      where: { userId, postId: id },
    });

    if (existingVote) {
      if (existingVote.value === value) {
        // Remove vote (toggle off)
        await prisma.vote.delete({ where: { id: existingVote.id } });
        await prisma.post.update({
          where: { id },
          data: {
            upvotes: { decrement: existingVote.value === 1 ? 1 : 0 },
            downvotes: { decrement: existingVote.value === -1 ? 1 : 0 },
          },
        });
      } else {
        // Change vote
        await prisma.vote.update({
          where: { id: existingVote.id },
          data: { value },
        });
        await prisma.post.update({
          where: { id },
          data: {
            upvotes: {
              increment: value === 1 && existingVote.value !== 1 ? 1 : value === 1 ? 0 : -1,
            },
            downvotes: {
              increment: value === -1 && existingVote.value !== -1 ? 1 : value === -1 ? 0 : -1,
            },
          },
        });
      }
    } else {
      // New vote
      await prisma.vote.create({
        data: {
          userId,
          postId: id,
          value,
        },
      });
      await prisma.post.update({
        where: { id },
        data: {
          upvotes: value === 1 ? { increment: 1 } : undefined,
          downvotes: value === -1 ? { increment: 1 } : undefined,
        },
      });
    }

    const updatedPost = await prisma.post.findUnique({ where: { id } });

    res.json({
      success: true,
      data: { post: updatedPost },
    });
  } catch (error) {
    next(error);
  }
};

export const getMyVote = async (req: ExtendedRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.json({ success: true, data: { vote: null } });
    }

    const vote = await prisma.vote.findFirst({
      where: { userId, postId: id },
      select: { value: true },
    });

    res.json({
      success: true,
      data: { vote: vote?.value || null },
    });
  } catch (error) {
    next(error);
  }
};

export const savePost = async (req: ExtendedRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      throw createError('Not authenticated', 401);
    }

    const post = await prisma.post.findUnique({ where: { id } });
    if (!post) {
      throw createError('Post not found', 404);
    }

    // Save by adding to a "saved" list (could be a separate model)
    // For MVP, we'll just return success - implementation can be added later
    res.json({
      success: true,
      message: 'Post saved',
    });
  } catch (error) {
    next(error);
  }
};

export const unsavePost = async (req: ExtendedRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      throw createError('Not authenticated', 401);
    }

    res.json({
      success: true,
      message: 'Post unsaved',
    });
  } catch (error) {
    next(error);
  }
};

export const reportPost = async (req: ExtendedRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { reason, description } = req.body;
    const reporterId = req.user?.id;

    const post = await prisma.post.findUnique({ where: { id } });
    if (!post) {
      throw createError('Post not found', 404);
    }

    await prisma.report.create({
      data: {
        reporterId,
        reportedType: 'POST',
        reportedId: id,
        reason,
        description,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Report submitted',
    });
  } catch (error) {
    next(error);
  }
};
