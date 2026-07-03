import { useState } from 'react';
import { useCustomersApi } from '../../hooks/useApi';
import type { Customer } from '../../types';
import { Users, Search, Mail, Phone, MapPin, MessageSquare, Building2, AlertCircle } from 'lucide-react';
import { cn } from '../../utils/cn';
import { Modal } from '../../components/ui/Modal';

export const MyCustomers = () => {
  const [search, setSearch] = useState('');
  const [sectorFilter, setSectorFilter] = useState('ALL');

  // Note modal
  const [noteModalOpen, setNoteModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [newNoteText, setNewNoteText] = useState('');

  const { useList, useUpdate } = useCustomersApi();
  const { data: custData, isLoading } = useList({ page: 1, limit: 100, search: search || undefined, sector: sectorFilter !== 'ALL' ? sectorFilter : undefined });
  const updateMutation = useUpdate();

  const customers: Customer[] = (custData?.data as Customer[]) || [];

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer || !newNoteText.trim()) return;
    const existingNotes = selectedCustomer.notes || '';
    const newNotes = `${existingNotes}\n[${new Date().toLocaleDateString()}] ${newNoteText.trim()}`.trim();
    try {
      await updateMutation.mutateAsync({ id: selectedCustomer.id, data: { notes: newNotes } as any });
      setNewNoteText('');
      setNoteModalOpen(false);
    } catch (err: any) {
      alert(err?.response?.data?.message || err?.message || 'Failed to add note');
    }
  };

  const filteredCustomers = customers.filter((c) => {
    const matchesSearch = 
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.company && c.company.toLowerCase().includes(search.toLowerCase())) ||
      (c.email || '').toLowerCase().includes(search.toLowerCase());
    const matchesSector = !sectorFilter || c.sector === sectorFilter;
    return matchesSearch && matchesSector;
  });

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
            <Users className="w-6 h-6" />
          </span>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">My Managed Customers</h1>
            <p className="text-sm text-slate-500">
              Oversee your active client accounts, review contract notes, and log relationship check-ins.
            </p>
          </div>
        </div>

        <div className="bg-indigo-50 px-4 py-2.5 rounded-xl border border-indigo-100 text-xs font-bold text-indigo-700">
          🏢 {customers.length} Accounts Under Management
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by customer name, company, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto">
          {['ALL', 'general', 'school', 'hospital', 'ecommerce', 'manufacturing', 'real_estate'].map((sec) => (
            <button
              key={sec}
              onClick={() => setSectorFilter(sec)}
              className={cn(
                "px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all capitalize whitespace-nowrap",
                sectorFilter === sec 
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20" 
                  : "bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100"
              )}
            >
              {sec === 'ALL' ? 'All Sectors' : sec.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Customers Grid */}
      {isLoading ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="text-sm text-slate-500 mt-3">Loading your customers...</p>
        </div>
      ) : filteredCustomers.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center text-slate-400">
          <AlertCircle className="w-10 h-10 mx-auto mb-3 text-slate-300" />
          <h3 className="text-base font-bold text-slate-700">No Customers Found</h3>
          <p className="text-xs mt-1">No assigned accounts match your current search or sector filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredCustomers.map((cust) => (
            <div key={cust.id} className="bg-white rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all p-6 flex flex-col justify-between group">
              <div>
                <div className="flex justify-between items-start gap-3 mb-3">
                  <div className="flex items-start space-x-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold text-base shrink-0 shadow-md shadow-indigo-500/20">
                      {cust.company?.charAt(0) || cust.name?.charAt(0) || 'C'}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                        {cust.name}
                      </h3>
                      <p className="text-xs font-extrabold text-indigo-600 flex items-center gap-1 mt-0.5">
                        <Building2 className="w-3.5 h-3.5" /> {cust.company || 'Private Client'}
                      </p>
                    </div>
                  </div>

                  <span className={cn(
                    "px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider shrink-0",
                    cust.status === 'active' ? "bg-emerald-100 text-emerald-800 border border-emerald-200" :
                    cust.status === 'prospect' ? "bg-blue-100 text-blue-800 border border-blue-200" : "bg-slate-100 text-slate-600"
                  )}>
                    {cust.status}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-slate-600 mt-5 pt-4 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <a href={`mailto:${cust.email}`} className="hover:text-indigo-600 truncate">{cust.email}</a>
                  </div>
                  {cust.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <a href={`tel:${cust.phone}`} className="hover:text-indigo-600">{cust.phone}</a>
                    </div>
                  )}
                  {cust.address && (
                    <div className="flex items-center gap-2 sm:col-span-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate text-slate-500">{cust.address}</span>
                    </div>
                  )}
                </div>

                {cust.notes && (
                  <div className="mt-4 p-3.5 rounded-2xl bg-slate-50 border border-slate-100/80 text-xs text-slate-700 italic">
                    <p className="line-clamp-3">"{cust.notes}"</p>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-100 text-xs">
                <span className="text-slate-400 text-[11px]">Sector: <strong className="text-slate-600 capitalize">{cust.sector || 'General'}</strong></span>
                
                <button
                  onClick={() => {
                    setSelectedCustomer(cust);
                    setNoteModalOpen(true);
                  }}
                  className="px-3.5 py-1.5 rounded-xl font-semibold bg-indigo-50 text-indigo-700 hover:bg-indigo-600 hover:text-white transition-colors flex items-center gap-1.5"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  Log Check-In
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
        title={`Log Account Check-In: ${selectedCustomer?.company || selectedCustomer?.name}`}
      >
        <form onSubmit={handleAddNote} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Check-in Notes / Account Status Update *</label>
            <textarea
              required
              value={newNoteText}
              onChange={(e) => setNewNoteText(e.target.value)}
              placeholder="e.g. Completed quarterly check-in call. Client is satisfied with system performance and requested additional training seats for new staff..."
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
              className="btn-primary px-5 py-2 text-sm font-semibold shadow-md shadow-indigo-500/20"
            >
              Save Account Note
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
