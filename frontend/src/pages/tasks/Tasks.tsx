import { useState } from 'react';
import { Plus, Calendar, CheckCircle2, MoreHorizontal, FileText, Check } from 'lucide-react';
import { cn } from '../../utils/cn';
import { format } from 'date-fns';
import { Modal } from '../../components/ui/Modal';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { useTasksApi } from '../../hooks/useApi';
import { TASK_STATUSES, TASK_PRIORITIES } from '../../constants';
import type { Task } from '../../types';

const emptyTask = { title: '', description: '', status: 'pending' as Task['status'], priority: 'medium' as Task['priority'], dueDate: '', notes: '' };

export const Tasks = () => {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);
  const [form, setForm] = useState(emptyTask);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Task | null>(null);
  const [actionDropdown, setActionDropdown] = useState<string | null>(null);
  const [formError, setFormError] = useState('');

  const { useList, useCreate, useUpdate, useDelete } = useTasksApi();
  const { data, isLoading } = useList({ page, limit: 15, status: statusFilter || undefined, dateFilter: dateFilter || undefined });
  const createMutation = useCreate();
  const updateMutation = useUpdate();
  const deleteMutation = useDelete();

  const openCreate = () => {
    setEditing(null);
    setForm(emptyTask);
    setFormError('');
    setModalOpen(true);
  };

  const openEdit = (task: Task) => {
    setEditing(task);
    setForm({
      title: task.title,
      description: task.description || '',
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate ? format(new Date(task.dueDate), 'yyyy-MM-dd') : '',
      notes: '',
    });
    setFormError('');
    setModalOpen(true);
    setActionDropdown(null);
  };

  const handleSave = async () => {
    if (!form.title.trim()) { setFormError('Title is required'); return; }
    setSaving(true);
    setFormError('');
    try {
      const payload: any = { ...form };
      if (payload.dueDate) {
        payload.dueDate = new Date(payload.dueDate).toISOString();
      } else {
        delete payload.dueDate;
      }
      delete payload.notes;
      if (editing) {
        await updateMutation.mutateAsync({ id: editing.id, data: payload });
      } else {
        await createMutation.mutateAsync(payload);
      }
      setModalOpen(false);
    } catch {
      setFormError('Failed to save task');
    } finally {
      setSaving(false);
    }
  };

  const toggleComplete = async (task: Task, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const newStatus = task.status === 'completed' ? 'pending' : 'completed';
    try {
      await updateMutation.mutateAsync({ id: task.id, data: { status: newStatus } as any });
    } catch { /* silent */ }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      setDeleteTarget(null);
    } catch { /* silent */ }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#191b23]">Task Management</h1>
          <p className="text-[#565e74]">Organize and track your daily tasks and follow-ups.</p>
        </div>
        <button onClick={openCreate} className="btn-primary flex w-full items-center justify-center shrink-0 sm:w-auto">
          <Plus className="w-4 h-4 mr-2" />
          Create Task
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200/70 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row gap-4 items-center justify-between bg-slate-50/50">
          <div className="flex space-x-2 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0 hide-scrollbar">
            <button
              onClick={() => { setStatusFilter(''); setPage(1); }}
              className={cn("px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap", statusFilter === '' ? "bg-slate-200 text-slate-800" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50")}
            >All Tasks</button>
            <button
              onClick={() => { setStatusFilter('pending'); setPage(1); }}
              className={cn("px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap", statusFilter === 'pending' ? "bg-yellow-100 text-yellow-800 border border-yellow-200" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50")}
            >Pending</button>
            <button
              onClick={() => { setStatusFilter('in_progress'); setPage(1); }}
              className={cn("px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap", statusFilter === 'in_progress' ? "bg-blue-100 text-blue-800 border border-blue-200" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50")}
            >In Progress</button>
            <button
              onClick={() => { setStatusFilter('completed'); setPage(1); }}
              className={cn("px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap", statusFilter === 'completed' ? "bg-green-100 text-green-800 border border-green-200" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50")}
            >Completed</button>
          </div>
          <div className="flex items-center space-x-3 w-full sm:w-auto shrink-0 justify-end">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Due Date:</label>
            <select
              value={dateFilter}
              onChange={(e) => { setDateFilter(e.target.value); setPage(1); }}
              className="bg-white border border-slate-200 rounded-lg text-sm px-3 py-1.5 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="">All Dates</option>
              <option value="overdue">Overdue</option>
              <option value="today">Due Today</option>
              <option value="this_week">Due This Week</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50/80 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3.5 w-12"></th>
                <th className="px-6 py-3.5 font-semibold text-slate-500 uppercase tracking-wider text-xs">Task</th>
                <th className="px-6 py-3.5 font-semibold text-slate-500 uppercase tracking-wider text-xs">Related To</th>
                <th className="px-6 py-3.5 font-semibold text-slate-500 uppercase tracking-wider text-xs">Due Date</th>
                <th className="px-6 py-3.5 font-semibold text-slate-500 uppercase tracking-wider text-xs">Priority</th>
                <th className="px-6 py-3.5 font-semibold text-slate-500 uppercase tracking-wider text-xs text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex justify-center"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div></div>
                  </td>
                </tr>
              ) : data?.data?.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <CheckCircle2 className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500 text-sm font-medium">No tasks found</p>
                    <p className="text-slate-400 text-xs mt-1">Create a task to get started.</p>
                  </td>
                </tr>
              ) : (
                (data?.data as Task[])?.map(task => (
                  <tr key={task.id} className={cn("hover:bg-slate-50 transition-colors group", task.status === 'completed' && "bg-slate-50/50 opacity-75")}>
                    <td className="px-6 py-4">
                      <button
                        onClick={(e) => toggleComplete(task, e)}
                        className={cn(
                          "w-5 h-5 rounded border flex items-center justify-center transition-colors",
                          task.status === 'completed' ? "bg-green-500 border-green-500 text-white" : "border-slate-300 bg-white hover:border-green-500"
                        )}
                      >
                        {task.status === 'completed' && <Check className="w-3.5 h-3.5" />}
                      </button>
                    </td>
                    <td className="px-6 py-4 min-w-[200px] max-w-[300px]">
                      <div className={cn("font-semibold text-slate-900 truncate", task.status === 'completed' && "line-through text-slate-500")}>
                        {task.title}
                      </div>
                      {task.description && (
                        <div className="text-slate-500 text-xs mt-0.5 truncate flex items-center">
                          <FileText className="w-3 h-3 mr-1 shrink-0" />
                          <span className="truncate">{task.description}</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {task.customer ? (
                        <div className="inline-flex items-center text-[#004ac6] bg-[#f3f3fe] px-2.5 py-1 rounded-md font-medium text-xs">
                          <span className="truncate max-w-[150px]">{task.customer.name}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-xs">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {task.dueDate ? (
                        <div className="flex items-center text-slate-600">
                          <Calendar className="w-4 h-4 mr-1.5 text-slate-400" />
                          <span className={cn(
                            "inline-flex items-center gap-1.5 text-xs font-semibold px-2 py-0.5 rounded-full border",
                            new Date(task.dueDate) < new Date() && task.status !== 'completed'
                              ? "bg-red-50 text-red-700 border-red-100 font-medium"
                              : "bg-slate-50 text-slate-600 border-slate-100"
                          )}>
                            {new Date(task.dueDate) < new Date() && task.status !== 'completed' && (
                              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse shrink-0"></span>
                            )}
                            {format(new Date(task.dueDate), 'MMM d, yyyy')}
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-xs">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "badge",
                        task.priority === 'high' ? "bg-red-50 text-red-700 border-red-200" :
                        task.priority === 'medium' ? "bg-yellow-50 text-yellow-700 border-yellow-200" :
                        "bg-blue-50 text-blue-700 border-blue-200"
                      )}>
                        {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActionDropdown(actionDropdown === task.id ? null : task.id);
                        }}
                        className="text-slate-400 hover:text-slate-700 p-1.5 rounded-md hover:bg-slate-100 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <MoreHorizontal className="w-5 h-5" />
                      </button>
                      {actionDropdown === task.id && (
                        <div className="absolute right-4 top-12 w-32 bg-white border border-slate-200 rounded-lg shadow-lg z-10 py-1">
                          <button onClick={() => openEdit(task)} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">Edit</button>
                          <button onClick={() => { setDeleteTarget(task); setActionDropdown(null); }} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50">Delete</button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {data && data.total > 15 && (
          <div className="p-4 border-t border-slate-200 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between bg-slate-50/50">
            <span className="text-sm text-slate-500">
              Showing <span className="font-medium text-slate-700">{(page - 1) * 15 + 1}</span> to <span className="font-medium text-slate-700">{Math.min(page * 15, data.total)}</span> of <span className="font-medium text-slate-700">{data.total}</span> results
            </span>
            <div className="flex gap-2 self-end sm:self-auto">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="btn-secondary px-3 py-1 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >Previous</button>
              <button
                onClick={() => setPage(p => p + 1)}
                disabled={page * 15 >= data.total}
                className="btn-secondary px-3 py-1 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >Next</button>
            </div>
          </div>
        )}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Task' : 'Create Task'}>
        {formError && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">{formError}</div>}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#191b23] mb-1">Title *</label>
            <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="input-field" placeholder="Task title" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#191b23] mb-1">Description</label>
            <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="input-field h-20 resize-none" placeholder="Task description..." />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#191b23] mb-1">Priority</label>
              <select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value as any })} className="input-field">
                {TASK_PRIORITIES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#191b23] mb-1">Status</label>
              <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value as any })} className="input-field">
                {TASK_STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#191b23] mb-1">Due Date</label>
            <input type="date" value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} className="input-field" />
          </div>
          <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
            {editing && (
              <button onClick={() => { setDeleteTarget(editing); setModalOpen(false); }} className="text-left text-sm text-red-600 hover:text-red-700 font-medium">Delete task</button>
            )}
            <div className="flex flex-col-reverse gap-3 sm:ml-auto sm:flex-row">
              <button onClick={() => setModalOpen(false)} className="btn-secondary text-sm">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="btn-primary text-sm">{saving ? 'Saving...' : editing ? 'Update Task' : 'Create Task'}</button>
            </div>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        title="Delete Task"
        message={`Are you sure you want to delete "${deleteTarget?.title}"? This action cannot be undone.`}
      />
    </div>
  );
};
