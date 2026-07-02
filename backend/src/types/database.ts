export type UserRole = 'admin' | 'manager' | 'employee' | 'staff';

export type CustomerStatus = 'active' | 'inactive' | 'prospect';
export type Sector =
  | 'general'
  | 'school'
  | 'hospital'
  | 'ecommerce'
  | 'manufacturing'
  | 'real_estate';
export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'won' | 'lost';
export type TaskStatus = 'pending' | 'in_progress' | 'completed';
export type TaskPriority = 'low' | 'medium' | 'high';
export type DealStage =
  | 'prospecting'
  | 'qualification'
  | 'proposal'
  | 'negotiation'
  | 'closed_won'
  | 'closed_lost';

export type ActivityType =
  | 'customer_created'
  | 'customer_updated'
  | 'lead_created'
  | 'lead_updated'
  | 'lead_assigned'
  | 'deal_created'
  | 'deal_updated'
  | 'deal_stage_changed'
  | 'contact_created'
  | 'contact_updated'
  | 'company_created'
  | 'company_updated'
  | 'task_assigned'
  | 'task_completed'
  | 'note_added'
  | 'custom';

export type CustomFieldType =
  | 'text'
  | 'number'
  | 'date'
  | 'boolean'
  | 'select'
  | 'multi_select'
  | 'file'
  | 'relation';

// ── User ─────────────────────────────────────────────────────────
export interface User {
  id: string;
  email: string;
  password_hash: string;
  name: string;
  role: UserRole;
  phone?: string;
  position?: string;
  department?: string;
  status?: 'active' | 'inactive';
  employee_id?: string;
  avatar?: string;
  is_verified: boolean;
  verification_token: string | null;
  reset_password_token: string | null;
  reset_password_expires: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserPublic {
  id: string;
  name: string;
  email: string;
  role?: UserRole;
  phone?: string;
  position?: string;
  department?: string;
  status?: 'active' | 'inactive';
  employee_id?: string;
  avatar?: string;
  created_at?: string;
}

export interface RefreshToken {
  id: string;
  user_id: string;
  token_hash: string;
  expires_at: string;
  revoked_at: string | null;
  created_at: string;
}

// ── Company ───────────────────────────────────────────────────────
export interface Company {
  id: string;
  name: string;
  industry: string | null;
  website: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  gst_number: string | null;
  iso_certificate: string | null;
  verified: boolean;
  sector: string;
  owner_id: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

// ── Contact ───────────────────────────────────────────────────────
export interface Contact {
  id: string;
  first_name: string;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  title: string | null;
  company_id: string | null;
  owner_id: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

// ── Customer (legacy — kept for backwards compat) ─────────────────
export interface Customer {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  address: string | null;
  status: CustomerStatus;
  sector: Sector;
  notes: string | null;
  assigned_to: string;
  created_at: string;
  updated_at: string;
}

// ── Lead ──────────────────────────────────────────────────────────
export interface Lead {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  source: string | null;
  status: LeadStatus;
  sector: Sector;
  notes: string | null;
  assigned_to: string | null;
  company_id: string | null;
  contact_id: string | null;
  value: number | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

// ── Deal ──────────────────────────────────────────────────────────
export interface Deal {
  id: string;
  title: string;
  value: number;
  stage: DealStage;
  probability: number;
  expected_close_dt: string | null;
  actual_close_dt: string | null;
  lead_id: string | null;
  company_id: string | null;
  contact_id: string | null;
  assigned_to: string;
  created_by: string;
  lost_reason: string | null;
  created_at: string;
  updated_at: string;
}

// ── Task ──────────────────────────────────────────────────────────
export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  due_date: string | null;
  assigned_to: string;
  customer_id: string | null;
  lead_id: string | null;
  deal_id: string | null;
  contact_id: string | null;
  company_id: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

// ── Note ──────────────────────────────────────────────────────────
export interface Note {
  id: string;
  body: string;
  author_id: string;
  lead_id: string | null;
  deal_id: string | null;
  contact_id: string | null;
  company_id: string | null;
  created_at: string;
  updated_at: string;
}

// ── Activity ──────────────────────────────────────────────────────
export interface Activity {
  id: string;
  type: ActivityType;
  description: string;
  user_id: string;
  customer_id: string | null;
  lead_id: string | null;
  deal_id: string | null;
  contact_id: string | null;
  company_id: string | null;
  task_id: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface ActivityWithUser extends Activity {
  user?: UserPublic;
}

// ── Custom Modules ────────────────────────────────────────────────
export interface CustomModule {
  id: string;
  name: string;
  slug: string;
  icon: string;
  sector: string;
  created_by: string;
  created_at: string;
}

export interface CustomField {
  id: string;
  module_id: string;
  label: string;
  field_key: string;
  field_type: CustomFieldType;
  required: boolean;
  options: string[] | null;
  sort_order: number;
  created_at: string;
}

export interface CustomRecord {
  id: string;
  module_id: string;
  data: Record<string, unknown>;
  owner_id: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

// ── Shared ────────────────────────────────────────────────────────
export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pages: number;
}

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
}
