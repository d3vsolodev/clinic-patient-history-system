import React, { useEffect, useState } from 'react';
import { Building2, ArrowUpRight, Users, ShieldCheck, Plus, Pencil, Trash2, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { departmentApi } from '../../api/index.js';
import { useToast } from '../../components/Toast.jsx';
import { CardSkeleton } from '../../components/Skeleton.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import Modal from '../../components/Modal.jsx';
import DepartmentForm from './DepartmentForm.jsx';
import { useAuth } from '../../hooks/useAuth.jsx';

export default function DepartmentList() {
  const navigate = useNavigate();
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const { showToast } = useToast();
  const { hasPermission } = useAuth();

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await departmentApi.list();
      setDepartments(data.data);
    } catch {
      showToast('Unable to load departments.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await departmentApi.remove(deleteTarget.DepartmentID);
      showToast('Department deleted successfully', 'success');
      setDeleteTarget(null);
      load();
    } catch (err) {
      showToast(err.response?.data?.message || 'Unable to delete department.', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const manageDepartments = hasPermission('departments.manage');

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
      </div>
    );
  }

  if (!departments.length) return <EmptyState title="No departments found" description={manageDepartments ? 'Create the first department to organize your care teams.' : undefined} action={manageDepartments && <button className="btn-primary" onClick={() => setFormOpen(true)}><Plus className="h-4 w-4" /> Add Department</button>} />;

  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-3 rounded-2xl bg-slate-900 p-5 text-white sm:flex-row sm:items-center">
        <div><p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-300">Department control room</p><h2 className="mt-1 text-xl font-bold">Coordinate every care team</h2><p className="mt-1 text-sm text-slate-300">Open a department to review its doctors and active patient flow.</p></div>
        <div className="flex items-center gap-3 text-xs text-slate-300"><div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-brand-300" /> Secure operations</div>{manageDepartments && <button className="btn bg-white text-slate-900 hover:bg-brand-50" onClick={() => { setEditingDepartment(null); setFormOpen(true); }}><Plus className="h-4 w-4" /> Add Department</button>}</div>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {departments.map((d) => (
        <div key={d.DepartmentID} className="card p-5">
          <div className="mb-3 flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-900/30 dark:text-brand-300">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold">{d.DepartmentName}</p>
              <p className="inline-flex items-center gap-1 text-xs text-slate-400"><Users className="h-3 w-3" /> {d.DoctorCount} doctor{d.DoctorCount === 1 ? '' : 's'}</p>
            </div>
          </div>
          {d.Description && <p className="text-sm text-slate-500">{d.Description}</p>}
          <div className="mt-4 flex items-center justify-between gap-2">
            <button onClick={() => navigate(`/doctors?departmentId=${d.DepartmentID}`)} className="inline-flex items-center gap-1 text-xs font-bold text-brand-700 hover:text-brand-600">View department doctors <ArrowUpRight className="h-3.5 w-3.5" /></button>
            {manageDepartments && <div className="flex gap-1"><button title="Edit department" className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-brand-600 dark:hover:bg-slate-800" onClick={() => { setEditingDepartment(d); setFormOpen(true); }}><Pencil className="h-4 w-4" /></button><button title="Delete department" className="rounded-lg p-2 text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20" onClick={() => setDeleteTarget(d)}><Trash2 className="h-4 w-4" /></button></div>}
          </div>
        </div>
      ))}
      </div>
      <DepartmentForm open={formOpen} onClose={() => setFormOpen(false)} department={editingDepartment} onSaved={() => { setFormOpen(false); load(); }} />
      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete department" footer={<><button className="btn-secondary" onClick={() => setDeleteTarget(null)}>Cancel</button><button className="btn-danger" onClick={handleDelete} disabled={deleting}>{deleting && <RefreshCw className="h-4 w-4 animate-spin" />} Delete</button></>}>
        <p className="text-sm text-slate-500">Delete <strong>{deleteTarget?.DepartmentName}</strong>? Departments with assigned doctors may be blocked by the database.</p>
      </Modal>
    </div>
  );
}
