import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useLocation } from 'react-router-dom';
import { Stethoscope, Loader2, Eye, EyeOff, LockKeyhole } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth.jsx';
import { useToast } from '../../components/Toast.jsx';

const DEMO_ACCOUNTS = [
  { role: 'Admin', email: 'admin@clinic.com' },
  { role: 'Doctor', email: 'doctor@clinic.com' },
  { role: 'Receptionist', email: 'reception@clinic.com' },
];

export default function Login() {
  const { register, handleSubmit, setValue, formState: { errors } } = useForm();
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = async ({ email, password }) => {
    setLoading(true);
    try {
      await login(email, password);
      showToast('Welcome back!', 'success');
      navigate(location.state?.from?.pathname || '/', { replace: true });
    } catch (err) {
      showToast(err.response?.data?.message || 'Login failed. Please check your credentials.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (email) => {
    setValue('email', email);
    setValue('password', 'Passw0rd!123');
  };

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="mb-6 text-center">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-600">CareLedger</p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">A calmer clinic day starts here.</h1>
        <p className="mt-2 text-sm text-slate-500">Secure access to your patient care workspace.</p>
      </div>
      <div className="card p-8">
      <div className="mb-6 flex items-center gap-3">
        <div className="grid h-11 w-11 place-items-center rounded-xl bg-brand-600 text-white">
          <Stethoscope className="h-5 w-5" />
        </div>
        <div>
          <p className="font-semibold leading-tight">Clinic workspace</p>
          <p className="text-xs text-slate-400">Sign in to continue</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="label">Email</label>
          <input
            type="email"
            className="input"
            placeholder="you@clinic.com"
            {...register('email', { required: true })}
          />
          {errors.email && <p className="mt-1 text-xs text-red-500">Email is required.</p>}
        </div>

        <div>
          <label className="label">Password</label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              className="input pr-10"
              placeholder="••••••••"
              {...register('password', { required: true })}
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && <p className="mt-1 text-xs text-red-500">Password is required.</p>}
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {!loading && <LockKeyhole className="h-4 w-4" />}
          Sign in
        </button>
      </form>

      <div className="mt-6 border-t border-slate-100 pt-4 dark:border-slate-800">
        <p className="mb-2 text-xs font-medium text-slate-400">Demo accounts (password: Passw0rd!123)</p>
        <div className="flex flex-wrap gap-2">
          {DEMO_ACCOUNTS.map((acc) => (
            <button
              key={acc.email}
              type="button"
              onClick={() => fillDemo(acc.email)}
              className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-500 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800"
            >
              {acc.role}
            </button>
          ))}
        </div>
      </div>
    </div>
    </div>
  );
}
