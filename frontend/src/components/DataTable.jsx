import React from 'react';
import { TableSkeleton } from './Skeleton.jsx';
import EmptyState from './EmptyState.jsx';

/**
 * columns: [{ key, header, render?: (row) => node }]
 */
export default function DataTable({ columns, rows, loading, emptyTitle = 'No records found', onRowClick }) {
  if (loading) {
    return (
      <div className="card overflow-hidden">
        <TableSkeleton cols={columns.length} />
      </div>
    );
  }

  if (!rows || rows.length === 0) {
    return (
      <div className="card">
        <EmptyState title={emptyTitle} />
      </div>
    );
  }

  return (
    <div className="card overflow-x-auto">
      <table className="w-full min-w-max text-left text-sm">
        <thead>
          <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400 dark:border-slate-800">
            {columns.map((col) => (
              <th key={col.key} className="px-4 py-3 font-medium">
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => (
            <tr
              key={row.id || row.PatientID || row.DoctorID || row.AppointmentID || idx}
              onClick={() => onRowClick && onRowClick(row)}
              className={`border-b border-slate-50 last:border-0 dark:border-slate-800/60 ${
                onRowClick ? 'cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/40' : ''
              }`}
            >
              {columns.map((col) => (
                <td key={col.key} className="px-4 py-3 align-middle">
                  {col.render ? col.render(row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
