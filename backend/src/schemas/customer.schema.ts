import { z } from 'zod';

const customerStatus = z.enum(['active', 'inactive', 'prospect']).optional();
const sector = z
  .enum(['general', 'school', 'hospital', 'ecommerce', 'manufacturing', 'real_estate'])
  .optional();

const optionalString = (max = 500) =>
  z.string().max(max).optional().or(z.literal(''));

export const createCustomerSchema = z
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
    company: optionalString(100),
    address: optionalString(250),
    status: customerStatus,
    sector,
    notes: optionalString(2000),
    assignedTo: z.string().uuid('assignedTo must be a valid UUID').optional(),
  })
  .strict(); // Reject unknown fields

export const updateCustomerSchema = z
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
    company: optionalString(100),
    address: optionalString(250),
    status: customerStatus,
    sector,
    notes: optionalString(2000),
    assignedTo: z.string().uuid('assignedTo must be a valid UUID').optional(),
  })
  .strict();

// Inferred types for service layer
export type CreateCustomerInput = z.infer<typeof createCustomerSchema>;
export type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>;
