import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/supabase';
import { applyOwnershipScope } from '../utils/access';
import { toCamelCase } from '../utils/transform';

export const getActivities = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    // Cap limit to prevent large data dumps
    const limit = Math.min(
      100,
      Math.max(1, parseInt(req.query.limit as string) || 20),
    );

    const query = applyOwnershipScope(
      supabase.from('activities').select('*'),
      req.user!,
      'user_id',
    );

    const { data: activities, error } = await query
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      next(error);
      return;
    }

    res
      .status(200)
      .json({ success: true, data: toCamelCase(activities || []) });
  } catch (error) {
    next(error);
  }
};

export const getTimeline = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  return getActivities(req, res, next);
};
