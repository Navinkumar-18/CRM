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
      .select('id, name, email, role, created_at', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(skip, skip + safeLimit - 1);

    if (error) throw error;

    const users = (data || []).map((u) => ({
      ...u,
      role: (u as any).role || 'employee',
    }));

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
      .select('id, name, email, role')
      .eq('id', id)
      .single();

    if (error) return null;
    return data;
  }

  async create(data: Record<string, unknown>): Promise<unknown> {
    const { data: user, error } = await supabase
      .from('users')
      .insert({
        ...data,
        id: data.id || crypto.randomUUID(),
        // Admin-created users are pre-verified — no email verification needed
        is_verified: true,
        verification_token: null,
      })
      .select('id, name, email, role, created_at')
      .single();

    if (error) throw error;
    return user;
  }

  async update(id: string, data: Record<string, unknown>): Promise<unknown> {
    const { data: user, error } = await supabase
      .from('users')
      .update(data)
      .eq('id', id)
      .select('id, name, email, role')
      .single();

    if (error) throw error;
    return user;
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
