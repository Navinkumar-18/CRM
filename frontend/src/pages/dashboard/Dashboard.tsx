import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../../api/axios';
import { 
  Users, 
  Target, 
  CheckSquare, 
  Activity,
  ArrowRight,
  IndianRupee,
  UserCircle,
  Building2,
  Briefcase,
  TrendingUp
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

const fetchMetrics = async () => {
  const response = await api.get('/dashboard/metrics');
  return (response as any).data;
};

const fetchRecentActivities = async () => {
  const response = await api.get('/dashboard/recent');
  return (response as any).data;
};

const fetchPipeline = async () => {
  const response = await api.get('/dashboard/pipeline');
  return (response as any).data;
};

const fetchFunnel = async () => {
  const response = await api.get('/dashboard/funnel');
  return (response as any).data;
};

const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'];

export const Dashboard = () => {
  const navigate = useNavigate();
  
  const { data: metrics, isLoading: metricsLoading } = useQuery({
    queryKey: ['metrics'],
    queryFn: fetchMetrics,
  });

  const { data: activities, isLoading: activitiesLoading } = useQuery({
    queryKey: ['recent-activities'],
    queryFn: fetchRecentActivities,
  });

  const { data: pipeline, isLoading: pipelineLoading } = useQuery({
    queryKey: ['pipeline'],
    queryFn: fetchPipeline,
  });

  const { data: funnel, isLoading: funnelLoading } = useQuery({
    queryKey: ['funnel'],
    queryFn: fetchFunnel,
  });

  if (metricsLoading) {
    return (
      <div className="space-y-6 max-w-[1440px] mx-auto animate-pulse">
        <div className="h-8 w-48 bg-slate-200 rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {[1,2,3,4,5].map(i => <div key={i} className="h-32 bg-slate-100 rounded-xl" />)}
        </div>
      </div>
    );
  }

  const statCards = [
    { name: 'Total Customers', value: metrics?.customers || 0, icon: Users, gradient: 'from-blue-500 to-blue-600' },
    { name: 'Companies', value: metrics?.companies || 0, icon: Building2, gradient: 'from-slate-500 to-slate-600' },
    { name: 'Active Leads', value: metrics?.leads || 0, icon: Target, gradient: 'from-violet-500 to-violet-600' },
    { name: 'Revenue Won', value: `₹${(metrics?.revenueClosedWon || 0).toLocaleString('en-IN')}`, icon: IndianRupee, gradient: 'from-emerald-500 to-emerald-600' },
    { name: 'Tasks Due', value: metrics?.tasksDue || 0, icon: CheckSquare, gradient: 'from-amber-500 to-amber-600' },
  ];

  const secondaryStats = [
    { name: 'Contacts', value: metrics?.contacts || 0, icon: UserCircle },
    { name: 'Open Deals', value: metrics?.openDeals || 0, icon: Briefcase },
  ];

  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="space-y-6 max-w-[1440px] mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{getTimeGreeting()}</h1>
        <p className="text-slate-500">Here's what's happening across your workspace.</p>
      </div>

      {/* Primary Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {statCards.map((stat) => (
          <div key={stat.name} className="bg-white rounded-xl border border-slate-200/70 p-5 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">{stat.name}</p>
                <p className="text-3xl font-bold text-slate-900 mt-2">{stat.value}</p>
              </div>
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-lg`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Secondary Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {secondaryStats.map((stat) => (
          <div key={stat.name} className="bg-white rounded-xl border border-slate-200/70 px-4 py-3 shadow-sm flex items-center gap-3">
            <stat.icon className="w-5 h-5 text-slate-400" />
            <div>
              <p className="text-xs font-medium text-slate-500">{stat.name}</p>
              <p className="text-lg font-bold text-slate-800">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200/70 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-5">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-bold text-slate-900">Lead Funnel Analysis</h2>
          </div>
          {funnelLoading ? (
            <div className="h-[300px] flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
            </div>
          ) : (
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={funnel || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="status" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} style={{ textTransform: 'capitalize' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} allowDecimals={false} />
                  <RechartsTooltip 
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Leads" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-slate-200/70 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-5">
            <Briefcase className="w-5 h-5 text-violet-600" />
            <h2 className="text-lg font-bold text-slate-900">Pipeline Revenue by Stage</h2>
          </div>
          {pipelineLoading ? (
            <div className="h-[300px] flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
            </div>
          ) : (
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pipeline || []}
                    dataKey="total"
                    nameKey="stage"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                  >
                    {(pipeline || []).map((_: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    formatter={(value: any) => [`₹${Number(value || 0).toLocaleString('en-IN')}`, 'Revenue']}
                    contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', textTransform: 'capitalize' }}
                  />
                  <Legend iconType="circle" formatter={(value) => <span style={{ textTransform: 'capitalize', color: '#475569', fontSize: '13px' }}>{value}</span>} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* Recent Activities + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200/70 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-slate-900">Recent Activities</h2>
            <button
              onClick={() => navigate('/activities')}
              className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors"
            >
              View all <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-3">
            {activitiesLoading ? (
              <div className="space-y-4">
                {[1,2,3].map(i => (
                  <div key={i} className="animate-pulse flex items-start space-x-3">
                    <div className="w-8 h-8 bg-slate-200 rounded-full shrink-0" />
                    <div className="flex-1 space-y-2 py-1"><div className="h-4 bg-slate-200 rounded w-3/4" /><div className="h-3 bg-slate-100 rounded w-1/4" /></div>
                  </div>
                ))}
              </div>
            ) : activities?.length === 0 ? (
              <div className="text-center py-8">
                <Activity className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 text-sm">No recent activities yet.</p>
              </div>
            ) : (
              activities?.slice(0, 8).map((activity: any) => (
                <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-200 group">
                  <div className="mt-0.5">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center border border-blue-100">
                      <Activity className="w-4 h-4 text-blue-600" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-800">
                      <span className="font-semibold">{activity.user?.name || 'System'}</span>
                      <span className="text-slate-500 ml-1">{activity.description}</span>
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {new Date(activity.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/70 p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 mb-5">Quick Actions</h2>
          <div className="space-y-3">
            {[
              { label: 'Add New Customer', icon: Users, path: '/customers', color: 'text-blue-600', bg: 'bg-blue-50' },
              { label: 'Create Lead', icon: Target, path: '/leads', color: 'text-violet-600', bg: 'bg-violet-50' },
              { label: 'New Deal', icon: Briefcase, path: '/deals', color: 'text-emerald-600', bg: 'bg-emerald-50' },
              { label: 'Assign Task', icon: CheckSquare, path: '/tasks', color: 'text-amber-600', bg: 'bg-amber-50' },
              { label: 'Add Company', icon: Building2, path: '/companies', color: 'text-slate-600', bg: 'bg-slate-50' },
            ].map(item => (
              <button
                key={item.label}
                onClick={() => navigate(item.path)}
                className="w-full text-left px-4 py-3.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 transition-all flex items-center justify-between group shadow-sm hover:shadow"
              >
                <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900">{item.label}</span>
                <div className={`w-8 h-8 rounded-lg ${item.bg} flex items-center justify-center`}>
                  <item.icon className={`w-4 h-4 ${item.color}`} />
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
