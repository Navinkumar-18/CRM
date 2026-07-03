import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api/axios';
import type { ApiResponse, PaginatedData } from '../../types';
import { 
  X, 
  MessageSquare, 
  Activity, 
  Plus, 
  Clock
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { format } from 'date-fns';

interface RecordDetailDrawerProps {
  open: boolean;
  onClose: () => void;
  recordId: string;
  recordType: 'lead' | 'company' | 'deal' | 'customer';
  recordName: string;
  additionalDetails?: React.ReactNode;
}

interface Note {
  id: string;
  body: string;
  createdAt: string;
  author?: {
    name: string;
  };
}

interface ActivityLog {
  id: string;
  type: string;
  description: string;
  createdAt: string;
  user?: {
    name: string;
  };
}

type TimelineItem = 
  | { type: 'note'; data: Note; timestamp: Date }
  | { type: 'activity'; data: ActivityLog; timestamp: Date };

export const RecordDetailDrawer = ({
  open,
  onClose,
  recordId,
  recordType,
  recordName,
  additionalDetails,
}: RecordDetailDrawerProps) => {
  const queryClient = useQueryClient();
  const [newNote, setNewNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Map react-query keys and endpoints
  const queryParamName = `${recordType}_id`;

  // Fetch Notes
  const { data: notesResponse, isLoading: notesLoading } = useQuery<PaginatedData<Note>>({
    queryKey: ['notes', recordType, recordId],
    queryFn: async () => {
      const res = await api.get('/notes', {
        params: { [queryParamName]: recordId, limit: 100 }
      }) as ApiResponse<PaginatedData<Note>>;
      return res.data;
    },
    enabled: open && !!recordId,
  });

  // Fetch Activities
  const { data: activitiesResponse, isLoading: activitiesLoading } = useQuery<ActivityLog[]>({
    queryKey: ['activities', recordType, recordId],
    queryFn: async () => {
      const res = await api.get('/activities', {
        params: { [queryParamName]: recordId, limit: 100 }
      }) as ApiResponse<ActivityLog[]>;
      return res.data;
    },
    enabled: open && !!recordId,
  });

  // Add Note Mutation
  const addNoteMutation = useMutation({
    mutationFn: async (body: string) => {
      const payload = {
        body,
        [queryParamName]: recordId,
      };
      await api.post('/notes', payload);
    },
    onSuccess: () => {
      setNewNote('');
      queryClient.invalidateQueries({ queryKey: ['notes', recordType, recordId] });
      queryClient.invalidateQueries({ queryKey: ['activities', recordType, recordId] });
    }
  });

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    setSubmitting(true);
    try {
      await addNoteMutation.mutateAsync(newNote);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  // Combine & Sort Timeline Items
  const notesList: Note[] = notesResponse?.data || [];
  const activitiesList: ActivityLog[] = activitiesResponse || [];

  const timelineItems: TimelineItem[] = [
    ...notesList.map((n): TimelineItem => ({ type: 'note', data: n, timestamp: new Date(n.createdAt) })),
    ...activitiesList.map((a): TimelineItem => ({ type: 'activity', data: a, timestamp: new Date(a.createdAt) })),
  ].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  const isLoading = notesLoading || activitiesLoading;

  return (
    <>
      {/* Backdrop */}
      {open && (
        <button
          type="button"
          aria-label="Close drawer"
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      {/* Slide-over container */}
      <div
        className={cn(
          "fixed inset-y-0 right-0 z-50 flex w-full max-w-lg flex-col bg-white shadow-2xl transition-transform duration-300 ease-in-out transform",
          open ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white px-6 py-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className={cn(
                "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold uppercase tracking-wider",
                recordType === 'lead' ? "bg-violet-50 text-violet-700 border border-violet-200" :
                recordType === 'company' ? "bg-blue-50 text-blue-700 border border-blue-200" :
                recordType === 'deal' ? "bg-emerald-50 text-emerald-700 border border-emerald-200" :
                "bg-slate-50 text-slate-700 border border-slate-200"
              )}>
                {recordType}
              </span>
            </div>
            <h2 className="mt-1.5 text-lg font-bold text-slate-900 truncate" title={recordName}>
              {recordName}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Custom Info / Metrics section */}
          {additionalDetails && (
            <div className="bg-slate-50/50 border border-slate-100 rounded-xl p-4">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Overview</h3>
              {additionalDetails}
            </div>
          )}

          {/* Activity / Notes Form */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Interaction & Timeline</h3>
            <form onSubmit={handleAddNote} className="relative">
              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Leave a comment or take a meeting note..."
                className="w-full min-h-[90px] rounded-xl border border-slate-200 p-3 pr-12 text-sm placeholder-slate-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/10 resize-none transition-all"
              />
              <button
                type="submit"
                disabled={submitting || !newNote.trim()}
                className={cn(
                  "absolute right-3 bottom-3 p-1.5 rounded-lg text-white transition-colors",
                  newNote.trim() && !submitting ? "bg-blue-600 hover:bg-blue-700" : "bg-slate-200 cursor-not-allowed"
                )}
              >
                <Plus className="w-4 h-4" />
              </button>
            </form>
          </div>

          {/* Timeline Feed */}
          <div className="relative border-l-2 border-slate-100 pl-6 ml-3.5 space-y-6">
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="animate-pulse flex items-start space-x-3">
                    <div className="w-7 h-7 bg-slate-200 rounded-full shrink-0" />
                    <div className="flex-1 space-y-2 py-1">
                      <div className="h-4 bg-slate-200 rounded w-3/4" />
                      <div className="h-3 bg-slate-100 rounded w-1/4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : timelineItems.length === 0 ? (
              <div className="text-center py-8">
                <Clock className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 text-sm font-medium">Timeline is quiet</p>
                <p className="text-slate-400 text-xs mt-1">Leave the first note above to start logging activity.</p>
              </div>
            ) : (
              timelineItems.map((item, idx) => {
                const isNote = item.type === 'note';
                
                return (
                  <div key={idx} className="relative group">
                    {/* Icon indicator */}
                    <div className={cn(
                      "absolute -left-[35px] top-0 w-6 h-6 rounded-full flex items-center justify-center border",
                      isNote 
                        ? "bg-amber-50 border-amber-200 text-amber-600" 
                        : "bg-blue-50 border-blue-200 text-blue-600"
                    )}>
                      {isNote ? (
                        <MessageSquare className="w-3.5 h-3.5" />
                      ) : (
                        <Activity className="w-3.5 h-3.5" />
                      )}
                    </div>

                    {/* Timeline card body */}
                    <div className="bg-white border border-slate-100 rounded-xl p-3.5 shadow-sm hover:shadow-md transition-shadow group-hover:border-slate-200">
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className="font-semibold text-sm text-slate-800">
                          {isNote ? (item.data.author?.name || 'System') : (item.data.user?.name || 'System')}
                        </span>
                        <span className="text-xs text-slate-400 font-medium">
                          {format(item.timestamp, 'MMM d, yyyy h:mm a')}
                        </span>
                      </div>
                      
                      <p className={cn(
                        "text-sm",
                        isNote ? "text-slate-700 whitespace-pre-wrap font-medium" : "text-slate-500"
                      )}>
                        {isNote ? item.data.body : item.data.description}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </>
  );
};
