import type { User, Lead, Customer, Task, Activity } from '../types';

export interface StaffMember extends User {
  employeeId: string;
  phone: string;
  position: string;
  department: string;
  status: 'active' | 'inactive';
  avatar: string;
  joinedDate: string;
  performance: number;
  assignedLeadsCount: number;
  assignedCustomersCount: number;
  pendingTasksCount: number;
  completedTasksCount: number;
  wonLeadsCount: number;
  lostLeadsCount: number;
}

const STORAGE_KEY = 'zuna_staff_data_v2';

const initialStaff: StaffMember[] = [
  {
    id: 'staff-001',
    name: 'Sarah Jenkins',
    email: 'sarah.jenkins@company.com',
    role: 'staff',
    employeeId: 'EMP-001',
    phone: '+1 415 555 0192',
    position: 'Senior Enterprise Sales Executive',
    department: 'Sales',
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200',
    joinedDate: '2024-03-15',
    performance: 94,
    assignedLeadsCount: 8,
    assignedCustomersCount: 6,
    pendingTasksCount: 3,
    completedTasksCount: 16,
    wonLeadsCount: 12,
    lostLeadsCount: 2,
  },
  {
    id: 'staff-002',
    name: 'Marcus Chen',
    email: 'marcus.chen@company.com',
    role: 'staff',
    employeeId: 'EMP-002',
    phone: '+1 415 555 0184',
    position: 'Lead Development Specialist',
    department: 'Sales',
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
    joinedDate: '2024-06-01',
    performance: 88,
    assignedLeadsCount: 14,
    assignedCustomersCount: 3,
    pendingTasksCount: 5,
    completedTasksCount: 19,
    wonLeadsCount: 8,
    lostLeadsCount: 4,
  },
  {
    id: 'staff-003',
    name: 'Priya Patel',
    email: 'priya.patel@company.com',
    role: 'manager',
    employeeId: 'EMP-003',
    phone: '+1 415 555 0143',
    position: 'Key Account Manager',
    department: 'Account Management',
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200',
    joinedDate: '2023-11-20',
    performance: 96,
    assignedLeadsCount: 4,
    assignedCustomersCount: 12,
    pendingTasksCount: 2,
    completedTasksCount: 28,
    wonLeadsCount: 18,
    lostLeadsCount: 1,
  },
  {
    id: 'staff-004',
    name: 'David Kim',
    email: 'david.kim@company.com',
    role: 'staff',
    employeeId: 'EMP-004',
    phone: '+1 415 555 0177',
    position: 'Customer Support Lead',
    department: 'Support',
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
    joinedDate: '2024-01-10',
    performance: 82,
    assignedLeadsCount: 2,
    assignedCustomersCount: 9,
    pendingTasksCount: 7,
    completedTasksCount: 21,
    wonLeadsCount: 5,
    lostLeadsCount: 3,
  },
  {
    id: 'staff-005',
    name: 'Elena Rodriguez',
    email: 'elena.r@company.com',
    role: 'employee',
    employeeId: 'EMP-005',
    phone: '+1 415 555 0121',
    position: 'Sales Associate',
    department: 'Marketing',
    status: 'inactive',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
    joinedDate: '2025-02-01',
    performance: 65,
    assignedLeadsCount: 1,
    assignedCustomersCount: 1,
    pendingTasksCount: 1,
    completedTasksCount: 4,
    wonLeadsCount: 2,
    lostLeadsCount: 5,
  },
  {
    id: 'staff-006',
    name: 'Sarah Jenkins (Staff Portal Demo)',
    email: 'staff@gmail.com',
    role: 'staff',
    employeeId: 'EMP-006',
    phone: '+1 415 555 0199',
    position: 'Senior Account Executive',
    department: 'Sales',
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=200',
    joinedDate: '2024-05-10',
    performance: 91,
    assignedLeadsCount: 6,
    assignedCustomersCount: 5,
    pendingTasksCount: 4,
    completedTasksCount: 15,
    wonLeadsCount: 10,
    lostLeadsCount: 2,
  },
  {
    id: 'staff-007',
    name: 'Employee User',
    email: 'employee@gmail.com',
    role: 'employee',
    employeeId: 'EMP-007',
    phone: '+1 415 555 0111',
    position: 'Sales Representative',
    department: 'Sales',
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=200',
    joinedDate: '2024-04-12',
    performance: 85,
    assignedLeadsCount: 5,
    assignedCustomersCount: 4,
    pendingTasksCount: 3,
    completedTasksCount: 11,
    wonLeadsCount: 6,
    lostLeadsCount: 2,
  },
  {
    id: 'staff-008',
    name: 'Manager User',
    email: 'manager@gmail.com',
    role: 'manager',
    employeeId: 'EMP-008',
    phone: '+1 415 555 0122',
    position: 'Regional Sales Manager',
    department: 'Sales',
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=200',
    joinedDate: '2023-08-01',
    performance: 95,
    assignedLeadsCount: 7,
    assignedCustomersCount: 8,
    pendingTasksCount: 2,
    completedTasksCount: 24,
    wonLeadsCount: 15,
    lostLeadsCount: 1,
  }
];

const initialLeads: Lead[] = [
  {
    id: 'lead-101',
    name: 'Acme Global Software',
    email: 'procurement@acmeglobal.com',
    phone: '+1 800 555 0199',
    source: 'Website',
    status: 'qualified',
    sector: 'ecommerce',
    notes: 'Requested demo of enterprise tier for 50+ user license.',
    assignedTo: { id: 'staff-006', name: 'Sarah Jenkins (Staff Portal Demo)', email: 'staff@gmail.com', role: 'staff' },
    createdAt: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'lead-102',
    name: 'Starlight Education Institute',
    email: 'admin@starlightedu.org',
    phone: '+1 800 555 0188',
    source: 'Referral',
    status: 'contacted',
    sector: 'school',
    notes: 'Interested in CRM for student admissions tracking.',
    assignedTo: { id: 'staff-006', name: 'Sarah Jenkins (Staff Portal Demo)', email: 'staff@gmail.com', role: 'staff' },
    createdAt: new Date(Date.now() - 3600000 * 24 * 5).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'lead-103',
    name: 'Metro City Hospital Network',
    email: 'it.director@metrohospital.org',
    phone: '+1 800 555 0177',
    source: 'Cold Call',
    status: 'new',
    sector: 'hospital',
    notes: 'Need secure patient interaction log and scheduling integration.',
    assignedTo: { id: 'staff-006', name: 'Sarah Jenkins (Staff Portal Demo)', email: 'staff@gmail.com', role: 'staff' },
    createdAt: new Date(Date.now() - 3600000 * 24 * 1).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'lead-104',
    name: 'Nexus Real Estate Group',
    email: 'contact@nexusrealty.com',
    phone: '+1 800 555 0166',
    source: 'Social Media',
    status: 'contacted',
    sector: 'real_estate',
    notes: 'Expanding to 10 new branches, looking for multi-office CRM.',
    assignedTo: { id: 'staff-006', name: 'Sarah Jenkins (Staff Portal Demo)', email: 'staff@gmail.com', role: 'staff' },
    createdAt: new Date(Date.now() - 3600000 * 24 * 4).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'lead-105',
    name: 'Apex Manufacturing Logistics',
    email: 'ops@apexmfg.com',
    phone: '+1 800 555 0155',
    source: 'Email',
    status: 'won',
    sector: 'manufacturing',
    notes: 'Contract signed for annual subscription. Onboarding next week.',
    assignedTo: { id: 'staff-006', name: 'Sarah Jenkins (Staff Portal Demo)', email: 'staff@gmail.com', role: 'staff' },
    createdAt: new Date(Date.now() - 3600000 * 24 * 10).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'lead-106',
    name: 'TechStream Solutions',
    email: 'info@techstream.io',
    phone: '+1 800 555 0144',
    source: 'Website',
    status: 'qualified',
    sector: 'general',
    notes: 'Follow up after proposal review.',
    assignedTo: { id: 'staff-001', name: 'Sarah Jenkins', email: 'sarah.jenkins@company.com', role: 'staff' },
    createdAt: new Date(Date.now() - 3600000 * 24 * 3).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'lead-107',
    name: 'GreenValley Schools',
    email: 'admissions@greenvalley.edu',
    phone: '+1 800 555 0133',
    source: 'Referral',
    status: 'new',
    sector: 'school',
    notes: 'Informed by board member about Zuna CRM capabilities.',
    assignedTo: { id: 'staff-002', name: 'Marcus Chen', email: 'marcus.chen@company.com', role: 'staff' },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

const initialCustomers: Customer[] = [
  {
    id: 'cust-201',
    name: 'Robert Vance (Vance Refrigeration)',
    email: 'rvance@vancerefrigeration.com',
    phone: '+1 312 555 0190',
    company: 'Vance Refrigeration',
    address: '400 Industrial Way, Scranton, PA',
    status: 'active',
    sector: 'manufacturing',
    notes: 'Long term VIP client. Monthly check-in required.',
    assignedTo: { id: 'staff-006', name: 'Sarah Jenkins (Staff Portal Demo)', email: 'staff@gmail.com', role: 'staff' },
    createdAt: new Date(Date.now() - 3600000 * 24 * 30).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cust-202',
    name: 'Jan Levinson (White-Sellers Corp)',
    email: 'jlevinson@whitesellers.com',
    phone: '+1 212 555 0180',
    company: 'White-Sellers Corp',
    address: '800 Park Ave, New York, NY',
    status: 'active',
    sector: 'general',
    notes: 'Upgraded license from 10 to 25 seats last month.',
    assignedTo: { id: 'staff-006', name: 'Sarah Jenkins (Staff Portal Demo)', email: 'staff@gmail.com', role: 'staff' },
    createdAt: new Date(Date.now() - 3600000 * 24 * 45).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cust-203',
    name: 'Dr. Gregory House (Princeton Plainsboro)',
    email: 'ghouse@ppth.org',
    phone: '+1 609 555 0170',
    company: 'Princeton Plainsboro Teaching Hospital',
    address: '100 Medical Center Dr, Princeton, NJ',
    status: 'active',
    sector: 'hospital',
    notes: 'Custom HIPAA compliant storage module active.',
    assignedTo: { id: 'staff-006', name: 'Sarah Jenkins (Staff Portal Demo)', email: 'staff@gmail.com', role: 'staff' },
    createdAt: new Date(Date.now() - 3600000 * 24 * 60).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cust-204',
    name: 'Arthur Pendelton (Sunnyside School District)',
    email: 'apendelton@sunnysidedistrict.edu',
    phone: '+1 415 555 0160',
    company: 'Sunnyside School District',
    address: '55 Education Blvd, San Francisco, CA',
    status: 'prospect',
    sector: 'school',
    notes: 'Pilot program ending in 2 weeks. Prepare renewal proposal.',
    assignedTo: { id: 'staff-006', name: 'Sarah Jenkins (Staff Portal Demo)', email: 'staff@gmail.com', role: 'staff' },
    createdAt: new Date(Date.now() - 3600000 * 24 * 15).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cust-205',
    name: 'Monica Geller (Jessa Boutique)',
    email: 'monica@jessaboutique.com',
    phone: '+1 212 555 0150',
    company: 'Jessa Boutique Online',
    address: '20 Bleecker St, New York, NY',
    status: 'inactive',
    sector: 'ecommerce',
    notes: 'Temporarily paused during off-season.',
    assignedTo: { id: 'staff-006', name: 'Sarah Jenkins (Staff Portal Demo)', email: 'staff@gmail.com', role: 'staff' },
    createdAt: new Date(Date.now() - 3600000 * 24 * 90).toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

const initialTasks: Task[] = [
  {
    id: 'task-301',
    title: 'Prepare Custom Pricing Proposal for Acme Global',
    description: 'Draft the enterprise tier pricing discount and email to procurement team.',
    status: 'in_progress',
    priority: 'high',
    dueDate: new Date(Date.now() + 3600000 * 24 * 1).toISOString().split('T')[0],
    assignedTo: { id: 'staff-006', name: 'Sarah Jenkins (Staff Portal Demo)', email: 'staff@gmail.com', role: 'staff' },
    customer: { id: 'lead-101', name: 'Acme Global Software', company: 'Acme Global' },
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'task-302',
    title: 'Quarterly Check-in Call with Vance Refrigeration',
    description: 'Review system usage, answer support queries, and pitch the new Analytics add-on.',
    status: 'pending',
    priority: 'medium',
    dueDate: new Date(Date.now() + 3600000 * 24 * 2).toISOString().split('T')[0],
    assignedTo: { id: 'staff-006', name: 'Sarah Jenkins (Staff Portal Demo)', email: 'staff@gmail.com', role: 'staff' },
    customer: { id: 'cust-201', name: 'Robert Vance', company: 'Vance Refrigeration' },
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'task-303',
    title: 'Send Onboarding Welcome Kit to Apex Logistics',
    description: 'Provide login credentials, admin documentation link, and schedule onboarding webinar.',
    status: 'completed',
    priority: 'high',
    dueDate: new Date(Date.now() - 3600000 * 24 * 1).toISOString().split('T')[0],
    assignedTo: { id: 'staff-006', name: 'Sarah Jenkins (Staff Portal Demo)', email: 'staff@gmail.com', role: 'staff' },
    customer: { id: 'lead-105', name: 'Apex Manufacturing Logistics', company: 'Apex Mfg' },
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 6).toISOString(),
  },
  {
    id: 'task-304',
    title: 'Follow up on Pilot Renewal with Sunnyside School District',
    description: 'Call Arthur Pendelton regarding the upcoming contract renewal decision.',
    status: 'pending',
    priority: 'high',
    dueDate: new Date().toISOString().split('T')[0],
    assignedTo: { id: 'staff-006', name: 'Sarah Jenkins (Staff Portal Demo)', email: 'staff@gmail.com', role: 'staff' },
    customer: { id: 'cust-204', name: 'Arthur Pendelton', company: 'Sunnyside School District' },
    createdAt: new Date(Date.now() - 3600000 * 36).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'task-305',
    title: 'Schedule Product Demo for Starlight Education',
    description: 'Coordinate 30-min Zoom demo with their admissions tracking team.',
    status: 'pending',
    priority: 'medium',
    dueDate: new Date(Date.now() + 3600000 * 24 * 3).toISOString().split('T')[0],
    assignedTo: { id: 'staff-006', name: 'Sarah Jenkins (Staff Portal Demo)', email: 'staff@gmail.com', role: 'staff' },
    customer: { id: 'lead-102', name: 'Starlight Education Institute', company: 'Starlight Edu' },
    createdAt: new Date(Date.now() - 3600000 * 18).toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

const initialActivities: Activity[] = [
  {
    id: 'act-401',
    type: 'task_completed',
    description: 'completed task "Send Onboarding Welcome Kit to Apex Logistics"',
    user: { id: 'staff-006', name: 'Sarah Jenkins (Staff Portal Demo)', email: 'staff@gmail.com', role: 'staff' },
    task: { id: 'task-303', title: 'Send Onboarding Welcome Kit to Apex Logistics' },
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: 'act-402',
    type: 'lead_updated',
    description: 'changed lead status of "Acme Global Software" to Qualified',
    user: { id: 'staff-006', name: 'Sarah Jenkins (Staff Portal Demo)', email: 'staff@gmail.com', role: 'staff' },
    lead: { id: 'lead-101', name: 'Acme Global Software' },
    createdAt: new Date(Date.now() - 3600000 * 8).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 8).toISOString(),
  },
  {
    id: 'act-403',
    type: 'customer_updated',
    description: 'added follow-up notes for customer "Robert Vance (Vance Refrigeration)"',
    user: { id: 'staff-006', name: 'Sarah Jenkins (Staff Portal Demo)', email: 'staff@gmail.com', role: 'staff' },
    customer: { id: 'cust-201', name: 'Robert Vance (Vance Refrigeration)' },
    createdAt: new Date(Date.now() - 3600000 * 16).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 16).toISOString(),
  },
  {
    id: 'act-404',
    type: 'task_assigned',
    description: 'assigned task "Prepare Custom Pricing Proposal for Acme Global" to Sarah Jenkins',
    user: { id: 'admin-001', name: 'Admin User', email: 'nerupunavin450@gmail.com', role: 'admin' },
    task: { id: 'task-301', title: 'Prepare Custom Pricing Proposal for Acme Global' },
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
  {
    id: 'act-405',
    type: 'lead_created',
    description: 'created new lead "Starlight Education Institute"',
    user: { id: 'staff-006', name: 'Sarah Jenkins (Staff Portal Demo)', email: 'staff@gmail.com', role: 'staff' },
    lead: { id: 'lead-102', name: 'Starlight Education Institute' },
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 48).toISOString(),
  }
];

class StaffDataService {
  private staff: StaffMember[] = [];
  private leads: Lead[] = [];
  private customers: Customer[] = [];
  private tasks: Task[] = [];
  private activities: Activity[] = [];

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      try {
        const parsed = JSON.parse(data);
        this.staff = parsed.staff || initialStaff;
        this.leads = parsed.leads || initialLeads;
        this.customers = parsed.customers || initialCustomers;
        this.tasks = parsed.tasks || initialTasks;
        this.activities = parsed.activities || initialActivities;
      } catch {
        this.resetDefaults();
      }
    } else {
      this.resetDefaults();
    }
  }

  private saveToStorage() {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        staff: this.staff,
        leads: this.leads,
        customers: this.customers,
        tasks: this.tasks,
        activities: this.activities,
      })
    );
  }

  public resetDefaults() {
    this.staff = [...initialStaff];
    this.leads = [...initialLeads];
    this.customers = [...initialCustomers];
    this.tasks = [...initialTasks];
    this.activities = [...initialActivities];
    this.saveToStorage();
  }

  // Sync with backend users if available
  public syncWithBackendUsers(backendUsers: any[]) {
    if (!backendUsers || !Array.isArray(backendUsers)) return;
    let modified = false;
    backendUsers.forEach((u) => {
      const existingIdx = this.staff.findIndex((s) => s.email === u.email || s.id === u.id);
      if (existingIdx === -1 && u.role !== 'admin') {
        const newStaff: StaffMember = {
          id: u.id || `staff-${Date.now()}`,
          name: u.name || u.email.split('@')[0],
          email: u.email,
          role: u.role || 'staff',
          employeeId: `EMP-${Math.floor(100 + Math.random() * 900)}`,
          phone: u.phone || '+1 555 0100',
          position: u.position || 'CRM Specialist',
          department: u.department || 'Sales',
          status: u.status || 'active',
          avatar: u.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name || 'Staff')}&background=3b82f6&color=fff`,
          joinedDate: u.createdAt ? u.createdAt.split('T')[0] : new Date().toISOString().split('T')[0],
          performance: Math.floor(75 + Math.random() * 23),
          assignedLeadsCount: 0,
          assignedCustomersCount: 0,
          pendingTasksCount: 0,
          completedTasksCount: 0,
          wonLeadsCount: 0,
          lostLeadsCount: 0,
        };
        this.staff.push(newStaff);
        modified = true;
      }
    });
    if (modified) this.saveToStorage();
  }

  // Staff CRUD
  public getStaffList(): StaffMember[] {
    // Dynamically recalculate counts
    return this.staff.map((s) => {
      const assignedLeads = this.leads.filter((l) => l.assignedTo?.email === s.email || l.assignedTo?.id === s.id);
      const assignedCustomers = this.customers.filter((c) => c.assignedTo?.email === s.email || c.assignedTo?.id === s.id);
      const assignedTasks = this.tasks.filter((t) => t.assignedTo?.email === s.email || t.assignedTo?.id === s.id);
      const pendingTasks = assignedTasks.filter((t) => t.status !== 'completed');
      const completedTasks = assignedTasks.filter((t) => t.status === 'completed');
      const wonLeads = assignedLeads.filter((l) => l.status === 'won');
      const lostLeads = assignedLeads.filter((l) => l.status === 'lost');

      return {
        ...s,
        assignedLeadsCount: assignedLeads.length,
        assignedCustomersCount: assignedCustomers.length,
        pendingTasksCount: pendingTasks.length,
        completedTasksCount: completedTasks.length,
        wonLeadsCount: wonLeads.length,
        lostLeadsCount: lostLeads.length,
      };
    });
  }

  public getStaffById(id: string): StaffMember | undefined {
    const list = this.getStaffList();
    return list.find((s) => s.id === id || s.email === id);
  }

  public createStaff(data: Partial<StaffMember>): StaffMember {
    const newStaff: StaffMember = {
      id: `staff-${Date.now()}`,
      name: data.name || 'New Employee',
      email: data.email || 'employee@company.com',
      role: data.role || 'staff',
      employeeId: data.employeeId || `EMP-${Math.floor(100 + Math.random() * 900)}`,
      phone: data.phone || '+1 555 000 0000',
      position: data.position || 'Account Representative',
      department: data.department || 'Sales',
      status: data.status || 'active',
      avatar: data.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(data.name || 'Staff')}&background=3b82f6&color=fff`,
      joinedDate: new Date().toISOString().split('T')[0],
      performance: 85,
      assignedLeadsCount: 0,
      assignedCustomersCount: 0,
      pendingTasksCount: 0,
      completedTasksCount: 0,
      wonLeadsCount: 0,
      lostLeadsCount: 0,
    };
    this.staff.unshift(newStaff);
    this.logActivity('custom', `Admin created staff member "${newStaff.name}" (${newStaff.email})`, { id: 'admin', name: 'Admin', email: 'admin@company.com', role: 'admin' });
    this.saveToStorage();
    return newStaff;
  }

  public updateStaff(id: string, data: Partial<StaffMember>): StaffMember | null {
    const index = this.staff.findIndex((s) => s.id === id || s.email === id);
    if (index === -1) return null;
    this.staff[index] = { ...this.staff[index], ...data };
    this.saveToStorage();
    return this.staff[index];
  }

  public deleteStaff(id: string): boolean {
    const initialLen = this.staff.length;
    this.staff = this.staff.filter((s) => s.id !== id && s.email !== id);
    if (this.staff.length < initialLen) {
      this.saveToStorage();
      return true;
    }
    return false;
  }

  public toggleStaffStatus(id: string): StaffMember | null {
    const staff = this.getStaffById(id);
    if (!staff) return null;
    const newStatus = staff.status === 'active' ? 'inactive' : 'active';
    return this.updateStaff(id, { status: newStatus });
  }

  // Work Assignment
  public assignWork(staffId: string, type: 'lead' | 'customer' | 'task', workData: any) {
    const staff = this.getStaffById(staffId);
    if (!staff) throw new Error('Staff member not found');

    const assigneeObj = { id: staff.id, name: staff.name, email: staff.email, role: staff.role };

    if (type === 'lead') {
      const existingLead = this.leads.find((l) => l.id === workData.id);
      if (existingLead) {
        existingLead.assignedTo = assigneeObj;
      } else {
        const newLead: Lead = {
          id: `lead-${Date.now()}`,
          name: workData.name || 'Assigned Lead',
          email: workData.email || '',
          phone: workData.phone || '',
          source: workData.source || 'Admin Assignment',
          status: 'new',
          sector: workData.sector || 'general',
          notes: workData.notes || 'Assigned by Admin',
          assignedTo: assigneeObj,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        this.leads.unshift(newLead);
      }
      this.logActivity('lead_assigned', `assigned lead "${workData.name || 'Lead'}" to ${staff.name}`, { id: 'admin', name: 'Admin User', email: 'admin@company.com', role: 'admin' }, undefined, { id: workData.id || `lead-${Date.now()}`, name: workData.name });
    } else if (type === 'customer') {
      const existingCust = this.customers.find((c) => c.id === workData.id);
      if (existingCust) {
        existingCust.assignedTo = assigneeObj;
      } else {
        const newCust: Customer = {
          id: `cust-${Date.now()}`,
          name: workData.name || 'Assigned Customer',
          email: workData.email || '',
          phone: workData.phone || '',
          company: workData.company || '',
          address: workData.address || '',
          status: 'active',
          sector: workData.sector || 'general',
          notes: workData.notes || 'Assigned by Admin',
          assignedTo: assigneeObj,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        this.customers.unshift(newCust);
      }
      this.logActivity('customer_updated', `assigned customer "${workData.name || 'Customer'}" to ${staff.name}`, { id: 'admin', name: 'Admin User', email: 'admin@company.com', role: 'admin' }, { id: workData.id || `cust-${Date.now()}`, name: workData.name });
    } else if (type === 'task') {
      const newTask: Task = {
        id: `task-${Date.now()}`,
        title: workData.title || 'New Task',
        description: workData.description || '',
        status: 'pending',
        priority: workData.priority || 'medium',
        dueDate: workData.dueDate || new Date(Date.now() + 3600000 * 48).toISOString().split('T')[0],
        assignedTo: assigneeObj,
        customer: workData.customer || (workData.relatedName ? { id: 'rel-1', name: workData.relatedName } : undefined),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      this.tasks.unshift(newTask);
      this.logActivity('task_assigned', `assigned task "${newTask.title}" to ${staff.name}`, { id: 'admin', name: 'Admin User', email: 'admin@company.com', role: 'admin' }, undefined, undefined, { id: newTask.id, title: newTask.title });
    }
    this.saveToStorage();
  }

  // Get queries for staff member
  public getStaffLeads(staffIdOrEmail: string): Lead[] {
    return this.leads.filter((l) => l.assignedTo?.id === staffIdOrEmail || l.assignedTo?.email === staffIdOrEmail);
  }

  public getStaffCustomers(staffIdOrEmail: string): Customer[] {
    return this.customers.filter((c) => c.assignedTo?.id === staffIdOrEmail || c.assignedTo?.email === staffIdOrEmail);
  }

  public getStaffTasks(staffIdOrEmail: string): Task[] {
    return this.tasks.filter((t) => t.assignedTo?.id === staffIdOrEmail || t.assignedTo?.email === staffIdOrEmail);
  }

  public getStaffActivities(staffIdOrEmail: string): Activity[] {
    return this.activities.filter((a) => a.user?.id === staffIdOrEmail || a.user?.email === staffIdOrEmail);
  }

  // Status updates
  public updateTaskStatus(taskId: string, status: 'pending' | 'in_progress' | 'completed', user?: any): Task | null {
    const task = this.tasks.find((t) => t.id === taskId);
    if (!task) return null;
    task.status = status;
    task.updatedAt = new Date().toISOString();
    if (status === 'completed') {
      this.logActivity('task_completed', `completed task "${task.title}"`, user || task.assignedTo, undefined, undefined, { id: task.id, title: task.title });
    }
    this.saveToStorage();
    return task;
  }

  public updateLeadStatus(leadId: string, status: any, user?: any): Lead | null {
    const lead = this.leads.find((l) => l.id === leadId);
    if (!lead) return null;
    lead.status = status;
    lead.updatedAt = new Date().toISOString();
    this.logActivity('lead_updated', `updated lead "${lead.name}" status to ${status}`, user || lead.assignedTo, undefined, { id: lead.id, name: lead.name });
    this.saveToStorage();
    return lead;
  }

  public addNote(entityType: 'lead' | 'customer' | 'task', entityId: string, noteText: string, user?: any) {
    if (entityType === 'lead') {
      const lead = this.leads.find((l) => l.id === entityId);
      if (lead) {
        lead.notes = `${lead.notes || ''}\n[${new Date().toLocaleDateString()}] ${noteText}`.trim();
        this.logActivity('lead_updated', `added note to lead "${lead.name}": "${noteText.slice(0, 30)}..."`, user || lead.assignedTo, undefined, { id: lead.id, name: lead.name });
      }
    } else if (entityType === 'customer') {
      const cust = this.customers.find((c) => c.id === entityId);
      if (cust) {
        cust.notes = `${cust.notes || ''}\n[${new Date().toLocaleDateString()}] ${noteText}`.trim();
        this.logActivity('customer_updated', `added note to customer "${cust.name}": "${noteText.slice(0, 30)}..."`, user || cust.assignedTo, { id: cust.id, name: cust.name });
      }
    }
    this.saveToStorage();
  }

  private logActivity(type: any, description: string, user: any, customer?: any, lead?: any, task?: any) {
    const newAct: Activity = {
      id: `act-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      type,
      description,
      user: user || { id: 'sys', name: 'System', email: 'system@company.com', role: 'admin' },
      customer,
      lead,
      task,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.activities.unshift(newAct);
  }
}

export const staffDataService = new StaffDataService();
