import { z } from 'zod';

export const createNoteSchema = z
  .object({
    body: z.string().min(1, 'Note body is required').max(5000).trim(),
    lead_id: z.string().uuid().optional(),
    deal_id: z.string().uuid().optional(),
    contact_id: z.string().uuid().optional(),
    company_id: z.string().uuid().optional(),
  })
  .strict()
  .refine(
    (data) =>
      !!(data.lead_id || data.deal_id || data.contact_id || data.company_id),
    {
      message:
        'A note must be attached to at least one entity (lead_id, deal_id, contact_id, or company_id)',
    },
  );

export const updateNoteSchema = z
  .object({
    body: z.string().min(1).max(5000).trim(),
  })
  .strict();

export type CreateNoteInput = z.infer<typeof createNoteSchema>;
export type UpdateNoteInput = z.infer<typeof updateNoteSchema>;
