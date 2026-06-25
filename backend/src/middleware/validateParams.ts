import { Request, Response, NextFunction } from 'express';

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Validates that a named route param is a valid UUID v4.
 * Rejects with 400 before the request reaches any service/repository.
 *
 * @example
 *   router.delete('/:id', validateUUID('id'), remove);
 */
export const validateUUID = (paramName = 'id') => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const value = req.params[paramName];

    if (!value || !UUID_REGEX.test(value as string)) {
      res.status(400).json({
        success: false,
        message: `Invalid ${paramName}: must be a valid UUID`,
      });
      return;
    }

    next();
  };
};
