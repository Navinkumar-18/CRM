import { Router } from 'express';
import {
  getModules,
  getModule,
  postModule,
  patchModule,
  destroyModule,
  postField,
  destroyField,
  getRecords,
  postRecord,
  patchRecord,
  destroyRecord,
} from '../controllers/custom.controller';
import { protect } from '../middleware/auth';
import { authorize } from '../middleware/roles';
import { validate } from '../middleware/validate';
import { validateUUID } from '../middleware/validateParams';
import {
  createCustomModuleSchema,
  createCustomFieldSchema,
  createCustomRecordSchema,
  updateCustomRecordSchema,
} from '../schemas/custom.schema';

const router = Router();

router.use(protect);

// ── Module management (admin only for writes) ─────────────────
router.get('/modules', getModules);
router.get('/modules/:slug', getModule);
router.post('/modules', authorize('admin'), validate(createCustomModuleSchema), postModule);
router.put('/modules/:id', validateUUID('id'), authorize('admin'), patchModule);
router.delete('/modules/:id', validateUUID('id'), authorize('admin'), destroyModule);

// ── Field management (admin only) ────────────────────────────
router.post('/modules/:slug/fields', authorize('admin'), validate(createCustomFieldSchema), postField);
router.delete('/fields/:id', validateUUID('id'), authorize('admin'), destroyField);

// ── Records CRUD (all authenticated users) ───────────────────
router.get('/records/:slug', getRecords);
router.post('/records/:slug', validate(createCustomRecordSchema), postRecord);
router.put('/records/:id', validateUUID('id'), validate(updateCustomRecordSchema), patchRecord);
router.delete('/records/:id', validateUUID('id'), authorize('admin', 'manager'), destroyRecord);

export default router;
