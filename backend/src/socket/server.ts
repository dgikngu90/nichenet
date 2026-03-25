import { Server as SocketIOServer } from 'socket.io';
import jwt from 'jsonwebtoken';

export const createSocketServer = (httpServer: any) => {
  const io = new SocketIOServer(httpServer, {
    path: '/ws',
    cors: {
      origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5173'],
      credentials: true,
    },
  });

  io.use(async (socket: any, next: any) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];

      if (!token) {
        throw new Error('Authentication token required');
      }

      const secret = process.env.JWT_SECRET;
      if (!secret) {
        throw new Error('JWT secret not configured');
      }

      const payload = jwt.verify(token, secret);
      socket.userId = payload.userId;
      socket.username = payload.username;
      next();
    } catch (error: any) {
      console.error('Socket auth error:', error.message);
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket: any) => {
    console.log(`User ${socket.username} (${socket.userId}) connected`);

    // User joins their personal notification room
    socket.join(`user:${socket.userId}`);

    // Join community room when they visit a community
    socket.on('join_community', (communityId: string) => {
      socket.join(`community:${communityId}`);
      console.log(`${socket.username} joined community ${communityId}`);
    });

    // Join post room for post-specific notifications
    socket.on('join_post', (postId: string) => {
      socket.join(`post:${postId}`);
    });

    // Handle typing indicators
    socket.on('typing_start', (data: { postId: string; communityId: string }) => {
      socket.to(`post:${data.postId}`).emit('user_typing', {
        userId: socket.userId,
        username: socket.username,
      });
    });

    socket.on('typing_stop', (data: { postId: string; communityId: string }) => {
      socket.to(`post:${data.postId}`).emit('user_stopped_typing', {
        userId: socket.userId,
      });
    });

    // Handle direct message (placeholder)
    socket.on('send_message', async (data: { toUserId: string; content: string }) => {
      // TODO: Direct messaging implementation
      socket.emit('message_sent', { ...data, fromUserId: socket.userId });
      socket.to(`user:${data.toUserId}`).emit('new_message', {
        fromUserId: socket.userId,
        fromUsername: socket.username,
        content: data.content,
      });
    });

    socket.on('disconnect', () => {
      console.log(`User ${socket.username} disconnected`);
    });
  });

  return io;
};
