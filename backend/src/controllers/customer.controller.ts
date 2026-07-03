import { Request, Response, NextFunction } from 'express';
import { toCamelCase } from '../utils/transform';
import {
  getCustomers,
  createCustomer,
  updateCustomer,
  deleteCustomer,
} from '../services/customer.service';
import {
  CreateCustomerInput,
  UpdateCustomerInput,
} from '../schemas/customer.schema';

export const list = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, parseInt(req.query.limit as string) || 10);
    const search = (req.query.search as string) || '';
    const sector = req.query.sector as string;

    const result = await getCustomers(req.user!, page, limit, search, sector);

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
    const customer = await createCustomer(
      req.user!,
      req.body as CreateCustomerInput,
    );
    res.status(201).json({ success: true, data: toCamelCase(customer) });
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
    const customer = await updateCustomer(
      req.user!,
      req.params.id as string,
      req.body as UpdateCustomerInput,
    );
    res.status(200).json({ success: true, data: toCamelCase(customer) });
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
    await deleteCustomer(req.user!, req.params.id as string);
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};
