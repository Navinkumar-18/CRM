import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../../api/axios';
import { Modal } from '../../../components/ui/Modal';
import type { User } from '../../../types';
import { Target, Users, CheckSquare, Calendar, AlertCircle, FileText } from 'lucide-react';
import { cn } from '../../../utils/cn';

interface AssignWorkModalProps {
  open: boolean;
  onClose: () => void;
  staff: User | null;
  onAssigned: () => void;
}

export const AssignWorkModal = ({ open, onClose, staff, onAssigned }: AssignWorkModalProps) => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'lead' | 'customer' | 'task'>('lead');
  const [errorMsg, setErrorMsg] = useState('');
  
  // Lead form
  const [selectedLeadId, setSelectedLeadId] = useState('');
  
  // Customer form
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  
  // Task form
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskPriority, setTaskPriority] = useState('medium');
  const [taskDueDate, setTaskDueDate] = useState(new Date(Date.now() + 3600000 * 48).toISOString().split('T')[0]);
  const [selectedTaskCustomerId, setSelectedTaskCustomerId] = useState('');

  // Reset form fields when modal open state or active tab changes
  useEffect(() => {
    setSelectedLeadId('');
    setSelectedCustomerId('');
    setTaskTitle('');
    setTaskDesc('');
    setTaskPriority('medium');
    setTaskDueDate(new Date(Date.now() + 3600000 * 48).toISOString().split('T')[0]);
    setSelectedTaskCustomerId('');
    setErrorMsg('');
  }, [open, activeTab]);

  // Fetch real leads and customers from database
  const { data: leadsData } = useQuery({
    queryKey: ['all-leads-assign'],
    queryFn: async () => {
      const res = await api.get('/leads?limit=100');
      return (res as any).data;
    },
    enabled: open,
  });

  const { data: custData } = useQuery({
    queryKey: ['all-customers-assign'],
    queryFn: async () => {
      const res = await api.get('/customers?limit=100');
      return (res as any).data;
    },
    enabled: open,
  });

  const leads = (leadsData?.data || []) as any[];
  const customers = (custData?.data || []) as any[];

  // Mutations for assigning
  const assignLeadMutation = useMutation({
    mutationFn: async (leadId: string) => {
      await api.put(`/leads/${leadId}`, { assignedTo: staff?.id });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['staff-leads'] });
    },
  });

  const assignCustomerMutation = useMutation({
    mutationFn: async (customerId: string) => {
      await api.put(`/customers/${customerId}`, { assignedTo: staff?.id });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['staff-customers'] });
    },
  });

  const createTaskMutation = useMutation({
    mutationFn: async (taskData: any) => {
      await api.post('/tasks', taskData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['staff-tasks'] });
    },
  });

  if (!staff) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      if (activeTab === 'lead') {
        if (!selectedLeadId) {
          setErrorMsg('Please select a lead');
          return;
        }
        await assignLeadMutation.mutateAsync(selectedLeadId);
      } else if (activeTab === 'customer') {
        if (!selectedCustomerId) {
          setErrorMsg('Please select a customer');
          return;
        }
        await assignCustomerMutation.mutateAsync(selectedCustomerId);
      } else if (activeTab === 'task') {
        if (!taskTitle.trim()) {
          setErrorMsg('Please enter a task title');
          return;
        }
        await createTaskMutation.mutateAsync({
          title: taskTitle,
          description: taskDesc,
          priority: taskPriority,
          dueDate: taskDueDate ? new Date(taskDueDate + 'T23:59:59').toISOString() : undefined,
          assignedTo: staff.id,
          status: 'pending',
          customerId: selectedTaskCustomerId || null,
        });
        // Reset task form
        setTaskTitle('');
        setTaskDesc('');
        setTaskPriority('medium');
        setSelectedTaskCustomerId('');
      }
      onAssigned();
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.message || err?.message || 'Failed to complete assignment');
    }
  };


  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Assign Work to ${staff.name}`}
    >
      <div className="flex border-b border-slate-200 mb-5">
        <button
          type="button"
          onClick={() => setActiveTab('lead')}
          className={cn(
            "flex items-center px-4 py-2.5 text-sm font-semibold border-b-2 transition-all gap-2",
            activeTab === 'lead' ? "border-blue-600 text-blue-600 bg-blue-50/50" : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50"
          )}
        >
          <Target className="w-4 h-4" />
          Assign Lead
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('customer')}
          className={cn(
            "flex items-center px-4 py-2.5 text-sm font-semibold border-b-2 transition-all gap-2",
            activeTab === 'customer' ? "border-blue-600 text-blue-600 bg-blue-50/50" : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50"
          )}
        >
          <Users className="w-4 h-4" />
          Assign Customer
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('task')}
          className={cn(
            "flex items-center px-4 py-2.5 text-sm font-semibold border-b-2 transition-all gap-2",
            activeTab === 'task' ? "border-blue-600 text-blue-600 bg-blue-50/50" : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50"
          )}
        >
          <CheckSquare className="w-4 h-4" />
          Create Task
        </button>
      </div>

      {errorMsg && (
        <div className="p-3 mb-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {activeTab === 'lead' && (
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Select Lead *</label>
            <select
              required
              value={selectedLeadId}
              onChange={(e) => setSelectedLeadId(e.target.value)}
              className="input-field"
            >
              <option value="">-- Choose a lead to reassign --</option>
              {leads.map((lead: any) => (
                <option key={lead.id} value={lead.id}>
                  {lead.name} ({lead.status})
                </option>
              ))}
            </select>
          </div>
        )}

        {activeTab === 'customer' && (
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Select Customer *</label>
            <select
              required
              value={selectedCustomerId}
              onChange={(e) => setSelectedCustomerId(e.target.value)}
              className="input-field"
            >
              <option value="">-- Choose a customer to reassign --</option>
              {customers.map((cust: any) => (
                <option key={cust.id} value={cust.id}>
                  {cust.name} ({cust.company || 'No Company'})
                </option>
              ))}
            </select>
            <p className="text-xs text-slate-500 mt-2">
              Assigning this customer will transfer primary account ownership to {staff.name}.
            </p>
          </div>
        )}

        {activeTab === 'task' && (
          <>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Task Title *</label>
              <input
                type="text"
                required
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                placeholder="e.g. Conduct follow-up call & product presentation"
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <FileText className="w-4 h-4 text-slate-400" /> Task Description / Instructions
              </label>
              <textarea
                value={taskDesc}
                onChange={(e) => setTaskDesc(e.target.value)}
                placeholder="Provide detailed instructions or notes for the employee..."
                className="input-field h-20 resize-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4 text-slate-400" /> Priority Level
                </label>
                <select value={taskPriority} onChange={(e) => setTaskPriority(e.target.value)} className="input-field">
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority (Urgent)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1 flex items-center gap-1">
                  <Calendar className="w-4 h-4 text-slate-400" /> Due Date
                </label>
                <input type="date" value={taskDueDate} onChange={(e) => setTaskDueDate(e.target.value)} className="input-field" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Link to Customer (Optional)</label>
              <select
                value={selectedTaskCustomerId}
                onChange={(e) => setSelectedTaskCustomerId(e.target.value)}
                className="input-field"
              >
                <option value="">-- No linked customer --</option>
                {customers.map((cust: any) => (
                  <option key={cust.id} value={cust.id}>
                    {cust.name} ({cust.company || 'No Company'})
                  </option>
                ))}
              </select>
            </div>
          </>
        )}

        <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary px-5 py-2 text-sm font-medium"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn-primary px-6 py-2 text-sm font-semibold shadow-md shadow-blue-500/20"
          >
            Assign to Employee
          </button>
        </div>
      </form>
    </Modal>
  );
};
