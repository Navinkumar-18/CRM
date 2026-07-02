import { Router } from 'express';
import {
  register,
  login,
  refresh,
  logout,
  me,
  updateMe,
  verifyEmailHandler,
  forgotPassword,
  resetPasswordHandler,
  adminVerifyUser,
} from '../controllers/auth.controller';
import { protect } from '../middleware/auth';
import { authorize } from '../middleware/roles';
import { validate } from '../middleware/validate';
import {
  authSlowDown,
  authLimiter,
  passwordResetLimiter,
} from '../middleware/rateLimiter';
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  updateProfileSchema,
} from '../schemas/auth.schema';

const router = Router();

// Public auth routes — all validated via Zod schema middleware
router.post('/register', authLimiter, validate(registerSchema), register);

router.post(
  '/login',
  authSlowDown, // Progressive delay after 2 failures
  authLimiter, // Hard limit: 5 attempts per 15 min
  validate(loginSchema),
  login,
);

router.post('/refresh', refresh);

router.post('/logout', logout);

router.get('/me', protect, me);
router.put('/me', protect, validate(updateProfileSchema), updateMe);

// Admin-only: auto-verify a newly created staff user so they can log in immediately
router.patch('/admin/verify-user', protect, authorize('admin'), adminVerifyUser);

// Email verification — no auth or rate limit needed (token is the proof)
router.post('/verify-email/:token', verifyEmailHandler);

// Password reset — strict rate limits
router.post(
  '/forgot-password',
  passwordResetLimiter,
  validate(forgotPasswordSchema),
  forgotPassword,
);

router.post(
  '/reset-password/:token',
  passwordResetLimiter,
  validate(resetPasswordSchema),
  resetPasswordHandler,
);

export default router;
