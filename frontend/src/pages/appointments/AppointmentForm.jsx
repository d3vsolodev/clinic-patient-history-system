import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Loader2 } from 'lucide-react';
import Modal from '../../components/Modal.jsx';
import { appointmentApi, doctorApi } from '../../api/index.js';
import { patientApi } from '../../api/patientApi.js';
import { useToast } from '../../components/Toast.jsx';

export default function AppointmentForm({ open, onClose, onSaved }) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  const [saving, setSaving] = useState(false);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const { showToast } = useToast();

  useEffect(() => {
    if (open) {
      reset({ durationMinutes: 30 });
      patientApi.list({ pageSize: 100 }).then(({ data }) => setPatients(data.data)).catch(() => {});
      doctorApi.list({ pageSize: 100 }).then(({ data }) => setDoctors(data.data)).catch(() => {});
    }
  }, [open, reset]);

  const onSubmit = async (values) => {
    setSaving(true);
    try {
      await appointmentApi.create({
        patientId: Number(values.patientId),
        doctorId: Number(values.doctorId),
        appointmentDate: new Date(values.appointmentDate).toISOString(),
        durationMinutes: Number(values.durationMinutes),
        reason: values.reason,
      });
      showToast('Appointment created successfully', 'success');
      onSaved();
    } catch (err) {
      showToast(err.response?.data?.message || 'Unable to create appointment.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="New Appointment"
      footer={
        <>
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={handleSubmit(onSubmit)} disabled={saving}>
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            Schedule Appointment
          </button>
        </>
      }
    >
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label className="label">Patient</label>
          <select className="input" {...register('patientId', { required: true })}>
            <option value="">Select patient</option>
            {patients.map((p) => <option key={p.PatientID} value={p.PatientID}>{p.FullName} ({p.PatientCode})</option>)}
          </select>
          {errors.patientId && <p className="mt-1 text-xs text-red-500">Required</p>}
        </div>
        <div>
          <label className="label">Doctor</label>
          <select className="input" {...register('doctorId', { required: true })}>
            <option value="">Select doctor</option>
            {doctors.map((d) => <option key={d.DoctorID} value={d.DoctorID}>Dr. {d.FullName} — {d.DepartmentName}</option>)}
          </select>
          {errors.doctorId && <p className="mt-1 text-xs text-red-500">Required</p>}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Date &amp; Time</label>
            <input type="datetime-local" className="input" {...register('appointmentDate', { required: true })} />
            {errors.appointmentDate && <p className="mt-1 text-xs text-red-500">Required</p>}
          </div>
          <div>
            <label className="label">Duration (minutes)</label>
            <input type="number" className="input" {...register('durationMinutes')} />
          </div>
        </div>
        <div>
          <label className="label">Reason</label>
          <textarea className="input" rows={3} {...register('reason')} />
        </div>
      </form>
    </Modal>
  );
}
