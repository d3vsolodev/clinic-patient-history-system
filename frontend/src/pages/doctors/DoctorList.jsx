import React, { useEffect, useState, useCallback } from 'react';
import { Search, Plus, Pencil, Trash2, Loader2 } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { doctorApi, departmentApi } from '../../api/index.js';
import DataTable from '../../components/DataTable.jsx';
import Pagination from '../../components/Pagination.jsx';
import Badge from '../../components/Badge.jsx';
import { useToast } from '../../components/Toast.jsx';
import { initials } from '../../utils/formatters.js';
import Modal from '../../components/Modal.jsx';
import DoctorForm from './DoctorForm.jsx';
import { useAuth } from '../../hooks/useAuth.jsx';

const PAGE_SIZE = 10;

export default function DoctorList() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [departmentId, setDepartmentId] = useState(searchParams.get('departmentId') || '');
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const { showToast } = useToast();
  const { hasPermission } = useAuth();

  useEffect(() => {
    departmentApi.list().then(({ data }) => setDepartments(data.data)).catch(() => {});
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await doctorApi.list({
        search: search || undefined,
        departmentId: departmentId || undefined,
        page,
        pageSize: PAGE_SIZE,
      });
      setDoctors(data.data);
      setTotalCount(data.meta.totalCount);
    } catch {
      showToast('Unable to load doctors.', 'error');
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, departmentId, page]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { setPage(1); }, [search, departmentId]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await doctorApi.remove(deleteTarget.DoctorID);
      showToast('Doctor deleted successfully', 'success');
      setDeleteTarget(null);
      load();
    } catch (err) {
      showToast(err.response?.data?.message || 'Unable to delete doctor.', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const manageDoctors = hasPermission('doctors.manage');

  const columns = [
    {
      key: 'FullName',
      header: 'Doctor',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-full bg-brand-100 text-xs font-semibold text-brand-700 dark:bg-brand-900/40 dark:text-brand-300">
            {initials(row.FirstName, row.LastName)}
          </div>
          <div>
            <p className="font-medium">Dr. {row.FullName}</p>
            <p className="text-xs text-slate-400">{row.DoctorCode}</p>
          </div>
        </div>
      ),
    },
    { key: 'DepartmentName', header: 'Department' },
    { key: 'Specialization', header: 'Specialization', render: (r) => r.Specialization || '-' },
    { key: 'Phone', header: 'Phone', render: (r) => r.Phone || '-' },
    { key: 'Status', header: 'Status', render: (r) => <Badge>{r.Status}</Badge> },
    {
      key: 'actions',
      header: '',
      render: (row) => manageDoctors && <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
        <button title="Edit doctor" className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800" onClick={() => { setEditingDoctor(row); setFormOpen(true); }}><Pencil className="h-4 w-4" /></button>
        <button title="Delete doctor" className="rounded-lg p-2 text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20" onClick={() => setDeleteTarget(row)}><Trash2 className="h-4 w-4" /></button>
      </div>,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
        <div className="relative max-w-xs flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input className="input pl-9" placeholder="Search doctors..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select className="input max-w-[220px]" value={departmentId} onChange={(e) => setDepartmentId(e.target.value)}>
          <option value="">All departments</option>
          {departments.map((d) => <option key={d.DepartmentID} value={d.DepartmentID}>{d.DepartmentName}</option>)}
        </select>
        </div>
        {manageDoctors && <button className="btn-primary shrink-0" onClick={() => { setEditingDoctor(null); setFormOpen(true); }}><Plus className="h-4 w-4" /> Add Doctor</button>}
      </div>

      <DataTable columns={columns} rows={doctors} loading={loading} emptyTitle="No doctors found" onRowClick={(row) => navigate(`/doctors/${row.DoctorID}`)} />
      <Pagination page={page} pageSize={PAGE_SIZE} totalCount={totalCount} onPageChange={setPage} />
      <DoctorForm open={formOpen} onClose={() => setFormOpen(false)} doctor={editingDoctor} onSaved={() => { setFormOpen(false); load(); }} />
      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete doctor" footer={<><button className="btn-secondary" onClick={() => setDeleteTarget(null)}>Cancel</button><button className="btn-danger" onClick={handleDelete} disabled={deleting}>{deleting && <Loader2 className="h-4 w-4 animate-spin" />} Delete</button></>}>
        <p className="text-sm text-slate-500">Delete <strong>{deleteTarget?.FullName}</strong>? Doctors with appointments or patient history may be blocked by the database.</p>
      </Modal>
    </div>
  );
}
