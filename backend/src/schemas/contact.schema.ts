import { z } from 'zod';

const optionalString = (max = 255) =>
  z.string().max(max).trim().optional().or(z.literal(''));

export const createContactSchema = z
  .object({
    first_name: z.string().min(1, 'First name is required').max(100).trim(),
    last_name: optionalString(100),
    email: z
      .string()
      .email('Invalid email')
      .max(254)
      .transform((v) => v.trim().toLowerCase())
      .optional()
      .or(z.literal('')),
    phone: optionalString(50),
    title: optionalString(100),
    company_id: z.string().uuid('company_id must be a valid UUID').optional(),
    owner_id: z.string().uuid('owner_id must be a valid UUID').optional(),
  })
  .strict();

export const updateContactSchema = createContactSchema.partial().strict();

export type CreateContactInput = z.infer<typeof createContactSchema>;
export type UpdateContactInput = z.infer<typeof updateContactSchema>;
