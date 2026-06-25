import { Request, Response, NextFunction } from 'express';
import { toCamelCase } from '../utils/transform';
import {
  getDashboardSummary,
  getPipelineRevenue,
  getRecentActivities as fetchRecentActivities,
  getLeadFunnel,
} from '../services/dashboard.service';

export const getMetrics = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const summary = await getDashboardSummary(req.user!);
    res.json({ success: true, data: summary });
  } catch (error) {
    next(error);
  }
};

export const getPipeline = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const pipeline = await getPipelineRevenue(req.user!);
    res.json({ success: true, data: pipeline });
  } catch (error) {
    next(error);
  }
};

export const getRecentActivity = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const limit = Math.min(50, parseInt(req.query.limit as string) || 20);
    const activities = await fetchRecentActivities(req.user!, limit);
    res.json({ success: true, data: toCamelCase(activities) });
  } catch (error) {
    next(error);
  }
};

export const getFunnel = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const funnel = await getLeadFunnel(req.user!);
    res.json({ success: true, data: funnel });
  } catch (error) {
    next(error);
  }
};

// Backward-compat aliases
export const getRecentActivities = getRecentActivity;
export const getConversionStats = getFunnel;
