import { Router } from 'express';
import { getActivities, getTimeline } from '../controllers/activity.controller';
import { protect } from '../middleware/auth';

const router = Router();

router.use(protect);

router.get('/', getActivities);
router.get('/timeline', getTimeline);

export default router;
