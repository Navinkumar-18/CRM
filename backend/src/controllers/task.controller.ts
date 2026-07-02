import { Request, Response, NextFunction } from 'express';
import { toCamelCase } from '../utils/transform';
import {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
} from '../services/task.service';
import { CreateTaskInput, UpdateTaskInput } from '../schemas/task.schema';

export const list = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, parseInt(req.query.limit as string) || 15);
    const status = req.query.status as string;
    const dateFilter = req.query.dateFilter as string;

    const result = await getTasks(req.user!, page, limit, status, dateFilter);

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
    const task = await createTask(req.user!, req.body as CreateTaskInput);
    res.status(201).json({ success: true, data: toCamelCase(task) });
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
    const task = await updateTask(
      req.user!,
      req.params.id as string,
      req.body as UpdateTaskInput,
    );
    res.status(200).json({ success: true, data: toCamelCase(task) });
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
    await deleteTask(req.user!, req.params.id as string);
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};
