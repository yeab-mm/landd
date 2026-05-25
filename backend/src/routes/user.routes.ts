// File: src/routes/user.routes.ts
// Location: backend/src/routes/user.routes.ts

import { Router } from 'express';
import { getProfile, updateProfile, changePassword } from '../controllers/user.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// All user routes require authentication
router.use(authenticate);

router.get('/me', getProfile);
router.put('/me', updateProfile);
router.put('/password', changePassword);

export default router;