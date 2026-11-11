import React, { useEffect, useState } from 'react';
import { Activity, AlertTriangle, CheckCircle2, Clock3, Database, LockKeyhole, RefreshCw, ShieldAlert, ShieldCheck, Users, Wifi } from 'lucide-react';
import { departmentApi } from '../../api/index.js';
import axiosClient from '../../api/axiosClient.js';
import { useToast } from '../../components/Toast.jsx';
import Badge from '../../components/Badge.jsx';

const INITIAL_EVENTS = [
  { id: 1, severity: 'Review', title: 'Audit feed is ready for connection', detail: 'Connect the audit-log endpoint to stream immutable events here.', time: 'Now' },
  { id: 2, severity: 'Info', title: 'JWT access controls active', detail: 'Protected clinic routes require a valid access token.', time: 'Today' },
  { id: 3, severity: 'Info', title: 'Rate protection enabled', detail: 'The API limits each client IP to 500 requests per 15 minutes.', time: 'Today' },
];

export default function SecurityOperations() {
  const { showToast } = useToast();
  const [health, setHealth] = useState('checking');
  const [rateRemaining, setRateRemaining] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [events, setEvents] = useState(INITIAL_EVENTS);
  const [refreshing, setRefreshing] = useState(false);

  const loadSecurity = async () => {
    setRefreshing(true);
    try {
      const [healthResponse, departmentsResponse, apiResponse] = await Promise.all([
        fetch('/health'),
        departmentApi.list(),
        axiosClient.get('/departments'),
      ]);
      setHealth(healthResponse.ok ? 'online' : 'degraded');
      setDepartments(departmentsResponse.data.data || []);
      setRateRemaining(apiResponse.headers['ratelimit-remaining'] || null);
    } catch {
      setHealth('degraded');
      showToast('Some security signals are unavailable.', 'error');
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => { loadSecurity(); }, []);

  const acknowledge = (id) => setEvents((current) => current.filter((event) => event.id !== id));
  const healthLabel = health === 'online' ? 'Operational' : health === 'checking' ? 'Checking' : 'Degraded';

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-2xl bg-slate-950 p-6 text-white shadow-xl shadow-slate-900/10 lg:p-8">
        <div className="relative z-10 max-w-2xl"><div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-brand-300"><ShieldCheck className="h-4 w-4" /> Hospital SOC</div><h2 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">Security operations center</h2><p className="mt-2 text-sm leading-6 text-slate-300">One control room for access posture, department coverage, and the signals protecting patient operations.</p><button onClick={loadSecurity} disabled={refreshing} className="btn mt-5 bg-brand-500 text-white hover:bg-brand-400">{refreshing ? <RefreshCw className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />} Refresh signals</button></div><div className="absolute -right-16 -top-24 h-72 w-72 rounded-full border-[28px] border-brand-500/20" /><div className="absolute -bottom-28 right-32 h-64 w-64 rounded-full border-[24px] border-cyan-400/10" />
      </section>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Signal icon={Activity} label="API health" value={healthLabel} tone={health === 'online' ? 'good' : 'warn'} />
        <Signal icon={LockKeyhole} label="Access control" value="JWT protected" tone="good" />
        <Signal icon={Wifi} label="Rate protection" value={rateRemaining ? `${rateRemaining} left` : '500 / 15 min'} tone="good" />
        <Signal icon={Database} label="Patient data" value="Encrypted transport" tone="good" />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
        <section className="card p-5"><div className="mb-4 flex items-center justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">Coverage map</p><h3 className="mt-1 text-lg font-bold">Department security posture</h3></div><Badge>Live</Badge></div><div className="space-y-2">{departments.map((department) => <div key={department.DepartmentID} className="flex items-center justify-between rounded-xl border border-slate-100 p-3 dark:border-slate-800"><div className="flex items-center gap-3"><div className="grid h-9 w-9 place-items-center rounded-lg bg-brand-50 text-brand-600"><Users className="h-4 w-4" /></div><div><p className="text-sm font-semibold">{department.DepartmentName}</p><p className="text-xs text-slate-400">{department.DoctorCount || 0} clinical staff · access monitored</p></div></div><span className="flex items-center gap-1 text-xs font-semibold text-emerald-600"><CheckCircle2 className="h-4 w-4" /> Healthy</span></div>)}</div></section>
        <section className="card p-5"><div className="mb-4 flex items-center justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">Response queue</p><h3 className="mt-1 text-lg font-bold">Security signals</h3></div><span className="text-xs text-slate-400">{events.length} open</span></div><div className="space-y-3">{events.length ? events.map((event) => <div key={event.id} className="rounded-xl border border-slate-100 p-3 dark:border-slate-800"><div className="flex gap-3"><div className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg ${event.severity === 'Review' ? 'bg-amber-100 text-amber-700' : 'bg-brand-50 text-brand-700'}`}>{event.severity === 'Review' ? <AlertTriangle className="h-4 w-4" /> : <ShieldAlert className="h-4 w-4" />}</div><div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-2"><p className="text-sm font-semibold">{event.title}</p><span className="shrink-0 text-[10px] text-slate-400">{event.time}</span></div><p className="mt-1 text-xs leading-5 text-slate-500">{event.detail}</p><button onClick={() => acknowledge(event.id)} className="mt-2 text-xs font-semibold text-brand-700">Acknowledge</button></div></div></div>) : <div className="py-10 text-center"><CheckCircle2 className="mx-auto h-8 w-8 text-emerald-500" /><p className="mt-2 text-sm font-semibold">Response queue clear</p></div>}</div></section>
      </div>

      <div className="grid gap-4 sm:grid-cols-3"><Control icon={Clock3} title="Incident readiness" text="Review queue and escalation rules are visible to authorized staff." /><Control icon={ShieldCheck} title="Least privilege" text="Roles and permission codes protect patient workflows." /><Control icon={Database} title="Audit foundation" text="Login, logout, password, and patient deletion events are recorded." /></div>
    </div>
  );
}

function Signal({ icon: Icon, label, value, tone }) { return <div className="card flex items-center gap-3 p-4"><div className={`grid h-10 w-10 place-items-center rounded-xl ${tone === 'warn' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}><Icon className="h-5 w-5" /></div><div><p className="text-xs text-slate-400">{label}</p><p className="font-bold">{value}</p></div></div>; }
function Control({ icon: Icon, title, text }) { return <div className="card p-4"><Icon className="h-5 w-5 text-brand-600" /><p className="mt-3 text-sm font-bold">{title}</p><p className="mt-1 text-xs leading-5 text-slate-500">{text}</p></div>; }
