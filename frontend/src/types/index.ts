export type CustomerStatus = 'active' | 'inactive' | 'prospect';
export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'won' | 'lost';
export type TaskStatus = 'pending' | 'in_progress' | 'completed';
export type TaskPriority = 'low' | 'medium' | 'high';
export type UserRole = 'admin' | 'manager' | 'employee' | 'staff';
export type Sector = 'general' | 'school' | 'hospital' | 'ecommerce' | 'manufacturing' | 'real_estate';
export type ActivityType =
  | 'customer_created'
  | 'customer_updated'
  | 'lead_created'
  | 'lead_updated'
  | 'task_assigned'
  | 'task_completed'
  | 'deal_created'
  | 'deal_updated'
  | 'deal_stage_changed'
  | 'company_created'
  | 'company_updated'
  | 'contact_created'
  | 'contact_updated'
  | 'custom';

export type DealStage = 'prospecting' | 'qualification' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  position?: string;
  department?: string;
  status?: 'active' | 'inactive';
  employeeId?: string;
  avatar?: string;
  joinedDate?: string;
  performance?: number;
  assignedLeadsCount?: number;
  assignedCustomersCount?: number;
  pendingTasksCount?: number;
  completedTasksCount?: number;
  created_at?: string;
}

export interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  address?: string;
  status: CustomerStatus;
  sector: Sector;
  notes?: string;
  assignedTo: User;
  createdAt: string;
  updatedAt: string;
}

export interface Lead {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  source?: string;
  status: LeadStatus;
  sector: Sector;
  notes?: string;
  assignedTo: User;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string;
  assignedTo: User;
  customer?: { id: string; name: string; company?: string };
  createdAt: string;
  updatedAt: string;
}

export interface Company {
  id: string;
  name: string;
  industry?: string;
  website?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  gstNumber?: string;
  isoCertificate?: string;
  sector: Sector;
  verified?: boolean;
  ownerId?: string;
  owner?: User;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Contact {
  id: string;
  firstName: string;
  lastName?: string;
  email?: string;
  phone?: string;
  title?: string;
  companyId?: string;
  company?: { id: string; name: string };
  ownerId?: string;
  owner?: User;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Deal {
  id: string;
  title: string;
  value: number;
  stage: DealStage;
  probability: number;
  expectedCloseDt?: string;
  actualCloseDt?: string;
  leadId?: string;
  lead?: { id: string; name: string };
  companyId?: string;
  company?: { id: string; name: string };
  contactId?: string;
  contact?: { id: string; firstName: string; lastName?: string };
  assignedTo?: string;
  assignee?: User;
  lostReason?: string;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Activity {
  id: string;
  type: ActivityType;
  description: string;
  user: User;
  customer?: { id: string; name: string };
  lead?: { id: string; name: string };
  task?: { id: string; title: string };
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export interface PaginatedData<T> {
  data: T[];
  total: number;
  page: number;
  pages: number;
}

export interface DashboardMetrics {
  customers: number;
  contacts: number;
  companies: number;
  leads: number;
  openDeals: number;
  tasksDue: number;
  revenueClosedWon: number;
}
