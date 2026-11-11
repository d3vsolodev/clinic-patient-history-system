import React, { useMemo, useState } from 'react';
import { Bell, Check, CheckCheck, Clock3, Inbox, Sparkles, Trash2 } from 'lucide-react';
import { useCareInbox } from '../../hooks/useCareInbox.jsx';

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'unread', label: 'Unread' },
  { id: 'read', label: 'Read' },
];

export default function CareInbox() {
  const { notifications, setNotifications } = useCareInbox();
  const [filter, setFilter] = useState('all');
  const unreadCount = notifications.filter((notification) => notification.unread).length;
  const visibleNotifications = useMemo(() => notifications.filter((notification) => (
    filter === 'all' || (filter === 'unread' ? notification.unread : !notification.unread)
  )), [filter, notifications]);

  const markAllRead = () => setNotifications((items) => items.map((item) => ({ ...item, unread: false })));
  const markRead = (id) => setNotifications((items) => items.map((item) => (
    item.id === id ? { ...item, unread: false } : item
  )));

  return (
    <div className="mx-auto min-w-0 max-w-6xl space-y-6 rounded-3xl bg-slate-50/80 p-4 sm:p-6 dark:bg-slate-900/40">
      <section className="flex flex-col gap-5 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-7 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex min-w-0 items-start gap-4">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300">
            <Inbox className="h-6 w-6" />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-brand-700 dark:text-brand-300">Care team</p>
              <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">Private workspace</span>
            </div>
            <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-white">Care inbox</h2>
            <p className="mt-1 max-w-xl text-sm leading-6 text-slate-500 dark:text-slate-400">A calm place to review clinic updates, follow-ups, and workspace notices.</p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-3 rounded-xl bg-slate-50 px-4 py-3 dark:bg-slate-800/70">
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-white text-brand-700 shadow-sm dark:bg-slate-700 dark:text-brand-300"><Bell className="h-4 w-4" /></div>
          <div><p className="text-lg font-bold leading-5 text-slate-900 dark:text-white">{unreadCount}</p><p className="mt-1 text-xs text-slate-500 dark:text-slate-400">unread {unreadCount === 1 ? 'update' : 'updates'}</p></div>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900" aria-label="Inbox notifications">
        <div className="flex flex-col gap-4 border-b border-slate-100 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 dark:border-slate-800">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white">Your updates</h3>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Review items when you have a moment.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex rounded-lg bg-slate-100 p-1 dark:bg-slate-800" role="tablist" aria-label="Filter inbox">
              {FILTERS.map(({ id, label }) => (
                <button key={id} type="button" role="tab" aria-selected={filter === id} onClick={() => setFilter(id)} className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${filter === id ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white' : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'}`}>
                  {label}{id === 'unread' && unreadCount > 0 ? ` ${unreadCount}` : ''}
                </button>
              ))}
            </div>
            <button type="button" onClick={markAllRead} disabled={!unreadCount} className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-semibold text-brand-700 hover:bg-brand-50 disabled:cursor-not-allowed disabled:text-slate-300 dark:text-brand-300 dark:hover:bg-brand-900/20 dark:disabled:text-slate-600">
              <CheckCheck className="h-4 w-4" /> Mark all read
            </button>
            {notifications.length > 0 && <button type="button" title="Clear inbox" aria-label="Clear inbox" onClick={() => setNotifications([])} className="grid h-9 w-9 place-items-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20"><Trash2 className="h-4 w-4" /></button>}
          </div>
        </div>

        {visibleNotifications.length ? (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {visibleNotifications.map(({ id, title, text, time, icon: Icon, tone, unread }) => (
              <article key={id} className={`flex min-w-0 gap-3 px-4 py-5 sm:gap-4 sm:px-6 ${unread ? 'bg-brand-50/35 dark:bg-brand-900/5' : ''}`}>
                <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${tone === 'amber' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' : tone === 'emerald' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' : 'bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300'}`}><Icon className="h-5 w-5" /></div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-white">{title}</h4>
                    {unread && <span className="rounded-full bg-brand-100 px-2 py-0.5 text-[10px] font-bold text-brand-700 dark:bg-brand-900/50 dark:text-brand-300">New</span>}
                  </div>
                  <p className="mt-1 break-words text-sm leading-6 text-slate-500 dark:text-slate-400">{text}</p>
                  <p className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-slate-400"><Clock3 className="h-3.5 w-3.5" />{time}</p>
                </div>
                {unread && <button type="button" onClick={() => markRead(id)} aria-label={`Mark ${title} as read`} className="inline-flex h-9 shrink-0 items-center gap-1.5 self-center rounded-lg px-2.5 text-xs font-semibold text-brand-700 hover:bg-brand-50 dark:text-brand-300 dark:hover:bg-brand-900/20"><Check className="h-4 w-4" /><span className="hidden sm:inline">Mark read</span></button>}
              </article>
            ))}
          </div>
        ) : (
          <div className="flex min-h-64 flex-col items-center justify-center px-6 py-12 text-center">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-50 text-emerald-700 dark:bg-emerald-900/25 dark:text-emerald-300"><Sparkles className="h-6 w-6" /></div>
            <h4 className="mt-4 font-semibold text-slate-900 dark:text-white">{notifications.length ? 'You’re all caught up' : 'Your inbox is clear'}</h4>
            <p className="mt-1 max-w-sm text-sm leading-6 text-slate-500 dark:text-slate-400">{notifications.length ? 'There are no updates in this view.' : 'Clinic updates will appear here when they need your attention.'}</p>
            {filter !== 'all' && notifications.length > 0 && <button type="button" onClick={() => setFilter('all')} className="mt-4 text-sm font-semibold text-brand-700 hover:text-brand-800 dark:text-brand-300">View all updates</button>}
          </div>
        )}
      </section>
    </div>
  );
}