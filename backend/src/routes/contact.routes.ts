import { Router } from 'express';
import {
  list,
  getOne,
  create,
  update,
  remove,
} from '../controllers/contact.controller';
import { protect } from '../middleware/auth';
import { authorize } from '../middleware/roles';
import { validate } from '../middleware/validate';
import { validateUUID } from '../middleware/validateParams';
import {
  createContactSchema,
  updateContactSchema,
} from '../schemas/contact.schema';

const router = Router();

router.use(protect);

router.get('/', list);
router.get('/:id', validateUUID('id'), getOne);
router.post('/', validate(createContactSchema), create);
router.put('/:id', validateUUID('id'), validate(updateContactSchema), update);
router.delete(
  '/:id',
  validateUUID('id'),
  authorize('admin', 'manager'),
  remove,
);

export default router;
