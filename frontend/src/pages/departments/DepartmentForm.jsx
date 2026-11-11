import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Loader2 } from 'lucide-react';
import Modal from '../../components/Modal.jsx';
import { departmentApi } from '../../api/index.js';
import { useToast } from '../../components/Toast.jsx';

export default function DepartmentForm({ open, onClose, department, onSaved }) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();
  const isEdit = !!department;

  useEffect(() => {
    if (open) {
      reset(department
        ? {
            departmentName: department.DepartmentName,
            description: department.Description || '',
            isActive: department.IsActive === true || department.IsActive === 1 || department.IsActive === '1' || department.IsActive === 'true',
          }
        : { isActive: true });
    }
  }, [open, department, reset]);

  const onSubmit = async (values) => {
    setSaving(true);
    try {
      const payload = { ...values, isActive: values.isActive === true || values.isActive === 'true' };
      if (isEdit) {
        await departmentApi.update(department.DepartmentID, payload);
        showToast('Department updated successfully', 'success');
      } else {
        await departmentApi.create(payload);
        showToast('Department created successfully', 'success');
      }
      onSaved();
    } catch (err) {
      showToast(err.response?.data?.message || 'Unable to save department.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit Department' : 'Add Department'}
      footer={(
        <>
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={handleSubmit(onSubmit)} disabled={saving}>
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            {isEdit ? 'Save Changes' : 'Create Department'}
          </button>
        </>
      )}
    >
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label className="label">Department Name</label>
          <input className="input" autoFocus {...register('departmentName', { required: true, maxLength: 150 })} />
          {errors.departmentName && <p className="mt-1 text-xs text-red-500">Enter a department name</p>}
        </div>
        <div>
          <label className="label">Description</label>
          <textarea className="input" rows={3} {...register('description')} />
        </div>
        {isEdit && (
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" {...register('isActive')} />
            Active department
          </label>
        )}
      </form>
    </Modal>
  );
}
