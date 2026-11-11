import React from 'react';

const TONE_MAP = {
  Active: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  Inactive: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
  Scheduled: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  Confirmed: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300',
  'Checked In': 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300',
  'In Progress': 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  Completed: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  Cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  'No Show': 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  Male: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  Female: 'bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300',
};

export default function Badge({ children, tone }) {
  const cls = TONE_MAP[tone || children] || 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300';
  return <span className={`badge ${cls}`}>{children}</span>;
}
