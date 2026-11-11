import React from 'react';

export function TableSkeleton({ rows = 6, cols = 5 }) {
  return (
    <div className="animate-pulse">
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex gap-4 border-b border-slate-100 px-4 py-4 dark:border-slate-800">
          {Array.from({ length: cols }).map((_, c) => (
            <div key={c} className="h-4 flex-1 rounded bg-slate-200 dark:bg-slate-800" />
          ))}
        </div>
      ))}
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="card animate-pulse p-5">
      <div className="mb-3 h-4 w-1/2 rounded bg-slate-200 dark:bg-slate-800" />
      <div className="h-7 w-1/3 rounded bg-slate-200 dark:bg-slate-800" />
    </div>
  );
}
