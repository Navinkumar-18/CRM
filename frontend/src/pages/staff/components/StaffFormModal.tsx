import { useState, useEffect } from 'react';
import { Modal } from '../../../components/ui/Modal';
import type { StaffMember } from '../../../services/staffDataService';
import { Shield, Mail, Phone, Briefcase, Building, Lock } from 'lucide-react';

interface StaffFormModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: Partial<StaffMember>, isEdit: boolean) => void;
  initialData?: StaffMember | null;
}

const emptyForm: Partial<StaffMember> & { password?: string } = {
  name: '',
  email: '',
  phone: '',
  role: 'staff',
  position: 'Sales Specialist',
  department: 'Sales',
  status: 'active',
  password: '',
};

export const StaffFormModal = ({ open, onClose, onSave, initialData }: StaffFormModalProps) => {
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const isEdit = !!initialData;

  useEffect(() => {
    if (initialData) {
      setForm({
        name: initialData.name || '',
        email: initialData.email || '',
        phone: initialData.phone || '',
        role: initialData.role || 'staff',
        position: initialData.position || '',
        department: initialData.department || 'Sales',
        status: initialData.status || 'active',
        password: '',
      });
    } else {
      setForm(emptyForm);
    }
    setError('');
  }, [initialData, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name?.trim()) {
      setError('Staff Name is required');
      return;
    }
    if (!form.email?.trim()) {
      setError('Email address is required');
      return;
    }
    if (!isEdit && !form.password?.trim()) {
      setError('Password is required for new staff accounts');
      return;
    }
    setError('');
    onSave(form, isEdit);
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? `Edit Staff: ${initialData?.name}` : 'Add New Staff Member'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm flex items-center">
            <svg className="w-4 h-4 mr-2 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">Full Name *</label>
          <input
            type="text"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="e.g. Sarah Jenkins"
            className="input-field"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
              <Mail className="w-4 h-4 text-slate-400" /> Email Address *
            </label>
            <input
              type="email"
              required
              disabled={isEdit}
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="sarah.j@company.com"
              className="input-field disabled:bg-slate-100 disabled:text-slate-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
              <Phone className="w-4 h-4 text-slate-400" /> Phone Number
            </label>
            <input
              type="text"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="+1 415 555 0199"
              className="input-field"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
              <Briefcase className="w-4 h-4 text-slate-400" /> Position Title
            </label>
            <input
              type="text"
              value={form.position}
              onChange={(e) => setForm({ ...form, position: e.target.value })}
              placeholder="Senior Sales Executive"
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
              <Building className="w-4 h-4 text-slate-400" /> Department
            </label>
            <select
              value={form.department}
              onChange={(e) => setForm({ ...form, department: e.target.value })}
              className="input-field"
            >
              <option value="Sales">Sales</option>
              <option value="Account Management">Account Management</option>
              <option value="Support">Support</option>
              <option value="Marketing">Marketing</option>
              <option value="Operations">Operations</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-slate-400" /> System Role
            </label>
            <select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value as any })}
              className="input-field"
            >
              <option value="staff">Staff (Standard employee access)</option>
              <option value="employee">Employee (Sales & tasks access)</option>
              <option value="manager">Manager (Team visibility)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Account Status</label>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value as any })}
              className="input-field"
            >
              <option value="active">Active (Can log in & receive leads)</option>
              <option value="inactive">Inactive (Suspended access)</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
            <Lock className="w-4 h-4 text-slate-400" /> {isEdit ? 'New Password (leave blank to keep current)' : 'Account Password *'}
          </label>
          <input
            type="password"
            required={!isEdit}
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            placeholder={isEdit ? '••••••••' : 'Enter strong password (e.g. Staff@123)'}
            className="input-field"
          />
          {!isEdit && (
            <p className="text-xs text-slate-500 mt-1">Staff will use this password to log in to their restricted portal.</p>
          )}
        </div>

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
            {isEdit ? 'Save Changes' : 'Create Staff Member'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
