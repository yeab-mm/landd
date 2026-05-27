import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../config/database';
import { parseFormData, serializeFormData } from '../utils/formData';

const isAdmin = (req: Request) => {
  const role = (req as any).user?.role;
  return role === 'Admin' || role === 'admin';
};

const isAdminOrOfficer = (req: Request) => {
  const role = (req as any).user?.role;
  return role === 'Admin' || role === 'admin' || role === 'Officer' || role === 'officer';
};

const normalizeUser = (user: any) => ({
  id: user.id,
  email: user.email,
  fullName: user.fullName,
  phone: user.phone,
  faydaId: user.faydaId,
  role: user.role,
  status: user.status,
  createdAt: user.createdAt,
  lastLogin: user.lastLogin,
});

export const getAdminUsers = async (req: Request, res: Response) => {
  try {
    if (!isAdminOrOfficer(req)) {
      return res.status(403).json({ error: 'Forbidden: Admin or Officer access required' });
    }

    const query = req.query as any;
    const filters: any = {};
    if (query.search) {
      filters.OR = [
        { fullName: { contains: String(query.search), mode: 'insensitive' } },
        { email: { contains: String(query.search), mode: 'insensitive' } },
        { phone: { contains: String(query.search), mode: 'insensitive' } },
        { faydaId: { contains: String(query.search), mode: 'insensitive' } },
      ];
    }
    if (query.role && query.role !== 'all') {
      filters.role = query.role;
    }
    if (query.status && query.status !== 'all') {
      filters.status = query.status;
    }

    const users = await prisma.user.findMany({
      where: filters,
      orderBy: { createdAt: 'desc' },
    });

    const usersWithProperties = await Promise.all(
      users.map(async (user) => {
        const propertiesCount = await prisma.land.count({ where: { ownerId: user.id } });
        return {
          ...normalizeUser(user),
          properties: propertiesCount,
          joinedDate: user.createdAt.toISOString(),
        };
      })
    );

    return res.json({ users: usersWithProperties });
  } catch (error) {
    console.error('Get admin users error:', error);
    return res.status(500).json({ error: 'Failed to fetch admin users' });
  }
};

export const getAdminUserById = async (req: Request, res: Response) => {
  try {
    if (!isAdminOrOfficer(req)) {
      return res.status(403).json({ error: 'Forbidden: Admin or Officer access required' });
    }

    const id = String(req.params.id || '');
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const propertiesCount = await prisma.land.count({ where: { ownerId: id } });
    return res.json({ user: { ...normalizeUser(user), properties: propertiesCount, joinedDate: user.createdAt.toISOString() } });
  } catch (error) {
    console.error('Get admin user by id error:', error);
    return res.status(500).json({ error: 'Failed to fetch user' });
  }
};

export const createAdminUser = async (req: Request, res: Response) => {
  try {
    if (!isAdmin(req)) {
      return res.status(403).json({ error: 'Forbidden: Admin access required' });
    }

    const { name, email, phone, kebeleId, role, status, password } = req.body;
    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }

    const existing = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });
    if (existing) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password || 'ChangeMe@123', 12);
    const newUser = await prisma.user.create({
      data: {
        fullName: name.trim(),
        email: email.toLowerCase().trim(),
        phone: phone?.trim() || '',
        faydaId: kebeleId?.trim() || '',
        role: role || 'Citizen',
        status: status || 'Active',
        password: hashedPassword,
      },
    });

    return res.status(201).json({ user: normalizeUser(newUser) });
  } catch (error) {
    console.error('Create admin user error:', error);
    return res.status(500).json({ error: 'Failed to create user' });
  }
};

export const updateAdminUser = async (req: Request, res: Response) => {
  try {
    if (!isAdminOrOfficer(req)) {
      return res.status(403).json({ error: 'Forbidden: Admin or Officer access required' });
    }

    const id = String(req.params.id || '');
    const { name, email, phone, kebeleId, role, status } = req.body;

    if (email) {
      const existing = await prisma.user.findFirst({
        where: { email: email.toLowerCase().trim(), NOT: { id } },
      });
      if (existing) {
        return res.status(400).json({ error: 'Email already in use by another account' });
      }
    }

    const updated = await prisma.user.update({
      where: { id },
      data: {
        fullName: name?.trim(),
        email: email ? email.toLowerCase().trim() : undefined,
        phone: phone?.trim(),
        faydaId: kebeleId?.trim(),
        role,
        status,
      },
    });

    return res.json({ user: normalizeUser(updated) });
  } catch (error) {
    console.error('Update admin user error:', error);
    return res.status(500).json({ error: 'Failed to update user' });
  }
};

export const deleteAdminUser = async (req: Request, res: Response) => {
  try {
    if (!isAdmin(req)) {
      return res.status(403).json({ error: 'Forbidden: Admin access required' });
    }

    const id = String(req.params.id || '');
    await prisma.user.delete({ where: { id } });
    return res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete admin user error:', error);
    return res.status(500).json({ error: 'Failed to delete user' });
  }
};

export const resetAdminUserPassword = async (req: Request, res: Response) => {
  try {
    if (!isAdmin(req)) {
      return res.status(403).json({ error: 'Forbidden: Admin access required' });
    }

    const id = String(req.params.id || '');
    const { newPassword } = req.body;
    if (!newPassword) {
      return res.status(400).json({ error: 'New password is required' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({
      where: { id },
      data: { password: hashedPassword },
    });

    return res.json({ message: 'User password reset successfully' });
  } catch (error) {
    console.error('Reset admin user password error:', error);
    return res.status(500).json({ error: 'Failed to reset password' });
  }
};

export const getAdminUserStats = async (req: Request, res: Response) => {
  try {
    if (!isAdminOrOfficer(req)) {
      return res.status(403).json({ error: 'Forbidden: Admin or Officer access required' });
    }

    const totalUsers = await prisma.user.count();
    const activeUsers = await prisma.user.count({ where: { status: 'Active' } });
    const inactiveUsers = await prisma.user.count({ where: { status: 'Inactive' } });
    const pendingUsers = await prisma.user.count({ where: { status: 'Pending' } });
    const admins = await prisma.user.count({ where: { role: { in: ['Admin', 'admin'] } } });
    const officers = await prisma.user.count({ where: { role: { in: ['Officer', 'officer'] } } });
    const citizens = await prisma.user.count({ where: { role: { in: ['Citizen', 'citizen'] } } });

    return res.json({
      totalUsers,
      activeUsers,
      inactiveUsers,
      pendingUsers,
      admins,
      officers,
      citizens,
    });
  } catch (error) {
    console.error('Get admin user stats error:', error);
    return res.status(500).json({ error: 'Failed to fetch user stats' });
  }
};

export const bulkUpdateUserStatus = async (req: Request, res: Response) => {
  try {
    if (!isAdmin(req)) {
      return res.status(403).json({ error: 'Forbidden: Admin access required' });
    }

    const { userIds, status } = req.body;
    if (!Array.isArray(userIds) || !status) {
      return res.status(400).json({ error: 'userIds array and status are required' });
    }

    await prisma.user.updateMany({
      where: { id: { in: userIds } },
      data: { status },
    });

    return res.json({ message: 'User statuses updated successfully' });
  } catch (error) {
    console.error('Bulk update user status error:', error);
    return res.status(500).json({ error: 'Failed to update user statuses' });
  }
};

export const bulkDeleteUsers = async (req: Request, res: Response) => {
  try {
    if (!isAdmin(req)) {
      return res.status(403).json({ error: 'Forbidden: Admin access required' });
    }

    const { userIds } = req.body;
    if (!Array.isArray(userIds)) {
      return res.status(400).json({ error: 'userIds array is required' });
    }

    await prisma.user.deleteMany({
      where: { id: { in: userIds } },
    });

    return res.json({ message: 'Users deleted successfully' });
  } catch (error) {
    console.error('Bulk delete users error:', error);
    return res.status(500).json({ error: 'Failed to delete users' });
  }
};

export const exportUsersCsv = async (req: Request, res: Response) => {
  try {
    if (!isAdminOrOfficer(req)) {
      return res.status(403).json({ error: 'Forbidden: Admin or Officer access required' });
    }

    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
    });

    const header = 'id,fullName,email,phone,faydaId,role,status,createdAt,lastLogin\n';
    const rows = users.map((user) => [
      user.id,
      user.fullName,
      user.email || '',
      user.phone || '',
      user.faydaId || '',
      user.role,
      user.status,
      user.createdAt.toISOString(),
      user.lastLogin ? user.lastLogin.toISOString() : '',
    ]);

    const csv = header + rows.map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(',')).join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="users.csv"');
    return res.send(csv);
  } catch (error) {
    console.error('Export users csv error:', error);
    return res.status(500).json({ error: 'Failed to export users CSV' });
  }
};

export const getAdminVerifications = async (req: Request, res: Response) => {
  try {
    if (!isAdminOrOfficer(req)) {
      return res.status(403).json({ error: 'Forbidden: Admin or Officer access required' });
    }

    const query = req.query as any;
    const filters: any = { type: 'Ownership Verification' };

    if (query.status && query.status !== 'all') {
      filters.status = query.status;
    }
    if (query.search) {
      filters.referenceNumber = { contains: String(query.search) };
    }

    const requests = await prisma.request.findMany({
      where: filters,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { fullName: true, email: true },
        },
      },
    });

    return res.json({
      verifications: requests.map((req) => {
        const formData = parseFormData(req.formData);
        return {
          id: req.id,
          applicant: formData.fullName || req.user.fullName || 'N/A',
          parcelId: formData.plotNumber || 'N/A',
          location: formData.kebele || 'N/A',
          submittedDate: req.createdAt.toISOString(),
          status: req.status,
          documentsCount: Array.isArray(formData.documents) ? formData.documents.length : 0,
          referenceNumber: req.referenceNumber,
        };
      }),
    });
  } catch (error) {
    console.error('Get admin verifications error:', error);
    return res.status(500).json({ error: 'Failed to fetch verifications' });
  }
};

export const getAdminVerificationById = async (req: Request, res: Response) => {
  try {
    if (!isAdminOrOfficer(req)) {
      return res.status(403).json({ error: 'Forbidden: Admin or Officer access required' });
    }

    const id = String(req.params.id || '');
    const verification = await prisma.request.findUnique({
      where: { id },
    });
    if (!verification) {
      return res.status(404).json({ error: 'Verification not found' });
    }

    return res.json({ verification });
  } catch (error) {
    console.error('Get admin verification by id error:', error);
    return res.status(500).json({ error: 'Failed to fetch verification' });
  }
};

export const createAdminVerification = async (req: Request, res: Response) => {
  try {
    if (!isAdminOrOfficer(req)) {
      return res.status(403).json({ error: 'Forbidden: Admin or Officer access required' });
    }

    const { applicant, parcelId, location, documents, purpose } = req.body;
    if (!applicant || !parcelId || !location) {
      return res.status(400).json({ error: 'Applicant, parcelId, and location are required' });
    }

    const referenceNumber = `VER-${new Date().getFullYear()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const formData = { fullName: applicant, plotNumber: parcelId, location, documents, purpose };

    const newVerification = await prisma.request.create({
      data: {
        type: 'Ownership Verification',
        status: 'pending',
        referenceNumber,
        formData: serializeFormData(formData),
        userId: (req as any).user?.userId,
      },
    });

    return res.status(201).json({ verification: newVerification });
  } catch (error) {
    console.error('Create admin verification error:', error);
    return res.status(500).json({ error: 'Failed to create verification' });
  }
};

export const updateAdminVerificationStatus = async (req: Request, res: Response) => {
  try {
    if (!isAdminOrOfficer(req)) {
      return res.status(403).json({ error: 'Forbidden: Admin or Officer access required' });
    }

    const role = ((req as any).user?.role || '').toLowerCase();
    const id = String(req.params.id || '');
    const { status, notes } = req.body;
    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    const statusNorm = String(status).toLowerCase();
    if (role === 'admin' && ['approved', 'rejected'].includes(statusNorm)) {
      return res.status(403).json({
        error: 'Admins cannot approve requests. Forward to an officer via Request intake.',
      });
    }

    const existing = await prisma.request.findUnique({ where: { id } });
    const merged = { ...parseFormData(existing?.formData), notes };
    const updated = await prisma.request.update({
      where: { id },
      data: { status, formData: serializeFormData(merged) },
    });

    return res.json({ verification: updated });
  } catch (error) {
    console.error('Update admin verification status error:', error);
    return res.status(500).json({ error: 'Failed to update verification status' });
  }
};

export const updateAdminVerification = async (req: Request, res: Response) => {
  try {
    if (!isAdminOrOfficer(req)) {
      return res.status(403).json({ error: 'Forbidden: Admin or Officer access required' });
    }

    const id = String(req.params.id || '');
    const data = req.body;

    const request = await prisma.request.findUnique({ where: { id } });
    if (!request) {
      return res.status(404).json({ error: 'Verification not found' });
    }

    const merged = { ...parseFormData(request.formData), ...data };
    const updated = await prisma.request.update({
      where: { id },
      data: {
        formData: serializeFormData(merged),
      },
    });

    return res.json({ verification: updated });
  } catch (error) {
    console.error('Update admin verification error:', error);
    return res.status(500).json({ error: 'Failed to update verification' });
  }
};

export const deleteAdminVerification = async (req: Request, res: Response) => {
  try {
    if (!isAdmin(req)) {
      return res.status(403).json({ error: 'Forbidden: Admin access required' });
    }

    const id = String(req.params.id || '');
    await prisma.request.delete({ where: { id } });
    return res.json({ message: 'Verification deleted successfully' });
  } catch (error) {
    console.error('Delete admin verification error:', error);
    return res.status(500).json({ error: 'Failed to delete verification' });
  }
};

export const getAdminVerificationStats = async (req: Request, res: Response) => {
  try {
    if (!isAdminOrOfficer(req)) {
      return res.status(403).json({ error: 'Forbidden: Admin or Officer access required' });
    }

    const total = await prisma.request.count({ where: { type: 'Ownership Verification' } });
    const pending = await prisma.request.count({ where: { type: 'Ownership Verification', status: 'pending' } });
    const approved = await prisma.request.count({ where: { type: 'Ownership Verification', status: 'approved' } });
    const rejected = await prisma.request.count({ where: { type: 'Ownership Verification', status: 'rejected' } });

    return res.json({ total, pending, approved, rejected });
  } catch (error) {
    console.error('Get admin verification stats error:', error);
    return res.status(500).json({ error: 'Failed to fetch verification stats' });
  }
};

export const bulkUpdateVerificationStatus = async (req: Request, res: Response) => {
  try {
    if (!isAdmin(req)) {
      return res.status(403).json({ error: 'Forbidden: Admin access required' });
    }

    const { verificationIds, status } = req.body;
    if (!Array.isArray(verificationIds) || !status) {
      return res.status(400).json({ error: 'verificationIds array and status are required' });
    }

    await prisma.request.updateMany({
      where: { id: { in: verificationIds } },
      data: { status },
    });

    return res.json({ message: 'Verification statuses updated successfully' });
  } catch (error) {
    console.error('Bulk update verification status error:', error);
    return res.status(500).json({ error: 'Failed to bulk update verification statuses' });
  }
};

export const bulkDeleteVerifications = async (req: Request, res: Response) => {
  try {
    if (!isAdmin(req)) {
      return res.status(403).json({ error: 'Forbidden: Admin access required' });
    }

    const { verificationIds } = req.body;
    if (!Array.isArray(verificationIds)) {
      return res.status(400).json({ error: 'verificationIds array is required' });
    }

    await prisma.request.deleteMany({
      where: { id: { in: verificationIds } },
    });

    return res.json({ message: 'Verifications deleted successfully' });
  } catch (error) {
    console.error('Bulk delete verifications error:', error);
    return res.status(500).json({ error: 'Failed to bulk delete verifications' });
  }
};

export const exportVerificationsCsv = async (req: Request, res: Response) => {
  try {
    if (!isAdminOrOfficer(req)) {
      return res.status(403).json({ error: 'Forbidden: Admin or Officer access required' });
    }

    const requests = await prisma.request.findMany({
      where: { type: 'Ownership Verification' },
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { fullName: true, email: true } } },
    });

    const header = 'id,referenceNumber,applicant,email,parcelId,location,status,createdAt\n';
    const rows = requests.map((request) => {
      const formData = parseFormData(request.formData);
      return [
        request.id,
        request.referenceNumber,
        formData.fullName || request.user.fullName || '',
        request.user.email || '',
        formData.plotNumber || '',
        formData.location || formData.kebele || '',
        request.status,
        request.createdAt.toISOString(),
      ];
    });

    const csv = header + rows.map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(',')).join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="verifications.csv"');
    return res.send(csv);
  } catch (error) {
    console.error('Export verifications csv error:', error);
    return res.status(500).json({ error: 'Failed to export verifications CSV' });
  }
};

// Marketplace endpoints (for admin listing management)
export const getMarketplaceListings = async (req: Request, res: Response) => {
  try {
    if (!isAdminOrOfficer(req)) {
      return res.status(403).json({ error: 'Forbidden: Admin or Officer access required' });
    }

    const lands = await prisma.land.findMany({
      include: {
        owner: {
          select: { id: true, fullName: true, email: true, phone: true }
        }
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.json({
      listings: lands.map((land) => ({
        id: land.id,
        title: `${land.landUseType} - ${land.kebele}`,
        status: land.verified ? 'active' : 'pending',
        type: land.landUseType.toLowerCase(),
        price: 0,
        area: `${land.landSize} sqm`,
        location: `${land.zone}, ${land.wereda}`,
        seller: land.owner.fullName,
        sellerId: land.owner.id,
        views: 0,
        postedDate: land.createdAt.toISOString(),
        verified: land.verified,
      })),
    });
  } catch (error) {
    console.error('Get marketplace listings error:', error);
    return res.status(500).json({ error: 'Failed to fetch listings' });
  }
};

export const getMarketplaceStats = async (req: Request, res: Response) => {
  try {
    if (!isAdminOrOfficer(req)) {
      return res.status(403).json({ error: 'Forbidden: Admin or Officer access required' });
    }

    const total = await prisma.land.count();
    const active = await prisma.land.count({ where: { verified: true } });
    const pending = await prisma.land.count({ where: { verified: false } });

    return res.json({ totalListings: total, activeListings: active, pendingListings: pending });
  } catch (error) {
    console.error('Get marketplace stats error:', error);
    return res.status(500).json({ error: 'Failed to fetch stats' });
  }
};

// Payments endpoints
export const getPayments = async (req: Request, res: Response) => {
  try {
    if (!isAdminOrOfficer(req)) {
      return res.status(403).json({ error: 'Forbidden: Admin or Officer access required' });
    }

    const payments = await prisma.payment.findMany({
      include: {
        user: {
          select: { id: true, fullName: true, email: true }
        }
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.json({
      payments: payments.map((p) => ({
        id: p.id,
        transaction: p.id.substring(0, 8),
        user: p.user.fullName,
        amount: p.amount,
        type: p.type || 'registration',
        status: p.status,
        date: p.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error('Get payments error:', error);
    return res.status(500).json({ error: 'Failed to fetch payments' });
  }
};

export const getPaymentsStats = async (req: Request, res: Response) => {
  try {
    if (!isAdminOrOfficer(req)) {
      return res.status(403).json({ error: 'Forbidden: Admin or Officer access required' });
    }

    const total = await prisma.payment.count();
    const completed = await prisma.payment.count({ where: { status: 'completed' } });
    const pending = await prisma.payment.count({ where: { status: 'pending' } });
    const failed = await prisma.payment.count({ where: { status: 'failed' } });

    const totalAmount = await prisma.payment.aggregate({
      where: { status: 'completed' },
      _sum: { amount: true },
    });

    return res.json({
      totalTransactions: total,
      completedTransactions: completed,
      pendingTransactions: pending,
      failedTransactions: failed,
      totalAmount: totalAmount._sum.amount || 0,
    });
  } catch (error) {
    console.error('Get payments stats error:', error);
    return res.status(500).json({ error: 'Failed to fetch stats' });
  }
};

// Notifications endpoints
export const getNotifications = async (req: Request, res: Response) => {
  try {
    if (!isAdminOrOfficer(req)) {
      return res.status(403).json({ error: 'Forbidden: Admin or Officer access required' });
    }

    const userId = (req as any).user?.userId;
    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return res.json({ notifications });
  } catch (error) {
    console.error('Get notifications error:', error);
    return res.status(500).json({ error: 'Failed to fetch notifications' });
  }
};

export const markNotificationAsRead = async (req: Request, res: Response) => {
  try {
    if (!isAdminOrOfficer(req)) {
      return res.status(403).json({ error: 'Forbidden: Admin or Officer access required' });
    }

    const id = String(req.params.id || '');
    const updated = await prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });

    return res.json({ notification: updated });
  } catch (error) {
    console.error('Mark notification as read error:', error);
    return res.status(500).json({ error: 'Failed to mark notification as read' });
  }
};

// Dashboard stats
export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    if (!isAdminOrOfficer(req)) {
      return res.status(403).json({ error: 'Forbidden: Admin or Officer access required' });
    }

    const totalUsers = await prisma.user.count();
    const totalLands = await prisma.land.count();
    const totalRequests = await prisma.request.count();
    const totalPayments = await prisma.payment.count();
    const completedPayments = await prisma.payment.count({ where: { status: 'completed' } });

    const recentActivities = await prisma.request.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { fullName: true }
        }
      }
    });

    return res.json({
      stats: {
        totalUsers,
        totalLands,
        totalRequests,
        totalPayments,
        completedPayments,
      },
      recentActivities: recentActivities.map((a) => ({
        id: a.id,
        description: `${a.user.fullName} submitted ${a.type}`,
        timestamp: a.createdAt.toISOString(),
        type: a.type,
      })),
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    return res.status(500).json({ error: 'Failed to fetch stats' });
  }
};
