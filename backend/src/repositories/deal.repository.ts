import { BaseRepository } from './base.repository';
import { supabase } from '../config/supabase';
import { AuthUser } from '../types/database';

export class DealRepository extends BaseRepository {
  constructor() {
    super('deals');
  }

  /** Pipeline summary: total value and count grouped by stage */
  async pipelineSummary(user: AuthUser) {
    let query = supabase
      .from('deals')
      .select('stage, value')
      .not('stage', 'in', '(closed_won,closed_lost)');

    if (user.role === 'employee') {
      query = query.eq('assigned_to', user.id);
    }

    const { data, error } = await query;
    if (error) throw error;

    const summary: Record<string, { count: number; total: number }> = {};
    for (const row of data ?? []) {
      if (!summary[row.stage]) summary[row.stage] = { count: 0, total: 0 };
      summary[row.stage].count++;
      summary[row.stage].total += Number(row.value) || 0;
    }
    return summary;
  }
}

export const dealRepository = new DealRepository();
