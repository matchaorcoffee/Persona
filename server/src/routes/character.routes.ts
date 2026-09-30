import { Router } from 'express';
import {
  listCharacters,
  getCharacter,
  createCharacter,
  updateCharacter,
  deleteCharacter,
  togglePublish,
  getGallery,
} from '../controllers/character.controller';
import { authenticateJWT } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticateJWT);

router.get('/', listCharacters);
router.get('/gallery', getGallery);
router.get('/:id', getCharacter);
router.post('/', createCharacter);
router.patch('/:id', updateCharacter);
router.delete('/:id', deleteCharacter);
router.patch('/:id/publish', togglePublish);

export default router;
