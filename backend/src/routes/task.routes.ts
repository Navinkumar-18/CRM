import { Router } from 'express';
import { list, create, update, remove } from '../controllers/task.controller';
import { protect } from '../middleware/auth';
import { authorize } from '../middleware/roles';
import { validate } from '../middleware/validate';
import { validateUUID } from '../middleware/validateParams';
import { createTaskSchema, updateTaskSchema } from '../schemas/task.schema';

const router = Router();

// All task routes require authentication
router.use(protect);

router.get('/', list);
router.post('/', validate(createTaskSchema), create);
router.put('/:id', validateUUID('id'), validate(updateTaskSchema), update);
// Only admin/manager can delete tasks
router.delete(
  '/:id',
  validateUUID('id'),
  authorize('admin', 'manager'),
  remove,
);

export default router;
