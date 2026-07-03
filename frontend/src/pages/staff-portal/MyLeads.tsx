import { useState } from 'react';
import { useLeadsApi } from '../../hooks/useApi';
import type { Lead } from '../../types';
import { Target, Search, Mail, Phone, MessageSquare, AlertCircle } from 'lucide-react';
import { cn } from '../../utils/cn';
import { Modal } from '../../components/ui/Modal';

export const MyLeads = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Note modal
  const [noteModalOpen, setNoteModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [newNoteText, setNewNoteText] = useState('');

  const { useList, useUpdate } = useLeadsApi();
  const { data: leadsData, isLoading } = useList({ page: 1, limit: 100, search: search || undefined });
  const updateMutation = useUpdate();

  const leads: Lead[] = (leadsData?.data as Lead[]) || [];

  const handleStatusChange = async (leadId: string, status: string) => {
    try {
      await updateMutation.mutateAsync({ id: leadId, data: { status } as Partial<Lead> });
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } }; message?: string };
      alert(error?.response?.data?.message || error?.message || 'Failed to update lead status');
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLead || !newNoteText.trim()) return;
    const existingNotes = selectedLead.notes || '';
    const newNotes = `${existingNotes}\n[${new Date().toLocaleDateString()}] ${newNoteText.trim()}`.trim();
    try {
      await updateMutation.mutateAsync({ id: selectedLead.id, data: { notes: newNotes } as Partial<Lead> });
      setNewNoteText('');
      setNoteModalOpen(false);
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } }; message?: string };
      alert(error?.response?.data?.message || error?.message || 'Failed to add note');
    }
  };

  const filteredLeads = leads.filter((l) => {
    const matchesSearch = 
      l.name.toLowerCase().includes(search.toLowerCase()) ||
      (l.email || '').toLowerCase().includes(search.toLowerCase()) ||
      (l.sector && l.sector.toLowerCase().includes(search.toLowerCase()));
    const matchesStatus = statusFilter === 'ALL' || l.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const wonCount = leads.filter(l => l.status === 'won').length;
  const activeCount = leads.filter(l => l.status !== 'won' && l.status !== 'lost').length;

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
            <Target className="w-6 h-6" />
          </span>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">My Assigned Leads</h1>
            <p className="text-sm text-slate-500">
              Manage your sales prospects, update pipeline stage, and record customer interaction notes.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-blue-50 px-4 py-2 rounded-xl border border-blue-100 text-xs font-bold text-blue-700">
            📊 {activeCount} Active Prospects
          </div>
          <div className="bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-100 text-xs font-bold text-emerald-700">
            🏆 {wonCount} Closed Won
          </div>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by company, email, or sector..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto">
          {['ALL', 'new', 'contacted', 'qualified', 'won', 'lost'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={cn(
                "px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all capitalize whitespace-nowrap",
                statusFilter === st 
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/20" 
                  : "bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100"
              )}
            >
              {st === 'ALL' ? 'All Leads' : st}
            </button>
          ))}
        </div>
      </div>

      {/* Leads Grid */}
      {isLoading ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-sm text-slate-500 mt-3">Loading your leads...</p>
        </div>
      ) : filteredLeads.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center text-slate-400">
          <AlertCircle className="w-10 h-10 mx-auto mb-3 text-slate-300" />
          <h3 className="text-base font-bold text-slate-700">No Leads Found</h3>
          <p className="text-xs mt-1">No assigned prospects match your current search or status filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredLeads.map((lead) => (
            <div key={lead.id} className="bg-white rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all p-6 flex flex-col justify-between group">
              <div>
                <div className="flex justify-between items-start gap-3 mb-3">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                      {lead.sector || 'General'}
                    </span>
                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                      {lead.name}
                    </h3>
                  </div>

                  <select
                    value={lead.status}
                    onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                    className={cn(
                      "text-xs font-extrabold px-3 py-1 rounded-xl border-0 focus:ring-2 focus:ring-blue-500 transition-colors shrink-0 cursor-pointer shadow-sm",
                      lead.status === 'won' ? "bg-emerald-100 text-emerald-800" :
                      lead.status === 'qualified' ? "bg-blue-100 text-blue-800" :
                      lead.status === 'contacted' ? "bg-amber-100 text-amber-800" :
                      lead.status === 'lost' ? "bg-red-100 text-red-800" : "bg-slate-100 text-slate-700"
                    )}
                  >
                    <option value="new">New</option>
                    <option value="contacted">Contacted</option>
                    <option value="qualified">Qualified</option>
                    <option value="won">Won (Closed) 🎉</option>
                    <option value="lost">Lost</option>
                  </select>
                </div>

                <div className="space-y-2 text-xs text-slate-600 mt-4 pt-4 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <a href={`mailto:${lead.email}`} className="hover:text-blue-600 truncate">{lead.email}</a>
                  </div>
                  {lead.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <a href={`tel:${lead.phone}`} className="hover:text-blue-600">{lead.phone}</a>
                    </div>
                  )}
                </div>

                {lead.notes && (
                  <div className="mt-4 p-3 rounded-2xl bg-slate-50 border border-slate-100/80 text-xs text-slate-700 italic relative">
                    <p className="line-clamp-3">"{lead.notes}"</p>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-100 text-xs">
                <span className="text-slate-400 text-[11px]">Source: <strong className="text-slate-600">{lead.source}</strong></span>
                
                <button
                  onClick={() => {
                    setSelectedLead(lead);
                    setNoteModalOpen(true);
                  }}
                  className="px-3 py-1.5 rounded-xl font-semibold bg-indigo-50 text-indigo-700 hover:bg-indigo-600 hover:text-white transition-colors flex items-center gap-1.5"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  Add Note
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Note Modal */}
      <Modal
        open={noteModalOpen}
        onClose={() => setNoteModalOpen(false)}
        title={`Add Interaction Note: ${selectedLead?.name}`}
      >
        <form onSubmit={handleAddNote} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Follow-up Summary / Customer Interaction *</label>
            <textarea
              required
              value={newNoteText}
              onChange={(e) => setNewNoteText(e.target.value)}
              placeholder="e.g. Conducted 30-minute discovery call. Client is interested in annual contract starting Q3..."
              className="input-field h-28 resize-none"
            />
          </div>
          <div className="flex justify-end space-x-3 pt-3">
            <button
              type="button"
              onClick={() => setNoteModalOpen(false)}
              className="btn-secondary px-4 py-2 text-sm font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary px-5 py-2 text-sm font-semibold shadow-md shadow-blue-500/20"
            >
              Save Interaction Note
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
