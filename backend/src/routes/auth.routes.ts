// File: backend/src/routes/auth.routes.ts
// Purpose: Define authentication API endpoints

import { Router } from 'express';
import { register, login, verifyOTP, resendOTP } from '../controllers/auth.controller';

const router = Router();

// Public authentication routes
router.post('/register', register);
router.post('/login', login);
router.post('/verify-otp', verifyOTP);
router.post('/resend-otp', resendOTP);

export default router;