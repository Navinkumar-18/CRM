import { useState, useRef, useEffect } from 'react';
import { Plus, Search, MoreHorizontal, Mail, Phone, Building, X, Users } from 'lucide-react';
import { cn } from '../../utils/cn';
import { format } from 'date-fns';
import { Modal } from '../../components/ui/Modal';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { useCustomersApi } from '../../hooks/useApi';
import { SECTORS, CUSTOMER_STATUSES, getSectorColor } from '../../constants';
import type { Customer } from '../../types';

const emptyCustomer = { name: '', email: '', phone: '', company: '', address: '', status: 'prospect' as Customer['status'], sector: 'general' as Customer['sector'], notes: '' };

export const Customers = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [sectorFilter, setSectorFilter] = useState('');
  const [showSectorFilter, setShowSectorFilter] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Customer | null>(null);
  const [form, setForm] = useState(emptyCustomer);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Customer | null>(null);
  const [actionDropdown, setActionDropdown] = useState<string | null>(null);
  const [formError, setFormError] = useState('');
  const sectorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (sectorRef.current && !sectorRef.current.contains(e.target as Node)) {
        setShowSectorFilter(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const { useList, useCreate, useUpdate, useDelete } = useCustomersApi();
  const { data, isLoading } = useList({ page, limit: 10, search, sector: sectorFilter || undefined });
  const createMutation = useCreate();
  const updateMutation = useUpdate();
  const deleteMutation = useDelete();

  const openCreate = () => {
    setEditing(null);
    setForm(emptyCustomer);
    setFormError('');
    setModalOpen(true);
  };

  const openEdit = (customer: Customer) => {
    setEditing(customer);
    setForm({ name: customer.name, email: customer.email || '', phone: customer.phone || '', company: customer.company || '', address: customer.address || '', status: customer.status, sector: customer.sector, notes: customer.notes || '' });
    setFormError('');
    setModalOpen(true);
    setActionDropdown(null);
  };

  const handleSave = async () => {
    if (!form.name.trim()) { setFormError('Name is required'); return; }
    setSaving(true);
    setFormError('');
    try {
      if (editing) {
        await updateMutation.mutateAsync({ id: editing.id, data: form });
      } else {
        await createMutation.mutateAsync(form);
      }
      setModalOpen(false);
    } catch (err: any) {
      setFormError(err?.response?.data?.message || err?.message || 'Failed to save customer');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      setDeleteTarget(null);
    } catch (err: any) {
      alert(err?.response?.data?.message || err?.message || 'Failed to delete customer');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#191b23]">Customer Directory</h1>
          <p className="text-[#565e74]">Manage your organization's customers and accounts.</p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center shrink-0">
          <Plus className="w-4 h-4 mr-2" />
          Add Customer
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200/70 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row gap-4 items-center justify-between bg-slate-50/50">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search customers..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
          <div className="flex items-center space-x-2 w-full sm:w-auto relative" ref={sectorRef}>
            <button onClick={() => setShowSectorFilter(!showSectorFilter)} className={cn("btn-secondary flex items-center text-sm w-full sm:w-auto justify-center", sectorFilter && "border-[#2563eb] text-[#2563eb]")}>
              <Building className="w-4 h-4 mr-2" />
              {sectorFilter ? SECTORS.find(s => s.value === sectorFilter)?.label : 'Sector'}
              {sectorFilter && <X className="w-3 h-3 ml-2 cursor-pointer" onClick={(e) => { e.stopPropagation(); setSectorFilter(''); }} />}
            </button>
            {showSectorFilter && (
              <div className="absolute top-full right-0 mt-1 w-44 bg-white border border-slate-200 rounded-lg shadow-lg z-10 py-1">
                {SECTORS.map(s => (
                  <button key={s.value} onClick={() => { setSectorFilter(s.value); setShowSectorFilter(false); setPage(1); }} className={cn("w-full text-left px-4 py-2 text-sm hover:bg-slate-50", sectorFilter === s.value && "bg-blue-50 text-blue-700")}>
                    {s.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50/80 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3.5 font-semibold text-slate-500 uppercase tracking-wider text-xs">Customer</th>
                <th className="px-6 py-3.5 font-semibold text-slate-500 uppercase tracking-wider text-xs">Contact Info</th>
                <th className="px-6 py-3.5 font-semibold text-slate-500 uppercase tracking-wider text-xs">Sector</th>
                <th className="px-6 py-3.5 font-semibold text-slate-500 uppercase tracking-wider text-xs">Status</th>
                <th className="px-6 py-3.5 font-semibold text-slate-500 uppercase tracking-wider text-xs">Added</th>
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
                    <Users className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500 text-sm font-medium">No customers found</p>
                    <p className="text-slate-400 text-xs mt-1">Try adjusting your search or filters.</p>
                  </td>
                </tr>
              ) : (
                (data?.data as Customer[])?.map(customer => (
                  <tr key={customer.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center text-blue-700 font-bold border border-blue-100">
                          {customer.name.charAt(0)}
                        </div>
                        <div className="ml-4">
                          <div className="font-semibold text-slate-900">{customer.name}</div>
                          <div className="text-slate-500 flex items-center text-xs mt-0.5">
                            <Building className="w-3 h-3 mr-1" />
                            {customer.company || 'Individual'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col space-y-1">
                        <div className="text-slate-800 flex items-center">
                          <Mail className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                          {customer.email || '-'}
                        </div>
                        <div className="text-slate-500 flex items-center text-xs">
                          <Phone className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                          {customer.phone || '-'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn("badge", getSectorColor(customer.sector))}>
                        {SECTORS.find(s => s.value === customer.sector)?.label || customer.sector}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "badge",
                        customer.status === 'active' ? "bg-green-50 text-green-700 border-green-200" :
                        customer.status === 'inactive' ? "bg-slate-100 text-slate-700 border-slate-200" :
                        "bg-blue-50 text-blue-700 border-blue-200"
                      )}>
                        {customer.status.charAt(0).toUpperCase() + customer.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {format(new Date(customer.createdAt), 'MMM d, yyyy')}
                    </td>
                    <td className="px-6 py-4 text-right relative">
                      <button
                        onClick={() => setActionDropdown(actionDropdown === customer.id ? null : customer.id)}
                        className="text-slate-400 hover:text-slate-700 p-1.5 rounded-md hover:bg-slate-100 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <MoreHorizontal className="w-5 h-5" />
                      </button>
                      {actionDropdown === customer.id && (
                        <div className="absolute right-4 top-12 w-32 bg-white border border-slate-200 rounded-lg shadow-lg z-10 py-1">
                          <button onClick={() => openEdit(customer)} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">Edit</button>
                          <button onClick={() => { setDeleteTarget(customer); setActionDropdown(null); }} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50">Delete</button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {data && data.total > 10 && (
          <div className="p-4 border-t border-slate-200 flex items-center justify-between bg-slate-50/50">
            <span className="text-sm text-slate-500">
              Showing <span className="font-medium text-slate-700">{(page - 1) * 10 + 1}</span> to <span className="font-medium text-slate-700">{Math.min(page * 10, data.total)}</span> of <span className="font-medium text-slate-700">{data.total}</span> results
            </span>
            <div className="flex space-x-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="btn-secondary px-3 py-1 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >Previous</button>
              <button
                onClick={() => setPage(p => p + 1)}
                disabled={page * 10 >= data.total}
                className="btn-secondary px-3 py-1 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >Next</button>
            </div>
          </div>
        )}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Customer' : 'Add Customer'}>
        {formError && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">{formError}</div>}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#191b23] mb-1">Name *</label>
            <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="input-field" placeholder="Customer name" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#191b23] mb-1">Email</label>
              <input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="input-field" placeholder="email@example.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#191b23] mb-1">Phone</label>
              <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="input-field" placeholder="+91 98765 43210" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#191b23] mb-1">Company</label>
              <input value={form.company} onChange={e => setForm({ ...form, company: e.target.value })} className="input-field" placeholder="Company name" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#191b23] mb-1">Sector</label>
              <select value={form.sector} onChange={e => setForm({ ...form, sector: e.target.value as any })} className="input-field">
                {SECTORS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#191b23] mb-1">Address</label>
            <input value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} className="input-field" placeholder="Address" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#191b23] mb-1">Status</label>
              <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value as any })} className="input-field">
                {CUSTOMER_STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#191b23] mb-1">Notes</label>
            <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} className="input-field h-20 resize-none" placeholder="Optional notes..." />
          </div>
          <div className="flex justify-end space-x-3 pt-2">
            <button onClick={() => setModalOpen(false)} className="btn-secondary text-sm">Cancel</button>
            <button onClick={handleSave} disabled={saving} className="btn-primary text-sm">{saving ? 'Saving...' : editing ? 'Update Customer' : 'Create Customer'}</button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        title="Delete Customer"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
      />
    </div>
  );
};
