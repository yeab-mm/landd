// File: backend/src/controllers/user.controller.ts
// Purpose: Handle user profile operations
// ✅ Uses explicit 'data:' syntax (no  shorthand) to avoid copy/paste issues

import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../config/database';

// ============================================
// GET /api/user/me - Get current user profile
// ============================================
export const getProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        faydaId: true,
        role: true,
        createdAt: true,
        lastLogin: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Safely get counts using separate queries for max compatibility and reliability
    const totalLands = await prisma.land.count({ where: { ownerId: userId } });
    const totalRequests = await prisma.request.count({ where: { userId } });
    
    // In progress or pending requests count
    const pendingRequests = await prisma.request.count({
      where: {
        userId,
        status: {
          in: ['pending', 'submitted', 'Pending']
        }
      }
    });

    const pendingPayments = await prisma.payment.count({
      where: {
        userId,
        status: 'pending'
      }
    });

    const unreadNotifications = await prisma.notification.count({
      where: {
        userId,
        isRead: false
      }
    });

    res.json({
      user: {
        ...user,
        stats: {
          totalLands,
          totalRequests,
          pendingRequests,
          pendingPayments,
          unreadNotifications,
        }
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
};

// ============================================
// PUT /api/user/me - Update user profile
// ============================================
export const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { fullName, phone, email } = req.body;

    // If email is provided, check if it's already in use by another user
    if (email) {
      const emailLower = email.toLowerCase().trim();
      const existingUser = await prisma.user.findFirst({
        where: {
          email: emailLower,
          NOT: { id: userId },
        },
      });

      if (existingUser) {
        return res.status(400).json({ error: 'Email is already in use by another account' });
      }
    }

    // ✅ EXPLICIT 'data:' SYNTAX (no  shorthand)
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {  // ← Explicit 'data:' key
        fullName: fullName ? fullName.trim() : undefined,
        phone: phone ? phone.trim() : undefined,
        email: email ? email.toLowerCase().trim() : undefined,
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        faydaId: true,
        role: true,
      },
    });

    res.json({ message: 'Profile updated', user: updatedUser });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
};

// ============================================
// PUT /api/user/password - Change password
// ============================================
export const changePassword = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current and new password required' });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { password: true },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'New password must be at least 8 characters' });
    }

    const hashed = await bcrypt.hash(newPassword, 12);

    // ✅ EXPLICIT 'data:' SYNTAX (no  shorthand)
    await prisma.user.update({
      where: { id: userId },
      data: {  // ← Explicit 'data:' key
        password: hashed,
      },
    });

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Failed to change password' });
  }
};

// ============================================
// GET /api/users - Get all users (Admin/Officer only)
// ============================================
export const getUsers = async (req: Request, res: Response) => {
  try {
    const role = (req as any).user?.role;
    
    if (role !== 'Admin' && role !== 'admin' && role !== 'Officer' && role !== 'officer') {
      return res.status(403).json({ error: 'Forbidden: Admin or Officer access required' });
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        faydaId: true,
        role: true,
        status: true,
        createdAt: true,
        lastLogin: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const usersWithProperties = await Promise.all(
      users.map(async (u) => {
        const propertiesCount = await prisma.land.count({ where: { ownerId: u.id } });
        return {
          ...u,
          propertiesCount,
        };
      })
    );

    res.json({ users: usersWithProperties });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ error: 'Failed to fetch users list' });
  }
};

// ============================================
// PUT /api/users/:id/role - Update user role (Admin only)
// ============================================
export const updateUserRole = async (req: Request, res: Response) => {
  try {
    const requesterRole = (req as any).user?.role;
    
    if (requesterRole !== 'Admin' && requesterRole !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: Admin access required' });
    }

    const id = String(req.params.id || '');
    const { role } = req.body;

    if (!role) {
      return res.status(400).json({ error: 'Role is required' });
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { role },
      select: {
        id: true,
        fullName: true,
        role: true,
      }
    });

    res.json({ message: 'User role updated successfully', user: updated });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({ error: 'Failed to update user role' });
  }
};

// ============================================
// PUT /api/users/:id/status - Update user status (Admin only)
// ============================================
export const updateUserStatus = async (req: Request, res: Response) => {
  try {
    const requesterRole = (req as any).user?.role;
    
    if (requesterRole !== 'Admin' && requesterRole !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: Admin access required' });
    }

    const id = String(req.params.id || '');
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { status },
      select: {
        id: true,
        fullName: true,
        status: true,
      }
    });

    res.json({ message: 'User status updated successfully', user: updated });
  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({ error: 'Failed to update user status' });
  }
};
