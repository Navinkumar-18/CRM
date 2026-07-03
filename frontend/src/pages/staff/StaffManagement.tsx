import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api/axios';
import type { User } from '../../types';
import { StaffFormModal } from './components/StaffFormModal';
import { AssignWorkModal } from './components/AssignWorkModal';
import { 
  Users, 
  UserPlus, 
  Search, 
  ShieldCheck, 
  CheckCircle2, 
  Briefcase, 
  Edit2, 
  Trash2, 
  Eye, 
  Share2, 
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';

export const StaffManagement = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');

  // Modal states
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<User | null>(null);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [assigningStaff, setAssigningStaff] = useState<User | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [apiSuccess, setApiSuccess] = useState<string | null>(null);


  // Fetch real users from database
  const { data: usersData, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const res = await api.get('/users?limit=100');
      return (res as any).data;
    },
  });

  const staffList: User[] = (usersData?.data || []) as User[];

  // Delete user mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/users/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  // Update user mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Record<string, any> }) => {
      const res = await api.put(`/users/${id}`, data);
      return (res as any).data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  const handleCreateOrUpdate = async (data: Partial<User> & { password?: string }, isEdit: boolean) => {
    setApiError(null);
    setApiSuccess(null);
    if (isEdit && editingStaff) {
      try {
        const updatePayload: Record<string, any> = {};
        if (data.name) updatePayload.name = data.name;
        if (data.role) updatePayload.role = data.role;
        if (data.password) updatePayload.password = data.password;
        if (data.phone !== undefined) updatePayload.phone = data.phone;
        if (data.position !== undefined) updatePayload.position = data.position;
        if (data.department !== undefined) updatePayload.department = data.department;
        if (data.status !== undefined) updatePayload.status = data.status;
        await updateMutation.mutateAsync({ id: editingStaff.id, data: updatePayload });
        setApiSuccess(`✅ Staff member ${data.name || editingStaff.name} updated successfully.`);
        setTimeout(() => setApiSuccess(null), 6000);
      } catch (err: any) {
        const msg = err.response?.data?.message || 'Failed to update staff member.';
        setApiError(msg);
      }
    } else {
      // Create user account directly in Supabase DB via /users endpoint
      try {
        await api.post('/users', {
          email: data.email,
          password: data.password,
          name: data.name,
          role: data.role || 'employee',
          phone: data.phone,
          position: data.position,
          department: data.department,
          status: data.status || 'active',
        });
        queryClient.invalidateQueries({ queryKey: ['users'] });
        setApiSuccess(`✅ Account created for ${data.name} (${data.email}) as ${data.role || 'employee'}.`);
        setTimeout(() => setApiSuccess(null), 6000);
      } catch (err: any) {
        const msg = err.response?.data?.message || 'Failed to create staff account. Please try again.';
        setApiError(msg);
      }
    }
  };

  const handleDeleteClick = (user: User, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteTarget(user);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      setApiSuccess(`Staff member "${deleteTarget.name}" deleted successfully.`);
      setTimeout(() => setApiSuccess(null), 6000);
      setDeleteTarget(null);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to delete staff member.';
      setApiError(msg);
      setDeleteTarget(null);
    }
  };

  const filteredStaff = staffList.filter((s) => {
    const matchesSearch = 
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === 'ALL' || s.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const totalStaff = staffList.length;
  const adminCount = staffList.filter(s => s.role === 'admin').length;
  const employeeCount = staffList.filter(s => s.role !== 'admin').length;

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

      {/* API Success / Error Notifications */}
      {apiSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-sm font-medium flex items-start gap-2.5 shadow-sm">
          <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
          <span>{apiSuccess}</span>
        </div>
      )}
      {apiError && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-sm font-medium flex items-start gap-2.5 shadow-sm">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <span>{apiError}</span>
        </div>
      )}

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Total Staff</p>
            <h3 className="text-2xl font-bold text-slate-900">{totalStaff}</h3>
            <p className="text-xs text-slate-500 mt-1 flex items-center text-emerald-600 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5"></span>
              All registered accounts
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Admins</p>
            <h3 className="text-2xl font-bold text-slate-900">{adminCount}</h3>
            <p className="text-xs text-slate-500 mt-1">Full system access</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Employees</p>
            <h3 className="text-2xl font-bold text-slate-900">{employeeCount}</h3>
            <p className="text-xs text-emerald-600 font-medium mt-1 flex items-center">
              <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Active team members
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Briefcase className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">System</p>
            <h3 className="text-2xl font-bold text-slate-900">Live</h3>
            <p className="text-xs text-slate-500 mt-1 flex items-center">
              <TrendingUp className="w-3.5 h-3.5 text-blue-500 mr-1" /> Connected to Database
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
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="ALL">All Roles</option>
            <option value="admin">Admin</option>
            <option value="manager">Manager</option>
            <option value="employee">Employee</option>
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
                <th className="py-3.5 px-4">Role</th>
                <th className="py-3.5 px-4 text-center">Joined</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-slate-400">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3"></div>
                    Loading staff from database...
                  </td>
                </tr>
              ) : filteredStaff.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-slate-400">
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
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-sm">
                          {s.name?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                            {s.name}
                          </div>
                          <div className="text-xs text-slate-500">{s.email}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <span className={cn(
                        "inline-block text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg",
                        s.role === 'admin' ? "bg-red-50 text-red-700" :
                        s.role === 'manager' ? "bg-indigo-50 text-indigo-700" : "bg-blue-50 text-blue-700"
                      )}>
                        {s.role}
                      </span>
                    </td>

                    <td className="py-4 px-4 text-center text-xs text-slate-500">
                      {s.created_at ? new Date(s.created_at).toLocaleDateString() : '—'}
                    </td>

                    <td className="py-4 px-6 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        {s.role !== 'admin' && (
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
                        )}

                        <button
                          onClick={() => navigate(`/staff/${s.id}`)}
                          title="View Details"
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

                        {s.role !== 'admin' && (
                          <button
                            onClick={(e) => handleDeleteClick(s, e)}
                            title="Delete Account"
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
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
        onAssigned={() => queryClient.invalidateQueries({ queryKey: ['users'] })}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
        title="Delete Staff Member"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This action is permanent and cannot be undone.`}
      />
    </div>
  );
};
