import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env';
import { toCamelCase } from '../utils/transform';
import {
  registerUser,
  loginUser,
  refreshTokens,
  revokeToken,
  getMe,
  verifyEmail,
  requestPasswordReset,
  resetPassword,
  updateMe as updateUserService,
} from '../services/auth.service';

const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: env.nodeEnv === 'production',
  sameSite: 'strict' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
  path: '/api/auth', // Scope the cookie to auth endpoints only
};

const CLEAR_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: env.nodeEnv === 'production',
  sameSite: 'strict' as const,
  maxAge: 0,
  path: '/api/auth',
};

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    // Input is already validated & normalized by Zod middleware
    const { email, password, name } = req.body;
    const { user, message } = await registerUser(email, password, name);
    res.status(201).json({ success: true, message, data: toCamelCase(user) });
  } catch (error) {
    next(error);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { email, password } = req.body;
    const { accessToken, refreshToken, user } = await loginUser(
      email,
      password,
    );

    res
      .status(200)
      .cookie('refreshToken', refreshToken, REFRESH_COOKIE_OPTIONS)
      .json({ success: true, data: { accessToken, user } });
  } catch (error) {
    next(error);
  }
};

export const refresh = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const oldRefreshToken = req.cookies.refreshToken;
    const { accessToken, refreshToken, user } =
      await refreshTokens(oldRefreshToken);

    res
      .status(200)
      .cookie('refreshToken', refreshToken, REFRESH_COOKIE_OPTIONS)
      .json({ success: true, data: { accessToken, user: toCamelCase(user) } });
  } catch (error) {
    next(error);
  }
};

export const logout = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const refreshToken = req.cookies.refreshToken;
    await revokeToken(refreshToken);

    res
      .clearCookie('refreshToken', CLEAR_COOKIE_OPTIONS)
      .status(200)
      .json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};

export const me = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const user = await getMe(req.user!.id);
    res.status(200).json({ success: true, data: toCamelCase(user) });
  } catch (error) {
    next(error);
  }
};

export const updateMe = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { name, email, password } = req.body;
    const user = await updateUserService(req.user!.id, {
      name,
      email,
      password,
    });
    res.status(200).json({ success: true, data: toCamelCase(user) });
  } catch (error) {
    next(error);
  }
};

export const verifyEmailHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    await verifyEmail(req.params.token as string);
    res
      .status(200)
      .json({ success: true, message: 'Email verified successfully' });
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { email } = req.body;
    await requestPasswordReset(email);

    // Always return same message regardless of whether email exists (prevent enumeration)
    res.status(200).json({
      success: true,
      message: 'If that email exists, a reset link has been sent',
    });
  } catch (error) {
    next(error);
  }
};

export const resetPasswordHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { password } = req.body;
    await resetPassword(req.params.token as string, password);
    res
      .status(200)
      .json({ success: true, message: 'Password reset successfully' });
  } catch (error) {
    next(error);
  }
};
