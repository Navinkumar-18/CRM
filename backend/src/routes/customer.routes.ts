import { Router } from 'express';
import { list, create, update, remove } from '../controllers/customer.controller';
import { protect } from '../middleware/auth';
import { authorize } from '../middleware/roles';
import { validate } from '../middleware/validate';
import { validateUUID } from '../middleware/validateParams';
import {
  createCustomerSchema,
  updateCustomerSchema,
} from '../schemas/customer.schema';

const router = Router();

// All customer routes require authentication
router.use(protect);

router.get('/', list);
router.post('/', validate(createCustomerSchema), create);
router.put('/:id', validateUUID('id'), validate(updateCustomerSchema), update);
router.delete('/:id', validateUUID('id'), authorize('admin', 'manager'), remove);

export default router;
