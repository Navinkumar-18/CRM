import { taskRepository } from '../repositories/task.repository';
import { AuthUser } from '../types/database';
import { logActivity } from './activity.service';
import { CreateTaskInput, UpdateTaskInput } from '../schemas/task.schema';
import { supabase } from '../config/supabase';
import { applyOwnershipScope, resolveAssignedTo } from '../utils/access';

export const getTasks = async (
  user: AuthUser,
  page: number,
  limit: number,
  status?: string,
  dateFilter?: string,
) => {
  const skip = (page - 1) * limit;

  let query = applyOwnershipScope(
    supabase
      .from('tasks')
      .select('*, customer:customers(id, name)', { count: 'exact' }),
    user,
  );

  if (status) {
    query = query.eq('status', status);
  }

  if (dateFilter) {
    const now = new Date().toISOString();
    if (dateFilter === 'overdue') {
      query = query.lt('due_date', now).neq('status', 'completed');
    } else if (dateFilter === 'today') {
      const start = new Date();
      start.setHours(0, 0, 0, 0);
      const end = new Date();
      end.setHours(23, 59, 59, 999);
      query = query.gte('due_date', start.toISOString()).lte('due_date', end.toISOString());
    } else if (dateFilter === 'this_week') {
      const start = new Date();
      start.setHours(0, 0, 0, 0);
      const end = new Date();
      end.setDate(end.getDate() + 7);
      end.setHours(23, 59, 59, 999);
      query = query.gte('due_date', start.toISOString()).lte('due_date', end.toISOString());
    }
  }

  const { data, count, error } = await query
    .range(skip, skip + limit - 1)
    .order('due_date', { ascending: true, nullsFirst: false });

  if (error) {
    if (error.code && error.code.startsWith('PGRST20')) {
      return { data: [], total: 0, page, pages: 1 };
    }
    throw error;
  }

  return {
    data: data || [],
    total: count || 0,
    page,
    pages: Math.ceil((count || 0) / limit),
  };
};

export const createTask = async (user: AuthUser, body: CreateTaskInput) => {
  const data = (await taskRepository.create({
    title: body.title,
    description: body.description || null,
    status: body.status || 'pending',
    priority: body.priority || 'medium',
    due_date: body.dueDate || null,
    assigned_to: resolveAssignedTo(body.assignedTo, user),
    customer_id: body.customerId || null,
  })) as Record<string, string>;

  void logActivity({
    type: 'task_assigned',
    userId: user.id,
    description: `Created task "${body.title}"`,
    taskId: data.id,
    customerId: body.customerId || null,
  });

  return data;
};

export const updateTask = async (
  user: AuthUser,
  id: string,
  body: UpdateTaskInput,
) => {
  const updateData: Record<string, unknown> = {};
  const fields = ['title', 'description', 'status', 'priority'] as const;

  for (const field of fields) {
    if (body[field] !== undefined) {
      updateData[field] = body[field];
    }
  }

  if (body.dueDate !== undefined) updateData.due_date = body.dueDate;
  if (body.assignedTo !== undefined) {
    updateData.assigned_to = body.assignedTo;
  }
  if (body.customerId !== undefined) {
    updateData.customer_id = body.customerId;
  }

  const data = (await taskRepository.update(id, updateData, user)) as Record<
    string,
    string
  >;

  const isCompletion = body.status === 'completed';
  void logActivity({
    type: isCompletion ? 'task_completed' : 'task_assigned',
    userId: user.id,
    description: isCompletion ? `Completed task "${data.title}"` : `Updated task "${data.title}"`,
    taskId: data.id,
  });

  return data;
};

export const deleteTask = async (user: AuthUser, id: string) => {
  await taskRepository.remove(id, user);
};
