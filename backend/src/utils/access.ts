import { AuthUser, UserRole } from '../types/database';

export const isPrivilegedRole = (role: UserRole): boolean =>
  role === 'admin' || role === 'manager';

export const resolveAssignedTo = (
  requestedAssignedTo: unknown,
  user: AuthUser,
): string => {
  if (
    typeof requestedAssignedTo === 'string' &&
    requestedAssignedTo &&
    isPrivilegedRole(user.role)
  ) {
    return requestedAssignedTo;
  }

  return user.id;
};

export const applyOwnershipScope = (
  query: any,
  user: AuthUser,
  column = 'assigned_to',
): any => {
  if (isPrivilegedRole(user.role)) {
    return query;
  }

  return query.eq(column, user.id);
};
