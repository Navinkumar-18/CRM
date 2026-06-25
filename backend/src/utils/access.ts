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

// Supabase builders vary by operation, so keep this helper loose and focused.
export const applyOwnershipScope = (
  query: any,
  user: AuthUser,
  column = 'assigned_to',
): any => {
  if (user.role === 'admin' || column === 'assigned_to') {
    return query;
  }

  return query.eq(column, user.id);
};
