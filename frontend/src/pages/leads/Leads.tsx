import { useState } from 'react';
import { Plus, Mail, Phone, Building, Target } from 'lucide-react';
import { cn } from '../../utils/cn';
import { format } from 'date-fns';
import { Modal } from '../../components/ui/Modal';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { useLeadsApi } from '../../hooks/useApi';
import { SECTORS, LEAD_STAGES, getSectorColor } from '../../constants';
import type { Lead } from '../../types';

const emptyLead = { name: '', email: '', phone: '', source: '', status: 'new' as Lead['status'], sector: 'general' as Lead['sector'], notes: '' };

export const Leads = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Lead | null>(null);
  const [form, setForm] = useState(emptyLead);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Lead | null>(null);
  const [formError, setFormError] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showStatusFilter, setShowStatusFilter] = useState(false);

  const { useList, useCreate, useUpdate, useDelete } = useLeadsApi();
  const { data: leads, isLoading } = useList({ limit: 100, sector: statusFilter || undefined });
  const createMutation = useCreate();
  const updateMutation = useUpdate();
  const deleteMutation = useDelete();

  const openCreate = () => {
    setEditing(null);
    setForm(emptyLead);
    setFormError('');
    setModalOpen(true);
  };

  const openEdit = (lead: Lead) => {
    setEditing(lead);
    setForm({ name: lead.name, email: lead.email || '', phone: lead.phone || '', source: lead.source || '', status: lead.status, sector: lead.sector, notes: lead.notes || '' });
    setFormError('');
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) { setFormError('Name is required'); return; }
    if (form.email && !form.email.endsWith('@gmail.com')) { setFormError('Email must be a Gmail address (@gmail.com)'); return; }
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
      setFormError(err?.response?.data?.message || err?.message || 'Failed to save lead');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      setDeleteTarget(null);
    } catch { /* silent */ }
  };

  const getLeadsByStatus = (status: string) => {
    return (leads?.data as Lead[])?.filter((lead: Lead) => lead.status === status) || [];
  };

  return (
    <div className="flex min-h-[calc(100vh-120px)] flex-col space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-[#191b23]">Lead Pipeline</h1>
          <p className="text-[#565e74]">Track and manage prospective customers through the sales funnel.</p>
        </div>
        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center sm:space-x-3 sm:gap-0">
          <div className="relative">
            <button
              onClick={() => setShowStatusFilter(!showStatusFilter)}
              className={cn("btn-secondary flex w-full items-center justify-center text-sm sm:w-auto", statusFilter && "border-[#2563eb] text-[#2563eb]")}
            >
              <Building className="w-4 h-4 mr-2" />
              {statusFilter ? SECTORS.find(s => s.value === statusFilter)?.label : 'Sector'}
            </button>
            {showStatusFilter && (
              <div className="absolute top-full right-0 mt-1 w-44 bg-white border border-[#E2E8F0] rounded-lg shadow-lg z-10 py-1">
                <button onClick={() => { setStatusFilter(''); setShowStatusFilter(false); }} className="w-full text-left px-4 py-2 text-sm hover:bg-[#f3f3fe]">All Sectors</button>
                {SECTORS.map(s => (
                  <button key={s.value} onClick={() => { setStatusFilter(s.value); setShowStatusFilter(false); }} className={cn("w-full text-left px-4 py-2 text-sm hover:bg-[#f3f3fe]", statusFilter === s.value && "bg-[#f3f3fe] text-[#2563eb]")}>
                    {s.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button onClick={openCreate} className="btn-primary flex w-full items-center justify-center shrink-0 sm:w-auto">
            <Plus className="w-4 h-4 mr-2" />
            Add Lead
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-x-auto pb-2 sm:pb-4">
        <div className="flex h-full min-w-max space-x-4">
          {isLoading ? (
            <div className="flex space-x-4 w-full">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="w-80 h-full bg-slate-50 rounded-xl animate-pulse"></div>
              ))}
            </div>
          ) : (
            LEAD_STAGES.map((stage) => {
              const stageLeads = getLeadsByStatus(stage.value);

              return (
                <div key={stage.value} className="w-[85vw] max-w-80 flex flex-col bg-[#f8fafc]/50 border border-[#E2E8F0] rounded-xl shrink-0 sm:w-80">
                  <div className="p-4 border-b border-[#E2E8F0] flex items-center justify-between shrink-0">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold text-[#191b23]">{stage.label}</h3>
                      <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", stage.color)}>
                        {stageLeads.length}
                      </span>
                    </div>
                  </div>

                  <div className="flex-1 p-3 overflow-y-auto space-y-3 custom-scrollbar">
                    {stageLeads.map((lead: Lead) => (
                      <div
                        key={lead.id}
                        onClick={() => openEdit(lead)}
                        className="bg-white border border-[#E2E8F0] rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-semibold text-[#191b23] truncate pr-2">{lead.name}</h4>
                          <span className="text-xs text-[#737686] shrink-0">{format(new Date(lead.createdAt), 'MMM d')}</span>
                        </div>

                        <div className="space-y-1.5 mb-3">
                          {lead.email && (
                            <div className="flex items-center text-sm text-[#565e74]">
                              <Mail className="w-3.5 h-3.5 mr-2 shrink-0 text-[#737686]" />
                              <span className="truncate">{lead.email}</span>
                            </div>
                          )}
                          {lead.phone && (
                            <div className="flex items-center text-sm text-[#565e74]">
                              <Phone className="w-3.5 h-3.5 mr-2 shrink-0 text-[#737686]" />
                              <span className="truncate">{lead.phone}</span>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
                          <div className="flex items-center space-x-2">
                            <div className="w-6 h-6 rounded-full bg-[#dbe1ff] text-[#00174b] flex items-center justify-center text-xs font-bold">
                              {lead.assignedTo?.name?.charAt(0) || '?'}
                            </div>
                            <span className={cn("px-2 py-0.5 rounded text-[10px] font-medium border", getSectorColor(lead.sector))}>
                              {SECTORS.find(s => s.value === lead.sector)?.label || lead.sector}
                            </span>
                          </div>
                          {lead.source && (
                            <span className="text-[10px] font-medium px-2 py-1 bg-slate-100 text-slate-600 rounded">
                              {lead.source}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                    {stageLeads.length === 0 && (
                      <div className="h-28 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center text-sm text-slate-400 bg-slate-50/30">
                        <Target className="w-5 h-5 mb-1 opacity-50" />
                        <span>No leads</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Lead' : 'Add Lead'}>
        {formError && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">{formError}</div>}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#191b23] mb-1">Name *</label>
            <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="input-field" placeholder="Lead name" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#191b23] mb-1">Email</label>
              <input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="input-field" placeholder="email@example.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#191b23] mb-1">Phone</label>
              <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="input-field" placeholder="+1 234 567 890" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#191b23] mb-1">Source</label>
              <select value={form.source} onChange={e => setForm({ ...form, source: e.target.value })} className="input-field">
                <option value="">Select source</option>
                <option value="Website">Website</option>
                <option value="Referral">Referral</option>
                <option value="Cold Call">Cold Call</option>
                <option value="Email">Email</option>
                <option value="Social Media">Social Media</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#191b23] mb-1">Sector</label>
              <select value={form.sector} onChange={e => setForm({ ...form, sector: e.target.value as any })} className="input-field">
                {SECTORS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#191b23] mb-1">Status</label>
              <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value as any })} className="input-field">
                {LEAD_STAGES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#191b23] mb-1">Notes</label>
            <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} className="input-field h-20 resize-none" placeholder="Optional notes..." />
          </div>
          <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
            {editing && (
              <button onClick={() => { setDeleteTarget(editing); setModalOpen(false); }} className="text-left text-sm text-red-600 hover:text-red-700 font-medium">Delete lead</button>
            )}
            <div className="flex flex-col-reverse gap-3 sm:ml-auto sm:flex-row">
              <button onClick={() => setModalOpen(false)} className="btn-secondary text-sm">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="btn-primary text-sm">{saving ? 'Saving...' : editing ? 'Update Lead' : 'Create Lead'}</button>
            </div>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        title="Delete Lead"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
      />
    </div>
  );
};
