import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Users, CalendarDays, Stethoscope, Building2, X, ShieldCheck, Radar, Inbox,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth.jsx';

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/patients', label: 'Patients', icon: Users, permission: 'patients.view' },
  { to: '/appointments', label: 'Appointments', icon: CalendarDays, permission: 'appointments.view' },
  { to: '/inbox', label: 'Care inbox', icon: Inbox },
  { to: '/doctors', label: 'Doctors', icon: Stethoscope },
  { to: '/departments', label: 'Departments', icon: Building2 },
  { to: '/soc', label: 'Security operations', icon: Radar, permission: 'audit.view' },
];

export default function Sidebar({ open, onClose }) {
  const { hasPermission } = useAuth();

  const items = NAV_ITEMS.filter((item) => !item.permission || hasPermission(item.permission));

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-30 bg-slate-900/40 lg:hidden" onClick={onClose} />
      )}
      <aside
        className={`fixed z-40 inset-y-0 left-0 w-64 shrink-0 border-r border-slate-100 bg-white transition-transform dark:border-slate-800 dark:bg-slate-900 lg:static lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-5 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-brand-600 text-white shadow-lg shadow-brand-600/20"><ShieldCheck className="h-5 w-5" /></div>
            <div>
              <p className="text-sm font-bold leading-tight tracking-tight">CareLedger</p>
              <p className="text-xs text-slate-400 leading-tight">Clinic operations</p>
            </div>
          </div>
          <button onClick={onClose} className="lg:hidden text-slate-400">
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto px-3 py-5">
          <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Workspace</p>
          {items.filter((item) => item.to !== '/soc').map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-brand-50 text-brand-700 shadow-sm dark:bg-brand-900/30 dark:text-brand-300'
                    : 'text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800/60'
                }`
              }
            >
              <Icon className="h-[18px] w-[18px]" />
              <span className="flex-1">{label}</span>
            </NavLink>
          ))}
          <p className="mt-6 px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Governance</p>
          {items.filter((item) => item.to === '/soc').map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} onClick={onClose} className={({ isActive }) => `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${isActive ? 'bg-slate-900 text-white shadow-sm dark:bg-slate-700' : 'text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800/60'}`}>
              <Icon className="h-[18px] w-[18px]" /><span className="flex-1">{label}</span><span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            </NavLink>
          ))}
        </nav>
        <div className="mx-3 mb-4 rounded-xl bg-slate-900 p-4 text-white dark:bg-slate-800">
          <p className="text-xs font-semibold text-brand-200">Care team status</p>
          <p className="mt-1 text-sm font-medium">All systems operational</p>
          <div className="mt-3 flex items-center gap-2 text-[11px] text-slate-300"><span className="h-2 w-2 rounded-full bg-emerald-400" /> Secure clinic workspace</div>
        </div>
      </aside>
    </>
  );
}
