import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { userRepository } from '../repositories/user.repository';
import { toCamelCase } from '../utils/transform';
import { logActivity } from '../services/activity.service';
import { env } from '../config/env';
import { CreateUserInput, UpdateUserInput } from '../schemas/user.schema';
import { ConflictError } from '../utils/AppError';
import { supabase } from '../config/supabase';
import { invalidateUserCache } from '../middleware/auth';

export const list = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, parseInt(req.query.limit as string) || 50);
    const result = await userRepository.findAll(page, limit);
    res.status(200).json({
      success: true,
      data: { ...result, data: toCamelCase(result.data) },
    });
  } catch (error) {
    next(error);
  }
};

export const getById = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const user = await userRepository.findById(req.params.id as string);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }
    res.status(200).json({ success: true, data: toCamelCase(user) });
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
    const { email, password, name, role, phone, position, department, status } =
      req.body as CreateUserInput;

    // Check for duplicate email
    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    if (existing) {
      throw new ConflictError('A user with this email already exists');
    }

    const passwordHash = await bcrypt.hash(password, env.bcryptRounds);

    const user = await userRepository.create({
      id: crypto.randomUUID(),
      email,
      password_hash: passwordHash,
      name,
      role: role || 'employee',
      phone,
      position,
      department,
      status,
    });

    // Audit log
    void logActivity({
      type: 'custom',
      userId: req.user!.id,
      description: `Admin created user "${name}" (${email})`,
    });

    res.status(201).json({ success: true, data: toCamelCase(user) });
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
    const { name, password, role, phone, position, department, status } =
      req.body as UpdateUserInput;
    const updateData: Record<string, unknown> = {};

    if (name) updateData.name = name;
    if (role) updateData.role = role;
    if (password) {
      updateData.password_hash = await bcrypt.hash(password, env.bcryptRounds);
    }
    if (phone !== undefined) updateData.phone = phone;
    if (position !== undefined) updateData.position = position;
    if (department !== undefined) updateData.department = department;
    if (status !== undefined) updateData.status = status;

    const user = await userRepository.update(
      req.params.id as string,
      updateData,
    );

    // Invalidate auth cache so role changes take effect within 30s
    invalidateUserCache(req.params.id as string);

    // Audit log
    void logActivity({
      type: 'custom',
      userId: req.user!.id,
      description: `Admin updated user ${req.params.id}`,
    });

    res.status(200).json({ success: true, data: toCamelCase(user) });
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
    if (req.params.id === req.user?.id) {
      res
        .status(400)
        .json({ success: false, message: 'Cannot delete your own account' });
      return;
    }

    await userRepository.remove(req.params.id as string);

    // Invalidate auth cache immediately
    invalidateUserCache(req.params.id as string);

    // Audit log
    void logActivity({
      type: 'custom',
      userId: req.user!.id,
      description: `Admin deleted user ${req.params.id}`,
    });

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};

export const getUserActivities = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const id = req.params.id as string;

    // Get staff member to attach user object
    const staff = await userRepository.findById(id);
    if (!staff) {
      res
        .status(404)
        .json({ success: false, message: 'Staff member not found' });
      return;
    }

    const { data, error } = await supabase
      .from('staff_activities')
      .select('*')
      .eq('staff_id', id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const activities = (data || []).map((act: any) => ({
      id: act.id,
      type: act.type,
      description: act.description,
      user: staff,
      created_at: act.created_at,
      metadata: act.metadata || null,
    }));

    res.status(200).json({ success: true, data: toCamelCase(activities) });
  } catch (error) {
    next(error);
  }
};
