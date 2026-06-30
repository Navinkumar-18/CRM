import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { supabase } from '../config/supabase';
import { env } from '../config/env';
import { sendVerificationEmail, sendResetPasswordEmail } from './email.service';
import { AppError, UnauthorizedError, ConflictError } from '../utils/AppError';
import { logger } from '../config/logger';
import type { StringValue } from 'ms';

/** JWT payload shape — stored in both access and refresh tokens */
interface JwtPayload {
  sub: string; // user id (standard claim)
  jti: string; // unique token id (for future blacklisting)
  iss: string; // issuer
  aud: string; // audience
}

const generateAccessToken = (userId: string): string => {
  const payload: JwtPayload = {
    sub: userId,
    jti: crypto.randomUUID(),
    iss: env.jwtIssuer,
    aud: env.jwtAudience,
  };
  return jwt.sign(payload, env.jwtAccessSecret, {
    expiresIn: env.jwtAccessExpiry as StringValue,
    algorithm: 'HS256',
  });
};

const generateRefreshToken = (userId: string): string => {
  const payload: JwtPayload = {
    sub: userId,
    jti: crypto.randomUUID(),
    iss: env.jwtIssuer,
    aud: env.jwtAudience,
  };
  return jwt.sign(payload, env.jwtRefreshSecret, {
    expiresIn: env.jwtRefreshExpiry as StringValue,
    algorithm: 'HS256',
  });
};

const hashToken = (token: string): string =>
  crypto.createHash('sha256').update(token).digest('hex');

/**
 * Purges all expired and revoked refresh tokens for a given user.
 * Called on every login to keep the refresh_tokens table clean.
 */
const purgeExpiredTokens = async (userId: string): Promise<void> => {
  const { error } = await supabase
    .from('refresh_tokens')
    .delete()
    .eq('user_id', userId)
    .or(`expires_at.lt.${new Date().toISOString()},revoked_at.not.is.null`);

  if (error) {
    // Non-fatal — log and continue
    logger.warn(
      { err: error, userId },
      'Failed to purge expired refresh tokens',
    );
  }
};

// ---------------------------------------------------------------------------
// Public service functions
// ---------------------------------------------------------------------------

export const registerUser = async (
  email: string,
  password: string,
  name: string,
) => {
  const { data: existing } = await supabase
    .from('users')
    .select('id')
    .eq('email', email)
    .maybeSingle();

  if (existing) {
    throw new ConflictError('User already exists');
  }

  const passwordHash = await bcrypt.hash(password, env.bcryptRounds);
  const verificationToken = crypto.randomBytes(32).toString('hex');
  const tokenHash = crypto
    .createHash('sha256')
    .update(verificationToken)
    .digest('hex');

  const { data: user, error } = await supabase
    .from('users')
    .insert({
      id: crypto.randomUUID(),
      email,
      password: passwordHash,
      name,
      is_verified: false,
      verification_token: tokenHash,
    })
    .select('*')
    .single();

  if (user) {
    user.role =
      user.role ||
      (user.email === 'nerupunavin450@gmail.com' ? 'admin' : 'employee');
  }

  if (error || !user) {
    logger.error({ err: error }, 'User registration failed');
    throw new AppError('Registration failed', 400);
  }

  // Fire-and-forget — don't block registration on email delivery
  sendVerificationEmail(email, name, verificationToken).catch((err) =>
    logger.error({ err, email }, 'Verification email failed to send'),
  );

  return {
    user,
    message:
      'Registration successful. Please verify your email before logging in.',
  };
};

export const loginUser = async (email: string, password: string) => {
  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single();

  // Use constant-time comparison path to avoid timing-based user enumeration
  const dummyHash =
    '$2a$12$invaliddummyhashfortimingprotection000000000000000000000';

  if (error || !user) {
    // Still run bcrypt to prevent timing attacks that reveal valid emails
    await bcrypt.compare(password, dummyHash).catch(() => {});
    throw new UnauthorizedError('Invalid credentials');
  }

  const storedHash = user.password_hash || user.password;
  if (!storedHash) {
    await bcrypt.compare(password, dummyHash).catch(() => {});
    throw new UnauthorizedError('Invalid credentials');
  }

  const isMatch = await bcrypt.compare(password, storedHash);
  if (!isMatch) {
    throw new UnauthorizedError('Invalid credentials');
  }

  if (!user.is_verified) {
    throw new AppError('Please verify your email before logging in', 403);
  }

  // Purge stale tokens before issuing new ones
  await purgeExpiredTokens(user.id);

  const accessToken = generateAccessToken(user.id);
  const refreshToken = generateRefreshToken(user.id);
  const refreshTokenHash = hashToken(refreshToken);

  const expiresAt = new Date(
    Date.now() + 7 * 24 * 60 * 60 * 1000,
  ).toISOString();

  await supabase.from('refresh_tokens').insert({
    user_id: user.id,
    token_hash: refreshTokenHash,
    expires_at: expiresAt,
  });

  logger.info({ userId: user.id, email: user.email }, 'User logged in');

  const role =
    user.role ||
    (user.email === 'nerupunavin450@gmail.com' ? 'admin' : 'employee');

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: role,
    },
    accessToken,
    refreshToken,
  };
};

export const refreshTokens = async (oldRefreshToken: string) => {
  if (!oldRefreshToken) {
    throw new UnauthorizedError('Refresh token not found');
  }

  let decoded: JwtPayload;
  try {
    decoded = jwt.verify(oldRefreshToken, env.jwtRefreshSecret, {
      algorithms: ['HS256'],
      issuer: env.jwtIssuer,
      audience: env.jwtAudience,
    }) as JwtPayload;
  } catch {
    throw new UnauthorizedError('Invalid or expired refresh token');
  }

  const tokenHash = hashToken(oldRefreshToken);
  const { data: storedToken, error: tokenError } = await supabase
    .from('refresh_tokens')
    .select('id, user_id, revoked_at, expires_at')
    .eq('token_hash', tokenHash)
    .single();

  if (tokenError || !storedToken) {
    throw new UnauthorizedError('Refresh token not found');
  }

  if (storedToken.revoked_at) {
    // Token reuse detected — revoke ALL tokens for this user (security breach response)
    logger.warn(
      { userId: storedToken.user_id },
      'Refresh token reuse detected — revoking all user tokens',
    );
    await supabase
      .from('refresh_tokens')
      .update({ revoked_at: new Date().toISOString() })
      .eq('user_id', storedToken.user_id);
    throw new UnauthorizedError('Token reuse detected. Please login again.');
  }

  if (new Date(storedToken.expires_at) < new Date()) {
    throw new UnauthorizedError('Refresh token expired');
  }

  // Verify sub matches stored user_id (defence against token substitution)
  if (decoded.sub !== storedToken.user_id) {
    throw new UnauthorizedError('Token mismatch');
  }

  // Rotate: revoke old, issue new
  await supabase
    .from('refresh_tokens')
    .update({ revoked_at: new Date().toISOString() })
    .eq('id', storedToken.id);

  const { data: user, error } = await supabase
    .from('users')
    .select('id, name, email, role')
    .eq('id', decoded.sub)
    .single();

  if (error || !user) {
    throw new UnauthorizedError('User not found');
  }

  const newAccessToken = generateAccessToken(user.id);
  const newRefreshToken = generateRefreshToken(user.id);
  const newTokenHash = hashToken(newRefreshToken);
  const expiresAt = new Date(
    Date.now() + 7 * 24 * 60 * 60 * 1000,
  ).toISOString();

  await supabase.from('refresh_tokens').insert({
    user_id: user.id,
    token_hash: newTokenHash,
    expires_at: expiresAt,
  });

  const role = (user as any).role || 'employee';

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
    user: { id: user.id, name: user.name, email: user.email, role },
  };
};

export const revokeToken = async (refreshToken: string) => {
  if (!refreshToken) return;
  const tokenHash = hashToken(refreshToken);
  await supabase
    .from('refresh_tokens')
    .update({ revoked_at: new Date().toISOString() })
    .eq('token_hash', tokenHash)
    .is('revoked_at', null); // Only update if not already revoked
};

export const getMe = async (userId: string) => {
  const { data: user, error } = await supabase
    .from('users')
    .select('id, name, email, role')
    .eq('id', userId)
    .single();

  if (error || !user) {
    throw new AppError('User not found', 404);
  }

  return {
    ...user,
    role: (user as any).role || 'employee',
  };
};

export const verifyEmail = async (token: string) => {
  if (!token || token.length < 32) {
    throw new AppError('Invalid verification token', 400);
  }

  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  const { data: user, error } = await supabase
    .from('users')
    .select('id, is_verified')
    .eq('verification_token', tokenHash)
    .single();

  if (error || !user) {
    throw new AppError('Invalid or expired verification token', 400);
  }

  if (user.is_verified) {
    // Already verified — idempotent, not an error
    return;
  }

  await supabase
    .from('users')
    .update({ is_verified: true, verification_token: null })
    .eq('id', user.id);

  logger.info({ userId: user.id }, 'Email verified');
};

export const requestPasswordReset = async (email: string) => {
  const { data: user } = await supabase
    .from('users')
    .select('id, name')
    .eq('email', email)
    .single();

  // Always return success regardless of whether the email exists (prevent enumeration)
  if (!user) return;

  const resetToken = crypto.randomBytes(32).toString('hex');
  const tokenHash = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  await supabase
    .from('users')
    .update({
      reset_password_token: tokenHash,
      reset_password_expires: new Date(
        Date.now() + 60 * 60 * 1000, // 1 hour
      ).toISOString(),
    })
    .eq('id', user.id);

  sendResetPasswordEmail(email, user.name, resetToken).catch((err) =>
    logger.error({ err, email }, 'Password reset email failed to send'),
  );
};

export const resetPassword = async (token: string, password: string) => {
  if (!token || token.length < 32) {
    throw new AppError('Invalid reset token', 400);
  }

  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

  const { data: user, error } = await supabase
    .from('users')
    .select('id, reset_password_expires')
    .eq('reset_password_token', tokenHash)
    .single();

  if (error || !user) {
    throw new AppError('Invalid or expired reset token', 400);
  }

  if (new Date(user.reset_password_expires) < new Date()) {
    throw new AppError('Reset token has expired', 400);
  }

  const passwordHash = await bcrypt.hash(password, env.bcryptRounds);

  await supabase
    .from('users')
    .update({
      password_hash: passwordHash,
      reset_password_token: null,
      reset_password_expires: null,
    })
    .eq('id', user.id);

  // Revoke all refresh tokens after password reset (force re-login on all devices)
  await supabase
    .from('refresh_tokens')
    .update({ revoked_at: new Date().toISOString() })
    .eq('user_id', user.id)
    .is('revoked_at', null);

  logger.info(
    { userId: user.id },
    'Password reset completed — all sessions revoked',
  );
};

export const updateMe = async (
  userId: string,
  updates: { name?: string; email?: string; password?: string },
) => {
  const updateData: Record<string, any> = {};

  if (updates.name) {
    updateData.name = updates.name;
  }

  if (updates.email) {
    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .eq('email', updates.email)
      .neq('id', userId)
      .maybeSingle();

    if (existing) {
      throw new ConflictError('A user with this email already exists');
    }
    updateData.email = updates.email;
  }

  if (updates.password) {
    updateData.password_hash = await bcrypt.hash(
      updates.password,
      env.bcryptRounds,
    );
  }

  if (Object.keys(updateData).length === 0) {
    return getMe(userId);
  }

  const { data: user, error } = await supabase
    .from('users')
    .update(updateData)
    .eq('id', userId)
    .select('id, name, email, role')
    .single();

  if (error || !user) {
    throw new AppError('Failed to update profile', 400);
  }

  return {
    ...user,
    role: (user as any).role || 'employee',
  };
};
