import { z } from 'zod';

const optionalString = (max = 255) =>
  z.string().max(max).trim().optional().or(z.literal(''));

export const createCompanySchema = z
  .object({
    name: z.string().min(1, 'Company name is required').max(255).trim(),
    industry: optionalString(100),
    website: z.string().url('Invalid URL').max(255).optional().or(z.literal('')),
    phone: optionalString(50),
    email: z
      .string()
      .email('Invalid email')
      .max(254)
      .transform((v) => v.trim().toLowerCase())
      .optional()
      .or(z.literal('')),
    address: optionalString(500),
    city: optionalString(100),
    state: optionalString(100),
    country: optionalString(100),
    gst_number: optionalString(20),
    iso_certificate: optionalString(100),
    sector: z
      .enum(['general', 'school', 'hospital', 'ecommerce', 'manufacturing', 'real_estate'])
      .optional()
      .default('general'),
    owner_id: z.string().uuid().optional(),
  })
  .strict();

export const updateCompanySchema = createCompanySchema
  .omit({ sector: true })
  .extend({
    sector: z
      .enum(['general', 'school', 'hospital', 'ecommerce', 'manufacturing', 'real_estate'])
      .optional(),
    verified: z.boolean().optional(),
  })
  .partial()
  .strict();

export type CreateCompanyInput = z.infer<typeof createCompanySchema>;
export type UpdateCompanyInput = z.infer<typeof updateCompanySchema>;
