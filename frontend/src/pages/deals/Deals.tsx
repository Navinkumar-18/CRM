import { useState } from 'react';
import { Plus, Briefcase, IndianRupee, Calendar } from 'lucide-react';
import { cn } from '../../utils/cn';
import { format } from 'date-fns';
import { Modal } from '../../components/ui/Modal';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { RecordDetailDrawer } from '../../components/common/RecordDetailDrawer';
import { useDealsApi } from '../../hooks/useApi';
import type { Deal } from '../../types';

const DEAL_STAGES = [
  { value: 'prospecting', label: 'Prospecting', color: 'bg-blue-100 text-blue-800', barColor: 'bg-blue-500' },
  { value: 'qualification', label: 'Qualification', color: 'bg-purple-100 text-purple-800', barColor: 'bg-purple-500' },
  { value: 'proposal', label: 'Proposal', color: 'bg-yellow-100 text-yellow-800', barColor: 'bg-yellow-500' },
  { value: 'negotiation', label: 'Negotiation', color: 'bg-orange-100 text-orange-800', barColor: 'bg-orange-500' },
  { value: 'closed_won', label: 'Closed Won', color: 'bg-green-100 text-green-800', barColor: 'bg-green-500' },
  { value: 'closed_lost', label: 'Closed Lost', color: 'bg-red-100 text-red-800', barColor: 'bg-red-500' },
] as const;

const emptyDeal = {
  title: '', value: 0, stage: 'prospecting' as Deal['stage'],
  probability: 10, expected_close_dt: '', lost_reason: '',
};

const STAGE_PROBABILITIES: Record<string, number> = {
  prospecting: 10,
  qualification: 25,
  proposal: 50,
  negotiation: 75,
  closed_won: 100,
  closed_lost: 0,
};

export const Deals = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Deal | null>(null);
  const [form, setForm] = useState(emptyDeal);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Deal | null>(null);
  const [formError, setFormError] = useState('');

  // Drag and Drop state
  const [draggedDeal, setDraggedDeal] = useState<Deal | null>(null);
  const [dragOverStage, setDragOverStage] = useState<string | null>(null);
  const [updatingDeals, setUpdatingDeals] = useState<Record<string, boolean>>({});

  // Drawer state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedDealForDrawer, setSelectedDealForDrawer] = useState<Deal | null>(null);

  const { useList, useCreate, useUpdate, useDelete } = useDealsApi();
  const { data: deals, isLoading } = useList({ limit: 200 });
  const selectedDeal = (deals?.data as Deal[])?.find(d => d.id === selectedDealForDrawer?.id) || selectedDealForDrawer;
  const createMutation = useCreate();
  const updateMutation = useUpdate();
  const deleteMutation = useDelete();

  const openCreate = () => {
    setEditing(null);
    setForm(emptyDeal);
    setFormError('');
    setModalOpen(true);
  };

  const openEdit = (deal: Deal) => {
    setEditing(deal);
    setForm({
      title: deal.title,
      value: deal.value || 0,
      stage: deal.stage,
      probability: deal.probability || 0,
      expected_close_dt: deal.expectedCloseDt ? format(new Date(deal.expectedCloseDt), 'yyyy-MM-dd') : '',
      lost_reason: deal.lostReason || '',
    });
    setFormError('');
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.title.trim()) { setFormError('Deal title is required'); return; }
    setSaving(true);
    setFormError('');
    try {
      const payload: Partial<Deal> & { expected_close_dt?: string; lost_reason?: string } = { ...form };
      if (!payload.expected_close_dt) delete payload.expected_close_dt;
      if (!payload.lost_reason) delete payload.lost_reason;
      if (editing) {
        await updateMutation.mutateAsync({ id: editing.id, data: payload as unknown as Partial<Deal> });
      } else {
        await createMutation.mutateAsync(payload as unknown as Partial<Deal>);
      }
      setModalOpen(false);
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } }; message?: string };
      setFormError(error?.response?.data?.message || error?.message || 'Failed to save deal');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      setDeleteTarget(null);
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } }; message?: string };
      alert(error?.response?.data?.message || error?.message || 'Failed to delete deal');
    }
  };

  const handleDrop = async (e: React.DragEvent, stageValue: Deal['stage']) => {
    e.preventDefault();
    setDragOverStage(null);
    if (!draggedDeal || draggedDeal.stage === stageValue) return;

    const dealId = draggedDeal.id;
    setUpdatingDeals(prev => ({ ...prev, [dealId]: true }));
    try {
      const defaultProb = STAGE_PROBABILITIES[stageValue] ?? 50;
      await updateMutation.mutateAsync({
        id: dealId,
        data: {
          stage: stageValue,
          probability: defaultProb,
        } as Partial<Deal>,
      });
    } catch (err) {
      console.error('Failed to update deal stage:', err);
    } finally {
      setUpdatingDeals(prev => {
        const copy = { ...prev };
        delete copy[dealId];
        return copy;
      });
      setDraggedDeal(null);
    }
  };

  const getDealsByStage = (stage: string) => {
    return (deals?.data as Deal[])?.filter((deal: Deal) => deal.stage === stage) || [];
  };

  const formatValue = (value: number) => {
    if (value >= 10000000) return `₹${(value / 10000000).toFixed(2)} Cr`;
    if (value >= 100000) return `₹${(value / 100000).toFixed(2)} L`;
    if (value >= 1000) return `₹${(value / 1000).toFixed(1)}K`;
    return `₹${value.toLocaleString('en-IN')}`;
  };

  return (
    <div className="flex min-h-[calc(100vh-120px)] flex-col space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-[#191b23]">Deals Pipeline</h1>
          <p className="text-[#565e74]">Track deals across stages from prospecting to close.</p>
        </div>
        <button onClick={openCreate} className="btn-primary flex w-full items-center justify-center shrink-0 sm:w-auto">
          <Plus className="w-4 h-4 mr-2" />
          Add Deal
        </button>
      </div>

      <div className="flex-1 overflow-x-auto pb-2 sm:pb-4">
        <div className="flex h-full min-w-max space-x-4">
          {isLoading ? (
            <div className="flex space-x-4 w-full">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="w-72 h-full bg-slate-50 rounded-xl animate-pulse"></div>
              ))}
            </div>
          ) : (
            DEAL_STAGES.map((stage) => {
              const stageDeals = getDealsByStage(stage.value);
              const stageTotal = stageDeals.reduce((sum, d) => sum + (d.value || 0), 0);

              return (
                <div
                  key={stage.value}
                  onDragOver={(e) => {
                    e.preventDefault();
                    if (dragOverStage !== stage.value) {
                      setDragOverStage(stage.value);
                    }
                  }}
                  onDragLeave={() => {
                    if (dragOverStage === stage.value) {
                      setDragOverStage(null);
                    }
                  }}
                  onDrop={(e) => handleDrop(e, stage.value)}
                  className={cn(
                    "w-[85vw] max-w-72 flex flex-col bg-[#f8fafc]/50 border rounded-xl shrink-0 sm:w-72 transition-colors duration-200",
                    dragOverStage === stage.value ? "border-blue-500 bg-blue-50/30" : "border-[#E2E8F0]"
                  )}
                >
                  <div className="p-4 border-b border-[#E2E8F0] shrink-0">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold text-[#191b23] text-sm">{stage.label}</h3>
                        <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", stage.color)}>
                          {stageDeals.length}
                        </span>
                      </div>
                    </div>
                    <div className="text-xs text-slate-500 font-medium">
                      {formatValue(stageTotal)} total
                    </div>
                  </div>

                  <div className="flex-1 p-3 overflow-y-auto space-y-3 custom-scrollbar">
                    {stageDeals.map((deal: Deal) => {
                      const isUpdating = updatingDeals[deal.id];
                      return (
                        <div
                          key={deal.id}
                          draggable
                          onDragStart={(e) => {
                            setDraggedDeal(deal);
                            e.dataTransfer.setData('text/plain', deal.id);
                          }}
                          onDragEnd={() => {
                            setDraggedDeal(null);
                            setDragOverStage(null);
                          }}
                          onClick={() => {
                            setSelectedDealForDrawer(deal);
                            setDrawerOpen(true);
                          }}
                          className={cn(
                            "bg-white border rounded-xl p-4 shadow-sm hover:shadow-md transition-all cursor-pointer group relative",
                            isUpdating ? "opacity-50 pointer-events-none" : "border-[#E2E8F0]",
                            draggedDeal?.id === deal.id && "opacity-30 border-dashed border-blue-400"
                          )}
                        >
                          {isUpdating && (
                            <div className="absolute inset-0 flex items-center justify-center bg-white/40 rounded-xl">
                              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                            </div>
                          )}
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-semibold text-[#191b23] text-sm truncate pr-2">{deal.title}</h4>
                          </div>

                          <div className="flex items-center text-emerald-700 bg-emerald-50 rounded-lg px-2.5 py-1.5 mb-3">
                            <IndianRupee className="w-4 h-4 mr-1" />
                            <span className="font-bold text-sm">{formatValue(deal.value || 0)}</span>
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-xs text-slate-500">
                              <span>Probability</span>
                              <span className="font-medium text-slate-700">{deal.probability || 0}%</span>
                            </div>
                            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div className={cn("h-full rounded-full transition-all", stage.barColor)} style={{ width: `${deal.probability || 0}%` }} />
                            </div>
                          </div>

                          {deal.expectedCloseDt && (
                            <div className="flex items-center mt-3 pt-2 border-t border-slate-100 text-xs text-slate-500">
                              <Calendar className="w-3 h-3 mr-1" />
                              <span>Close: {format(new Date(deal.expectedCloseDt), 'MMM d, yyyy')}</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                    {stageDeals.length === 0 && (
                      <div className="h-28 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center text-sm text-slate-400 bg-slate-50/30">
                        <Briefcase className="w-5 h-5 mb-1 opacity-50" />
                        <span>No deals</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Deal' : 'Add Deal'}>
        {formError && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">{formError}</div>}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#191b23] mb-1">Deal Title *</label>
            <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="input-field" placeholder="Deal title" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#191b23] mb-1">Value (₹)</label>
              <input type="number" min={0} value={form.value} onChange={e => setForm({ ...form, value: Number(e.target.value) })} className="input-field" placeholder="0" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#191b23] mb-1">Stage</label>
              <select value={form.stage} onChange={e => setForm({ ...form, stage: e.target.value as Deal['stage'] })} className="input-field">
                {DEAL_STAGES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#191b23] mb-1">Probability (%)</label>
              <input type="number" min={0} max={100} value={form.probability} onChange={e => setForm({ ...form, probability: Number(e.target.value) })} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#191b23] mb-1">Expected Close Date</label>
              <input type="date" value={form.expected_close_dt} onChange={e => setForm({ ...form, expected_close_dt: e.target.value })} className="input-field" />
            </div>
          </div>
          {(form.stage === 'closed_lost') && (
            <div>
              <label className="block text-sm font-medium text-[#191b23] mb-1">Lost Reason</label>
              <textarea value={form.lost_reason} onChange={e => setForm({ ...form, lost_reason: e.target.value })} className="input-field h-20 resize-none" placeholder="Why was this deal lost?" />
            </div>
          )}
          <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
            {editing && (
              <button onClick={() => { setDeleteTarget(editing); setModalOpen(false); }} className="text-left text-sm text-red-600 hover:text-red-700 font-medium">Delete deal</button>
            )}
            <div className="flex flex-col-reverse gap-3 sm:ml-auto sm:flex-row">
              <button onClick={() => setModalOpen(false)} className="btn-secondary text-sm">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="btn-primary text-sm">{saving ? 'Saving...' : editing ? 'Update Deal' : 'Create Deal'}</button>
            </div>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        title="Delete Deal"
        message={`Are you sure you want to delete "${deleteTarget?.title}"? This action cannot be undone.`}
      />

      {selectedDeal && (
        <RecordDetailDrawer
          open={drawerOpen}
          onClose={() => {
            setDrawerOpen(false);
            setSelectedDealForDrawer(null);
          }}
          recordId={selectedDeal.id}
          recordType="deal"
          recordName={selectedDeal.title}
          additionalDetails={
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-slate-500 text-xs">Value</p>
                <p className="font-semibold text-emerald-700 bg-emerald-50 rounded-lg px-2 py-0.5 mt-0.5 inline-block">
                  {formatValue(selectedDeal.value || 0)}
                </p>
              </div>
              <div>
                <p className="text-slate-500 text-xs">Probability</p>
                <p className="font-semibold text-slate-800 mt-0.5">{selectedDeal.probability || 0}%</p>
              </div>
              <div>
                <p className="text-slate-500 text-xs">Stage</p>
                <span className={cn(
                  "px-2 py-0.5 rounded-full text-xs font-medium inline-block mt-0.5 capitalize",
                  DEAL_STAGES.find(s => s.value === selectedDeal.stage)?.color
                )}>
                  {DEAL_STAGES.find(s => s.value === selectedDeal.stage)?.label || selectedDeal.stage}
                </span>
              </div>
              {selectedDeal.expectedCloseDt && (
                <div>
                  <p className="text-slate-500 text-xs">Expected Close</p>
                  <p className="font-medium text-slate-800 mt-0.5">
                    {format(new Date(selectedDeal.expectedCloseDt), 'MMM d, yyyy')}
                  </p>
                </div>
              )}
              <div className="col-span-2 pt-2 border-t border-slate-100 flex justify-end">
                <button
                  onClick={() => {
                    openEdit(selectedDeal);
                  }}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline"
                >
                  Edit Deal Details
                </button>
              </div>
            </div>
          }
        />
      )}
    </div>
  );
};
