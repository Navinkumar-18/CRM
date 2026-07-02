import { useState } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { staffDataService, type StaffMember } from '../../../services/staffDataService';
import { Target, Users, CheckSquare, Calendar, AlertCircle, FileText } from 'lucide-react';
import { cn } from '../../../utils/cn';

interface AssignWorkModalProps {
  open: boolean;
  onClose: () => void;
  staff: StaffMember | null;
  onAssigned: () => void;
}

export const AssignWorkModal = ({ open, onClose, staff, onAssigned }: AssignWorkModalProps) => {
  const [activeTab, setActiveTab] = useState<'lead' | 'customer' | 'task'>('lead');
  
  // Lead form
  const [selectedLeadId, setSelectedLeadId] = useState('');
  const [leadPriority, setLeadPriority] = useState('medium');
  const [leadDueDate, setLeadDueDate] = useState('');
  
  // Customer form
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  
  // Task form
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskPriority, setTaskPriority] = useState('medium');
  const [taskDueDate, setTaskDueDate] = useState(new Date(Date.now() + 3600000 * 48).toISOString().split('T')[0]);
  const [relatedName, setRelatedName] = useState('');

  if (!staff) return null;

  const leads = staffDataService['leads'] || [];
  const customers = staffDataService['customers'] || [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab === 'lead') {
      const lead = leads.find((l: any) => l.id === selectedLeadId);
      if (!lead && !selectedLeadId) return;
      staffDataService.assignWork(staff.id, 'lead', { id: selectedLeadId, name: lead?.name || 'Assigned Lead', priority: leadPriority, dueDate: leadDueDate });
    } else if (activeTab === 'customer') {
      const cust = customers.find((c: any) => c.id === selectedCustomerId);
      if (!cust && !selectedCustomerId) return;
      staffDataService.assignWork(staff.id, 'customer', { id: selectedCustomerId, name: cust?.name || 'Assigned Customer', company: cust?.company });
    } else if (activeTab === 'task') {
      if (!taskTitle.trim()) return;
      staffDataService.assignWork(staff.id, 'task', { title: taskTitle, description: taskDesc, priority: taskPriority, dueDate: taskDueDate, relatedName });
    }
    onAssigned();
    onClose();
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

      <form onSubmit={handleSubmit} className="space-y-4">
        {activeTab === 'lead' && (
          <>
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
                    {lead.name} ({lead.status}) — currently assigned to {lead.assignedTo?.name || 'Unassigned'}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4 text-slate-400" /> Priority Level
                </label>
                <select value={leadPriority} onChange={(e) => setLeadPriority(e.target.value)} className="input-field">
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1 flex items-center gap-1">
                  <Calendar className="w-4 h-4 text-slate-400" /> Follow-up Due Date
                </label>
                <input type="date" value={leadDueDate} onChange={(e) => setLeadDueDate(e.target.value)} className="input-field" />
              </div>
            </div>
          </>
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
                  {cust.name} ({cust.company || 'No Company'}) — assigned to {cust.assignedTo?.name || 'Unassigned'}
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
              <label className="block text-sm font-semibold text-slate-700 mb-1">Related Lead / Customer Name (Optional)</label>
              <input
                type="text"
                value={relatedName}
                onChange={(e) => setRelatedName(e.target.value)}
                placeholder="e.g. Acme Global Software"
                className="input-field"
              />
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
