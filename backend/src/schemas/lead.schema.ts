import { z } from 'zod';

const leadStatus = z
  .enum(['new', 'contacted', 'qualified', 'won', 'lost'])
  .optional();
const sector = z
  .enum(['general', 'school', 'hospital', 'ecommerce', 'manufacturing', 'real_estate'])
  .optional();

const optionalString = (max = 500) =>
  z.string().max(max).optional().or(z.literal(''));

export const createLeadSchema = z
  .object({
    name: z
      .string()
      .min(1, 'Name is required')
      .max(100, 'Name too long')
      .trim(),
    email: z
      .string()
      .email('Invalid email')
      .max(254)
      .transform((v) => v.trim().toLowerCase())
      .optional()
      .or(z.literal('')),
    phone: optionalString(30),
    source: optionalString(100),
    status: leadStatus,
    sector,
    notes: optionalString(2000),
    assignedTo: z.string().uuid('assignedTo must be a valid UUID').optional(),
  })
  .strict();

export const updateLeadSchema = z
  .object({
    name: z.string().min(1).max(100).trim().optional(),
    email: z
      .string()
      .email('Invalid email')
      .max(254)
      .transform((v) => v.trim().toLowerCase())
      .optional()
      .or(z.literal('')),
    phone: optionalString(30),
    source: optionalString(100),
    status: leadStatus,
    sector,
    notes: optionalString(2000),
    assignedTo: z.string().uuid('assignedTo must be a valid UUID').optional(),
  })
  .strict();

export type CreateLeadInput = z.infer<typeof createLeadSchema>;
export type UpdateLeadInput = z.infer<typeof updateLeadSchema>;
