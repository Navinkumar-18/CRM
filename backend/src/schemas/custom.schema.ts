import { z } from 'zod';

export const createCustomModuleSchema = z
  .object({
    name: z.string().min(1, 'Module name is required').max(100).trim(),
    slug: z
      .string()
      .min(1)
      .max(100)
      .regex(
        /^[a-z0-9_]+$/,
        'Slug must be lowercase letters, numbers, or underscores',
      )
      .trim(),
    icon: z.string().max(50).optional().default('cube'),
    sector: z.string().max(50).optional().default('general'),
  })
  .strict();

export const createCustomFieldSchema = z
  .object({
    label: z.string().min(1).max(100).trim(),
    field_key: z
      .string()
      .min(1)
      .max(100)
      .regex(
        /^[a-z0-9_]+$/,
        'Field key must be lowercase letters, numbers, or underscores',
      )
      .trim(),
    field_type: z
      .enum([
        'text',
        'number',
        'date',
        'boolean',
        'select',
        'multi_select',
        'file',
        'relation',
      ])
      .default('text'),
    required: z.boolean().default(false),
    options: z.array(z.string().max(100)).optional(),
    sort_order: z.number().int().min(0).default(0),
  })
  .strict();

export const createCustomRecordSchema = z
  .object({
    data: z.record(z.string(), z.unknown()),
    owner_id: z.string().uuid().optional(),
  })
  .strict();

export const updateCustomRecordSchema = z
  .object({
    data: z.record(z.string(), z.unknown()),
  })
  .strict();

export type CreateCustomModuleInput = z.infer<typeof createCustomModuleSchema>;
export type CreateCustomFieldInput = z.infer<typeof createCustomFieldSchema>;
export type CreateCustomRecordInput = z.infer<typeof createCustomRecordSchema>;
export type UpdateCustomRecordInput = z.infer<typeof updateCustomRecordSchema>;
