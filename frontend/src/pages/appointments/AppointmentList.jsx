import React, { useEffect, useState, useCallback } from 'react';
import { Plus, Check, LogIn, CheckCheck, XCircle } from 'lucide-react';
import { appointmentApi } from '../../api/index.js';
import DataTable from '../../components/DataTable.jsx';
import Pagination from '../../components/Pagination.jsx';
import Badge from '../../components/Badge.jsx';
import { useAuth } from '../../hooks/useAuth.jsx';
import { useToast } from '../../components/Toast.jsx';
import { formatDateTime } from '../../utils/formatters.js';
import AppointmentForm from './AppointmentForm.jsx';

const PAGE_SIZE = 10;
const STATUSES = ['Scheduled', 'Confirmed', 'Checked In', 'In Progress', 'Completed', 'Cancelled', 'No Show'];

export default function AppointmentList() {
  const [appointments, setAppointments] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const { hasPermission } = useAuth();
  const { showToast } = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await appointmentApi.list({ status: status || undefined, page, pageSize: PAGE_SIZE });
      setAppointments(data.data);
      setTotalCount(data.meta.totalCount);
    } catch {
      showToast('Unable to load appointments.', 'error');
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, page]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { setPage(1); }, [status]);

  const runAction = async (fn, id, successMsg) => {
    try {
      await fn(id);
      showToast(successMsg, 'success');
      load();
    } catch (err) {
      showToast(err.response?.data?.message || 'Action failed.', 'error');
    }
  };

  const columns = [
    {
      key: 'PatientName',
      header: 'Patient',
      render: (row) => (
        <div>
          <p className="font-medium">{row.PatientName}</p>
          <p className="text-xs text-slate-400">{row.PatientCode}</p>
        </div>
      ),
    },
    { key: 'DoctorName', header: 'Doctor', render: (row) => `Dr. ${row.DoctorName}` },
    { key: 'DepartmentName', header: 'Department', render: (row) => row.DepartmentName || '-' },
    { key: 'AppointmentDate', header: 'Date & Time', render: (row) => formatDateTime(row.AppointmentDate) },
    { key: 'Status', header: 'Status', render: (row) => <Badge tone={row.Status}>{row.Status}</Badge> },
    {
      key: 'actions',
      header: '',
      render: (row) => (
        hasPermission('appointments.manage') && (
          <div className="flex gap-1">
            {row.Status === 'Scheduled' && (
              <IconAction title="Confirm" onClick={() => runAction(appointmentApi.confirm, row.AppointmentID, 'Appointment confirmed')} icon={Check} />
            )}
            {['Scheduled', 'Confirmed'].includes(row.Status) && (
              <IconAction title="Check In" onClick={() => runAction(appointmentApi.checkIn, row.AppointmentID, 'Patient checked in')} icon={LogIn} />
            )}
            {['Checked In', 'In Progress'].includes(row.Status) && (
              <IconAction title="Check out" onClick={() => runAction(appointmentApi.checkOut, row.AppointmentID, 'Patient checked out')} icon={CheckCheck} />
            )}
            {!['Completed', 'Cancelled', 'No Show'].includes(row.Status) && (
              <IconAction title="Cancel" tone="red" onClick={() => runAction(appointmentApi.cancel, row.AppointmentID, 'Appointment cancelled')} icon={XCircle} />
            )}
          </div>
        )
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <select className="input max-w-[200px]" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        {hasPermission('appointments.manage') && (
          <button className="btn-primary shrink-0" onClick={() => setFormOpen(true)}>
            <Plus className="h-4 w-4" /> New Appointment
          </button>
        )}
      </div>

      <DataTable columns={columns} rows={appointments} loading={loading} emptyTitle="No appointments found" />
      <Pagination page={page} pageSize={PAGE_SIZE} totalCount={totalCount} onPageChange={setPage} />

      <AppointmentForm open={formOpen} onClose={() => setFormOpen(false)} onSaved={() => { setFormOpen(false); load(); }} />
    </div>
  );
}

function IconAction({ icon: Icon, title, tone = 'brand', onClick }) {
  const toneCls = tone === 'red'
    ? 'text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'
    : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800';
  return (
    <button title={title} onClick={onClick} className={`rounded-lg p-2 ${toneCls}`}>
      <Icon className="h-4 w-4" />
    </button>
  );
}
