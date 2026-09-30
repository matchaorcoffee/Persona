import { Router } from 'express';
import {
  createConversation,
  listConversations,
  getMessages,
  sendMessage,
  deleteConversation,
  messageLimiter,
} from '../controllers/conversation.controller';
import { authenticateJWT } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticateJWT);

router.get('/', listConversations);
router.post('/', createConversation);
router.get('/:id/messages', getMessages);
router.post('/:id/messages', messageLimiter, sendMessage);
router.delete('/:id', deleteConversation);

export default router;
