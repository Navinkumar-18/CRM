import { Request, Response, NextFunction } from 'express';
import { toCamelCase } from '../utils/transform';
import {
  getContacts,
  getContactById,
  createContact,
  updateContact,
  deleteContact,
} from '../services/contact.service';
import {
  CreateContactInput,
  UpdateContactInput,
} from '../schemas/contact.schema';

export const list = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, parseInt(req.query.limit as string) || 10);
    const search = (req.query.search as string) || '';
    const companyId = req.query.company_id as string | undefined;

    const result = await getContacts(req.user!, page, limit, search, companyId);
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
    const contact = await getContactById(req.params.id as string);
    if (!contact) {
      res.status(404).json({ success: false, message: 'Contact not found' });
      return;
    }
    res.json({ success: true, data: toCamelCase(contact) });
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
    const contact = await createContact(
      req.user!,
      req.body as CreateContactInput,
    );
    res.status(201).json({ success: true, data: toCamelCase(contact) });
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
    const contact = await updateContact(
      req.user!,
      req.params.id as string,
      req.body as UpdateContactInput,
    );
    res.json({ success: true, data: toCamelCase(contact) });
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
    await deleteContact(req.user!, req.params.id as string);
    res.json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};
