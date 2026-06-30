import { Router } from 'express';
import { list, create, update, remove } from '../controllers/lead.controller';
import { protect } from '../middleware/auth';
import { authorize } from '../middleware/roles';
import { validate } from '../middleware/validate';
import { validateUUID } from '../middleware/validateParams';
import { createLeadSchema, updateLeadSchema } from '../schemas/lead.schema';

const router = Router();

// All lead routes require authentication
router.use(protect);

router.get('/', list);
router.post('/', validate(createLeadSchema), create);
router.put('/:id', validateUUID('id'), validate(updateLeadSchema), update);
router.delete(
  '/:id',
  validateUUID('id'),
  authorize('admin', 'manager'),
  remove,
);

export default router;
