import { Request, Response, NextFunction } from 'express';
import { prisma } from '../app';
import { createError } from '../middleware/errorHandler';
import { JwtPayload } from '../middleware/auth';

interface ExtendedRequest extends Request {
  user?: JwtPayload;
}

export const getComments = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { postId } = req.params;
    const { page = 1, limit = 100, sort = 'createdAt' } = req.query;

    // Check post exists and user has access
    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: { community: true },
    });

    if (!post) {
      throw createError('Post not found', 404);
    }

    const userId = (req as any).user?.id;
    if (post.community.isPrivate && !userId) {
      throw createError('Authentication required', 401);
    }

    const where = { postId };

    const [comments, total] = await Promise.all([
      prisma.comment.findMany({
        where,
        include: {
          author: { select: { id: true, username: true, name: true, image: true } },
          children: {
            include: {
              author: { select: { id: true, username: true, name: true, image: true } },
              _count: { select: { children: true } },
            },
            orderBy: { createdAt: 'asc' },
          },
          _count: { select: { children: true } },
        },
        orderBy: { [sort as string]: 'desc' },
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
      }),
      prisma.comment.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        comments,
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

export const createComment = async (req: ExtendedRequest, res: Response, next: NextFunction) => {
  try {
    const { postId } = req.params;
    const { content, parentId } = req.body;
    const authorId = req.user?.id;

    if (!authorId) {
      throw createError('Not authenticated', 401);
    }

    const post = await prisma.post.findFirst({
      where: { id: postId },
      include: { community: true },
    });

    if (!post) {
      throw createError('Post not found', 404);
    }

    // Check forum membership
    const member = await prisma.communityMember.findFirst({
      where: { userId: authorId, communityId: post.community.id },
    });

    if (!member) {
      throw createError('Not a member of this community', 403);
    }

    if (member.role === 'BANNED') {
      throw createError('You are banned from this community', 403);
    }

    // Validate parent comment exists (if provided)
    if (parentId) {
      const parentComment = await prisma.comment.findFirst({
        where: { id: parentId, postId },
      });

      if (!parentComment) {
        throw createError('Parent comment not found', 404);
      }
    }

    const comment = await prisma.comment.create({
      data: {
        content,
        authorId,
        postId,
        parentId,
      },
      include: {
        author: { select: { id: true, username: true, name: true, image: true } },
      },
    });

    // Update comment count on post
    await prisma.post.update({
      where: { id: postId },
      data: { commentCount: { increment: 1 } },
    });

    res.status(201).json({
      success: true,
      data: { comment },
    });
  } catch (error) {
    next(error);
  }
};

export const updateComment = async (req: ExtendedRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const userId = req.user?.id;

    const comment = await prisma.comment.findUnique({
      where: { id },
      include: { post: { include: { community: true } } },
    });

    if (!comment) {
      throw createError('Comment not found', 404);
    }

    if (comment.authorId !== userId) {
      throw createError('Not authorized', 403);
    }

    const updated = await prisma.comment.update({
      where: { id },
      data: { content, editedAt: new Date() },
      include: {
        author: { select: { id: true, username: true, name: true, image: true } },
      },
    });

    res.json({
      success: true,
      data: { comment: updated },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteComment = async (req: ExtendedRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const comment = await prisma.comment.findUnique({
      where: { id },
      include: { post: { include: { community: true } } },
    });

    if (!comment) {
      throw createError('Comment not found', 404);
    }

    const isAuthor = comment.authorId === userId;
    const isModerator = await prisma.communityMember.findFirst({
      where: {
        userId,
        communityId: comment.post.community.id,
        role: { in: ['OWNER', 'MODERATOR'] },
      },
    });

    if (!isAuthor && !isModerator) {
      throw createError('Not authorized', 403);
    }

    // Soft delete - keep in database but mark as deleted
    await prisma.comment.update({
      where: { id },
      data: { content: '[deleted]' },
    });

    res.json({
      success: true,
      message: 'Comment deleted',
    });
  } catch (error) {
    next(error);
  }
};

export const voteComment = async (req: ExtendedRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { value } = req.body;

    if (value !== 1 && value !== -1) {
      throw createError('Invalid vote value', 400);
    }

    const userId = req.user?.id;
    if (!userId) {
      throw createError('Not authenticated', 401);
    }

    const comment = await prisma.comment.findUnique({ where: { id } });
    if (!comment) {
      throw createError('Comment not found', 404);
    }

    // Check existing vote
    const existingVote = await prisma.vote.findFirst({
      where: { userId, commentId: id },
    });

    if (existingVote) {
      if (existingVote.value === value) {
        await prisma.vote.delete({ where: { id: existingVote.id } });
        await prisma.comment.update({
          where: { id },
          data: {
            upvotes: { decrement: value === 1 ? 1 : 0 },
            downvotes: { decrement: value === -1 ? 1 : 0 },
          },
        });
      } else {
        await prisma.vote.update({
          where: { id: existingVote.id },
          data: { value },
        });
        await prisma.comment.update({
          where: { id },
          data: {
            upvotes: { increment: value === 1 ? 1 : -1 },
          },
        });
      }
    } else {
      await prisma.vote.create({
        data: { userId, commentId: id, value },
      });
      await prisma.comment.update({
        where: { id },
        data: {
          upvotes: value === 1 ? { increment: 1 } : undefined,
          downvotes: value === -1 ? { increment: 1 } : undefined,
        },
      });
    }

    const updatedComment = await prisma.comment.findUnique({ where: { id } });

    res.json({
      success: true,
      data: { comment: updatedComment },
    });
  } catch (error) {
    next(error);
  }
};

export const reportComment = async (req: ExtendedRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { reason, description } = req.body;
    const reporterId = req.user?.id;

    const comment = await prisma.comment.findUnique({ where: { id } });
    if (!comment) {
      throw createError('Comment not found', 404);
    }

    await prisma.report.create({
      data: {
        reporterId,
        reportedType: 'COMMENT',
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
