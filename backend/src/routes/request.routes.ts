// File: backend/src/routes/request.routes.ts
// Purpose: Define routes for request management API endpoints

import { Router } from 'express';
import {
  createRequest,
  getRequests,
  getRequestDetail,
  updateRequestStatus,
} from '../controllers/request.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// All request routes require authentication
router.use(authenticate);

router.get('/', getRequests);
router.get('/:referenceNumber', getRequestDetail);
router.post('/', createRequest);
router.put('/:id', updateRequestStatus);

export default router;

