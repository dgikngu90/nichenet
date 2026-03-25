import { Request, Response, NextFunction } from 'express';
import { prisma } from '../app';
import { createError } from '../middleware/errorHandler';
import { JwtPayload } from '../middleware/auth';

interface ExtendedRequest extends Request {
  user?: JwtPayload;
}

const generateSlug = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .substring(0, 50);
};

export const listCommunities = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      page = 1,
      limit = 20,
      sort = 'createdAt',
      order = 'desc',
      isPrivate = 'false',
    } = req.query;

    const where = {
      isPrivate: isPrivate === 'false' ? false : undefined,
    };

    const [communities, total] = await Promise.all([
      prisma.community.findMany({
        where,
        include: {
          owner: { select: { id: true, username: true, name: true, image: true } },
          _count: { select: { members: true, posts: true } },
        },
        orderBy: { [sort as string]: order as 'asc' | 'desc' },
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
      }),
      prisma.community.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        communities,
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

export const searchCommunities = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { q, page = 1, limit = 20 } = req.query;

    if (!q || typeof q !== 'string') {
      throw createError('Search query required', 400);
    }

    const communities = await prisma.community.findMany({
      where: {
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { description: { contains: q, mode: 'insensitive' } },
        ],
        isPrivate: false,
      },
      include: {
        owner: { select: { id: true, username: true, name: true, image: true } },
        _count: { select: { members: true, posts: true } },
      },
      orderBy: { name: 'asc' },
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit),
    });

    res.json({
      success: true,
      data: { communities },
    });
  } catch (error) {
    next(error);
  }
};

export const getTrendingCommunities = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { limit = '10' } = req.query;
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const communities = await prisma.community.findMany({
      where: { createdAt: { gte: sevenDaysAgo }, isPrivate: false },
      include: {
        owner: { select: { id: true, username: true, name: true, image: true } },
        _count: { select: { members: true, posts: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: Number(limit),
    });

    res.json({
      success: true,
      data: { communities },
    });
  } catch (error) {
    next(error);
  }
};

export const getDiscoverCommunities = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { limit = '20' } = req.query;
    const userId = (req as any).user?.id;

    // Get random public communities not joined by user
    const where: any = { isPrivate: false };

    if (userId) {
      const joinedCommunities = await prisma.communityMember.findMany({
        where: { userId },
        select: { communityId: true },
      });
      const joinedIds = joinedCommunities.map((c) => c.communityId);
      if (joinedIds.length > 0) {
        where.id = { notIn: joinedIds };
      }
    }

    const communities = await prisma.community.findMany({
      where,
      include: {
        owner: { select: { id: true, username: true, name: true, image: true } },
        _count: { select: { members: true, posts: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: Number(limit),
    });

    res.json({
      success: true,
      data: { communities },
    });
  } catch (error) {
    next(error);
  }
};

export const getCommunity = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { slug } = req.params;
    const userId = (req as any).user?.id;

    const community = await prisma.community.findUnique({
      where: { slug },
      include: {
        owner: { select: { id: true, username: true, name: true, image: true } },
        modActions: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: {
            moderator: { select: { id: true, username: true, name: true, image: true } },
            targetUser: { select: { id: true, username: true, name: true } },
            community: { select: { name: true } },
          },
        },
      },
    });

    if (!community) {
      throw createError('Community not found', 404);
    }

    // Check if user is a member
    const membership = userId
      ? await prisma.communityMember.findUnique({
          where: { userId_communityId: { userId, communityId: community.id } },
        })
      : null;

    // Check for pending invite
    const invite = userId
      ? await prisma.communityInvite.findFirst({
          where: {
            communityId: community.id,
            inviteeId: userId,
            status: 'PENDING',
          },
        })
      : null;

    // Get recent posts
    const recentPosts = await prisma.post.findMany({
      where: { communityId: community.id },
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        author: { select: { id: true, username: true, name: true, image: true } },
        _count: { select: { comments: true } },
      },
    });

    res.json({
      success: true,
      data: {
        community: {
          ...community,
          isMember: !!membership,
          memberRole: membership?.role || null,
          pendingInvite: !!invite,
          recentPosts,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getMembers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { slug } = req.params;
    const { page = 1, limit = 50, role } = req.query;

    const community = await prisma.community.findUnique({
      where: { slug },
    });

    if (!community) {
      throw createError('Community not found', 404);
    }

    const where: any = { communityId: community.id };

    if (role) {
      where.role = role;
    }

    const [members, total] = await Promise.all([
      prisma.communityMember.findMany({
        where,
        include: {
          user: { select: { id: true, username: true, name: true, image: true, bio: true } },
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
        members,
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

export const createCommunity = async (req: ExtendedRequest, res: Response, next: NextFunction) => {
  try {
    const { name, description, rules, isPrivate, requiresApproval, icon, banner } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      throw createError('Not authenticated', 401);
    }

    // Generate unique slug
    let baseSlug = generateSlug(name);
    let slug = baseSlug;
    let counter = 1;

    while (true) {
      const existing = await prisma.community.findUnique({ where: { slug } });
      if (!existing) break;
      slug = `${baseSlug}-${counter++}`;
    }

    const community = await prisma.community.create({
      data: {
        name,
        slug,
        description,
        rules,
        isPrivate: isPrivate || false,
        requiresApproval: requiresApproval || false,
        icon,
        banner,
        ownerId: userId,
      },
      include: {
        owner: { select: { id: true, username: true, name: true, image: true } },
      },
    });

    // Add creator as owner
    await prisma.communityMember.create({
      data: {
        userId,
        communityId: community.id,
        role: 'OWNER',
      },
    });

    res.status(201).json({
      success: true,
      data: { community },
    });
  } catch (error) {
    next(error);
  }
};

export const updateCommunity = async (req: ExtendedRequest, res: Response, next: NextFunction) => {
  try {
    const { slug } = req.params;
    const { description, rules, isPrivate, requiresApproval, icon, banner } = req.body;
    const userId = req.user?.id;

    const community = await prisma.community.findUnique({
      where: { slug },
    });

    if (!community) {
      throw createError('Community not found', 404);
    }

    // Check if user is owner or mod
    const membership = await prisma.communityMember.findUnique({
      where: { userId_communityId: { userId: userId!, communityId: community.id } },
    });

    if (!membership || !['OWNER', 'MODERATOR'].includes(membership.role)) {
      throw createError('Not authorized', 403);
    }

    // Only owner can change privacy or ownership
    if (membership.role !== 'OWNER' && (isPrivate !== undefined || requiresApproval !== undefined)) {
      throw createError('Only owner can change privacy settings', 403);
    }

    const updated = await prisma.community.update({
      where: { slug },
      data: {
        description,
        rules,
        ...(isPrivate !== undefined && { isPrivate }),
        ...(requiresApproval !== undefined && { requiresApproval }),
        ...(icon && { icon }),
        ...(banner && { banner }),
      },
      include: {
        owner: { select: { id: true, username: true, name: true, image: true } },
      },
    });

    res.json({
      success: true,
      data: { community: updated },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteCommunity = async (req: ExtendedRequest, res: Response, next: NextFunction) => {
  try {
    const { slug } = req.params;
    const userId = req.user?.id;

    const community = await prisma.community.findUnique({
      where: { slug },
    });

    if (!community) {
      throw createError('Community not found', 404);
    }

    if (community.ownerId !== userId) {
      throw createError('Only owner can delete community', 403);
    }

    await prisma.community.delete({
      where: { slug },
    });

    res.json({
      success: true,
      message: 'Community deleted',
    });
  } catch (error) {
    next(error);
  }
};

export const joinCommunity = async (req: ExtendedRequest, res: Response, next: NextFunction) => {
  try {
    const { slug } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      throw createError('Not authenticated', 401);
    }

    const community = await prisma.community.findUnique({
      where: { slug },
    });

    if (!community) {
      throw createError('Community not found', 404);
    }

    // Check if already a member
    const existing = await prisma.communityMember.findUnique({
      where: { userId_communityId: { userId, communityId: community.id } },
    });

    if (existing) {
      throw createError('Already a member', 400);
    }

    // Handle private communities
    if (community.isPrivate) {
      throw createError('This community is private. You need an invite to join.', 403);
    }

    // Handle approval required
    if (community.requiresApproval) {
      // TODO: Create join request
      throw createError('Join requests require approval', 403);
    }

    await prisma.communityMember.create({
      data: {
        userId,
        communityId: community.id,
        role: 'MEMBER',
      },
    });

    res.json({
      success: true,
      message: 'Joined community successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const leaveCommunity = async (req: ExtendedRequest, res: Response, next: NextFunction) => {
  try {
    const { slug } = req.params;
    const userId = req.user?.id;

    const community = await prisma.community.findUnique({
      where: { slug },
    });

    if (!community) {
      throw createError('Community not found', 404);
    }

    if (community.ownerId === userId) {
      throw createError('Owner cannot leave community. Transfer ownership first.', 400);
    }

    const result = await prisma.communityMember.delete({
      where: {
        userId_communityId: { userId: userId!, communityId: community.id },
      },
    });

    if (!result) {
      throw createError('Not a member of this community', 404);
    }

    res.json({
      success: true,
      message: 'Left community',
    });
  } catch (error) {
    next(error);
  }
};

export const getJoinRequests = async (req: ExtendedRequest, res: Response, next: NextFunction) => {
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

    const requests = await prisma.communityInvite.findMany({
      where: {
        communityId: community.id,
        status: 'PENDING',
      },
      include: {
        invitee: { select: { id: true, username: true, name: true, image: true } },
        inviter: { select: { id: true, username: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      success: true,
      data: { requests },
    });
  } catch (error) {
    next(error);
  }
};

export const createInvite = async (req: ExtendedRequest, res: Response, next: NextFunction) => {
  try {
    const { slug } = req.params;
    const { inviteeEmail } = req.body;
    const inviterId = req.user?.id;

    if (!inviterId) {
      throw createError('Not authenticated', 401);
    }

    const community = await prisma.community.findUnique({
      where: { slug },
    });

    if (!community) {
      throw createError('Community not found', 404);
    }

    // Check permission
    const member = await prisma.communityMember.findFirst({
      where: {
        userId: inviterId,
        communityId: community.id,
        role: { in: ['OWNER', 'MODERATOR'] },
      },
    });

    if (!member) {
      throw createError('Not authorized to invite', 403);
    }

    const invitee = await prisma.user.findUnique({
      where: { email: inviteeEmail },
    });

    if (!invitee) {
      throw createError('User not found', 404);
    }

    // Check if already a member
    const existingMember = await prisma.communityMember.findUnique({
      where: {
        userId_communityId: { userId: invitee.id, communityId: community.id },
      },
    });

    if (existingMember) {
      throw createError('User is already a member', 400);
    }

    // Check for existing pending invite
    const existingInvite = await prisma.communityInvite.findFirst({
      where: {
        communityId: community.id,
        inviteeId: invitee.id,
        status: 'PENDING',
      },
    });

    if (existingInvite) {
      throw createError('Invite already sent', 400);
    }

    const token = crypto.randomBytes(32).toString('hex');

    await prisma.communityInvite.create({
      data: {
        communityId: community.id,
        inviterId,
        inviteeId: invitee.id,
        token,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    });

    // TODO: Send email notification

    res.status(201).json({
      success: true,
      message: 'Invite sent',
    });
  } catch (error) {
    next(error);
  }
};

export const acceptInvite = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token } = req.params;
    const userId = (req as any).user?.id;

    if (!userId) {
      throw createError('Not authenticated', 401);
    }

    const invite = await prisma.communityInvite.findFirst({
      where: { token, inviteeId: userId, status: 'PENDING' },
    });

    if (!invite) {
      throw createError('Invalid or expired invite', 404);
    }

    if (invite.expiresAt && invite.expiresAt < new Date()) {
      await prisma.communityInvite.update({
        where: { id: invite.id },
        data: { status: 'EXPIRED' },
      });
      throw createError('Invite has expired', 400);
    }

    // Check if already a member
    const existing = await prisma.communityMember.findUnique({
      where: {
        userId_communityId: { userId, communityId: invite.communityId },
      },
    });

    if (existing) {
      await prisma.communityInvite.update({
        where: { id: invite.id },
        data: { status: 'ACCEPTED' },
      });
      throw createError('Already a member', 400);
    }

    await prisma.communityMember.create({
      data: {
        userId,
        communityId: invite.communityId,
        role: 'MEMBER',
      },
    });

    await prisma.communityInvite.update({
      where: { id: invite.id },
      data: { status: 'ACCEPTED' },
    });

    res.json({
      success: true,
      message: 'Invite accepted',
    });
  } catch (error) {
    next(error);
  }
};

export const getMyInvites = async (req: ExtendedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;

    const invites = await prisma.communityInvite.findMany({
      where: { inviteeId: userId, status: 'PENDING' },
      include: {
        community: {
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
            icon: true,
            owner: { select: { username: true, name: true } },
          },
        },
        inviter: { select: { id: true, username: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      success: true,
      data: { invites },
    });
  } catch (error) {
    next(error);
  }
};

export const revokeInvite = async (req: ExtendedRequest, res: Response, next: NextFunction) => {
  try {
    const { inviteId } = req.params;
    const userId = req.user?.id;

    const invite = await prisma.communityInvite.findFirst({
      where: { id: inviteId },
    });

    if (!invite) {
      throw createError('Invite not found', 404);
    }

    // Check permission (inviter or community owner/mod)
    if (invite.inviterId !== userId) {
      const member = await prisma.communityMember.findFirst({
        where: {
          userId,
          communityId: invite.communityId,
          role: { in: ['OWNER', 'MODERATOR'] },
        },
      });

      if (!member) {
        throw createError('Not authorized', 403);
      }
    }

    await prisma.communityInvite.delete({
      where: { id: inviteId },
    });

    res.json({
      success: true,
      message: 'Invite revoked',
    });
  } catch (error) {
    next(error);
  }
};

export const addModerator = async (req: ExtendedRequest, res: Response, next: NextFunction) => {
  try {
    const { slug } = req.params;
    const { userId: targetUserId } = req.body;
    const moderatorId = req.user?.id;

    const community = await prisma.community.findUnique({
      where: { slug },
    });

    if (!community) {
      throw createError('Community not found', 404);
    }

    // Only owner can add mods
    if (community.ownerId !== moderatorId) {
      throw createError('Only owner can add moderators', 403);
    }

    const member = await prisma.communityMember.findUnique({
      where: { userId_communityId: { userId: targetUserId, communityId: community.id } },
    });

    if (!member) {
      throw createError('User is not a member', 404);
    }

    await prisma.communityMember.update({
      where: { userId_communityId: { userId: targetUserId, communityId: community.id } },
      data: { role: 'MODERATOR' },
    });

    res.json({
      success: true,
      message: 'Moderator added',
    });
  } catch (error) {
    next(error);
  }
};

export const removeModerator = async (req: ExtendedRequest, res: Response, next: NextFunction) => {
  try {
    const { slug, userId: targetUserId } = req.params;
    const moderatorId = req.user?.id;

    const community = await prisma.community.findUnique({
      where: { slug },
    });

    if (!community) {
      throw createError('Community not found', 404);
    }

    if (community.ownerId === targetUserId) {
      throw createError('Cannot remove owner', 400);
    }

    // Only owner can remove mods
    if (community.ownerId !== moderatorId) {
      throw createError('Only owner can remove moderators', 403);
    }

    await prisma.communityMember.update({
      where: { userId_communityId: { userId: targetUserId, communityId: community.id } },
      data: { role: 'MEMBER' },
    });

    res.json({
      success: true,
      message: 'Moderator removed',
    });
  } catch (error) {
    next(error);
  }
};

export const getModActions = async (req: ExtendedRequest, res: Response, next: NextFunction) => {
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

    const actions = await prisma.modAction.findMany({
      where: { communityId: community.id },
      include: {
        moderator: { select: { id: true, username: true, name: true, image: true } },
        targetUser: { select: { id: true, username: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    res.json({
      success: true,
      data: { actions },
    });
  } catch (error) {
    next(error);
  }
};

export const banUser = async (req: ExtendedRequest, res: Response, next: NextFunction) => {
  try {
    const { slug } = req.params;
    const { userId: targetUserId, reason, permanent = true, durationHours } = req.body;
    const moderatorId = req.user?.id;

    const community = await prisma.community.findUnique({
      where: { slug },
    });

    if (!community) {
      throw createError('Community not found', 404);
    }

    const member = await prisma.communityMember.findFirst({
      where: {
        userId: moderatorId,
        communityId: community.id,
        role: { in: ['OWNER', 'MODERATOR'] },
      },
    });

    if (!member) {
      throw createError('Not authorized', 403);
    }

    if (community.ownerId === targetUserId) {
      throw createError('Cannot ban owner', 400);
    }

    const expiresAt = permanent
      ? null
      : new Date(Date.now() + durationHours * 60 * 60 * 1000);

    await prisma.modAction.create({
      data: {
        moderatorId: moderatorId!,
        communityId: community.id,
        targetUserId,
        actionType: 'BAN',
        reason,
        duration: permanent ? null : durationHours,
        expiresAt,
      },
    });

    await prisma.communityMember.update({
      where: {
        userId_communityId: { userId: targetUserId, communityId: community.id },
      },
      data: { role: 'BANNED' },
    });

    res.json({
      success: true,
      message: permanent ? 'User banned permanently' : `User banned for ${durationHours} hours`,
    });
  } catch (error) {
    next(error);
  }
};

export const unbanUser = async (req: ExtendedRequest, res: Response, next: NextFunction) => {
  try {
    const { slug } = req.params;
    const { userId: targetUserId } = req.body;
    const moderatorId = req.user?.id;

    const community = await prisma.community.findUnique({
      where: { slug },
    });

    if (!community) {
      throw createError('Community not found', 404);
    }

    const member = await prisma.communityMember.findFirst({
      where: {
        userId: moderatorId,
        communityId: community.id,
        role: { in: ['OWNER', 'MODERATOR'] },
      },
    });

    if (!member) {
      throw createError('Not authorized', 403);
    }

    await prisma.communityMember.update({
      where: {
        userId_communityId: { userId: targetUserId, communityId: community.id },
      },
      data: { role: 'MEMBER' },
    });

    await prisma.modAction.create({
      data: {
        moderatorId: moderatorId!,
        communityId: community.id,
        targetUserId,
        actionType: 'UNBAN',
      },
    });

    res.json({
      success: true,
      message: 'User unbanned',
    });
  } catch (error) {
    next(error);
  }
};

export const reportCommunity = async (req: ExtendedRequest, res: Response, next: NextFunction) => {
  try {
    const { slug } = req.params;
    const { reason, description } = req.body;
    const reporterId = req.user?.id;

    const community = await prisma.community.findUnique({
      where: { slug },
    });

    if (!community) {
      throw createError('Community not found', 404);
    }

    await prisma.report.create({
      data: {
        reporterId,
        reportedType: 'COMMUNITY',
        reportedId: community.id,
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
