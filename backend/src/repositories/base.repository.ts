import { supabase } from '../config/supabase';
import { AuthUser } from '../types/database';
import { applyOwnershipScope } from '../utils/access';

const MAX_PAGE_LIMIT = 100;

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedQuery<T = unknown> {
  data: T[];
  total: number;
  page: number;
  pages: number;
}

export class BaseRepository {
  protected table: string;
  protected ownershipColumn: string;

  constructor(table: string, ownershipColumn = 'assigned_to') {
    this.table = table;
    this.ownershipColumn = ownershipColumn;
  }

  async findById(id: string, columns = '*') {
    const { data, error } = await supabase
      .from(this.table)
      .select(columns)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data;
  }

  /**
   * Like findById, but applies ownership scope so non-privileged users
   * can only access their own records.
   */
  async findByIdScoped(id: string, user: AuthUser, columns = '*') {
    const query = applyOwnershipScope(
      supabase.from(this.table).select(columns).eq('id', id),
      user,
      this.ownershipColumn,
    );
    const { data, error } = await query.single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data;
  }

  async findScoped(
    user: AuthUser,
    pagination: PaginationParams,
    filters: Record<string, string> = {},
    search?: { fields: string[]; query: string },
    extra = '',
  ): Promise<PaginatedQuery> {
    const { page } = pagination;
    // Guard against runaway queries
    const limit = Math.min(Math.max(1, pagination.limit), MAX_PAGE_LIMIT);
    const skip = (page - 1) * limit;

    let query = applyOwnershipScope(
      supabase.from(this.table).select(extra || '*', { count: 'exact' }),
      user,
      this.ownershipColumn,
    );

    for (const [key, value] of Object.entries(filters)) {
      if (value) query = query.eq(key, value);
    }

    if (search?.query) {
      // Sanitize: escape SQL LIKE wildcard characters
      const sanitized = search.query
        .trim()
        .slice(0, 100) // Cap search query length
        .replace(/[%_\\]/g, '\\$&');

      const conditions = search.fields
        .map((f) => `${f}.ilike.%${sanitized}%`)
        .join(',');
      query = query.or(conditions);
    }

    const { data, count, error } = await query
      .range(skip, skip + limit - 1)
      .order('created_at', { ascending: false });

    if (error) {
      if (error.code && error.code.startsWith('PGRST20')) {
        return { data: [], total: 0, page, pages: 1 };
      }
      throw error;
    }

    return {
      data: (data || []) as unknown[],
      total: count || 0,
      page,
      pages: Math.ceil((count || 0) / limit),
    };
  }

  async create(data: Record<string, unknown>, columns = '*'): Promise<unknown> {
    const { data: record, error } = await supabase
      .from(this.table)
      .insert(data)
      .select(columns)
      .single();

    if (error) throw error;
    return record;
  }

  async update(
    id: string,
    data: Record<string, unknown>,
    user: AuthUser,
    columns = '*',
  ): Promise<unknown> {
    const query = applyOwnershipScope(
      supabase.from(this.table).update(data).eq('id', id),
      user,
      this.ownershipColumn,
    );
    const { data: record, error } = await query.select(columns).single();

    if (error) throw error;
    return record;
  }

  async remove(id: string, user: AuthUser): Promise<void> {
    const { error } = await applyOwnershipScope(
      supabase.from(this.table).delete().eq('id', id),
      user,
      this.ownershipColumn,
    );

    if (error) throw error;
  }
}
