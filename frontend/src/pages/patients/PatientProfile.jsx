import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Phone, Mail, MapPin, Droplet, Cake, User as UserIcon,
  Clock, Stethoscope, Pill, FlaskConical, Receipt, History, LayoutGrid, LogIn, LogOut,
} from 'lucide-react';
import { patientApi } from '../../api/patientApi.js';
import { appointmentApi } from '../../api/index.js';
import Badge from '../../components/Badge.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import { useToast } from '../../components/Toast.jsx';
import { formatDate, formatDateTime, formatCurrency, initials } from '../../utils/formatters.js';
import { useAuth } from '../../hooks/useAuth.jsx';

const TABS = [
  { key: 'overview', label: 'Overview', icon: LayoutGrid },
  { key: 'medical', label: 'Medical History', icon: Stethoscope },
  { key: 'appointments', label: 'Appointments', icon: Clock },
  { key: 'prescriptions', label: 'Prescriptions', icon: Pill },
  { key: 'lab', label: 'Laboratory', icon: FlaskConical },
  { key: 'billing', label: 'Billing', icon: Receipt },
  { key: 'timeline', label: 'Timeline', icon: History },
];

export default function PatientProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('overview');
  const [actionLoading, setActionLoading] = useState(null);
  const { hasPermission } = useAuth();

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const { data } = await patientApi.getProfile(id);
        setProfile(data.data);
      } catch {
        showToast('Unable to load patient profile.', 'error');
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const updateAppointment = async (appointmentId, action, message) => {
    setActionLoading(appointmentId);
    try {
      await action(appointmentId);
      showToast(message, 'success');
      const { data } = await patientApi.getProfile(id);
      setProfile(data.data);
    } catch (err) {
      showToast(err.response?.data?.message || 'Unable to update appointment.', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return <div className="card h-96 animate-pulse" />;
  }

  if (!profile) {
    return <EmptyState title="Patient not found" />;
  }

  const { patient, medicalHistory, appointments, prescriptions, labResults, billing, timeline } = profile;

  return (
    <div className="space-y-4">
      <button onClick={() => navigate('/patients')} className="flex items-center gap-1 text-sm text-slate-400 hover:text-slate-600">
        <ArrowLeft className="h-4 w-4" /> Back to Patients
      </button>

      <div className="card p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="grid h-16 w-16 place-items-center rounded-full bg-brand-100 text-xl font-semibold text-brand-700 dark:bg-brand-900/40 dark:text-brand-300">
              {initials(patient.FirstName, patient.LastName)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-semibold">{patient.FullName}</h2>
                <Badge>{patient.Status}</Badge>
              </div>
              <p className="text-sm text-slate-400">{patient.PatientCode}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm sm:grid-cols-4">
            <InfoItem icon={Cake} label="Age" value={`${patient.Age} yrs`} />
            <InfoItem icon={UserIcon} label="Gender" value={patient.Gender} />
            <InfoItem icon={Droplet} label="Blood Type" value={patient.BloodType || '-'} />
            <InfoItem icon={Phone} label="Phone" value={patient.Phone || '-'} />
            <InfoItem icon={Mail} label="Email" value={patient.Email || '-'} />
            <InfoItem icon={MapPin} label="Address" value={patient.Address || '-'} />
          </div>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="flex gap-1 overflow-x-auto border-b border-slate-100 px-3 pt-2 dark:border-slate-800">
          {TABS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex shrink-0 items-center gap-1.5 rounded-t-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                tab === key
                  ? 'border-b-2 border-brand-600 text-brand-700 dark:text-brand-300'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <Icon className="h-4 w-4" /> {label}
            </button>
          ))}
        </div>

        <div className="p-5">
          {tab === 'overview' && <OverviewTab patient={patient} timeline={timeline} />}
          {tab === 'medical' && <MedicalHistoryTab items={medicalHistory} />}
          {tab === 'appointments' && <AppointmentsTab items={appointments} canManage={hasPermission('appointments.manage')} actionLoading={actionLoading} onAction={updateAppointment} />}
          {tab === 'prescriptions' && <PrescriptionsTab items={prescriptions} />}
          {tab === 'lab' && <LabTab items={labResults} />}
          {tab === 'billing' && <BillingTab billing={billing} />}
          {tab === 'timeline' && <TimelineTab items={timeline} />}
        </div>
      </div>
    </div>
  );
}

function InfoItem({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-2">
      <Icon className="mt-0.5 h-4 w-4 text-slate-400" />
      <div>
        <p className="text-xs text-slate-400">{label}</p>
        <p className="font-medium">{value}</p>
      </div>
    </div>
  );
}

function OverviewTab({ patient, timeline }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div>
        <h4 className="mb-2 text-sm font-semibold text-slate-500">Emergency Contact</h4>
        <p className="text-sm">{patient.EmergencyContactName || 'Not provided'}</p>
        <p className="text-sm text-slate-400">{patient.EmergencyContactPhone || ''}</p>
      </div>
      <div>
        <h4 className="mb-2 text-sm font-semibold text-slate-500">Recent Activity</h4>
        {timeline?.length ? (
          <ul className="space-y-2">
            {timeline.slice(0, 5).map((e) => (
              <li key={`${e.EventType}-${e.EventID}`} className="text-sm">
                <span className="font-medium">{e.Title}</span>
                <span className="ml-2 text-xs text-slate-400">{formatDateTime(e.EventDate)}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-slate-400">No activity recorded yet.</p>
        )}
      </div>
    </div>
  );
}

function MedicalHistoryTab({ items }) {
  if (!items?.length) return <EmptyState title="No medical history recorded" />;
  return (
    <div className="space-y-3">
      {items.map((m) => (
        <div key={m.MedicalHistoryID} className="rounded-lg border border-slate-100 p-4 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <p className="font-medium">{m.ChiefComplaint || 'Consultation'}</p>
            <span className="text-xs text-slate-400">{formatDate(m.VisitDate)}</span>
          </div>
          <p className="mt-1 text-sm text-slate-500">Dr. {m.DoctorName}</p>
          {m.Symptoms && <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{m.Symptoms}</p>}
        </div>
      ))}
    </div>
  );
}

function AppointmentsTab({ items, canManage, actionLoading, onAction }) {
  if (!items?.length) return <EmptyState title="No appointments yet" />;
  return (
    <div className="space-y-2">
      {items.map((a) => (
        <div key={a.AppointmentID} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-100 p-3 dark:border-slate-800">
          <div>
            <p className="font-medium">Dr. {a.DoctorName}</p>
            <p className="text-xs text-slate-400">{formatDateTime(a.AppointmentDate)}</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge tone={a.Status}>{a.Status}</Badge>
            {canManage && ['Scheduled', 'Confirmed'].includes(a.Status) && (
              <button className="btn-secondary px-2.5 py-1.5 text-xs" disabled={actionLoading === a.AppointmentID} onClick={() => onAction(a.AppointmentID, appointmentApi.checkIn, 'Patient checked in')}>
                <LogIn className="h-3.5 w-3.5" /> Check in
              </button>
            )}
            {canManage && ['Checked In', 'In Progress'].includes(a.Status) && (
              <button className="btn-primary px-2.5 py-1.5 text-xs" disabled={actionLoading === a.AppointmentID} onClick={() => onAction(a.AppointmentID, appointmentApi.checkOut, 'Patient checked out')}>
                <LogOut className="h-3.5 w-3.5" /> Check out
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function PrescriptionsTab({ items }) {
  if (!items?.length) return <EmptyState title="No prescriptions yet" />;
  const grouped = Object.values(
    items.reduce((acc, row) => {
      acc[row.PrescriptionID] = acc[row.PrescriptionID] || { ...row, meds: [] };
      if (row.MedicineName) acc[row.PrescriptionID].meds.push(row);
      return acc;
    }, {})
  );
  return (
    <div className="space-y-3">
      {grouped.map((p) => (
        <div key={p.PrescriptionID} className="rounded-lg border border-slate-100 p-4 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <p className="font-medium">Dr. {p.DoctorName}</p>
            <span className="text-xs text-slate-400">{formatDate(p.PrescriptionDate)}</span>
          </div>
          <ul className="mt-2 space-y-1 text-sm text-slate-600 dark:text-slate-300">
            {p.meds.map((m) => (
              <li key={m.PrescriptionItemID}>
                {m.MedicineName} — {m.Dosage}, {m.Frequency} ({m.Duration})
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

function LabTab({ items }) {
  if (!items?.length) return <EmptyState title="No laboratory results yet" />;
  return (
    <div className="space-y-2">
      {items.map((l) => (
        <div key={l.LabResultID} className="flex items-center justify-between rounded-lg border border-slate-100 p-3 dark:border-slate-800">
          <div>
            <p className="font-medium">{l.TestName}</p>
            <p className="text-xs text-slate-400">{l.ResultValue} {l.Unit} &middot; {formatDate(l.ResultDate)}</p>
          </div>
          <Badge tone={l.ResultStatus === 'Normal' ? 'Active' : l.ResultStatus === 'Critical' ? 'Cancelled' : 'In Progress'}>
            {l.ResultStatus}
          </Badge>
        </div>
      ))}
    </div>
  );
}

function BillingTab({ billing }) {
  const invoices = billing?.invoices || [];
  if (!invoices.length) return <EmptyState title="No invoices yet" />;
  const total = invoices.reduce((sum, invoice) => sum + Number(invoice.Total || 0), 0);
  const paid = invoices.reduce((sum, invoice) => sum + Number(invoice.PaidAmount || 0), 0);
  const balance = invoices.reduce((sum, invoice) => sum + Number(invoice.RemainingBalance ?? (Number(invoice.Total || 0) - Number(invoice.PaidAmount || 0))), 0);
  return (
    <div className="space-y-2">
      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        <BillingMetric label="Total billed" value={formatCurrency(total)} />
        <BillingMetric label="Paid" value={formatCurrency(paid)} tone="text-emerald-600" />
        <BillingMetric label="Balance due" value={formatCurrency(balance)} tone="text-amber-600" />
      </div>
      {invoices.map((i) => (
        <div key={i.InvoiceID} className="flex items-center justify-between rounded-lg border border-slate-100 p-3 dark:border-slate-800">
          <div>
            <p className="font-medium">{i.InvoiceNumber}</p>
            <p className="text-xs text-slate-400">{formatDate(i.InvoiceDate)}</p>
          </div>
          <div className="text-right">
            <p className="font-medium">{formatCurrency(i.Total)}</p>
            <Badge tone={i.Status === 'Paid' ? 'Active' : i.Status === 'Overdue' ? 'Cancelled' : 'In Progress'}>{i.Status}</Badge>
          </div>
        </div>
      ))}
    </div>
  );
}

function BillingMetric({ label, value, tone = 'text-slate-900' }) {
  return <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/60"><p className="text-xs text-slate-400">{label}</p><p className={`mt-1 text-lg font-bold ${tone} dark:text-slate-100`}>{value}</p></div>;
}

function TimelineTab({ items }) {
  if (!items?.length) return <EmptyState title="No timeline events yet" />;
  return (
    <ol className="relative space-y-6 border-l border-slate-200 pl-6 dark:border-slate-800">
      {items.map((e) => (
        <li key={`${e.EventType}-${e.EventID}-${e.EventDate}`} className="relative">
          <span className="absolute -left-[27px] top-1 h-3 w-3 rounded-full border-2 border-white bg-brand-500 dark:border-slate-900" />
          <p className="text-xs text-slate-400">{formatDateTime(e.EventDate)}</p>
          <p className="font-medium">{e.Title}</p>
          {e.Description && <p className="text-sm text-slate-500">{e.Description}</p>}
          {e.DoctorName && <p className="text-xs text-slate-400">Dr. {e.DoctorName}</p>}
        </li>
      ))}
    </ol>
  );
}
