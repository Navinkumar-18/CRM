import { isPrivilegedRole, resolveAssignedTo, applyOwnershipScope } from '../../../src/utils/access';
import { AuthUser } from '../../../src/types/database';

describe('access utilities', () => {
  describe('isPrivilegedRole', () => {
    it('should return true for admin and manager', () => {
      expect(isPrivilegedRole('admin')).toBe(true);
      expect(isPrivilegedRole('manager')).toBe(true);
    });

    it('should return false for employee', () => {
      expect(isPrivilegedRole('employee')).toBe(false);
    });
  });

  describe('resolveAssignedTo', () => {
    const adminUser = { id: 'admin-1', role: 'admin', email: 'admin@crm.com' } as AuthUser;
    const employeeUser = { id: 'emp-1', role: 'employee', email: 'emp@crm.com' } as AuthUser;

    it('should allow privileged roles to assign records to anyone', () => {
      expect(resolveAssignedTo('target-user-id', adminUser)).toBe('target-user-id');
    });

    it('should force assigning to self for non-privileged roles', () => {
      expect(resolveAssignedTo('target-user-id', employeeUser)).toBe('emp-1');
    });

    it('should default to self for empty requested assignments', () => {
      expect(resolveAssignedTo('', adminUser)).toBe('admin-1');
      expect(resolveAssignedTo(undefined, adminUser)).toBe('admin-1');
    });
  });

  describe('applyOwnershipScope', () => {
    const adminUser = { id: 'admin-1', role: 'admin', email: 'admin@crm.com' } as AuthUser;
    const employeeUser = { id: 'emp-1', role: 'employee', email: 'emp@crm.com' } as AuthUser;

    it('should not mutate query for privileged roles', () => {
      const mockQuery = { eq: jest.fn() };
      const result = applyOwnershipScope(mockQuery, adminUser);
      expect(result).toBe(mockQuery);
      expect(mockQuery.eq).not.toHaveBeenCalled();
    });

    it('should scope query to assigned_to column for non-privileged roles', () => {
      const mockQuery = { eq: jest.fn().mockReturnThis() };
      const result = applyOwnershipScope(mockQuery, employeeUser);
      expect(result).toBe(mockQuery);
      expect(mockQuery.eq).toHaveBeenCalledWith('assigned_to', 'emp-1');
    });

    it('should scope query to custom column if provided', () => {
      const mockQuery = { eq: jest.fn().mockReturnThis() };
      const result = applyOwnershipScope(mockQuery, employeeUser, 'owner_id');
      expect(result).toBe(mockQuery);
      expect(mockQuery.eq).toHaveBeenCalledWith('owner_id', 'emp-1');
    });
  });
});
