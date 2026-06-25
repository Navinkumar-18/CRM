import { Request, Response, NextFunction } from 'express';
import { authorize } from '../../../src/middleware/roles';

const mockResponse = () => {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res as Response;
};

describe('authorize middleware', () => {
  it('allows access when user has required role', () => {
    const req = { user: { id: '1', email: 'a@b.com', role: 'admin' } } as Request;
    const res = mockResponse();
    const next = jest.fn() as NextFunction;

    authorize('admin')(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('denies access when user lacks required role', () => {
    const req = { user: { id: '1', email: 'a@b.com', role: 'employee' } } as Request;
    const res = mockResponse();
    const next = jest.fn() as NextFunction;

    authorize('admin')(req, res, next);
    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(403);
  });

  it('returns 401 if no user', () => {
    const req = {} as Request;
    const res = mockResponse();
    const next = jest.fn() as NextFunction;

    authorize('admin')(req, res, next);
    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
  });
});
