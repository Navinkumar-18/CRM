import { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../api/axios';
import { Activity, Target, Users, CheckSquare, TrendingUp, MailCheck, AlertTriangle } from 'lucide-react';

export const VerifyEmail = () => {
  const { token } = useParams<{ token: string }>();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState<string>('Verifying your email address...');
  const verifyAttempted = useRef(false);

  useEffect(() => {
    if (verifyAttempted.current) return;
    verifyAttempted.current = true;

    const verify = async () => {
      try {
        const response = await api.post(`/auth/verify-email/${token}`);
        setStatus('success');
        setMessage((response as { message?: string }).message || 'Your email address has been successfully verified.');
      } catch (err) {
        const error = err as { response?: { data?: { message?: string } } };
        setStatus('error');
        setMessage(error.response?.data?.message || 'Failed to verify email. The link may be invalid or expired.');
      }
    };
    verify();
  }, [token]);

  return (
    <div className="min-h-screen bg-[#faf8ff] flex">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 relative overflow-hidden items-center justify-center">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-indigo-300 rounded-full blur-3xl"></div>
        </div>
        <div className="relative z-10 text-center px-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/15 backdrop-blur-sm rounded-2xl mb-8 border border-white/20">
            <Activity className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">Zuna CRM</h1>
          <p className="text-blue-100 text-lg mb-12 max-w-md mx-auto leading-relaxed">
            Manage customers, track leads, and streamline your workflow — all in one place.
          </p>
          <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
            {[
              { icon: Users, label: 'Customers', desc: 'Manage accounts' },
              { icon: Target, label: 'Leads', desc: 'Track pipeline' },
              { icon: CheckSquare, label: 'Tasks', desc: 'Stay organized' },
              { icon: TrendingUp, label: 'Analytics', desc: 'Measure growth' },
            ].map(item => (
              <div key={item.label} className="bg-white/10 backdrop-blur-sm border border-white/15 rounded-xl p-4 text-left hover:bg-white/15 transition-colors">
                <item.icon className="w-5 h-5 text-blue-200 mb-2" />
                <p className="text-white font-semibold text-sm">{item.label}</p>
                <p className="text-blue-200 text-xs mt-0.5">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex flex-col items-center mb-8">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20 mb-4">
              <Activity className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Zuna CRM</h1>
            <p className="text-slate-500 mt-1">Email Verification</p>
          </div>

          <div className="glass-panel-elevated p-5 sm:p-8 text-center">
            {status === 'loading' && (
              <div className="flex flex-col items-center py-6">
                <svg className="animate-spin h-10 w-10 text-blue-600 mb-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <h2 className="text-xl font-semibold text-slate-900 mb-1">Verifying Email</h2>
                <p className="text-slate-500 text-sm">{message}</p>
              </div>
            )}

            {status === 'success' && (
              <div className="flex flex-col items-center py-6">
                <div className="w-14 h-14 bg-green-50 border border-green-200 rounded-2xl flex items-center justify-center text-green-600 mb-4 shadow-sm">
                  <MailCheck className="w-7 h-7" />
                </div>
                <h2 className="text-xl font-bold text-slate-900 mb-2">Verification Complete!</h2>
                <p className="text-slate-500 text-sm mb-6 max-w-xs">{message}</p>
                <Link
                  to="/login"
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-2.5 rounded-lg font-semibold transition-all duration-150 shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30"
                >
                  Sign In
                </Link>
              </div>
            )}

            {status === 'error' && (
              <div className="flex flex-col items-center py-6">
                <div className="w-14 h-14 bg-red-50 border border-red-200 rounded-2xl flex items-center justify-center text-red-600 mb-4 shadow-sm">
                  <AlertTriangle className="w-7 h-7" />
                </div>
                <h2 className="text-xl font-bold text-slate-900 mb-2">Verification Failed</h2>
                <p className="text-slate-500 text-sm mb-6 max-w-xs">{message}</p>
                <Link
                  to="/login"
                  className="w-full border border-slate-200 hover:bg-slate-50 text-slate-700 py-2.5 rounded-lg font-semibold transition-all duration-150"
                >
                  Back to Sign In
                </Link>
              </div>
            )}
          </div>

          <p className="text-center text-xs text-slate-400 mt-6">
            Zuna CRM v0.1 — Manage your relationships
          </p>
        </div>
      </div>
    </div>
  );
};
