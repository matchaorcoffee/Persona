import { Router } from 'express';
import { getQuestions, scoreTest } from '../controllers/personality.controller';
import { authenticateJWT } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticateJWT);

// GET /api/personality-test/questions
router.get('/questions', getQuestions);

// POST /api/personality-test/score
router.post('/score', scoreTest);

export default router;
