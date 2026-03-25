import { Request, Response, NextFunction } from 'express';
import { prisma } from '../app';
import { createError } from '../middleware/errorHandler';
import { JwtPayload } from '../middleware/auth';

interface ExtendedRequest extends Request {
  user?: JwtPayload;
}

export const getReports = async (req: ExtendedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const { status = 'PENDING', page = 1, limit = 50, type } = req.query;

    // Get all communities where user is a moderator
    const moderatingCommunities = await prisma.communityMember.findMany({
      where: { userId, role: { in: ['OWNER', 'MODERATOR'] } },
      select: { communityId: true },
    });

    const communityIds = moderatingCommunities.map((c) => c.communityId);

    if (communityIds.length === 0) {
      throw createError('Not a moderator of any community', 403);
    }

    const where: any = {
      status,
      reportedType: type,
      reportedId: {
        in: communityIds,
      },
    };

    // This is simplified - in production, join with the actual reported entity
    // For now, we'll check each report's target
    const reports = await prisma.report.findMany({
      where: { status },
      include: {
        reporter: { select: { id: true, username: true, name: true, image: true } },
        resolver: { select: { id: true, username: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit),
    });

    // Filter reports for user's communities
    const filteredReports = reports.filter((report) => {
      // Check if the reported item belongs to a community the user moderates
      if (report.reportedType === 'POST') {
        const post = prisma.post.findFirst({ where: { id: report.reportedId } });
        return post && communityIds.includes(post.communityId);
      }
      if (report.reportedType === 'COMMENT') {
        const comment = prisma.comment.findFirst({
          where: { id: report.reportedId },
          include: { post: true },
        });
        return comment && communityIds.includes(comment.post.communityId);
      }
      if (report.reportedType === 'USER') {
        const member = prisma.communityMember.findFirst({
          where: { userId: report.reportedId },
        });
        return member && communityIds.includes(member.communityId);
      }
      if (report.reportedType === 'COMMUNITY') {
        const community = prisma.community.findFirst({
          where: { id: report.reportedId },
        });
        return community && communityIds.includes(community.id);
      }
      return false;
    });

    res.json({
      success: true,
      data: { reports: filteredReports },
    });
  } catch (error) {
    next(error);
  }
};

export const getReport = async (req: ExtendedRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const report = await prisma.report.findUnique({
      where: { id },
      include: {
        reporter: { select: { id: true, username: true, name: true, image: true } },
        resolver: { select: { id: true, username: true } },
      },
    });

    if (!report) {
      throw createError('Report not found', 404);
    }

    res.json({
      success: true,
      data: { report },
    });
  } catch (error) {
    next(error);
  }
};

export const resolveReport = async (req: ExtendedRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { action, reason } = req.body;
    const resolverId = req.user?.id;

    const report = await prisma.report.findUnique({ where: { id } });

    if (!report) {
      throw createError('Report not found', 404);
    }

    // Check if user is authorized to resolve this report
    if (report.reportedType === 'POST') {
      const post = await prisma.post.findUnique({
        where: { id: report.reportedId },
        include: { community: true },
      });
      if (post) {
        const member = await prisma.communityMember.findFirst({
          where: {
            userId: resolverId,
            communityId: post.community.id,
            role: { in: ['OWNER', 'MODERATOR'] },
          },
        });
        if (!member) throw createError('Not authorized', 403);
      }
    } else if (report.reportedType === 'COMMENT') {
      const comment = await prisma.comment.findFirst({
        where: { id: report.reportedId },
        include: { post: { include: { community: true } } },
      });
      if (comment) {
        const member = await prisma.communityMember.findFirst({
          where: {
            userId: resolverId,
            communityId: comment.post.community.id,
            role: { in: ['OWNER', 'MODERATOR'] },
          },
        });
        if (!member) throw createError('Not authorized', 403);
      }
    }

    await prisma.report.update({
      where: { id },
      data: {
        status: 'RESOLVED',
        resolvedBy: resolverId,
        resolvedAt: new Date(),
      },
    });

    // Action based on report type
    if (action) {
      // Handle different actions: remove_post, remove_comment, ban_user, etc.
      // Implementation depends on scale
    }

    res.json({
      success: true,
      message: 'Report resolved',
    });
  } catch (error) {
    next(error);
  }
};

export const dismissReport = async (req: ExtendedRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const resolverId = req.user?.id;

    const report = await prisma.report.findUnique({ where: { id } });

    if (!report) {
      throw createError('Report not found', 404);
    }

    await prisma.report.update({
      where: { id },
      data: {
        status: 'DISMISSED',
        resolvedBy: resolverId,
        resolvedAt: new Date(),
      },
    });

    res.json({
      success: true,
      message: 'Report dismissed',
    });
  } catch (error) {
    next(error);
  }
};

export const getModerationQueue = async (req: ExtendedRequest, res: Response, next: NextFunction) => {
  try {
    const { slug } = req.params;
    const userId = req.user?.id;

    const community = await prisma.community.findUnique({
      where: { slug },
    });

    if (!community) {
      throw createError('Community not found', 404);
    }

    const member = await prisma.communityMember.findFirst({
      where: {
        userId,
        communityId: community.id,
        role: { in: ['OWNER', 'MODERATOR'] },
      },
    });

    if (!member) {
      throw createError('Not authorized', 403);
    }

    // Get reports for this community
    const reports = await prisma.report.findMany({
      where: { status: 'PENDING' },
      include: {
        reporter: { select: { id: true, username: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    // Filter by actual community
    // Implementation similar to getReports but for single community

    res.json({
      success: true,
      data: { reports: [] },
    });
  } catch (error) {
    next(error);
  }
};
