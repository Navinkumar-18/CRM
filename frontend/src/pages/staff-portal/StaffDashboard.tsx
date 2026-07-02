import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { staffDataService, type StaffMember } from '../../services/staffDataService';
import type { Lead, Customer, Task, Activity } from '../../types';
import { 
  Target, 
  Users, 
  CheckSquare, 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  Sparkles, 
  Activity as ActivityIcon,
  Mail,
  Check
} from 'lucide-react';
import { cn } from '../../utils/cn';

export const StaffDashboard = () => {
  const { user } = useAuthStore();
  const [staffProfile, setStaffProfile] = useState<StaffMember | null>(null);
  const [myLeads, setMyLeads] = useState<Lead[]>([]);
  const [myCustomers, setMyCustomers] = useState<Customer[]>([]);
  const [myTasks, setMyTasks] = useState<Task[]>([]);
  const [myActivities, setMyActivities] = useState<Activity[]>([]);
  const [celebrateTaskId, setCelebrateTaskId] = useState<string | null>(null);

  const loadData = () => {
    const emailOrId = user?.email || user?.id || 'staff@gmail.com';
    const found = staffDataService.getStaffById(emailOrId) || staffDataService.getStaffList().find(s => s.role !== 'admin');
    if (found) {
      setStaffProfile(found);
      setMyLeads(staffDataService.getStaffLeads(found.id).concat(staffDataService.getStaffLeads(found.email)));
      setMyCustomers(staffDataService.getStaffCustomers(found.id).concat(staffDataService.getStaffCustomers(found.email)));
      setMyTasks(staffDataService.getStaffTasks(found.id).concat(staffDataService.getStaffTasks(found.email)));
      setMyActivities(staffDataService.getStaffActivities(found.id).concat(staffDataService.getStaffActivities(found.email)));
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleCompleteTask = (task: Task) => {
    const newStatus = task.status === 'completed' ? 'pending' : 'completed';
    if (newStatus === 'completed') {
      setCelebrateTaskId(task.id);
      setTimeout(() => setCelebrateTaskId(null), 1500);
    }
    staffDataService.updateTaskStatus(task.id, newStatus, user);
    loadData();
  };

  const pendingTasks = myTasks.filter(t => t.status !== 'completed');
  const completedTasksCount = myTasks.filter(t => t.status === 'completed').length;
  const wonLeads = myLeads.filter(l => l.status === 'won').length;

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Welcome Hero Banner */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              Staff Employee Portal
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, {user?.name || staffProfile?.name || 'Valued Team Member'}! 🚀
            </h1>
            <p className="text-blue-100 text-sm mt-1 max-w-2xl">
              Here is your daily CRM workspace. Monitor your assigned leads, update account notes, and check off high-priority action items.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl flex items-center space-x-4 shrink-0">
            <div className="text-right">
              <p className="text-[10px] uppercase font-bold text-blue-200">Your KPI Score</p>
              <div className="text-2xl font-extrabold">{staffProfile?.performance || 91}%</div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center font-bold text-lg">
              📈
            </div>
          </div>
        </div>
      </div>

      {/* KPI Summary Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link to="/my-leads" className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all group">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">My Assigned Leads</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">{myLeads.length}</h3>
              <p className="text-xs text-blue-600 font-semibold mt-1 flex items-center">
                <span>{wonLeads} won deals</span>
                <ArrowRight className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform" />
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <Target className="w-6 h-6" />
            </div>
          </div>
        </Link>

        <Link to="/my-customers" className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all group">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">My Customers</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">{myCustomers.length}</h3>
              <p className="text-xs text-indigo-600 font-semibold mt-1 flex items-center">
                <span>Active managed accounts</span>
                <ArrowRight className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform" />
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              <Users className="w-6 h-6" />
            </div>
          </div>
        </Link>

        <Link to="/my-tasks" className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all group">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Pending To-Dos</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">{pendingTasks.length}</h3>
              <p className="text-xs text-amber-600 font-semibold mt-1 flex items-center">
                <span>Action required today</span>
                <ArrowRight className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform" />
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition-colors">
              <Clock className="w-6 h-6" />
            </div>
          </div>
        </Link>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Tasks Completed</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">{completedTasksCount}</h3>
              <p className="text-xs text-emerald-600 font-semibold mt-1 flex items-center">
                <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                <span>Great productivity!</span>
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckSquare className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Tasks & Leads */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Action Items */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="p-2 bg-amber-50 text-amber-600 rounded-xl">
                  <Clock className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">My Pending To-Dos</h3>
                  <p className="text-xs text-slate-500">Check off items to log completion activity</p>
                </div>
              </div>
              <Link to="/my-tasks" className="text-xs font-bold text-blue-600 hover:text-blue-700">
                View All ({myTasks.length}) →
              </Link>
            </div>

            {pendingTasks.length === 0 ? (
              <div className="text-center py-10">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-2 animate-bounce" />
                <h4 className="font-bold text-slate-800">All caught up! 🎉</h4>
                <p className="text-xs text-slate-500">You have zero pending tasks assigned right now.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingTasks.slice(0, 5).map((t) => (
                  <div 
                    key={t.id}
                    className={cn(
                      "p-3.5 rounded-2xl border transition-all flex items-start space-x-3",
                      celebrateTaskId === t.id 
                        ? "bg-emerald-50 border-emerald-300 scale-[1.02]" 
                        : "bg-slate-50/70 border-slate-200/80 hover:border-blue-300 hover:bg-white"
                    )}
                  >
                    <button
                      onClick={() => handleCompleteTask(t)}
                      className="w-5 h-5 rounded-lg border-2 border-slate-300 hover:border-emerald-500 hover:bg-emerald-50 transition-colors mt-0.5 flex items-center justify-center shrink-0 group"
                      title="Mark Task as Completed"
                    >
                      <Check className="w-3.5 h-3.5 text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>

                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-2">
                        <h4 className="font-bold text-sm text-slate-900 truncate">{t.title}</h4>
                        <span className={cn(
                          "text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded shrink-0",
                          t.priority === 'high' ? "bg-red-100 text-red-700 font-extrabold" :
                          t.priority === 'medium' ? "bg-amber-100 text-amber-700" : "bg-slate-200 text-slate-700"
                        )}>
                          {t.priority}
                        </span>
                      </div>
                      {t.description && (
                        <p className="text-xs text-slate-500 mt-1 line-clamp-1">{t.description}</p>
                      )}
                      <div className="flex justify-between items-center text-[11px] text-slate-400 mt-2">
                        <span>Due: <strong className="text-slate-600">{t.dueDate || 'No date'}</strong></span>
                        {t.customer && (
                          <span className="text-indigo-600 font-medium">@{t.customer.company || t.customer.name}</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Assigned Leads */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                  <Target className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">My Assigned Leads</h3>
                  <p className="text-xs text-slate-500">Active prospects needing follow-up</p>
                </div>
              </div>
              <Link to="/my-leads" className="text-xs font-bold text-blue-600 hover:text-blue-700">
                View All ({myLeads.length}) →
              </Link>
            </div>

            {myLeads.length === 0 ? (
              <div className="text-center py-10 text-slate-400">
                <Target className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-600">No leads assigned to you yet</p>
                <p className="text-xs">Your sales manager or admin will assign prospects shortly.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {myLeads.slice(0, 4).map((l) => (
                  <div key={l.id} className="p-3.5 rounded-2xl border border-slate-200/80 bg-white hover:border-blue-300 transition-all flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-slate-900 truncate">{l.name}</h4>
                        <span className={cn(
                          "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded",
                          l.status === 'won' ? "bg-emerald-100 text-emerald-800" :
                          l.status === 'qualified' ? "bg-blue-100 text-blue-800" :
                          l.status === 'contacted' ? "bg-amber-100 text-amber-800" : "bg-slate-100 text-slate-700"
                        )}>
                          {l.status}
                        </span>
                      </div>
                      <div className="flex items-center space-x-3 text-xs text-slate-500 mt-1">
                        <span className="flex items-center gap-1 truncate"><Mail className="w-3 h-3 text-slate-400" /> {l.email}</span>
                      </div>
                    </div>

                    <Link
                      to="/my-leads"
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-colors shrink-0"
                    >
                      Manage
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Activity Feed */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
          <span className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
            <ActivityIcon className="w-5 h-5" />
          </span>
          <div>
            <h3 className="font-bold text-slate-900 text-base">My Activity Timeline</h3>
            <p className="text-xs text-slate-500">Live feed of your task completions and lead updates</p>
          </div>
        </div>

        {myActivities.length === 0 ? (
          <p className="text-center py-6 text-sm text-slate-400">No activity recorded yet.</p>
        ) : (
          <div className="space-y-3">
            {myActivities.slice(0, 5).map((act) => (
              <div key={act.id} className="flex items-center justify-between p-3 rounded-2xl bg-slate-50/80 border border-slate-100 text-xs">
                <div className="flex items-center space-x-3">
                  <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                  <span className="font-medium text-slate-700">{act.description}</span>
                </div>
                <span className="text-slate-400 shrink-0">{new Date(act.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
