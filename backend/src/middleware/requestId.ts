import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

/**
 * Attaches a unique `X-Request-ID` to every request.
 * - If the upstream proxy / API gateway already provides one, it is reused.
 * - Otherwise a fresh UUID is generated.
 * The ID is echoed back in the response header for client-side tracing.
 */
export const requestId = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const incoming = req.headers['x-request-id'];
  const id =
    typeof incoming === 'string' && incoming.length > 0
      ? incoming
      : crypto.randomUUID();

  req.requestId = id;
  res.setHeader('X-Request-ID', id);
  next();
};
