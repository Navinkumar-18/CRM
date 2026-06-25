// This file augments the Express Request type globally.
// It MUST be a module (contain at least one import/export) for declaration merging to work.
import { AuthUser } from './database';

declare global {
  namespace Express {
    interface Request {
      /**
       * Populated by the `protect` middleware after JWT verification.
       */
      user?: AuthUser;
      /**
       * Populated by the `requestId` middleware. Injected as X-Request-ID header.
       */
      requestId?: string;
    }
  }
}

export {};
