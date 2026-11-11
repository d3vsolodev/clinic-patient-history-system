import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Loader2 } from 'lucide-react';
import Modal from '../../components/Modal.jsx';
import { departmentApi, doctorApi } from '../../api/index.js';
import { useToast } from '../../components/Toast.jsx';

export default function DoctorForm({ open, onClose, doctor, onSaved }) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  const [departments, setDepartments] = useState([]);
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();
  const isEdit = !!doctor;

  useEffect(() => {
    if (!open) return;
    reset(doctor
      ? { departmentId: doctor.DepartmentID, firstName: doctor.FirstName, lastName: doctor.LastName, gender: doctor.Gender, specialization: doctor.Specialization || '', licenseNumber: doctor.LicenseNumber || '', phone: doctor.Phone || '', email: doctor.Email || '', status: doctor.Status || 'Active' }
      : { gender: 'Male', status: 'Active' });
    departmentApi.list().then(({ data }) => setDepartments(data.data)).catch(() => showToast('Unable to load departments.', 'error'));
  }, [open, doctor, reset, showToast]);

  const onSubmit = async (values) => {
    setSaving(true);
    try {
      const payload = { ...values, departmentId: Number(values.departmentId) };
      if (isEdit) {
        await doctorApi.update(doctor.DoctorID, payload);
        showToast('Doctor updated successfully', 'success');
      } else {
        await doctorApi.create(payload);
        showToast('Doctor created successfully', 'success');
      }
      onSaved();
    } catch (err) {
      showToast(err.response?.data?.message || 'Unable to save doctor.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? 'Edit Doctor' : 'Add Doctor'} size="lg" footer={<><button className="btn-secondary" onClick={onClose}>Cancel</button><button className="btn-primary" onClick={handleSubmit(onSubmit)} disabled={saving}>{saving && <Loader2 className="h-4 w-4 animate-spin" />}{isEdit ? 'Save Changes' : 'Create Doctor'}</button></>}>
      <form className="grid grid-cols-1 gap-4 sm:grid-cols-2" onSubmit={handleSubmit(onSubmit)}>
        <div><label className="label">First Name</label><input className="input" autoFocus {...register('firstName', { required: true })} />{errors.firstName && <p className="mt-1 text-xs text-red-500">Required</p>}</div>
        <div><label className="label">Last Name</label><input className="input" {...register('lastName', { required: true })} />{errors.lastName && <p className="mt-1 text-xs text-red-500">Required</p>}</div>
        <div><label className="label">Department</label><select className="input" {...register('departmentId', { required: true })}><option value="">Select department</option>{departments.map((d) => <option key={d.DepartmentID} value={d.DepartmentID}>{d.DepartmentName}</option>)}</select>{errors.departmentId && <p className="mt-1 text-xs text-red-500">Required</p>}</div>
        <div><label className="label">Gender</label><select className="input" {...register('gender', { required: true })}><option value="Male">Male</option><option value="Female">Female</option><option value="Other">Other</option></select></div>
        <div><label className="label">Specialization</label><input className="input" {...register('specialization')} /></div>
        <div><label className="label">License Number</label><input className="input" {...register('licenseNumber')} /></div>
        <div><label className="label">Phone</label><input className="input" {...register('phone')} /></div>
        <div><label className="label">Email</label><input type="email" className="input" {...register('email')} /></div>
        {isEdit && <div><label className="label">Status</label><select className="input" {...register('status')}><option value="Active">Active</option><option value="Inactive">Inactive</option></select></div>}
      </form>
    </Modal>
  );
}
