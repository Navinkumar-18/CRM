import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { supabase } from '../config/supabase';
import { env } from '../config/env';
import { logger } from '../config/logger';
import type { UserRole } from '../types/database';

/** Decoded JWT payload shape (matches auth.service token generation) */
interface JwtPayload {
  sub: string;
  jti: string;
  iss: string;
  aud: string;
  iat: number;
  exp: number;
}

/**
 * Simple in-memory user cache to avoid a DB lookup on every request.
 * TTL: 30 seconds — short enough to pick up role changes promptly.
 *
 * NOTE: This is process-local. When running multiple instances behind a
 * load balancer, add a Redis-backed cache in Phase 3.
 */
interface CacheEntry {
  user: { id: string; email: string; name: string; role: string };
  expiresAt: number;
}
const userCache = new Map<string, CacheEntry>();
const USER_CACHE_TTL_MS = 30_000;

const getCachedUser = (userId: string): CacheEntry['user'] | null => {
  const entry = userCache.get(userId);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    userCache.delete(userId);
    return null;
  }
  return entry.user;
};

const setCachedUser = (userId: string, user: CacheEntry['user']): void => {
  userCache.set(userId, { user, expiresAt: Date.now() + USER_CACHE_TTL_MS });
};

/**
 * JWT authentication middleware.
 *
 * - Reads Bearer token from Authorization header
 * - Verifies signature, algorithm, issuer, and audience
 * - Fetches user from DB (or short-lived cache) to confirm account still exists
 * - Attaches `req.user` for downstream middleware/controllers
 */
export const protect = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ success: false, message: 'Authentication required' });
    return;
  }

  const token = authHeader.slice(7); // Remove 'Bearer '

  if (!token || token.split('.').length !== 3) {
    res.status(401).json({ success: false, message: 'Invalid token format' });
    return;
  }

  let decoded: JwtPayload;
  try {
    decoded = jwt.verify(token, env.jwtAccessSecret, {
      algorithms: ['HS256'],
      issuer: env.jwtIssuer,
      audience: env.jwtAudience,
    }) as JwtPayload;
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      res.status(401).json({ success: false, message: 'Token expired' });
    } else {
      res.status(401).json({ success: false, message: 'Invalid token' });
    }
    return;
  }

  const userId = decoded.sub;

  // Check in-memory cache first to reduce DB load
  let user = getCachedUser(userId);

  if (!user) {
    const { data, error } = await supabase
      .from('users')
      .select('id, email, name, role, is_verified')  // role is now read from DB
      .eq('id', userId)
      .single();

    if (error || !data) {
      res.status(401).json({ success: false, message: 'Authentication failed' });
      return;
    }

    if (!data.is_verified) {
      res
        .status(403)
        .json({ success: false, message: 'Email verification required' });
      return;
    }

    user = { id: data.id, email: data.email, name: data.name, role: data.role as string };
    setCachedUser(userId, user);
  }

  req.user = { id: user.id, email: user.email, role: user.role as UserRole };
  next();
};

/**
 * Invalidates a user's entry in the auth cache.
 * Call this after role changes or account suspension.
 */
export const invalidateUserCache = (userId: string): void => {
  userCache.delete(userId);
  logger.debug({ userId }, 'Auth cache invalidated');
};
