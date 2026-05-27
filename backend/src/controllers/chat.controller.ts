import { Request, Response } from 'express';
import prisma from '../config/database';

const isStaff = (role: string) => {
  const r = (role || '').toLowerCase();
  return r === 'admin' || r === 'officer';
};

/** Start or resume buyer–seller chat for a listing. */
export const startConversation = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    const { landId } = req.body;
    if (!userId || !landId) {
      return res.status(400).json({ error: 'landId is required' });
    }

    const land = await prisma.land.findFirst({
      where: { id: landId, listingStatus: 'active', forSale: true },
      include: { owner: { select: { id: true, fullName: true } } },
    });
    if (!land) {
      return res.status(404).json({ error: 'Listing not found or not active' });
    }

    if (land.ownerId === userId) {
      return res.status(400).json({ error: 'You cannot chat on your own listing' });
    }

    let conversation = await prisma.chatConversation.findUnique({
      where: { landId_buyerId: { landId, buyerId: userId } },
      include: {
        land: { select: { listingTitle: true, plotNumber: true } },
        messages: { orderBy: { createdAt: 'asc' }, take: 100 },
      },
    });

    if (!conversation) {
      conversation = await prisma.chatConversation.create({
        data: {
          landId,
          sellerId: land.ownerId,
          buyerId: userId,
          status: 'open',
        },
        include: {
          land: { select: { listingTitle: true, plotNumber: true } },
          messages: true,
        },
      });
    }

    return res.json({
      conversation: {
        id: conversation.id,
        landId: conversation.landId,
        sellerId: conversation.sellerId,
        buyerId: conversation.buyerId,
        status: conversation.status,
        adminLocked: conversation.adminLocked,
        listingTitle: land.listingTitle,
        sellerName: land.owner.fullName,
        messages: conversation.messages,
      },
    });
  } catch (error) {
    console.error('startConversation', error);
    return res.status(500).json({ error: 'Failed to start conversation' });
  }
};

export const getMyConversations = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const conversations = await prisma.chatConversation.findMany({
      where: {
        OR: [{ sellerId: userId }, { buyerId: userId }],
      },
      include: {
        land: { select: { listingTitle: true, plotNumber: true, listingPrice: true } },
        messages: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return res.json({ conversations });
  } catch (error) {
    console.error('getMyConversations', error);
    return res.status(500).json({ error: 'Failed to fetch conversations' });
  }
};

export const getMessages = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    const role = (req as any).user?.role;
    const id = String(req.params.id);

    const conversation = await prisma.chatConversation.findUnique({
      where: { id },
      include: { messages: { orderBy: { createdAt: 'asc' } } },
    });
    if (!conversation) return res.status(404).json({ error: 'Conversation not found' });

    const allowed =
      isStaff(role) ||
      conversation.sellerId === userId ||
      conversation.buyerId === userId;
    if (!allowed) return res.status(403).json({ error: 'Forbidden' });

    return res.json({ conversation, messages: conversation.messages });
  } catch (error) {
    console.error('getMessages', error);
    return res.status(500).json({ error: 'Failed to fetch messages' });
  }
};

export const sendMessage = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    const role = (req as any).user?.role;
    const id = String(req.params.id);
    const { content } = req.body;

    if (!content?.trim()) {
      return res.status(400).json({ error: 'Message content is required' });
    }

    const conversation = await prisma.chatConversation.findUnique({ where: { id } });
    if (!conversation) return res.status(404).json({ error: 'Conversation not found' });

    const allowed =
      isStaff(role) ||
      conversation.sellerId === userId ||
      conversation.buyerId === userId;
    if (!allowed) return res.status(403).json({ error: 'Forbidden' });

    if (conversation.adminLocked && !isStaff(role)) {
      return res.status(403).json({ error: 'Chat is locked by admin. Contact support.' });
    }
    if (conversation.status === 'closed' && !isStaff(role)) {
      return res.status(403).json({ error: 'Conversation is closed' });
    }

    const message = await prisma.chatMessage.create({
      data: {
        conversationId: id,
        senderId: userId,
        content: content.trim(),
      },
    });

    await prisma.chatConversation.update({
      where: { id },
      data: { updatedAt: new Date() },
    });

    return res.status(201).json({ message });
  } catch (error) {
    console.error('sendMessage', error);
    return res.status(500).json({ error: 'Failed to send message' });
  }
};

/** Admin: all marketplace chats */
export const getAdminConversations = async (req: Request, res: Response) => {
  try {
    const role = (req as any).user?.role;
    if (!isStaff(role)) return res.status(403).json({ error: 'Forbidden' });

    const conversations = await prisma.chatConversation.findMany({
      include: {
        land: { select: { listingTitle: true, plotNumber: true } },
        messages: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
      orderBy: { updatedAt: 'desc' },
    });

    const userIds = new Set<string>();
    conversations.forEach((c) => {
      userIds.add(c.sellerId);
      userIds.add(c.buyerId);
    });
    const users = await prisma.user.findMany({
      where: { id: { in: [...userIds] } },
      select: { id: true, fullName: true },
    });
    const nameMap = Object.fromEntries(users.map((u) => [u.id, u.fullName]));

    return res.json({
      conversations: conversations.map((c) => ({
        ...c,
        sellerName: nameMap[c.sellerId],
        buyerName: nameMap[c.buyerId],
        lastMessage: c.messages[0] || null,
      })),
    });
  } catch (error) {
    console.error('getAdminConversations', error);
    return res.status(500).json({ error: 'Failed to fetch conversations' });
  }
};

export const updateAdminConversation = async (req: Request, res: Response) => {
  try {
    const role = (req as any).user?.role;
    if ((role || '').toLowerCase() !== 'admin') {
      return res.status(403).json({ error: 'Only admins can moderate chats' });
    }

    const id = String(req.params.id);
    const { status, adminLocked } = req.body;

    const updated = await prisma.chatConversation.update({
      where: { id },
      data: {
        ...(status !== undefined ? { status } : {}),
        ...(adminLocked !== undefined ? { adminLocked: Boolean(adminLocked) } : {}),
      },
    });

    return res.json({ conversation: updated });
  } catch (error) {
    console.error('updateAdminConversation', error);
    return res.status(500).json({ error: 'Failed to update conversation' });
  }
};
