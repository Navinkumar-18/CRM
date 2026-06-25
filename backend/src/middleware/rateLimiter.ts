import rateLimit from 'express-rate-limit';
import slowDown from 'express-slow-down';
import { env } from '../config/env';

/**
 * Strict per-IP limiter for authentication endpoints.
 * Only counts failed requests (skipSuccessfulRequests: true).
 */
export const authLimiter = rateLimit({
  windowMs: env.authRateLimitWindowMs, // 15 minutes (configurable)
  max: env.authRateLimitMax,           // 5 attempts (configurable)
  skipSuccessfulRequests: true,        // Only penalise failures
  message: {
    success: false,
    message: 'Too many failed attempts, please try again after 15 minutes',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Progressive slowdown for auth endpoints.
 * After 2 failed requests: +500ms delay per additional request.
 * This catches attackers who stay under the hard rate limit.
 */
export const authSlowDown = slowDown({
  windowMs: env.authRateLimitWindowMs,
  delayAfter: 2,       // Start slowing after 2 failures
  delayMs: () => 500,  // Add 500ms per request above the threshold
  skipSuccessfulRequests: true,
});

/**
 * Stricter limiter for password reset — 3 per hour per IP.
 */
export const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3,
  skipSuccessfulRequests: true,
  message: {
    success: false,
    message: 'Too many password reset requests, please try again after 1 hour',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * General API limiter — applied to all /api/* routes.
 */
export const apiLimiter = rateLimit({
  windowMs: env.apiRateLimitWindowMs, // 1 minute (configurable)
  max: env.apiRateLimitMax,           // 200 requests (configurable)
  message: { success: false, message: 'Too many requests, please slow down' },
  standardHeaders: true,
  legacyHeaders: false,
});
