import { Router } from 'express';
import {
  list,
  getOne,
  pipeline,
  create,
  update,
  changeStage,
  remove,
} from '../controllers/deal.controller';
import { protect } from '../middleware/auth';
import { authorize } from '../middleware/roles';
import { validate } from '../middleware/validate';
import { validateUUID } from '../middleware/validateParams';
import {
  createDealSchema,
  updateDealSchema,
  updateDealStageSchema,
} from '../schemas/deal.schema';

const router = Router();

router.use(protect);

router.get('/', list);
router.get('/pipeline', pipeline);                    // pipeline summary (before /:id)
router.get('/:id', validateUUID('id'), getOne);
router.post('/', validate(createDealSchema), create);
router.put('/:id', validateUUID('id'), validate(updateDealSchema), update);
router.patch('/:id/stage', validateUUID('id'), validate(updateDealStageSchema), changeStage);
router.delete('/:id', validateUUID('id'), authorize('admin', 'manager'), remove);

export default router;
