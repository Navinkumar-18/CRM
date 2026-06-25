export const SECTORS = [
  { value: 'general', label: 'General', color: 'bg-slate-100 text-slate-700 border-slate-200' },
  { value: 'school', label: 'School', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  { value: 'hospital', label: 'Hospital', color: 'bg-red-100 text-red-700 border-red-200' },
  { value: 'ecommerce', label: 'E-Commerce', color: 'bg-green-100 text-green-700 border-green-200' },
] as const;

export const CUSTOMER_STATUSES = [
  { value: 'active', label: 'Active', color: 'bg-green-50 text-green-700 border-green-200' },
  { value: 'inactive', label: 'Inactive', color: 'bg-slate-100 text-slate-700 border-slate-200' },
  { value: 'prospect', label: 'Prospect', color: 'bg-blue-50 text-blue-700 border-blue-200' },
] as const;

export const LEAD_STAGES = [
  { value: 'new', label: 'New Leads', color: 'bg-blue-100 text-blue-800' },
  { value: 'contacted', label: 'Contacted', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'qualified', label: 'Qualified', color: 'bg-purple-100 text-purple-800' },
  { value: 'won', label: 'Closed Won', color: 'bg-green-100 text-green-800' },
  { value: 'lost', label: 'Closed Lost', color: 'bg-red-100 text-red-800' },
] as const;

export const TASK_STATUSES = [
  { value: 'pending', label: 'Pending', color: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
  { value: 'in_progress', label: 'In Progress', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  { value: 'completed', label: 'Completed', color: 'bg-green-50 text-green-700 border-green-200' },
] as const;

export const TASK_PRIORITIES = [
  { value: 'low', label: 'Low', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  { value: 'medium', label: 'Medium', color: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
  { value: 'high', label: 'High', color: 'bg-red-50 text-red-700 border-red-200' },
] as const;

export const ACTIVITY_ICONS: Record<string, string> = {
  customer_created: 'text-blue-600 bg-blue-100',
  lead_created: 'text-purple-600 bg-purple-100',
  task_completed: 'text-green-600 bg-green-100',
};

export function getSectorColor(sector: string): string {
  const s = SECTORS.find(s => s.value === sector);
  return s?.color ?? SECTORS[0].color;
}

export function getStatusColor(status: string, type: 'customer' | 'lead' | 'task'): string {
  if (type === 'customer') {
    const s = CUSTOMER_STATUSES.find(s => s.value === status);
    return s?.color ?? CUSTOMER_STATUSES[2].color;
  }
  if (type === 'lead') {
    const s = LEAD_STAGES.find(s => s.value === status);
    return s?.color ?? LEAD_STAGES[0].color;
  }
  const s = TASK_STATUSES.find(s => s.value === status);
  return s?.color ?? TASK_STATUSES[0].color;
}
