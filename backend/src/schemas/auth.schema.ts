import { z } from 'zod';

/**
 * Production-strength password policy:
 * - Minimum 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one digit
 * - At least one special character
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

export const registerSchema = z.object({
  email: z
    .string()
    .email('Please provide a valid email address')
    .max(254, 'Email too long')
    .transform((v) => v.trim().toLowerCase()),
  password: passwordSchema,
  name: z
    .string()
    .min(1, 'Name is required')
    .max(50, 'Name must be at most 50 characters')
    .transform((v) => v.trim()),
});

export const loginSchema = z.object({
  email: z
    .string()
    .email('Please provide a valid email address')
    .transform((v) => v.trim().toLowerCase()),
  password: z.string().min(1, 'Password is required').max(128, 'Password too long'),
});

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .email('Please provide a valid email address')
    .transform((v) => v.trim().toLowerCase()),
});

export const resetPasswordSchema = z.object({
  password: passwordSchema,
});

// Inferred types for use in services / controllers
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
