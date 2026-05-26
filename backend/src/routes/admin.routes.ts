import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  getAdminUsers,
  getAdminUserById,
  createAdminUser,
  updateAdminUser,
  deleteAdminUser,
  resetAdminUserPassword,
  getAdminUserStats,
  bulkUpdateUserStatus,
  bulkDeleteUsers,
  exportUsersCsv,
  getAdminVerifications,
  getAdminVerificationById,
  createAdminVerification,
  updateAdminVerificationStatus,
  updateAdminVerification,
  deleteAdminVerification,
  getAdminVerificationStats,
  bulkUpdateVerificationStatus,
  bulkDeleteVerifications,
  exportVerificationsCsv,
  getMarketplaceListings,
  getMarketplaceStats,
  getPayments,
  getPaymentsStats,
  getNotifications,
  markNotificationAsRead,
  getDashboardStats,
} from '../controllers/admin.controller';

const router = Router();
router.use(authenticate);

// Users endpoints
router.get('/users', getAdminUsers);
router.get('/users/:id', getAdminUserById);
router.post('/users', createAdminUser);
router.put('/users/:id', updateAdminUser);
router.delete('/users/:id', deleteAdminUser);
router.put('/users/:id/role', updateAdminUser);
router.patch('/users/:id/status', updateAdminUser);
router.post('/users/:id/reset-password', resetAdminUserPassword);
router.get('/users/stats/summary', getAdminUserStats);
router.post('/users/bulk/update-status', bulkUpdateUserStatus);
router.post('/users/bulk/delete', bulkDeleteUsers);
router.get('/users/export/csv', exportUsersCsv);

// Verifications endpoints
router.get('/verifications', getAdminVerifications);
router.get('/verifications/:id', getAdminVerificationById);
router.post('/verifications', createAdminVerification);
router.put('/verifications/:id/status', updateAdminVerificationStatus);
router.put('/verifications/:id', updateAdminVerification);
router.delete('/verifications/:id', deleteAdminVerification);
router.get('/verifications/stats/summary', getAdminVerificationStats);
router.post('/verifications/bulk/status', bulkUpdateVerificationStatus);
router.post('/verifications/bulk/delete', bulkDeleteVerifications);
router.get('/verifications/export/csv', exportVerificationsCsv);

// Marketplace endpoints
router.get('/marketplace/listings', getMarketplaceListings);
router.get('/marketplace/stats', getMarketplaceStats);

// Payments endpoints
router.get('/payments', getPayments);
router.get('/payments/stats', getPaymentsStats);

// Notifications endpoints
router.get('/notifications', getNotifications);
router.put('/notifications/:id/read', markNotificationAsRead);

// Dashboard endpoints
router.get('/stats', getDashboardStats);

export default router;
