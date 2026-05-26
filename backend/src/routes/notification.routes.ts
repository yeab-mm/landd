// File: backend/src/routes/notification.routes.ts
// Purpose: Expose endpoints for user notifications

import { Router } from 'express';
import { getNotifications, markAsRead } from '../controllers/notification.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// All notification routes require authentication
router.use(authenticate);

// GET /api/notifications - Retrieve all notifications
router.get('/', getNotifications);

// PUT /api/notifications/:id/read - Mark single notification as read
router.put('/:id/read', markAsRead);

export default router;
