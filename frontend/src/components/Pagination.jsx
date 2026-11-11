import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({ page, pageSize, totalCount, onPageChange }) {
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between px-1 py-3 text-sm text-slate-500">
      <span>
        Page {page} of {totalPages} &middot; {totalCount} total
      </span>
      <div className="flex gap-2">
        <button
          className="btn-secondary !px-2 !py-1"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button
          className="btn-secondary !px-2 !py-1"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
