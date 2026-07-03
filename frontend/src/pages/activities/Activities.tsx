import { useQuery } from '@tanstack/react-query';
import api from '../../api/axios';
import { Activity as ActivityIcon, Clock, CheckCircle2, UserPlus, Target } from 'lucide-react';
import { format } from 'date-fns';
import { ACTIVITY_ICONS } from '../../constants';
import type { Activity } from '../../types';

export const Activities = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['activities'],
    queryFn: async () => {
      const res = await api.get('/activities/timeline?limit=50');
      return (res as unknown as { data: Activity[] }).data;
    },
  });

  const getActivityIcon = (type: string) => {
    switch(type) {
      case 'customer_created': return <UserPlus className="w-4 h-4 text-blue-600" />;
      case 'lead_created': return <Target className="w-4 h-4 text-purple-600" />;
      case 'task_completed': return <CheckCircle2 className="w-4 h-4 text-green-600" />;
      default: return <ActivityIcon className="w-4 h-4 text-slate-600" />;
    }
  };

  const getActivityBg = (type: string) => {
    return ACTIVITY_ICONS[type]?.split(' ')[1] || 'bg-slate-100';
  };

  const getActivityLabel = (type: string) => {
    return type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#191b23]">Activity Logs</h1>
        <p className="text-[#565e74]">Comprehensive timeline of actions across the platform.</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200/70 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50/80 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3.5 font-semibold text-slate-500 uppercase tracking-wider text-xs w-16">Type</th>
                <th className="px-6 py-3.5 font-semibold text-slate-500 uppercase tracking-wider text-xs">Description</th>
                <th className="px-6 py-3.5 font-semibold text-slate-500 uppercase tracking-wider text-xs">User</th>
                <th className="px-6 py-3.5 font-semibold text-slate-500 uppercase tracking-wider text-xs">Date & Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center">
                    <div className="flex justify-center"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div></div>
                  </td>
                </tr>
              ) : data?.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center">
                    <ActivityIcon className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500 text-sm font-medium">No activities recorded yet</p>
                    <p className="text-slate-400 text-xs mt-1">Activities will appear as you interact with the CRM.</p>
                  </td>
                </tr>
              ) : (
                data?.map((activity: Activity) => (
                  <tr key={activity.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className={`h-8 w-8 rounded-lg ${getActivityBg(activity.type)} flex items-center justify-center border border-white/50 shadow-sm`}>
                        {getActivityIcon(activity.type)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900">{activity.description}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{getActivityLabel(activity.type)}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center text-sm text-[#2563eb] bg-blue-50 px-2 py-0.5 rounded font-medium">
                        {activity.user?.name || 'System'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      <div className="flex items-center text-sm">
                        <Clock className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                        {format(new Date(activity.createdAt), 'MMM d, yyyy')}
                        <span className="ml-2 text-slate-400 text-xs">
                          {format(new Date(activity.createdAt), 'h:mm a')}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {data && data.length >= 50 && (
          <div className="p-4 border-t border-slate-200 text-center bg-slate-50/50 text-sm text-slate-500">
            Showing latest 50 activities.
          </div>
        )}
      </div>
    </div>
  );
};
