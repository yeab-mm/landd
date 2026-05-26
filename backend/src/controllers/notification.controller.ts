// File: backend/src/controllers/notification.controller.ts
// Purpose: Manage notifications for citizens
// ✅ Uses explicit 'data:' key to avoid prisma build issues

import { Request, Response } from 'express';
import prisma from '../config/database';

// GET /api/notifications - Get all notifications for current user
export const getNotifications = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ notifications });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
};

// PUT /api/notifications/:id/read - Mark notification as read
export const markAsRead = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const id = String(req.params.id || '');

    // Check if notification belongs to user
    const existing = await prisma.notification.findUnique({
      where: { id },
    });

    if (!existing) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    if (existing.userId !== userId) {
      return res.status(403).json({ error: 'Forbidden: Access denied' });
    }

    // Update read status
    const updated = await prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });

    res.json({ message: 'Notification marked as read', notification: updated });
  } catch (error) {
    console.error('Mark notification read error:', error);
    res.status(500).json({ error: 'Failed to update notification status' });
  }
};
