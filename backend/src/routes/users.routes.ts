// File: backend/src/routes/users.routes.ts
// Purpose: Expose user list operations for admin panel

import { Router } from 'express';
import { getUsers, updateUserRole, updateUserStatus } from '../controllers/user.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// Require authentication for all user management endpoints
router.use(authenticate);

// GET /api/users - Fetch all users in the system (Admin/Officer only)
router.get('/', getUsers);

// PUT /api/users/:id/role - Update user role (Admin only)
router.put('/:id/role', updateUserRole);

// PUT /api/users/:id/status - Update user status (Admin only)
router.put('/:id/status', updateUserStatus);

export default router;
