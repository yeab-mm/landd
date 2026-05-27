import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  startConversation,
  getMyConversations,
  getMessages,
  sendMessage,
  getAdminConversations,
  updateAdminConversation,
} from '../controllers/chat.controller';

const router = Router();
router.use(authenticate);

router.post('/conversations', startConversation);
router.get('/conversations', getMyConversations);
router.get('/conversations/:id/messages', getMessages);
router.post('/conversations/:id/messages', sendMessage);

router.get('/admin/conversations', getAdminConversations);
router.put('/admin/conversations/:id', updateAdminConversation);

export default router;
