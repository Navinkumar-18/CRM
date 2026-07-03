import { supabase } from '../config/supabase';
import { env } from '../config/env';
import crypto from 'crypto';

const MAX_PAGE_LIMIT = 100;

class UserRepository {
  async findAll(
    page = 1,
    limit = 50,
  ): Promise<{ data: unknown[]; total: number; page: number; pages: number }> {
    const safeLimit = Math.min(Math.max(1, limit), MAX_PAGE_LIMIT);
    const skip = (page - 1) * safeLimit;

    const { data, count, error } = await supabase
      .from('users')
      .select('id, name, email, role, created_at, staffs:staffs(phone, position, department, status, employee_id, joined_date, performance)', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(skip, skip + safeLimit - 1);

    if (error) throw error;

    const users = (data || []).map((u: any) => {
      const staff = Array.isArray(u.staffs) ? u.staffs[0] : u.staffs;
      return {
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role || 'employee',
        created_at: u.created_at,
        phone: staff?.phone || null,
        position: staff?.position || null,
        department: staff?.department || null,
        status: staff?.status || 'active',
        employee_id: staff?.employee_id || null,
        joined_date: staff?.joined_date || null,
        performance: staff?.performance ? parseFloat(staff.performance) : 0,
      };
    });

    return {
      data: users || [],
      total: count || 0,
      page,
      pages: Math.ceil((count || 0) / safeLimit),
    };
  }

  async findById(id: string): Promise<unknown> {
    const { data, error } = await supabase
      .from('users')
      .select('id, name, email, role, created_at, staffs:staffs(phone, position, department, status, employee_id, joined_date, performance)')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    if (!data) return null;
    const u: any = data;
    const staff = Array.isArray(u.staffs) ? u.staffs[0] : u.staffs;
    return {
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role || 'employee',
      created_at: u.created_at,
      phone: staff?.phone || null,
      position: staff?.position || null,
      department: staff?.department || null,
      status: staff?.status || 'active',
      employee_id: staff?.employee_id || null,
      joined_date: staff?.joined_date || null,
      performance: staff?.performance ? parseFloat(staff.performance) : 0,
    };
  }

  async create(data: Record<string, unknown>): Promise<unknown> {
    const userId = (data.id as string) || crypto.randomUUID();
    
    // Separate user table fields and staff table fields
    const { phone, position, department, status, employee_id, joined_date, performance, ...userTableFields } = data;

    // 1. Insert user
    const { data: user, error: userError } = await supabase
      .from('users')
      .insert({
        ...userTableFields,
        id: userId,
        // Admin-created users are pre-verified — no email verification needed
        is_verified: true,
        verification_token: null,
      })
      .select('id, name, email, role, created_at')
      .single();

    if (userError) throw userError;

    // 2. Update staff profile details (the trigger handles auto-inserting the default row)
    const empId = (employee_id as string) || `EMP-${userId.substring(0, 8)}`;
    const { data: staff, error: staffError } = await supabase
      .from('staffs')
      .update({
        phone: (phone as string) || null,
        position: (position as string) || 'Sales Specialist',
        department: (department as string) || 'Sales',
        status: (status as string) || 'active',
        employee_id: empId,
        performance: performance ? parseFloat(performance as string) : 0.00,
      })
      .eq('id', userId)
      .select('*')
      .single();

    if (staffError) {
      // Clean up user if staff update fails
      await supabase.from('users').delete().eq('id', userId);
      throw staffError;
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role || 'employee',
      created_at: user.created_at,
      phone: staff?.phone || null,
      position: staff?.position || null,
      department: staff?.department || null,
      status: staff?.status || 'active',
      employee_id: staff?.employee_id || null,
      joined_date: staff?.joined_date || null,
      performance: staff?.performance ? parseFloat(staff.performance) : 0,
    };
  }

  async update(id: string, data: Record<string, unknown>): Promise<unknown> {
    // Separate user table fields and staff table fields
    const { phone, position, department, status, employee_id, joined_date, performance, ...userTableFields } = data;

    // 1. Update user if any user fields are present
    let updatedUser = null;
    if (Object.keys(userTableFields).length > 0) {
      const { data: user, error: userError } = await supabase
        .from('users')
        .update(userTableFields)
        .eq('id', id)
        .select('id, name, email, role, created_at')
        .single();
      if (userError) throw userError;
      updatedUser = user;
    } else {
      updatedUser = await this.findById(id);
    }

    // 2. Update staff profile if any staff fields are present
    const staffTableFields: Record<string, unknown> = {};
    if (phone !== undefined) staffTableFields.phone = phone;
    if (position !== undefined) staffTableFields.position = position;
    if (department !== undefined) staffTableFields.department = department;
    if (status !== undefined) staffTableFields.status = status;
    if (employee_id !== undefined) staffTableFields.employee_id = employee_id;
    if (performance !== undefined) staffTableFields.performance = performance;

    let updatedStaff = null;
    if (Object.keys(staffTableFields).length > 0) {
      const { data: staff, error: staffError } = await supabase
        .from('staffs')
        .update(staffTableFields)
        .eq('id', id)
        .select('*')
        .single();
      if (staffError) throw staffError;
      updatedStaff = staff;
    } else {
      const { data: staff } = await supabase
        .from('staffs')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      updatedStaff = staff;
    }

    const u = updatedUser as any;
    return {
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role || 'employee',
      created_at: u.created_at,
      phone: updatedStaff?.phone || null,
      position: updatedStaff?.position || null,
      department: updatedStaff?.department || null,
      status: updatedStaff?.status || 'active',
      employee_id: updatedStaff?.employee_id || null,
      joined_date: updatedStaff?.joined_date || null,
      performance: updatedStaff?.performance ? parseFloat(updatedStaff.performance) : 0,
    };
  }

  async remove(id: string): Promise<unknown> {
    const { data, error } = await supabase
      .from('users')
      .delete()
      .eq('id', id)
      .select('id')
      .single();

    if (error) throw error;
    return data;
  }
}

export const userRepository = new UserRepository();
