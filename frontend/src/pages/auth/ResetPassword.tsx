import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useForm as useRHForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import api from '../../api/axios';
import { Activity, Eye, EyeOff, Target, Users, CheckSquare, TrendingUp, KeyRound } from 'lucide-react';

const resetPasswordSchema = z.object({
  password: z.string().min(8, { message: 'Password must be at least 8 characters' })
    .regex(/[A-Z]/, { message: 'Must contain an uppercase letter' })
    .regex(/[a-z]/, { message: 'Must contain a lowercase letter' })
    .regex(/[0-9]/, { message: 'Must contain a number' }),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

export const ResetPassword = () => {
  const { token } = useParams<{ token: string }>();
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useRHForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data: ResetPasswordFormValues) => {
    setIsLoading(true);
    setError(null);
    setSuccessMsg(null);
    try {
      const response = await api.post(`/auth/reset-password/${token}`, {
        password: data.password,
      });
      setSuccessMsg((response as { message?: string }).message || 'Password reset successfully! You can now sign in with your new password.');
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to reset password');
    } finally {
      setIsLoading(false);
    }
  };

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
            <p className="text-slate-500 mt-1">Set new password</p>
          </div>

          <div className="glass-panel-elevated p-5 sm:p-8">
            <div className="hidden lg:flex flex-col items-center mb-8">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 mb-4">
                <KeyRound className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">Set New Password</h2>
              <p className="text-slate-500 text-sm mt-1">Please enter your new password below.</p>
            </div>

            {error && (
              <div className="mb-5 p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm flex items-center">
                <svg className="w-4 h-4 mr-2 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
                {error}
              </div>
            )}

            {successMsg ? (
              <div className="space-y-5">
                <div className="p-3.5 bg-green-50 border border-green-200 text-green-700 rounded-xl text-sm flex items-center">
                  <CheckSquare className="w-4 h-4 mr-2 shrink-0" />
                  {successMsg}
                </div>
                <Link
                  to="/login"
                  className="block w-full text-center bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-2.5 rounded-lg font-semibold transition-all duration-150 shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30"
                >
                  Sign In
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">New Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      {...register('password')}
                      className="input-field pr-10"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  {errors.password && <p className="text-red-500 text-xs mt-1.5">{errors.password.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Confirm Password</label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    {...register('confirmPassword')}
                    className="input-field"
                    placeholder="••••••••"
                  />
                  {errors.confirmPassword && <p className="text-red-500 text-xs mt-1.5">{errors.confirmPassword.message}</p>}
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-2.5 rounded-lg font-semibold transition-all duration-150 shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 disabled:opacity-60 disabled:cursor-not-allowed mt-2"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Resetting password...
                    </span>
                  ) : 'Reset Password'}
                </button>
              </form>
            )}

            {!successMsg && (
              <p className="text-center text-sm text-slate-500 mt-6">
                Back to{' '}
                <Link to="/login" className="text-blue-600 hover:text-blue-700 font-medium hover:underline">
                  Sign in
                </Link>
              </p>
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
