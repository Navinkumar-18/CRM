import { Request, Response, NextFunction } from 'express';
import { toCamelCase } from '../utils/transform';
import {
  getNotes,
  createNote,
  updateNote,
  deleteNote,
} from '../services/note.service';
import { CreateNoteInput, UpdateNoteInput } from '../schemas/note.schema';

export const list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, parseInt(req.query.limit as string) || 20);

    const filters = {
      lead_id: req.query.lead_id as string | undefined,
      deal_id: req.query.deal_id as string | undefined,
      contact_id: req.query.contact_id as string | undefined,
      company_id: req.query.company_id as string | undefined,
    };

    const result = await getNotes(req.user!, filters, page, limit);
    res.json({ success: true, data: { ...result, data: toCamelCase(result.data) } });
  } catch (error) {
    next(error);
  }
};

export const create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const note = await createNote(req.user!, req.body as CreateNoteInput);
    res.status(201).json({ success: true, data: toCamelCase(note) });
  } catch (error) {
    next(error);
  }
};

export const update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const note = await updateNote(req.user!, req.params.id as string, req.body as UpdateNoteInput);
    res.json({ success: true, data: toCamelCase(note) });
  } catch (error) {
    next(error);
  }
};

export const remove = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await deleteNote(req.user!, req.params.id as string);
    res.json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};
