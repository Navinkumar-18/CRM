import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { staffDataService, type StaffMember } from '../../services/staffDataService';
import { StaffFormModal } from './components/StaffFormModal';
import { AssignWorkModal } from './components/AssignWorkModal';
import { 
  Users, 
  UserPlus, 
  Search, 
  ShieldCheck, 
  CheckCircle2, 
  Target, 
  Briefcase, 
  Edit2, 
  Trash2, 
  Eye, 
  Share2, 
  RefreshCw,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { cn } from '../../utils/cn';

export const StaffManagement = () => {
  const navigate = useNavigate();
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [search, setSearch] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modal states
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [assigningStaff, setAssigningStaff] = useState<StaffMember | null>(null);

  const loadData = () => {
    setStaffList(staffDataService.getStaffList());
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateOrUpdate = (data: Partial<StaffMember>, isEdit: boolean) => {
    if (isEdit && editingStaff) {
      staffDataService.updateStaff(editingStaff.id, data);
    } else {
      staffDataService.createStaff(data);
    }
    loadData();
  };

  const handleToggleStatus = (id: string, _name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    staffDataService.toggleStaffStatus(id);
    loadData();
  };

  const handleDelete = (id: string, name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Are you sure you want to delete staff member "${name}"? This will unassign their active work.`)) {
      staffDataService.deleteStaff(id);
      loadData();
    }
  };

  const handleResetDefaults = () => {
    if (confirm('Reset staff list and all assigned work to default demo data?')) {
      staffDataService.resetDefaults();
      loadData();
    }
  };

  const filteredStaff = staffList.filter((s) => {
    const matchesSearch = 
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase()) ||
      (s.employeeId && s.employeeId.toLowerCase().includes(search.toLowerCase())) ||
      (s.position && s.position.toLowerCase().includes(search.toLowerCase()));
    const matchesDept = departmentFilter === 'ALL' || s.department === departmentFilter;
    const matchesStatus = statusFilter === 'ALL' || s.status === statusFilter;
    return matchesSearch && matchesDept && matchesStatus;
  });

  const totalStaff = staffList.length;
  const activeStaff = staffList.filter((s) => s.status === 'active').length;
  const totalLeadsAssigned = staffList.reduce((acc, s) => acc + s.assignedLeadsCount, 0);
  const totalTasksCompleted = staffList.reduce((acc, s) => acc + s.completedTasksCount, 0);

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-blue-100/80 text-blue-700 rounded-xl">
              <ShieldCheck className="w-6 h-6" />
            </span>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Staff Management & RBAC</h1>
              <p className="text-sm text-slate-500 mt-0.5">
                Manage employee roles, assign CRM leads and tasks, and monitor individual performance.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 self-stretch sm:self-auto">
          <button
            onClick={handleResetDefaults}
            title="Reset Demo Data"
            className="btn-secondary px-3.5 py-2 text-xs flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
            Reset Data
          </button>
          <button
            onClick={() => {
              setEditingStaff(null);
              setFormModalOpen(true);
            }}
            className="btn-primary px-4 py-2.5 text-sm font-semibold flex items-center gap-2 shadow-lg shadow-blue-500/20 whitespace-nowrap"
          >
            <UserPlus className="w-4 h-4" />
            + Add Staff Member
          </button>
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Total Staff</p>
            <h3 className="text-2xl font-bold text-slate-900">{totalStaff}</h3>
            <p className="text-xs text-slate-500 mt-1 flex items-center text-emerald-600 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5"></span>
              {activeStaff} active accounts
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Assigned Leads</p>
            <h3 className="text-2xl font-bold text-slate-900">{totalLeadsAssigned}</h3>
            <p className="text-xs text-slate-500 mt-1">Across all departments</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Target className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Tasks Completed</p>
            <h3 className="text-2xl font-bold text-slate-900">{totalTasksCompleted}</h3>
            <p className="text-xs text-emerald-600 font-medium mt-1 flex items-center">
              <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> High team velocity
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Briefcase className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Avg Performance</p>
            <h3 className="text-2xl font-bold text-slate-900">89%</h3>
            <p className="text-xs text-slate-500 mt-1 flex items-center">
              <TrendingUp className="w-3.5 h-3.5 text-blue-500 mr-1" /> Based on lead conversion
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, email, ID, or position..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="px-3 py-2 text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="ALL">All Departments</option>
            <option value="Sales">Sales</option>
            <option value="Account Management">Account Management</option>
            <option value="Support">Support</option>
            <option value="Marketing">Marketing</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="ALL">All Statuses</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>
        </div>
      </div>

      {/* Staff Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/75 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-6">Employee</th>
                <th className="py-3.5 px-4">Role & Dept</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-center">Assigned Work</th>
                <th className="py-3.5 px-4 text-center">Tasks (Pend / Comp)</th>
                <th className="py-3.5 px-4 text-center">Performance</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredStaff.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <AlertCircle className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    No staff members match the selected filters.
                  </td>
                </tr>
              ) : (
                filteredStaff.map((s) => (
                  <tr 
                    key={s.id}
                    onClick={() => navigate(`/staff/${s.id}`)}
                    className="hover:bg-blue-50/30 transition-colors cursor-pointer group"
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-3">
                        <img 
                          src={s.avatar} 
                          alt={s.name} 
                          className="w-10 h-10 rounded-full object-cover border border-slate-200 shadow-sm shrink-0" 
                        />
                        <div>
                          <div className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors flex items-center gap-1.5">
                            {s.name}
                            <span className="text-[10px] bg-slate-100 text-slate-600 font-semibold px-1.5 py-0.5 rounded">
                              {s.employeeId}
                            </span>
                          </div>
                          <div className="text-xs text-slate-500">{s.email}</div>
                          <div className="text-[11px] text-slate-400 mt-0.5">{s.phone}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <div className="font-semibold text-slate-800 text-xs">{s.position || 'Specialist'}</div>
                      <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                        {s.department}
                      </div>
                      <span className="inline-block mt-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-50 text-indigo-700">
                        {s.role}
                      </span>
                    </td>

                    <td className="py-4 px-4 text-center">
                      <button
                        onClick={(e) => handleToggleStatus(s.id, s.name, e)}
                        title="Click to toggle status"
                        className={cn(
                          "px-3 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1.5 transition-all shadow-sm",
                          s.status === 'active'
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60 hover:bg-emerald-100"
                            : "bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200"
                        )}
                      >
                        <span className={cn("w-1.5 h-1.5 rounded-full", s.status === 'active' ? "bg-emerald-500" : "bg-slate-400")}></span>
                        {s.status === 'active' ? 'Active' : 'Inactive'}
                      </button>
                    </td>

                    <td className="py-4 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 font-bold text-xs" title="Leads Assigned">
                          {s.assignedLeadsCount} Leads
                        </span>
                        <span className="px-2.5 py-1 rounded-lg bg-purple-50 text-purple-700 font-bold text-xs" title="Customers Assigned">
                          {s.assignedCustomersCount} Cust
                        </span>
                      </div>
                    </td>

                    <td className="py-4 px-4 text-center">
                      <div className="inline-flex items-center gap-1 bg-slate-50 px-3 py-1 rounded-lg border border-slate-200/60 font-semibold text-xs text-slate-700">
                        <span className="text-amber-600 font-bold">{s.pendingTasksCount}</span>
                        <span className="text-slate-300">/</span>
                        <span className="text-emerald-600 font-bold">{s.completedTasksCount}</span>
                      </div>
                    </td>

                    <td className="py-4 px-4 text-center">
                      <div className="w-24 mx-auto">
                        <div className="flex justify-between text-[11px] font-bold text-slate-700 mb-1">
                          <span>KPI</span>
                          <span>{s.performance || 85}%</span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className={cn(
                              "h-full rounded-full transition-all duration-500",
                              (s.performance || 85) >= 90 ? "bg-emerald-500" : (s.performance || 85) >= 80 ? "bg-blue-500" : "bg-amber-500"
                            )}
                            style={{ width: `${s.performance || 85}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-6 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setAssigningStaff(s);
                            setAssignModalOpen(true);
                          }}
                          title="Assign Lead, Customer, or Task"
                          className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm hover:from-blue-700 hover:to-indigo-700 transition-all flex items-center gap-1"
                        >
                          <Share2 className="w-3.5 h-3.5" />
                          Assign
                        </button>

                        <button
                          onClick={() => navigate(`/staff/${s.id}`)}
                          title="View Details & Activity Timeline"
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => {
                            setEditingStaff(s);
                            setFormModalOpen(true);
                          }}
                          title="Edit Staff Member"
                          className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        <button
                          onClick={(e) => handleDelete(s.id, s.name, e)}
                          title="Delete Account"
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <StaffFormModal
        open={formModalOpen}
        onClose={() => setFormModalOpen(false)}
        onSave={handleCreateOrUpdate}
        initialData={editingStaff}
      />

      <AssignWorkModal
        open={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        staff={assigningStaff}
        onAssigned={() => loadData()}
      />
    </div>
  );
};
