import { supabase } from '../config/supabase';
import { AuthUser } from '../types/database';

export class NoteRepository {
  private table = 'notes';

  async findByEntity(
    entityType: 'lead_id' | 'deal_id' | 'contact_id' | 'company_id',
    entityId: string,
    page: number,
    limit: number,
  ) {
    const skip = (page - 1) * limit;
    const { data, count, error } = await supabase
      .from(this.table)
      .select('*, author:author_id(id, name, email)', { count: 'exact' })
      .eq(entityType, entityId)
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

  async findAll(
    user: AuthUser,
    filters: { lead_id?: string; deal_id?: string; contact_id?: string; company_id?: string },
    page: number,
    limit: number,
  ) {
    const skip = (page - 1) * limit;
    let query = supabase
      .from(this.table)
      .select('*, author:author_id(id, name, email)', { count: 'exact' });

    if (user.role === 'employee') {
      query = query.eq('author_id', user.id);
    }

    if (filters.lead_id) query = query.eq('lead_id', filters.lead_id);
    if (filters.deal_id) query = query.eq('deal_id', filters.deal_id);
    if (filters.contact_id) query = query.eq('contact_id', filters.contact_id);
    if (filters.company_id) query = query.eq('company_id', filters.company_id);

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

  async findById(id: string) {
    const { data, error } = await supabase
      .from(this.table)
      .select('*, author:author_id(id, name, email)')
      .eq('id', id)
      .single();
    if (error) return null;
    return data;
  }

  async create(data: Record<string, unknown>) {
    const { data: record, error } = await supabase
      .from(this.table)
      .insert(data)
      .select('*, author:author_id(id, name, email)')
      .single();
    if (error) throw error;
    return record;
  }

  async update(id: string, authorId: string, body: string) {
    const { data, error } = await supabase
      .from(this.table)
      .update({ body })
      .eq('id', id)
      .eq('author_id', authorId) // authors can only edit their own notes
      .select('*, author:author_id(id, name, email)')
      .single();
    if (error) throw error;
    return data;
  }

  async remove(id: string, user: AuthUser) {
    let query = supabase.from(this.table).delete().eq('id', id);
    // Admin/manager can delete any note; employee only their own
    if (user.role === 'employee') {
      query = query.eq('author_id', user.id);
    }
    const { error } = await query;
    if (error) throw error;
  }
}

export const noteRepository = new NoteRepository();
