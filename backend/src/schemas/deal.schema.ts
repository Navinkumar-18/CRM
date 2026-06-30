import { z } from 'zod';

const dealStageEnum = z.enum([
  'prospecting',
  'qualification',
  'proposal',
  'negotiation',
  'closed_won',
  'closed_lost',
]);

export const createDealSchema = z
  .object({
    title: z.string().min(1, 'Deal title is required').max(255).trim(),
    value: z.number().min(0).default(0),
    stage: dealStageEnum.optional().default('prospecting'),
    probability: z.number().int().min(0).max(100).optional(),
    expected_close_dt: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD')
      .optional()
      .or(z.literal('')),
    lead_id: z.string().uuid().optional(),
    company_id: z.string().uuid().optional(),
    contact_id: z.string().uuid().optional(),
    assigned_to: z.string().uuid().optional(),
    lost_reason: z.string().max(500).optional().or(z.literal('')),
  })
  .strict();

export const updateDealSchema = createDealSchema.partial().strict();

export const updateDealStageSchema = z
  .object({
    stage: dealStageEnum,
    probability: z.number().int().min(0).max(100).optional(),
    lost_reason: z.string().max(500).optional().or(z.literal('')),
    actual_close_dt: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD')
      .optional(),
  })
  .strict();

export type CreateDealInput = z.infer<typeof createDealSchema>;
export type UpdateDealInput = z.infer<typeof updateDealSchema>;
export type UpdateDealStageInput = z.infer<typeof updateDealStageSchema>;
