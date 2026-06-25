import { Request, Response, NextFunction } from 'express';
import { toCamelCase } from '../utils/transform';
import {
  getLeads,
  createLead,
  updateLead,
  deleteLead,
} from '../services/lead.service';
import { CreateLeadInput, UpdateLeadInput } from '../schemas/lead.schema';

export const list = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, parseInt(req.query.limit as string) || 10);
    const search = (req.query.search as string) || '';
    const status = req.query.status as string;

    const result = await getLeads(req.user!, page, limit, search, status);

    res.status(200).json({
      success: true,
      data: { ...result, data: toCamelCase(result.data) },
    });
  } catch (error) {
    next(error);
  }
};

export const create = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const lead = await createLead(req.user!, req.body as CreateLeadInput);
    res.status(201).json({ success: true, data: toCamelCase(lead) });
  } catch (error) {
    next(error);
  }
};

export const update = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const lead = await updateLead(
      req.user!,
      req.params.id as string,
      req.body as UpdateLeadInput,
    );
    res.status(200).json({ success: true, data: toCamelCase(lead) });
  } catch (error) {
    next(error);
  }
};

export const remove = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    await deleteLead(req.user!, req.params.id as string);
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};
