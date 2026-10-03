import { Router } from 'express';
import { sessionNotesController } from '../controllers/sessionNotes.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { createSessionNoteSchema, updateSessionNoteSchema } from '../validators/sessionNotes.validator';

const router = Router();
router.use(authMiddleware);
router.get('/', sessionNotesController.getAll);
router.get('/:id', sessionNotesController.getById);
router.post('/', validate(createSessionNoteSchema), sessionNotesController.create);
router.put('/:id', validate(updateSessionNoteSchema), sessionNotesController.update);
export default router;
