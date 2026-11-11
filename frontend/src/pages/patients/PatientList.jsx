import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Trash2, Pencil } from 'lucide-react';
import { patientApi } from '../../api/patientApi.js';
import DataTable from '../../components/DataTable.jsx';
import Pagination from '../../components/Pagination.jsx';
import Badge from '../../components/Badge.jsx';
import Modal from '../../components/Modal.jsx';
import { useAuth } from '../../hooks/useAuth.jsx';
import { useToast } from '../../components/Toast.jsx';
import { formatDate } from '../../utils/formatters.js';
import PatientForm from './PatientForm.jsx';

const PAGE_SIZE = 10;

export default function PatientList() {
  const [patients, setPatients] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [gender, setGender] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const { hasPermission } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await patientApi.list({
        search: search || undefined,
        gender: gender || undefined,
        status: status || undefined,
        page,
        pageSize: PAGE_SIZE,
      });
      setPatients(data.data);
      setTotalCount(data.meta.totalCount);
    } catch {
      showToast('Unable to load patients.', 'error');
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, gender, status, page]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => { setPage(1); }, [search, gender, status]);

  const handleDelete = async () => {
    try {
      await patientApi.remove(deleteTarget.PatientID);
      showToast('Patient deleted successfully', 'success');
      setDeleteTarget(null);
      load();
    } catch (err) {
      showToast(err.response?.data?.message || 'Unable to delete patient.', 'error');
    }
  };

  const columns = [
    {
      key: 'FullName',
      header: 'Patient',
      render: (row) => (
        <div>
          <p className="font-medium">{row.FullName}</p>
          <p className="text-xs text-slate-400">{row.PatientCode}</p>
        </div>
      ),
    },
    { key: 'Age', header: 'Age' },
    { key: 'Gender', header: 'Gender', render: (row) => <Badge tone={row.Gender}>{row.Gender}</Badge> },
    { key: 'Phone', header: 'Phone', render: (row) => row.Phone || '-' },
    { key: 'CreatedAt', header: 'Registered', render: (row) => formatDate(row.CreatedAt) },
    { key: 'Status', header: 'Status', render: (row) => <Badge>{row.Status}</Badge> },
    {
      key: 'actions',
      header: '',
      render: (row) => (
        <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
          {hasPermission('patients.update') && (
            <button
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              onClick={() => { setEditingPatient(row); setFormOpen(true); }}
            >
              <Pencil className="h-4 w-4" />
            </button>
          )}
          {hasPermission('patients.delete') && (
            <button
              className="rounded-lg p-2 text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
              onClick={() => setDeleteTarget(row)}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-wrap gap-2">
          <div className="relative max-w-xs flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              className="input pl-9"
              placeholder="Search name, code, phone, email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select className="input max-w-[140px]" value={gender} onChange={(e) => setGender(e.target.value)}>
            <option value="">All genders</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
          <select className="input max-w-[140px]" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">All statuses</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
        {hasPermission('patients.create') && (
          <button className="btn-primary shrink-0" onClick={() => { setEditingPatient(null); setFormOpen(true); }}>
            <Plus className="h-4 w-4" /> Add Patient
          </button>
        )}
      </div>

      <DataTable
        columns={columns}
        rows={patients}
        loading={loading}
        emptyTitle="No patients found"
        onRowClick={(row) => navigate(`/patients/${row.PatientID}`)}
      />
      <Pagination page={page} pageSize={PAGE_SIZE} totalCount={totalCount} onPageChange={setPage} />

      <PatientForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        patient={editingPatient}
        onSaved={() => { setFormOpen(false); load(); }}
      />

      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete patient"
        footer={
          <>
            <button className="btn-secondary" onClick={() => setDeleteTarget(null)}>Cancel</button>
            <button className="btn-danger" onClick={handleDelete}>Delete</button>
          </>
        }
      >
        <p className="text-sm text-slate-500">
          Are you sure you want to delete <strong>{deleteTarget?.FullName}</strong>? This can be reversed by an
          administrator but will hide the patient from active lists.
        </p>
      </Modal>
    </div>
  );
}
