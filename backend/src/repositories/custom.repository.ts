import { supabase } from '../config/supabase';
import { AuthUser } from '../types/database';
import { applyOwnershipScope } from '../utils/access';
import { NotFoundError } from '../utils/AppError';

export class CustomRepository {
  async listModules() {
    const { data, error } = await supabase
      .from('custom_modules')
      .select('*')
      .order('name');
    if (error) throw error;
    return data ?? [];
  }

  async getModuleBySlug(slug: string) {
    const { data, error } = await supabase
      .from('custom_modules')
      .select('*, fields:custom_fields(*)')
      .eq('slug', slug)
      .single();
    if (error) return null;
    return data;
  }

  async getModuleById(id: string) {
    const { data, error } = await supabase
      .from('custom_modules')
      .select('*, fields:custom_fields(*)')
      .eq('id', id)
      .single();
    if (error) return null;
    return data;
  }

  async createModule(data: Record<string, unknown>) {
    const { data: record, error } = await supabase
      .from('custom_modules')
      .insert(data)
      .select()
      .single();
    if (error) throw error;
    return record;
  }

  async updateModule(id: string, data: Record<string, unknown>) {
    const { data: record, error } = await supabase
      .from('custom_modules')
      .update(data)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return record;
  }

  async deleteModule(id: string) {
    const { error } = await supabase
      .from('custom_modules')
      .delete()
      .eq('id', id);
    if (error) throw error;
  }

  async addField(moduleId: string, data: Record<string, unknown>) {
    const { data: record, error } = await supabase
      .from('custom_fields')
      .insert({ ...data, module_id: moduleId })
      .select()
      .single();
    if (error) throw error;
    return record;
  }

  async removeField(fieldId: string) {
    const { error } = await supabase
      .from('custom_fields')
      .delete()
      .eq('id', fieldId);
    if (error) throw error;
  }

  async listRecords(
    moduleId: string,
    page: number,
    limit: number,
    user: AuthUser,
  ) {
    const skip = (page - 1) * limit;
    let query = supabase
      .from('custom_records')
      .select('*', { count: 'exact' })
      .eq('module_id', moduleId);

    query = applyOwnershipScope(query, user, 'owner_id');

    const { data, count, error } = await query
      .range(skip, skip + limit - 1)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return {
      data: data ?? [],
      total: count ?? 0,
      page,
      pages: Math.ceil((count ?? 0) / limit),
    };
  }

  async createRecord(data: Record<string, unknown>) {
    const { data: record, error } = await supabase
      .from('custom_records')
      .insert(data)
      .select()
      .single();
    if (error) throw error;
    return record;
  }

  async updateRecord(
    id: string,
    data: Record<string, unknown>,
    user: AuthUser,
  ) {
    let query = supabase.from('custom_records').update({ data }).eq('id', id);

    query = applyOwnershipScope(query, user, 'owner_id');

    const { data: record, error } = await query.select().single();
    if (error) {
      if (error.code === 'PGRST116') {
        throw new NotFoundError('Record not found or access denied');
      }
      throw error;
    }
    return record;
  }

  async deleteRecord(id: string, user: AuthUser) {
    let query = supabase.from('custom_records').delete().eq('id', id);

    query = applyOwnershipScope(query, user, 'owner_id');

    const { error } = await query;
    if (error) throw error;
  }
}

export const customRepository = new CustomRepository();
