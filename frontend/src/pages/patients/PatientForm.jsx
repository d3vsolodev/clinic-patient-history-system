import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Loader2 } from 'lucide-react';
import Modal from '../../components/Modal.jsx';
import { patientApi } from '../../api/patientApi.js';
import { useToast } from '../../components/Toast.jsx';

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export default function PatientForm({ open, onClose, patient, onSaved }) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();
  const isEdit = !!patient;

  useEffect(() => {
    if (open) {
      reset(
        patient
          ? {
              firstName: patient.FirstName,
              lastName: patient.LastName,
              dateOfBirth: patient.DateOfBirth ? patient.DateOfBirth.substring(0, 10) : '',
              gender: patient.Gender,
              bloodType: patient.BloodType || '',
              phone: patient.Phone || '',
              email: patient.Email || '',
              address: patient.Address || '',
              emergencyContactName: patient.EmergencyContactName || '',
              emergencyContactPhone: patient.EmergencyContactPhone || '',
              status: patient.Status || 'Active',
            }
          : { gender: 'Male', status: 'Active' }
      );
    }
  }, [open, patient, reset]);

  const onSubmit = async (values) => {
    setSaving(true);
    try {
      if (isEdit) {
        await patientApi.update(patient.PatientID, values);
        showToast('Patient updated successfully', 'success');
      } else {
        await patientApi.create(values);
        showToast('Patient created successfully', 'success');
      }
      onSaved();
    } catch (err) {
      const errs = err.response?.data?.errors;
      showToast(errs?.[0] || err.response?.data?.message || 'Unable to save patient.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit Patient' : 'Add Patient'}
      size="lg"
      footer={
        <>
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={handleSubmit(onSubmit)} disabled={saving}>
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            {isEdit ? 'Save Changes' : 'Create Patient'}
          </button>
        </>
      }
    >
      <form className="grid grid-cols-1 gap-4 sm:grid-cols-2" onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label className="label">First Name</label>
          <input className="input" {...register('firstName', { required: true })} />
          {errors.firstName && <p className="mt-1 text-xs text-red-500">Required</p>}
        </div>
        <div>
          <label className="label">Last Name</label>
          <input className="input" {...register('lastName', { required: true })} />
          {errors.lastName && <p className="mt-1 text-xs text-red-500">Required</p>}
        </div>
        <div>
          <label className="label">Date of Birth</label>
          <input type="date" className="input" {...register('dateOfBirth', { required: true })} />
          {errors.dateOfBirth && <p className="mt-1 text-xs text-red-500">Required</p>}
        </div>
        <div>
          <label className="label">Gender</label>
          <select className="input" {...register('gender', { required: true })}>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div>
          <label className="label">Blood Type</label>
          <select className="input" {...register('bloodType')}>
            <option value="">Unknown</option>
            {BLOOD_TYPES.map((bt) => <option key={bt} value={bt}>{bt}</option>)}
          </select>
        </div>
        {isEdit && (
          <div>
            <label className="label">Status</label>
            <select className="input" {...register('status')}>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        )}
        <div>
          <label className="label">Phone</label>
          <input className="input" {...register('phone')} />
        </div>
        <div>
          <label className="label">Email</label>
          <input type="email" className="input" {...register('email')} />
          {errors.email && <p className="mt-1 text-xs text-red-500">Enter a valid email</p>}
        </div>
        <div className="sm:col-span-2">
          <label className="label">Address</label>
          <input className="input" {...register('address')} />
        </div>
        <div>
          <label className="label">Emergency Contact Name</label>
          <input className="input" {...register('emergencyContactName')} />
        </div>
        <div>
          <label className="label">Emergency Contact Phone</label>
          <input className="input" {...register('emergencyContactPhone')} />
        </div>
      </form>
    </Modal>
  );
}
