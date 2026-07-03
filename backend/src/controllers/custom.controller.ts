import { Request, Response, NextFunction } from 'express';
import {
  listModules,
  getModuleBySlug,
  createModule,
  updateModule,
  deleteModule,
  addField,
  removeField,
  listRecords,
  createRecord,
  updateRecord,
  deleteRecord,
} from '../services/custom.service';
import {
  CreateCustomModuleInput,
  CreateCustomFieldInput,
  CreateCustomRecordInput,
  UpdateCustomRecordInput,
} from '../schemas/custom.schema';

export const getModules = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const modules = await listModules();
    res.json({ success: true, data: modules });
  } catch (error) {
    next(error);
  }
};

export const getModule = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const module = await getModuleBySlug(req.params.slug as string);
    res.json({ success: true, data: module });
  } catch (error) {
    next(error);
  }
};

export const postModule = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const module = await createModule(
      req.user!,
      req.body as CreateCustomModuleInput,
    );
    res.status(201).json({ success: true, data: module });
  } catch (error) {
    next(error);
  }
};

export const patchModule = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const module = await updateModule(
      req.params.id as string,
      req.body as Partial<CreateCustomModuleInput>,
    );
    res.json({ success: true, data: module });
  } catch (error) {
    next(error);
  }
};

export const destroyModule = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    await deleteModule(req.params.id as string);
    res.json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};

export const postField = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const field = await addField(
      req.params.slug as string,
      req.user!,
      req.body as CreateCustomFieldInput,
    );
    res.status(201).json({ success: true, data: field });
  } catch (error) {
    next(error);
  }
};

export const destroyField = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    await removeField(req.params.id as string);
    res.json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};

export const getRecords = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, parseInt(req.query.limit as string) || 10);
    const result = await listRecords(
      req.params.slug as string,
      page,
      limit,
      req.user!,
    );
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const postRecord = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const record = await createRecord(
      req.params.slug as string,
      req.user!,
      req.body as CreateCustomRecordInput,
    );
    res.status(201).json({ success: true, data: record });
  } catch (error) {
    next(error);
  }
};

export const patchRecord = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const record = await updateRecord(
      req.params.id as string,
      req.body as UpdateCustomRecordInput,
      req.user!,
    );
    res.json({ success: true, data: record });
  } catch (error) {
    next(error);
  }
};

export const destroyRecord = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    await deleteRecord(req.params.id as string, req.user!);
    res.json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};
