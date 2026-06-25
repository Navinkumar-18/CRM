import { supabase } from '../config/supabase';
import { AuthUser } from '../types/database';

/** Applies ownership filter based on user role */
const ownerFilter = (user: AuthUser) =>
  user.role === 'employee' ? user.id : null;

export const getDashboardSummary = async (user: AuthUser) => {
  const scopeId = ownerFilter(user);

  // Run all counts in parallel
  const [
    leadsResult,
    dealsResult,
    openDealsResult,
    tasksDueResult,
    contactsResult,
    companiesResult,
    customersResult,
  ] = await Promise.all([
    // Total leads
    (() => {
      let q = supabase.from('leads').select('id', { count: 'exact', head: true });
      if (scopeId) q = q.eq('assigned_to', scopeId);
      return q;
    })(),
    // Total deal revenue (closed_won)
    (() => {
      let q = supabase.from('deals').select('value').eq('stage', 'closed_won');
      if (scopeId) q = q.eq('assigned_to', scopeId);
      return q;
    })(),
    // Open deals count
    (() => {
      let q = supabase
        .from('deals')
        .select('id', { count: 'exact', head: true })
        .not('stage', 'in', '(closed_won,closed_lost)');
      if (scopeId) q = q.eq('assigned_to', scopeId);
      return q;
    })(),
    // Tasks due today or overdue
    (() => {
      const today = new Date().toISOString();
      let q = supabase
        .from('tasks')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'pending')
        .lte('due_date', today);
      if (scopeId) q = q.eq('assigned_to', scopeId);
      return q;
    })(),
    // Total contacts
    (() => {
      let q = supabase.from('contacts').select('id', { count: 'exact', head: true });
      if (scopeId) q = q.eq('owner_id', scopeId);
      return q;
    })(),
    // Total companies
    supabase.from('companies').select('id', { count: 'exact', head: true }),
    // Total customers
    (() => {
      let q = supabase.from('customers').select('id', { count: 'exact', head: true });
      if (scopeId) q = q.eq('assigned_to', scopeId);
      return q;
    })(),
  ]);

  const revenue = (dealsResult.data ?? []).reduce(
    (sum: number, row: { value: number }) => sum + Number(row.value || 0),
    0,
  );

  return {
    leads: leadsResult.count ?? 0,
    open_deals: openDealsResult.count ?? 0,
    tasks_due: tasksDueResult.count ?? 0,
    contacts: contactsResult.count ?? 0,
    companies: companiesResult.count ?? 0,
    customers: customersResult.count ?? 0,
    revenue_closed_won: revenue,
  };
};

export const getPipelineRevenue = async (user: AuthUser) => {
  const scopeId = ownerFilter(user);

  let query = supabase
    .from('deals')
    .select('stage, value')
    .not('stage', 'in', '(closed_won,closed_lost)');

  if (scopeId) query = query.eq('assigned_to', scopeId);

  const { data, error } = await query;
  if (error) throw error;

  const stages = ['prospecting', 'qualification', 'proposal', 'negotiation'];
  const result = stages.map((stage) => {
    const rows = (data ?? []).filter((r: { stage: string }) => r.stage === stage);
    return {
      stage,
      count: rows.length,
      total: rows.reduce((sum: number, r: { value: number }) => sum + Number(r.value || 0), 0),
    };
  });

  return result;
};

export const getRecentActivities = async (user: AuthUser, limit = 20) => {
  let query = supabase
    .from('activities')
    .select('*, user:user_id(id, name, email)')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (user.role === 'employee') {
    query = query.eq('user_id', user.id);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
};

export const getLeadFunnel = async (user: AuthUser) => {
  const scopeId = ownerFilter(user);

  let query = supabase.from('leads').select('status');
  if (scopeId) query = query.eq('assigned_to', scopeId);

  const { data, error } = await query;
  if (error) throw error;

  const statuses = ['new', 'contacted', 'qualified', 'won', 'lost'];
  return statuses.map((status) => ({
    status,
    count: (data ?? []).filter((r: { status: string }) => r.status === status).length,
  }));
};
