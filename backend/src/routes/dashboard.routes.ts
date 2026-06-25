import { Router } from 'express';
import {
  getMetrics,
  getPipeline,
  getRecentActivity,
  getFunnel,
} from '../controllers/dashboard.controller';
import { protect } from '../middleware/auth';

const router = Router();

router.use(protect);

router.get('/summary', getMetrics);       // KPI counts: leads, deals, tasks, revenue
router.get('/pipeline', getPipeline);     // Revenue by stage
router.get('/funnel', getFunnel);         // Lead status breakdown
router.get('/recent', getRecentActivity); // Recent activity feed

// Legacy aliases for frontend compatibility
router.get('/metrics', getMetrics);
router.get('/conversion', getFunnel);

export default router;
