import { Router } from 'express';
import { list, create, update, remove } from '../controllers/note.controller';
import { protect } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { validateUUID } from '../middleware/validateParams';
import { createNoteSchema, updateNoteSchema } from '../schemas/note.schema';

const router = Router();

router.use(protect);

router.get('/', list);                                            // ?lead_id= &deal_id= &contact_id= &company_id=
router.post('/', validate(createNoteSchema), create);
router.put('/:id', validateUUID('id'), validate(updateNoteSchema), update);
router.delete('/:id', validateUUID('id'), remove);

export default router;
