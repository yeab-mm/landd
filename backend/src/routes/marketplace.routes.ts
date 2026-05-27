import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  getMarketplaceListings,
  submitMarketplaceListing,
} from '../controllers/marketplace.controller';

const router = Router();

router.get('/listings', authenticate, getMarketplaceListings);
router.post('/listings', authenticate, submitMarketplaceListing);

export default router;
