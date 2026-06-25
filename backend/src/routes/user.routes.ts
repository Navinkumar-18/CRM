import { Router } from 'express';
import { list, create, update, remove } from '../controllers/user.controller';
import { protect } from '../middleware/auth';
import { authorize } from '../middleware/roles';
import { validate } from '../middleware/validate';
import { validateUUID } from '../middleware/validateParams';
import { createUserSchema, updateUserSchema } from '../schemas/user.schema';

const router = Router();

// All user management routes require authentication + admin role
router.use(protect);
router.use(authorize('admin'));

router.get('/', list);
router.post('/', validate(createUserSchema), create);
router.put('/:id', validateUUID('id'), validate(updateUserSchema), update);
router.delete('/:id', validateUUID('id'), remove);

export default router;
