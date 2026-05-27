import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import prisma from './config/database';

let io: Server | null = null;

export function initSocket(httpServer: HttpServer) {
  io = new Server(httpServer, {
    cors: { origin: '*', methods: ['GET', 'POST'] },
  });

  io.use((socket, next) => {
    const token =
      socket.handshake.auth?.token ||
      socket.handshake.headers?.authorization?.toString().replace('Bearer ', '');
    if (!token) return next(new Error('Unauthorized'));
    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'dev-secret-key-must-be-32-chars-min'
      ) as { userId: string; role?: string };
      (socket as any).userId = decoded.userId;
      (socket as any).role = decoded.role;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket: Socket) => {
    const userId = (socket as any).userId as string;

    socket.on('join_conversation', async (conversationId: string) => {
      const conv = await prisma.chatConversation.findUnique({ where: { id: conversationId } });
      if (!conv) return;
      const role = ((socket as any).role || '').toLowerCase();
      const allowed =
        role === 'admin' ||
        role === 'officer' ||
        conv.sellerId === userId ||
        conv.buyerId === userId;
      if (allowed) {
        socket.join(`conv:${conversationId}`);
      }
    });

    socket.on('leave_conversation', (conversationId: string) => {
      socket.leave(`conv:${conversationId}`);
    });

    socket.on('send_message', async (payload: { conversationId: string; content: string }) => {
      try {
        const { conversationId, content } = payload;
        if (!conversationId || !content?.trim()) return;

        const conv = await prisma.chatConversation.findUnique({ where: { id: conversationId } });
        if (!conv) return;

        const role = ((socket as any).role || '').toLowerCase();
        const isStaff = role === 'admin' || role === 'officer';
        if (conv.adminLocked && !isStaff) {
          socket.emit('error_message', { error: 'Chat locked by admin' });
          return;
        }
        if (conv.status === 'closed' && !isStaff) {
          socket.emit('error_message', { error: 'Conversation closed' });
          return;
        }
        if (!isStaff && conv.sellerId !== userId && conv.buyerId !== userId) return;

        const message = await prisma.chatMessage.create({
          data: {
            conversationId,
            senderId: userId,
            content: content.trim(),
          },
        });

        await prisma.chatConversation.update({
          where: { id: conversationId },
          data: { updatedAt: new Date() },
        });

        io?.to(`conv:${conversationId}`).emit('new_message', {
          message: {
            ...message,
            createdAt: message.createdAt.toISOString(),
          },
        });
      } catch (err) {
        console.error('socket send_message', err);
      }
    });
  });

  return io;
}

export function getIo() {
  return io;
}
