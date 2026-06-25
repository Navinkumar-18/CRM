import { z } from 'zod';

/**
 * Re-uses the same strong password policy as auth.schema.ts.
 * Kept in sync intentionally — if password requirements change, update both.
 */
const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password must be at most 128 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(
    /[!@#$%^&*(),.?":{}|<>]/,
    'Password must contain at least one special character',
  );

export const createUserSchema = z
  .object({
    email: z
      .string()
      .email('Please provide a valid email address')
      .max(254)
      .transform((v) => v.trim().toLowerCase()),
    password: passwordSchema,
    name: z
      .string()
      .min(1, 'Name is required')
      .max(50, 'Name must be at most 50 characters')
      .trim(),
    role: z.enum(['admin', 'manager', 'employee']).optional(),
  })
  .strict();

export const updateUserSchema = z
  .object({
    name: z.string().min(1).max(50).trim().optional(),
    password: passwordSchema.optional(),
    role: z.enum(['admin', 'manager', 'employee']).optional(),
  })
  .strict();

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
