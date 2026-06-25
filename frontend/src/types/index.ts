export type CustomerStatus = 'active' | 'inactive' | 'prospect';
export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'won' | 'lost';
export type TaskStatus = 'pending' | 'in_progress' | 'completed';
export type TaskPriority = 'low' | 'medium' | 'high';
export type UserRole = 'admin' | 'manager' | 'employee';
export type Sector = 'general' | 'school' | 'hospital' | 'ecommerce';
export type ActivityType =
  | 'customer_created'
  | 'customer_updated'
  | 'lead_created'
  | 'lead_updated'
  | 'task_assigned'
  | 'task_completed'
  | 'custom';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
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
  totalCustomers: number;
  totalLeads: number;
  totalTasks: number;
  conversionRate: number;
}
