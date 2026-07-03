import { Request, Response, NextFunction } from 'express';
import { toCamelCase } from '../utils/transform';
import {
  getCompanies,
  getCompanyById,
  createCompany,
  updateCompany,
  deleteCompany,
} from '../services/company.service';
import {
  CreateCompanyInput,
  UpdateCompanyInput,
} from '../schemas/company.schema';
import { verifyGstNumber } from '../services/gst.service';

export const verifyGst = async (
  req: Request,
  res: Response,
  _next: NextFunction,
): Promise<void> => {
  try {
    const gst = req.params.gst as string;
    if (!gst || gst.length !== 15) {
      res.status(400).json({
        success: false,
        message: 'Invalid GSTIN format. Must be 15 characters.',
      });
      return;
    }
    const details = await verifyGstNumber(gst);
    res.json({ success: true, data: details });
  } catch (error: any) {
    const msg = error.message || 'GST verification failed';
    // Return appropriate status based on error type
    if (msg.includes('not found') || msg.includes('not found in government')) {
      res.status(404).json({ success: false, message: msg });
    } else if (msg.includes('Invalid GSTIN')) {
      res.status(400).json({ success: false, message: msg });
    } else if (msg.includes('temporarily unavailable')) {
      res.status(503).json({ success: false, message: msg });
    } else {
      res.status(500).json({ success: false, message: msg });
    }
  }
};

export const list = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, parseInt(req.query.limit as string) || 10);
    const search = (req.query.search as string) || '';
    const sector = req.query.sector as string | undefined;

    const result = await getCompanies(req.user!, page, limit, search, sector);
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
    const company = await getCompanyById(req.user!, req.params.id as string);
    if (!company) {
      res.status(404).json({ success: false, message: 'Company not found' });
      return;
    }
    res.json({ success: true, data: toCamelCase(company) });
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
    const company = await createCompany(
      req.user!,
      req.body as CreateCompanyInput,
    );
    res.status(201).json({ success: true, data: toCamelCase(company) });
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
    const company = await updateCompany(
      req.user!,
      req.params.id as string,
      req.body as UpdateCompanyInput,
    );
    res.json({ success: true, data: toCamelCase(company) });
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
    await deleteCompany(req.user!, req.params.id as string);
    res.json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};
