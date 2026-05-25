// File: backend/src/routes/users.routes.ts
// Purpose: Expose user list operations for admin panel

import { Router } from 'express';
import { getUsers } from '../controllers/user.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// Require authentication for all user management endpoints
router.use(authenticate);

// GET /api/users - Fetch all users in the system (Admin/Officer only)
router.get('/', getUsers);

export default router;
