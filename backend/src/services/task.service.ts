import { taskRepository } from '../repositories/task.repository';
import { AuthUser } from '../types/database';
import { logActivity } from './activity.service';
import { CreateTaskInput, UpdateTaskInput } from '../schemas/task.schema';

export const getTasks = async (
  user: AuthUser,
  page: number,
  limit: number,
  status?: string,
) => {
  const filters: Record<string, string> = {};
  if (status) filters.status = status;

  return taskRepository.findScoped(user, { page, limit }, filters);
};

export const createTask = async (user: AuthUser, body: CreateTaskInput) => {
  const data = (await taskRepository.create({
    title: body.title,
    description: body.description || null,
    status: body.status || 'pending',
    priority: body.priority || 'medium',
    due_date: body.dueDate || null,
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
  // Removed assignedTo logic due to missing column in DB schema
  if (body.customerId !== undefined) {
    updateData.customer_id = body.customerId;
  }

  const data = (await taskRepository.update(id, updateData, user)) as Record<
    string,
    string
  >;

  void logActivity({
    type: 'task_assigned',
    userId: user.id,
    description: `Updated task "${data.title}"`,
    taskId: data.id,
  });

  return data;
};

export const deleteTask = async (user: AuthUser, id: string) => {
  await taskRepository.remove(id, user);
};
