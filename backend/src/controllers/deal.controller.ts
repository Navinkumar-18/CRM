import { Request, Response, NextFunction } from 'express';
import { toCamelCase } from '../utils/transform';
import {
  getDeals,
  getDealById,
  getPipelineSummary,
  createDeal,
  updateDeal,
  updateDealStage,
  deleteDeal,
} from '../services/deal.service';
import {
  CreateDealInput,
  UpdateDealInput,
  UpdateDealStageInput,
} from '../schemas/deal.schema';

export const list = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, parseInt(req.query.limit as string) || 10);
    const search = (req.query.search as string) || '';
    const stage = req.query.stage as string | undefined;
    const companyId = req.query.company_id as string | undefined;

    const result = await getDeals(
      req.user!,
      page,
      limit,
      search,
      stage,
      companyId,
    );
    res.json({
      success: true,
      data: { ...result, data: toCamelCase(result.data) },
    });
  } catch (error) {
    next(error);
  }
};

export const getOne = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const deal = await getDealById(req.user!, req.params.id as string);
    if (!deal) {
      res.status(404).json({ success: false, message: 'Deal not found' });
      return;
    }
    res.json({ success: true, data: toCamelCase(deal) });
  } catch (error) {
    next(error);
  }
};

export const pipeline = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const summary = await getPipelineSummary(req.user!);
    res.json({ success: true, data: summary });
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
    const deal = await createDeal(req.user!, req.body as CreateDealInput);
    res.status(201).json({ success: true, data: toCamelCase(deal) });
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
    const deal = await updateDeal(
      req.user!,
      req.params.id as string,
      req.body as UpdateDealInput,
    );
    res.json({ success: true, data: toCamelCase(deal) });
  } catch (error) {
    next(error);
  }
};

export const changeStage = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const deal = await updateDealStage(
      req.user!,
      req.params.id as string,
      req.body as UpdateDealStageInput,
    );
    res.json({ success: true, data: toCamelCase(deal) });
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
    await deleteDeal(req.user!, req.params.id as string);
    res.json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};
