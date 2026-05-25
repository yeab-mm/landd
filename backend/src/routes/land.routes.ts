// File: backend/src/routes/land.routes.ts
// Purpose: Define land management API endpoints

import { Router } from 'express';
import {
  getLands,
  getLand,
  createLand,
  updateLand,
  deleteLand,
} from '../controllers/land.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// All land routes require authentication
router.use(authenticate);

router.get('/', getLands);
router.get('/:id', getLand);
router.post('/', createLand);
router.put('/:id', updateLand);
router.delete('/:id', deleteLand);

export default router;