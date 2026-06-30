import { Router } from 'express';
import {
  list,
  getOne,
  create,
  update,
  remove,
  verifyGst,
} from '../controllers/company.controller';
import { protect } from '../middleware/auth';
import { authorize } from '../middleware/roles';
import { validate } from '../middleware/validate';
import { validateUUID } from '../middleware/validateParams';
import {
  createCompanySchema,
  updateCompanySchema,
} from '../schemas/company.schema';

const router = Router();

router.use(protect);

router.get('/verify-gst/:gst', verifyGst);
router.get('/', list);
router.get('/:id', validateUUID('id'), getOne);
router.post('/', validate(createCompanySchema), create);
router.put('/:id', validateUUID('id'), validate(updateCompanySchema), update);
router.delete(
  '/:id',
  validateUUID('id'),
  authorize('admin', 'manager'),
  remove,
);

export default router;
