import { useState } from 'react';
import { useTasksApi } from '../../hooks/useApi';
import type { Task } from '../../types';
import { CheckSquare, Search, CheckCircle2, AlertCircle, Sparkles, Check, Calendar } from 'lucide-react';
import { cn } from '../../utils/cn';

export const MyTasks = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [celebrateTaskId, setCelebrateTaskId] = useState<string | null>(null);

  const { useList, useUpdate } = useTasksApi();
  const { data: taskData, isLoading } = useList({ page: 1, limit: 100 });
  const updateMutation = useUpdate();

  const tasks: Task[] = (taskData?.data as Task[]) || [];

  const handleStatusChange = async (task: Task, newStatus: string) => {
    if (newStatus === 'completed' && task.status !== 'completed') {
      setCelebrateTaskId(task.id);
      setTimeout(() => setCelebrateTaskId(null), 1500);
    }
    try {
      await updateMutation.mutateAsync({ id: task.id, data: { status: newStatus } as Partial<Task> });
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } }; message?: string };
      alert(error?.response?.data?.message || error?.message || 'Failed to update task status');
    }
  };

  const filteredTasks = tasks.filter((t) => {
    const matchesSearch = 
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      (t.description && t.description.toLowerCase().includes(search.toLowerCase())) ||
      (t.customer && (t.customer.company || t.customer.name || '').toLowerCase().includes(search.toLowerCase()));
    const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter;
    const matchesPriority = priorityFilter === 'ALL' || t.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const pendingCount = tasks.filter(t => t.status !== 'completed').length;
  const completedCount = tasks.filter(t => t.status === 'completed').length;

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
            <CheckSquare className="w-6 h-6" />
          </span>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">My Action Items & To-Dos</h1>
            <p className="text-sm text-slate-500">
              Track your daily CRM assignments, update progress, and mark tasks as completed.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-amber-50 px-4 py-2 rounded-xl border border-amber-100 text-xs font-bold text-amber-700">
            ⏳ {pendingCount} Pending
          </div>
          <div className="bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-100 text-xs font-bold text-emerald-700">
            ✅ {completedCount} Completed
          </div>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search tasks or related customer names..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 focus:bg-white transition-all"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-200">
            {['ALL', 'pending', 'in_progress', 'completed'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={cn(
                  "px-3 py-1 text-xs font-bold rounded-lg transition-all capitalize",
                  statusFilter === st 
                    ? "bg-amber-600 text-white shadow-sm" 
                    : "text-slate-600 hover:text-slate-900"
                )}
              >
                {st === 'ALL' ? 'All Status' : st.replace('_', ' ')}
              </button>
            ))}
          </div>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-1.5 text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none"
          >
            <option value="ALL">All Priorities</option>
            <option value="high">🔥 High Priority</option>
            <option value="medium">⚡ Medium Priority</option>
            <option value="low">☕ Low Priority</option>
          </select>
        </div>
      </div>

      {/* Tasks List */}
      {isLoading ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600 mx-auto"></div>
          <p className="text-sm text-slate-500 mt-3">Loading your tasks...</p>
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center text-slate-400">
          <AlertCircle className="w-10 h-10 mx-auto mb-3 text-slate-300" />
          <h3 className="text-base font-bold text-slate-700">No Tasks Match Filter</h3>
          <p className="text-xs mt-1">Try resetting your search query or status filter.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTasks.map((task) => (
            <div 
              key={task.id}
              className={cn(
                "p-5 rounded-3xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white shadow-sm hover:shadow-md",
                celebrateTaskId === task.id ? "border-emerald-400 bg-emerald-50/60 scale-[1.01]" : "border-slate-200/80"
              )}
            >
              <div className="flex items-start space-x-4 flex-1 min-w-0">
                <button
                  onClick={() => handleStatusChange(task, task.status === 'completed' ? 'pending' : 'completed')}
                  className={cn(
                    "w-7 h-7 rounded-xl flex items-center justify-center transition-all shrink-0 mt-0.5 border-2",
                    task.status === 'completed' 
                      ? "bg-emerald-500 border-emerald-500 text-white shadow-md shadow-emerald-500/20" 
                      : "border-slate-300 hover:border-amber-500 hover:bg-amber-50"
                  )}
                  title={task.status === 'completed' ? "Mark as Pending" : "Check off as Completed!"}
                >
                  {task.status === 'completed' ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    <Check className="w-4 h-4 text-amber-600 opacity-0 hover:opacity-100 transition-opacity" />
                  )}
                </button>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className={cn(
                      "font-bold text-base",
                      task.status === 'completed' ? "line-through text-slate-400" : "text-slate-900"
                    )}>
                      {task.title}
                    </h3>
                    {celebrateTaskId === task.id && (
                      <span className="inline-flex items-center gap-1 text-xs font-extrabold text-emerald-600 animate-pulse">
                        <Sparkles className="w-3.5 h-3.5" /> Completed! 🎉
                      </span>
                    )}
                  </div>

                  {task.description && (
                    <p className="text-sm text-slate-600 mt-1">{task.description}</p>
                  )}

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mt-3 pt-3 border-t border-slate-100">
                    <span className="flex items-center gap-1 font-medium text-slate-700">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" /> Due: {task.dueDate || 'No set date'}
                    </span>
                    {task.customer && (
                      <span className="font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-md">
                        🏢 Related: {task.customer.company || task.customer.name}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex md:flex-col items-center md:items-end justify-between md:justify-center gap-3 pt-3 md:pt-0 border-t md:border-0 border-slate-100 shrink-0">
                <span className={cn(
                  "text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-lg",
                  task.priority === 'high' ? "bg-red-100 text-red-700" :
                  task.priority === 'medium' ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-600"
                )}>
                  {task.priority} Priority
                </span>

                <select
                  value={task.status}
                  onChange={(e) => handleStatusChange(task, e.target.value)}
                  className={cn(
                    "text-xs font-bold px-3 py-1.5 rounded-xl border-0 shadow-sm cursor-pointer",
                    task.status === 'completed' ? "bg-emerald-100 text-emerald-800" :
                    task.status === 'in_progress' ? "bg-blue-100 text-blue-800" : "bg-slate-100 text-slate-700"
                  )}
                >
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed ✅</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
