import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { staffDataService, type StaffMember } from '../../services/staffDataService';
import type { Lead, Customer, Task, Activity } from '../../types';
import { AssignWorkModal } from './components/AssignWorkModal';
import { StaffFormModal } from './components/StaffFormModal';
import { 
  ArrowLeft, 
  Mail, 
  Phone, 
  Briefcase, 
  Building, 
  Calendar, 
  Target, 
  Users, 
  CheckSquare, 
  Activity as ActivityIcon, 
  Share2, 
  Edit2, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Plus
} from 'lucide-react';
import { cn } from '../../utils/cn';

export const StaffDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [staff, setStaff] = useState<StaffMember | null>(null);
  const [activeTab, setActiveTab] = useState<'leads' | 'customers' | 'tasks' | 'activities'>('leads');
  
  const [leads, setLeads] = useState<Lead[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);

  // Modals
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [formModalOpen, setFormModalOpen] = useState(false);

  const loadData = () => {
    if (!id) return;
    const found = staffDataService.getStaffById(id);
    if (!found) {
      // Not found
      return;
    }
    setStaff(found);
    setLeads(staffDataService.getStaffLeads(found.id).concat(staffDataService.getStaffLeads(found.email)));
    setCustomers(staffDataService.getStaffCustomers(found.id).concat(staffDataService.getStaffCustomers(found.email)));
    setTasks(staffDataService.getStaffTasks(found.id).concat(staffDataService.getStaffTasks(found.email)));
    setActivities(staffDataService.getStaffActivities(found.id).concat(staffDataService.getStaffActivities(found.email)));
  };

  useEffect(() => {
    loadData();
  }, [id]);

  if (!staff) {
    return (
      <div className="p-12 text-center">
        <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-slate-800">Staff Member Not Found</h3>
        <p className="text-sm text-slate-500 mb-6">The requested employee ID does not exist or was removed.</p>
        <button onClick={() => navigate('/staff')} className="btn-primary px-4 py-2 text-sm">
          Return to Staff List
        </button>
      </div>
    );
  }

  const handleUpdateStaff = (data: Partial<StaffMember>) => {
    staffDataService.updateStaff(staff.id, data);
    loadData();
  };

  const handleToggleStatus = () => {
    staffDataService.toggleStaffStatus(staff.id);
    loadData();
  };

  const handleTaskStatusChange = (taskId: string, newStatus: any) => {
    staffDataService.updateTaskStatus(taskId, newStatus);
    loadData();
  };

  const handleLeadStatusChange = (leadId: string, newStatus: any) => {
    staffDataService.updateLeadStatus(leadId, newStatus);
    loadData();
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Back navigation & Actions header */}
      <div className="flex items-center justify-between">
        <Link 
          to="/staff" 
          className="inline-flex items-center text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          Back to Staff Directory
        </Link>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleToggleStatus}
            className={cn(
              "px-3.5 py-2 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 transition-all border shadow-sm",
              staff.status === 'active' 
                ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100" 
                : "bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200"
            )}
          >
            <span className={cn("w-2 h-2 rounded-full", staff.status === 'active' ? "bg-emerald-500" : "bg-slate-400")}></span>
            {staff.status === 'active' ? 'Active Employee' : 'Inactive Employee'}
          </button>

          <button
            onClick={() => setFormModalOpen(true)}
            className="btn-secondary px-3.5 py-2 text-xs font-semibold flex items-center gap-1.5"
          >
            <Edit2 className="w-3.5 h-3.5" />
            Edit Profile
          </button>

          <button
            onClick={() => setAssignModalOpen(true)}
            className="btn-primary px-4 py-2 text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-blue-500/20"
          >
            <Share2 className="w-3.5 h-3.5" />
            Assign Workload
          </button>
        </div>
      </div>

      {/* Staff Profile Hero Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-blue-500/10 to-indigo-500/5 rounded-full blur-2xl -mr-16 -mt-16 pointer-events-none"></div>
        
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
            <div className="relative">
              <img 
                src={staff.avatar} 
                alt={staff.name} 
                className="w-24 h-24 rounded-2xl object-cover border-2 border-white shadow-lg shrink-0"
              />
              <span className="absolute -bottom-2 -right-2 px-2 py-0.5 rounded-md bg-blue-600 text-white font-bold text-[10px] tracking-wider uppercase shadow">
                {staff.employeeId}
              </span>
            </div>

            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">{staff.name}</h1>
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-bold text-xs uppercase tracking-wider">
                  {staff.role}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600 mt-2">
                <span className="flex items-center gap-1.5 font-medium text-slate-800">
                  <Briefcase className="w-4 h-4 text-blue-500" /> {staff.position || 'Specialist'}
                </span>
                <span className="flex items-center gap-1.5 text-slate-500">
                  <Building className="w-4 h-4 text-indigo-500" /> {staff.department} Department
                </span>
                <span className="flex items-center gap-1.5 text-slate-500">
                  <Calendar className="w-4 h-4 text-slate-400" /> Joined {staff.joinedDate || '2024'}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-5 text-xs text-slate-500 mt-3 pt-3 border-t border-slate-100">
                <a href={`mailto:${staff.email}`} className="flex items-center gap-1.5 hover:text-blue-600 transition-colors">
                  <Mail className="w-3.5 h-3.5 text-slate-400" /> {staff.email}
                </a>
                <a href={`tel:${staff.phone}`} className="flex items-center gap-1.5 hover:text-blue-600 transition-colors">
                  <Phone className="w-3.5 h-3.5 text-slate-400" /> {staff.phone}
                </a>
              </div>
            </div>
          </div>

          {/* Performance Box */}
          <div className="w-full md:w-auto bg-slate-50/80 rounded-2xl p-4 border border-slate-200/80 flex md:flex-col justify-between md:items-end gap-2 shrink-0">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Overall KPI Rating</p>
              <div className="text-2xl font-extrabold text-slate-900 mt-0.5">{staff.performance || 85}%</div>
            </div>
            <div className="text-right">
              <span className="inline-flex items-center px-2 py-1 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                Top Quartile Performer
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Workload Tabs */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="flex border-b border-slate-200/80 bg-slate-50/50 px-6 overflow-x-auto">
          <button
            onClick={() => setActiveTab('leads')}
            className={cn(
              "flex items-center px-5 py-4 text-sm font-bold border-b-2 transition-all gap-2.5 whitespace-nowrap",
              activeTab === 'leads' ? "border-blue-600 text-blue-600 bg-white shadow-sm" : "border-transparent text-slate-500 hover:text-slate-800"
            )}
          >
            <Target className="w-4 h-4" />
            Assigned Leads ({leads.length})
          </button>
          <button
            onClick={() => setActiveTab('customers')}
            className={cn(
              "flex items-center px-5 py-4 text-sm font-bold border-b-2 transition-all gap-2.5 whitespace-nowrap",
              activeTab === 'customers' ? "border-blue-600 text-blue-600 bg-white shadow-sm" : "border-transparent text-slate-500 hover:text-slate-800"
            )}
          >
            <Users className="w-4 h-4" />
            Managed Customers ({customers.length})
          </button>
          <button
            onClick={() => setActiveTab('tasks')}
            className={cn(
              "flex items-center px-5 py-4 text-sm font-bold border-b-2 transition-all gap-2.5 whitespace-nowrap",
              activeTab === 'tasks' ? "border-blue-600 text-blue-600 bg-white shadow-sm" : "border-transparent text-slate-500 hover:text-slate-800"
            )}
          >
            <CheckSquare className="w-4 h-4" />
            Tasks & To-Dos ({tasks.length})
          </button>
          <button
            onClick={() => setActiveTab('activities')}
            className={cn(
              "flex items-center px-5 py-4 text-sm font-bold border-b-2 transition-all gap-2.5 whitespace-nowrap",
              activeTab === 'activities' ? "border-blue-600 text-blue-600 bg-white shadow-sm" : "border-transparent text-slate-500 hover:text-slate-800"
            )}
          >
            <ActivityIcon className="w-4 h-4" />
            Activity Timeline ({activities.length})
          </button>
        </div>

        <div className="p-6">
          {/* LEADS TAB */}
          {activeTab === 'leads' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-base font-bold text-slate-800">Leads Currently Assigned</h3>
                <button
                  onClick={() => setAssignModalOpen(true)}
                  className="btn-secondary px-3 py-1.5 text-xs font-semibold flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Assign Another Lead
                </button>
              </div>

              {leads.length === 0 ? (
                <div className="text-center py-12 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                  <Target className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-slate-600">No active leads assigned</p>
                  <p className="text-xs text-slate-400 mt-1">Assign leads to start monitoring sales pipeline.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {leads.map((lead) => (
                    <div key={lead.id} className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-blue-300 transition-all shadow-sm flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-bold text-slate-900">{lead.name}</h4>
                            <p className="text-xs text-slate-500">{lead.email} • {lead.phone}</p>
                          </div>
                          <select
                            value={lead.status}
                            onChange={(e) => handleLeadStatusChange(lead.id, e.target.value)}
                            className={cn(
                              "text-xs font-bold px-2.5 py-1 rounded-lg border-0 focus:ring-2 focus:ring-blue-500",
                              lead.status === 'won' ? "bg-emerald-100 text-emerald-800" :
                              lead.status === 'qualified' ? "bg-blue-100 text-blue-800" :
                              lead.status === 'contacted' ? "bg-amber-100 text-amber-800" : "bg-slate-100 text-slate-700"
                            )}
                          >
                            <option value="new">New</option>
                            <option value="contacted">Contacted</option>
                            <option value="qualified">Qualified</option>
                            <option value="won">Won (Closed)</option>
                            <option value="lost">Lost</option>
                          </select>
                        </div>
                        {lead.notes && (
                          <p className="text-xs text-slate-600 mt-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100 italic">
                            "{lead.notes}"
                          </p>
                        )}
                      </div>
                      <div className="flex justify-between items-center text-[11px] text-slate-400 mt-4 pt-3 border-t border-slate-100">
                        <span>Source: <strong className="text-slate-600">{lead.source}</strong></span>
                        <span>Assigned: {new Date(lead.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* CUSTOMERS TAB */}
          {activeTab === 'customers' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-base font-bold text-slate-800">Managed Customer Accounts</h3>
                <button
                  onClick={() => setAssignModalOpen(true)}
                  className="btn-secondary px-3 py-1.5 text-xs font-semibold flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Assign Another Customer
                </button>
              </div>

              {customers.length === 0 ? (
                <div className="text-center py-12 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                  <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-slate-600">No customers currently managed</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {customers.map((cust) => (
                    <div key={cust.id} className="p-4 rounded-2xl border border-slate-200 bg-white shadow-sm flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-bold text-slate-900">{cust.name}</h4>
                            <p className="text-xs font-semibold text-indigo-600">{cust.company}</p>
                            <p className="text-xs text-slate-500 mt-0.5">{cust.email}</p>
                          </div>
                          <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800 uppercase">
                            {cust.status}
                          </span>
                        </div>
                        {cust.address && (
                          <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
                            📍 {cust.address}
                          </p>
                        )}
                        {cust.notes && (
                          <p className="text-xs text-slate-600 mt-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100 italic">
                            "{cust.notes}"
                          </p>
                        )}
                      </div>
                      <div className="text-right text-[11px] text-slate-400 mt-4 pt-3 border-t border-slate-100">
                        Sector: <strong className="text-slate-600 capitalize">{cust.sector || 'General'}</strong>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TASKS TAB */}
          {activeTab === 'tasks' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-base font-bold text-slate-800">Assigned Tasks & Action Items</h3>
                <button
                  onClick={() => setAssignModalOpen(true)}
                  className="btn-secondary px-3 py-1.5 text-xs font-semibold flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Create Task
                </button>
              </div>

              {tasks.length === 0 ? (
                <div className="text-center py-12 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                  <CheckSquare className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-slate-600">No tasks currently assigned</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {tasks.map((task) => (
                    <div key={task.id} className="p-4 rounded-2xl border border-slate-200 bg-white hover:shadow-md transition-all flex items-center justify-between gap-4">
                      <div className="flex items-start space-x-3.5 flex-1 min-w-0">
                        <button
                          onClick={() => handleTaskStatusChange(task.id, task.status === 'completed' ? 'pending' : 'completed')}
                          className={cn(
                            "w-6 h-6 rounded-lg flex items-center justify-center transition-all shrink-0 mt-0.5",
                            task.status === 'completed' ? "bg-emerald-500 text-white" : "border-2 border-slate-300 hover:border-blue-500"
                          )}
                        >
                          {task.status === 'completed' && <CheckCircle2 className="w-4 h-4" />}
                        </button>

                        <div className="min-w-0 flex-1">
                          <h4 className={cn("font-bold text-sm", task.status === 'completed' ? "line-through text-slate-400" : "text-slate-900")}>
                            {task.title}
                          </h4>
                          {task.description && (
                            <p className="text-xs text-slate-500 mt-1 line-clamp-2">{task.description}</p>
                          )}
                          {task.customer && (
                            <span className="inline-block mt-2 text-[11px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                              Related: {task.customer.company || task.customer.name}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <span className={cn(
                          "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded",
                          task.priority === 'high' ? "bg-red-100 text-red-700" :
                          task.priority === 'medium' ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-600"
                        )}>
                          {task.priority} priority
                        </span>
                        <div className="flex items-center text-xs text-slate-400">
                          <Clock className="w-3.5 h-3.5 mr-1" />
                          Due: {task.dueDate || 'No date'}
                        </div>
                        <select
                          value={task.status}
                          onChange={(e) => handleTaskStatusChange(task.id, e.target.value)}
                          className="text-xs font-semibold px-2 py-1 rounded bg-slate-50 border border-slate-200 text-slate-700"
                        >
                          <option value="pending">Pending</option>
                          <option value="in_progress">In Progress</option>
                          <option value="completed">Completed</option>
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ACTIVITIES TAB */}
          {activeTab === 'activities' && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-slate-800 mb-4">Chronological Activity Log</h3>
              {activities.length === 0 ? (
                <div className="text-center py-12 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                  <ActivityIcon className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-slate-600">No recent activity recorded</p>
                </div>
              ) : (
                <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                  {activities.map((act) => (
                    <div key={act.id} className="relative flex items-start space-x-3">
                      <div className="absolute -left-6 top-1 w-4 h-4 rounded-full bg-blue-600 border-2 border-white shadow"></div>
                      <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 flex-1">
                        <div className="flex justify-between items-center text-xs mb-1">
                          <span className="font-bold text-slate-800">{act.user?.name || 'Staff User'}</span>
                          <span className="text-slate-400">{new Date(act.createdAt).toLocaleString()}</span>
                        </div>
                        <p className="text-sm text-slate-700">{act.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <StaffFormModal
        open={formModalOpen}
        onClose={() => setFormModalOpen(false)}
        onSave={handleUpdateStaff}
        initialData={staff}
      />

      <AssignWorkModal
        open={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        staff={staff}
        onAssigned={() => loadData()}
      />
    </div>
  );
};
