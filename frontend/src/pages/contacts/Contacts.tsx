import { useState } from 'react';
import { Plus, Search, MoreHorizontal, Mail, Phone, UserCircle, Building2 } from 'lucide-react';
import { format } from 'date-fns';
import { Modal } from '../../components/ui/Modal';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { useContactsApi } from '../../hooks/useApi';
import type { Contact } from '../../types';

const emptyContact = {
  first_name: '', last_name: '', email: '', phone: '', title: '',
};

export const Contacts = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Contact | null>(null);
  const [form, setForm] = useState(emptyContact);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Contact | null>(null);
  const [actionDropdown, setActionDropdown] = useState<string | null>(null);
  const [formError, setFormError] = useState('');

  const { useList, useCreate, useUpdate, useDelete } = useContactsApi();
  const { data, isLoading } = useList({ page, limit: 10, search });
  const createMutation = useCreate();
  const updateMutation = useUpdate();
  const deleteMutation = useDelete();

  const openCreate = () => {
    setEditing(null);
    setForm(emptyContact);
    setFormError('');
    setModalOpen(true);
  };

  const openEdit = (contact: Contact) => {
    setEditing(contact);
    setForm({
      first_name: contact.firstName || '',
      last_name: contact.lastName || '',
      email: contact.email || '',
      phone: contact.phone || '',
      title: contact.title || '',
    });
    setFormError('');
    setModalOpen(true);
    setActionDropdown(null);
  };

  const handleSave = async () => {
    if (!form.first_name.trim()) { setFormError('First name is required'); return; }
    setSaving(true);
    setFormError('');
    try {
      if (editing) {
        await updateMutation.mutateAsync({ id: editing.id, data: form as any });
      } else {
        await createMutation.mutateAsync(form as any);
      }
      setModalOpen(false);
    } catch (err: any) {
      setFormError(err?.response?.data?.message || err?.message || 'Failed to save contact');
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
      alert(err?.response?.data?.message || err?.message || 'Failed to delete contact');
    }
  };

  const getDisplayName = (contact: Contact) => {
    return [contact.firstName, contact.lastName].filter(Boolean).join(' ') || 'Unnamed';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#191b23]">Contacts</h1>
          <p className="text-[#565e74]">Manage individual contacts and their details.</p>
        </div>
        <button onClick={openCreate} className="btn-primary flex w-full items-center justify-center shrink-0 sm:w-auto">
          <Plus className="w-4 h-4 mr-2" />
          Add Contact
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200/70 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex gap-4 items-center bg-slate-50/50">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search contacts..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50/80 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3.5 font-semibold text-slate-500 uppercase tracking-wider text-xs">Contact</th>
                <th className="px-6 py-3.5 font-semibold text-slate-500 uppercase tracking-wider text-xs">Contact Info</th>
                <th className="px-6 py-3.5 font-semibold text-slate-500 uppercase tracking-wider text-xs">Job Title</th>
                <th className="px-6 py-3.5 font-semibold text-slate-500 uppercase tracking-wider text-xs">Company</th>
                <th className="px-6 py-3.5 font-semibold text-slate-500 uppercase tracking-wider text-xs">Added</th>
                <th className="px-6 py-3.5 font-semibold text-slate-500 uppercase tracking-wider text-xs text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {isLoading ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center"><div className="flex justify-center"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div></div></td></tr>
              ) : data?.data?.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center">
                  <UserCircle className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500 text-sm font-medium">No contacts found</p>
                  <p className="text-slate-400 text-xs mt-1">Add a contact to get started.</p>
                </td></tr>
              ) : (
                (data?.data as Contact[])?.map(contact => (
                  <tr key={contact.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center text-purple-700 font-bold border border-purple-100">
                          {(contact.firstName || '?').charAt(0)}
                        </div>
                        <div className="ml-4">
                          <div className="font-semibold text-slate-900">{getDisplayName(contact)}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col space-y-1">
                        <div className="text-slate-800 flex items-center"><Mail className="w-3.5 h-3.5 mr-1.5 text-slate-400" />{contact.email || '-'}</div>
                        <div className="text-slate-500 flex items-center text-xs"><Phone className="w-3.5 h-3.5 mr-1.5 text-slate-400" />{contact.phone || '-'}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {contact.title || '-'}
                    </td>
                    <td className="px-6 py-4">
                      {contact.company ? (
                        <div className="inline-flex items-center text-[#004ac6] bg-[#f3f3fe] px-2.5 py-1 rounded-md font-medium text-xs">
                          <Building2 className="w-3 h-3 mr-1" />
                          {contact.company.name}
                        </div>
                      ) : (
                        <span className="text-slate-400 text-xs">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {format(new Date(contact.createdAt), 'MMM d, yyyy')}
                    </td>
                    <td className="px-6 py-4 text-right relative">
                      <button
                        onClick={() => setActionDropdown(actionDropdown === contact.id ? null : contact.id)}
                        className="text-slate-400 hover:text-slate-700 p-1.5 rounded-md hover:bg-slate-100 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <MoreHorizontal className="w-5 h-5" />
                      </button>
                      {actionDropdown === contact.id && (
                        <div className="absolute right-4 top-12 w-32 bg-white border border-slate-200 rounded-lg shadow-lg z-10 py-1">
                          <button onClick={() => openEdit(contact)} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">Edit</button>
                          <button onClick={() => { setDeleteTarget(contact); setActionDropdown(null); }} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50">Delete</button>
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
          <div className="p-4 border-t border-slate-200 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between bg-slate-50/50">
            <span className="text-sm text-slate-500">
              Showing <span className="font-medium text-slate-700">{(page - 1) * 10 + 1}</span> to <span className="font-medium text-slate-700">{Math.min(page * 10, data.total)}</span> of <span className="font-medium text-slate-700">{data.total}</span>
            </span>
            <div className="flex gap-2 self-end sm:self-auto">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-secondary px-3 py-1 text-sm disabled:opacity-50 disabled:cursor-not-allowed">Previous</button>
              <button onClick={() => setPage(p => p + 1)} disabled={page * 10 >= data.total} className="btn-secondary px-3 py-1 text-sm disabled:opacity-50 disabled:cursor-not-allowed">Next</button>
            </div>
          </div>
        )}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Contact' : 'Add Contact'}>
        {formError && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">{formError}</div>}
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#191b23] mb-1">First Name *</label>
              <input value={form.first_name} onChange={e => setForm({ ...form, first_name: e.target.value })} className="input-field" placeholder="First name" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#191b23] mb-1">Last Name</label>
              <input value={form.last_name} onChange={e => setForm({ ...form, last_name: e.target.value })} className="input-field" placeholder="Last name" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#191b23] mb-1">Email</label>
              <input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="input-field" placeholder="email@example.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#191b23] mb-1">Phone</label>
              <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="input-field" placeholder="+91 ..." />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#191b23] mb-1">Job Title</label>
            <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="input-field" placeholder="e.g. Sales Manager" />
          </div>
          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
            <button onClick={() => setModalOpen(false)} className="btn-secondary text-sm">Cancel</button>
            <button onClick={handleSave} disabled={saving} className="btn-primary text-sm">{saving ? 'Saving...' : editing ? 'Update Contact' : 'Create Contact'}</button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        title="Delete Contact"
        message={`Are you sure you want to delete "${deleteTarget ? getDisplayName(deleteTarget) : ''}"? This action cannot be undone.`}
      />
    </div>
  );
};
