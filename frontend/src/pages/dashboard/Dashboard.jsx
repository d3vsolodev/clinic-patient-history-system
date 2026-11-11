import React, { useEffect, useState } from 'react';
import {
  Users, UserPlus, CalendarCheck, CalendarClock, Stethoscope,
  FlaskConical, Pill, DollarSign, TrendingUp, AlertCircle, ArrowUpRight, RefreshCw, Plus,
} from 'lucide-react';
import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from 'recharts';
import { appointmentApi, dashboardApi } from '../../api/index.js';
import { CardSkeleton } from '../../components/Skeleton.jsx';
import { formatCurrency } from '../../utils/formatters.js';
import { useToast } from '../../components/Toast.jsx';
import { useNavigate } from 'react-router-dom';
import Badge from '../../components/Badge.jsx';
import { useAuth } from '../../hooks/useAuth.jsx';

const PIE_COLORS = ['#20a98d', '#f472b6', '#94a3b8'];

const TONE_CLASSES = {
  brand: 'bg-brand-50 text-brand-600 dark:bg-brand-900/30 dark:text-brand-300',
  blue: 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300',
  amber: 'bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-300',
  emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-300',
  indigo: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-300',
  cyan: 'bg-cyan-50 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-300',
  pink: 'bg-pink-50 text-pink-600 dark:bg-pink-900/30 dark:text-pink-300',
  red: 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-300',
};

function StatCard({ icon: Icon, label, value, tone = 'brand' }) {
  return (
    <div className="card p-5">
      <div className="flex items-center gap-3">
        <div className={`grid h-10 w-10 place-items-center rounded-lg ${TONE_CLASSES[tone] || TONE_CLASSES.brand}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs text-slate-400">{label}</p>
          <p className="text-xl font-semibold">{value}</p>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [todayAppointments, setTodayAppointments] = useState([]);
  const [scheduleError, setScheduleError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { showToast } = useToast();
  const navigate = useNavigate();
  const { hasPermission } = useAuth();

  const loadDashboard = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    const now = new Date();
    const today = [now.getFullYear(), String(now.getMonth() + 1).padStart(2, '0'), String(now.getDate()).padStart(2, '0')].join('-');
    try {
      const dashboardRequest = dashboardApi.get();
      const appointmentRequest = hasPermission('appointments.view')
        ? appointmentApi.list({ fromDate: today, toDate: today, page: 1, pageSize: 8 })
        : Promise.resolve(null);
      const [dashboardResult, appointmentResult] = await Promise.allSettled([dashboardRequest, appointmentRequest]);
      if (dashboardResult.status === 'rejected') throw dashboardResult.reason;
      setData(dashboardResult.value.data.data);
      if (appointmentResult.status === 'fulfilled') {
        setTodayAppointments(appointmentResult.value?.data?.data || []);
        setScheduleError(false);
      } else {
        setTodayAppointments([]);
        setScheduleError(true);
      }
    } catch {
      showToast(isRefresh ? 'Unable to refresh dashboard data.' : 'Unable to load dashboard data.', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const dateLabel = new Intl.DateTimeFormat('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  }).format(new Date());

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
        {Array.from({ length: 10 }).map((_, i) => <CardSkeleton key={i} />)}
      </div>
    );
  }

  if (!data) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center text-center">
        <div className="grid h-14 w-14 place-items-center rounded-2xl bg-amber-100 text-amber-700"><AlertCircle className="h-7 w-7" /></div>
        <h2 className="mt-5 text-xl font-bold tracking-tight">Dashboard data is unavailable</h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">The clinic API did not respond. Your records are safe; try again when the service is online.</p>
        <button className="btn-primary mt-5" onClick={() => loadDashboard(true)}><RefreshCw className="h-4 w-4" /> Try again</button>
      </div>
    );
  }

  const s = data.summary || {};

  const cards = [
    { icon: Users, label: 'Total Patients', value: s.TotalPatients ?? 0, tone: 'brand' },
    { icon: UserPlus, label: 'New Today', value: s.NewPatientsToday ?? 0, tone: 'blue' },
    { icon: CalendarClock, label: "Today's Appointments", value: s.TodayAppointments ?? 0, tone: 'amber' },
    { icon: CalendarCheck, label: 'Completed Today', value: s.CompletedAppointmentsToday ?? 0, tone: 'emerald' },
    { icon: Stethoscope, label: 'Doctors', value: s.TotalDoctors ?? 0, tone: 'indigo' },
    { icon: FlaskConical, label: 'Pending Lab Tests', value: s.PendingLabTests ?? 0, tone: 'cyan' },
    { icon: Pill, label: 'Pending Prescriptions', value: s.PendingPrescriptions ?? 0, tone: 'pink' },
    { icon: DollarSign, label: "Today's Revenue", value: formatCurrency(s.TodayRevenue), tone: 'emerald' },
    { icon: TrendingUp, label: 'Monthly Revenue', value: formatCurrency(s.MonthlyRevenue), tone: 'brand' },
    { icon: AlertCircle, label: 'Outstanding Balance', value: formatCurrency(s.OutstandingBalance), tone: 'red' },
  ];

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-2xl bg-slate-900 px-6 py-7 text-white shadow-xl shadow-slate-900/10 lg:px-8">
        <div className="relative z-10 max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-300">{dateLabel}</p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">Good Evening, keep care moving.</h2>
          <p className="mt-2 max-w-lg text-sm leading-6 text-slate-300">A focused view of today&apos;s patient flow, clinical workload, and revenue signals.</p>
          <div className="mt-5 flex flex-wrap gap-2">
            <button className="btn bg-brand-500 text-white hover:bg-brand-400" onClick={() => navigate('/appointments')}><CalendarCheck className="h-4 w-4" /> View schedule</button>
            <button className="btn border border-slate-700 bg-slate-800 text-slate-100 hover:bg-slate-700" onClick={() => navigate('/patients')}><Users className="h-4 w-4" /> Find a patient</button>
          </div>
        </div>
        <button className="absolute right-5 top-5 rounded-lg p-2 text-slate-300 hover:bg-slate-800 hover:text-white disabled:opacity-50" title="Refresh dashboard" onClick={() => loadDashboard(true)} disabled={refreshing}>
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
        </button>
        <div className="absolute -right-10 -top-20 h-64 w-64 rounded-full border-[26px] border-brand-500/20" />
        <div className="absolute -bottom-28 right-20 h-64 w-64 rounded-full border-[26px] border-amber-400/10" />
      </section>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
        {cards.map((c) => <StatCard key={c.label} {...c} />)}
      </div>

      {hasPermission('appointments.view') && (
        <section className="card overflow-hidden">
          <div className="flex flex-col gap-3 border-b border-slate-100 p-5 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-medium">Today&apos;s schedule</p>
              <p className="mt-1 text-sm text-slate-400">{todayAppointments.length} appointment{todayAppointments.length === 1 ? '' : 's'} scheduled</p>
            </div>
            <div className="flex gap-2">
              {hasPermission('appointments.manage') && <button className="btn-primary" onClick={() => navigate('/appointments')}><Plus className="h-4 w-4" /> New appointment</button>}
              <button className="btn-secondary" onClick={() => navigate('/appointments')}>View all</button>
            </div>
          </div>
          {todayAppointments.length ? (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {todayAppointments.map((appointment) => (
                <div key={appointment.AppointmentID} className="flex items-center gap-4 px-5 py-4">
                  <div className="w-24 shrink-0 text-sm font-medium text-slate-600 dark:text-slate-300">{new Date(appointment.AppointmentDate).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{appointment.PatientName}</p>
                    <p className="truncate text-xs text-slate-400">Dr. {appointment.DoctorName} {appointment.DepartmentName ? `· ${appointment.DepartmentName}` : ''}</p>
                  </div>
                  <Badge tone={appointment.Status}>{appointment.Status}</Badge>
                </div>
              ))}
            </div>
          ) : <p className="px-5 py-10 text-center text-sm text-slate-400">{scheduleError ? "Today's schedule is unavailable." : 'No appointments scheduled for today.'}</p>}
        </section>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="card p-5">
          <p className="mb-4 font-medium">Patient Registrations</p>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={data.patientTrend || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="Period" fontSize={12} />
              <YAxis fontSize={12} allowDecimals={false} />
              <Tooltip />
              <Line type="monotone" dataKey="Count" stroke="#20a98d" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-5">
          <p className="mb-4 font-medium">Appointments (Last 7 Days)</p>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data.appointmentTrend || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="Day" fontSize={12} tickFormatter={(d) => new Date(d).toLocaleDateString('en-US', { weekday: 'short' })} />
              <YAxis fontSize={12} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="Count" fill="#45c4a8" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-5">
          <p className="mb-4 font-medium">Revenue Trend</p>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={data.revenueTrend || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="Period" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip formatter={(v) => formatCurrency(v)} />
              <Line type="monotone" dataKey="Revenue" stroke="#158872" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-5">
          <p className="mb-4 font-medium">Gender Distribution</p>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={data.genderDistribution || []} dataKey="Count" nameKey="Gender" outerRadius={90} label>
                {(data.genderDistribution || []).map((entry, i) => (
                  <Cell key={entry.Gender} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Legend />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card p-5">
        <p className="mb-4 font-medium">Most Common Diagnoses</p>
        {data.commonDiagnoses?.length ? (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data.commonDiagnoses} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis type="number" fontSize={12} allowDecimals={false} />
              <YAxis type="category" dataKey="DiagnosisName" fontSize={12} width={140} />
              <Tooltip />
              <Bar dataKey="Count" fill="#20a98d" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="py-8 text-center text-sm text-slate-400">No diagnosis data yet.</p>
        )}
      </div>
    </div>
  );
}
