import React, { useEffect, useState } from 'react';
import { ArrowLeft, CalendarDays, Users, Mail, Phone, Stethoscope } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { doctorApi } from '../../api/index.js';
import Badge from '../../components/Badge.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import { useToast } from '../../components/Toast.jsx';
import { formatDateTime, initials } from '../../utils/formatters.js';

export default function DoctorProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [doctorResponse, appointmentsResponse, patientsResponse] = await Promise.all([
          doctorApi.getById(id),
          doctorApi.getAppointments(id),
          doctorApi.getPatients(id),
        ]);
        setData({
          doctor: doctorResponse.data.data,
          appointments: appointmentsResponse.data.data || [],
          patients: patientsResponse.data.data || [],
        });
      } catch {
        showToast('Unable to load doctor workspace.', 'error');
      } finally {
        setLoading(false);
      }
    })();
  }, [id, showToast]);

  if (loading) return <div className="card h-96 animate-pulse" />;
  if (!data) return <EmptyState title="Doctor not found" />;

  const { doctor, appointments, patients } = data;
  return (
    <div className="space-y-4">
      <button onClick={() => navigate('/doctors')} className="flex items-center gap-1 text-sm text-slate-400 hover:text-slate-600">
        <ArrowLeft className="h-4 w-4" /> Back to doctors
      </button>

      <section className="card p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="grid h-16 w-16 place-items-center rounded-2xl bg-brand-100 text-lg font-bold text-brand-700">{initials(doctor.FirstName, doctor.LastName)}</div>
            <div>
              <div className="flex flex-wrap items-center gap-2"><h2 className="text-xl font-bold">Dr. {doctor.FullName || `${doctor.FirstName || ''} ${doctor.LastName || ''}`.trim()}</h2><Badge>{doctor.Status}</Badge></div>
              <p className="text-sm text-slate-400">{doctor.DoctorCode} · {doctor.DepartmentName}</p>
              <p className="mt-1 text-sm font-medium text-brand-700">{doctor.Specialization || 'General practice'}</p>
            </div>
          </div>
          <div className="grid gap-2 text-sm text-slate-500 sm:text-right">
            <span className="inline-flex items-center gap-2 sm:justify-end"><Phone className="h-4 w-4" /> {doctor.Phone || 'No phone'}</span>
            <span className="inline-flex items-center gap-2 sm:justify-end"><Mail className="h-4 w-4" /> {doctor.Email || 'No email'}</span>
          </div>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-3">
        <Metric icon={CalendarDays} label="Appointments" value={appointments.length} />
        <Metric icon={Users} label="Assigned patients" value={patients.length} />
        <Metric icon={Stethoscope} label="Department" value={doctor.DepartmentName || '-'} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="card p-5"><h3 className="mb-4 font-semibold">Upcoming and recent appointments</h3>{appointments.length ? <div className="space-y-2">{appointments.slice(0, 8).map((appointment) => <div key={appointment.AppointmentID} className="flex items-center justify-between rounded-xl border border-slate-100 p-3 dark:border-slate-800"><div><p className="font-medium">{appointment.PatientName || appointment.FullName || 'Patient'}</p><p className="text-xs text-slate-400">{formatDateTime(appointment.AppointmentDate)}</p></div><Badge tone={appointment.Status}>{appointment.Status}</Badge></div>)}</div> : <EmptyState title="No appointments" />}</section>
        <section className="card p-5"><h3 className="mb-4 font-semibold">Patient panel</h3>{patients.length ? <div className="space-y-2">{patients.slice(0, 8).map((patient) => <button key={patient.PatientID} onClick={() => navigate(`/patients/${patient.PatientID}`)} className="flex w-full items-center justify-between rounded-xl border border-slate-100 p-3 text-left hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800"><span><span className="block font-medium">{patient.FullName}</span><span className="text-xs text-slate-400">{patient.PatientCode}</span></span><ArrowLeft className="h-4 w-4 rotate-180 text-slate-300" /></button>)}</div> : <EmptyState title="No assigned patients" />}</section>
      </div>
    </div>
  );
}

function Metric({ icon: Icon, label, value }) {
  return <div className="card flex items-center gap-3 p-4"><div className="grid h-10 w-10 place-items-center rounded-xl bg-brand-50 text-brand-600"><Icon className="h-5 w-5" /></div><div><p className="text-xs text-slate-400">{label}</p><p className="font-bold">{value}</p></div></div>;
}
