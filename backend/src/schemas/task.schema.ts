import { z } from 'zod';

const taskStatus = z.enum(['pending', 'in_progress', 'completed']).optional();
const taskPriority = z.enum(['low', 'medium', 'high']).optional();

export const createTaskSchema = z
  .object({
    title: z
      .string()
      .min(1, 'Title is required')
      .max(200, 'Title too long')
      .trim(),
    description: z.string().max(2000).optional().or(z.literal('')),
    status: taskStatus,
    priority: taskPriority,
    dueDate: z.string().optional().nullable(),
    assignedTo: z.string().uuid('assignedTo must be a valid UUID').optional(),
    customerId: z
      .string()
      .uuid('customerId must be a valid UUID')
      .optional()
      .nullable(),
  })
  .strict();

export const updateTaskSchema = z
  .object({
    title: z.string().min(1).max(200).trim().optional(),
    description: z.string().max(2000).optional().or(z.literal('')),
    status: taskStatus,
    priority: taskPriority,
    dueDate: z.string().optional().nullable(),
    assignedTo: z.string().uuid('assignedTo must be a valid UUID').optional(),
    customerId: z
      .string()
      .uuid('customerId must be a valid UUID')
      .optional()
      .nullable(),
  })
  .strict();

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
