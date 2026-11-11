import React, { createContext, useContext, useMemo, useState } from 'react';
import { AlertTriangle, CalendarClock, ShieldCheck } from 'lucide-react';

const INITIAL_NOTIFICATIONS = [
  { id: 1, title: 'Schedule is ready', text: "Review today's appointment queue before the morning rush.", time: 'Just now', icon: CalendarClock, tone: 'brand', unread: true },
  { id: 2, title: 'Follow-up needed', text: 'Two patient records are waiting for a completed visit note.', time: '18 min ago', icon: AlertTriangle, tone: 'amber', unread: true },
  { id: 3, title: 'Workspace secure', text: 'Your clinic session and database connection are healthy.', time: '1 hr ago', icon: ShieldCheck, tone: 'emerald', unread: false },
];

const CareInboxContext = createContext(null);

export function CareInboxProvider({ children }) {
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const value = useMemo(() => ({ notifications, setNotifications }), [notifications]);

  return <CareInboxContext.Provider value={value}>{children}</CareInboxContext.Provider>;
}

export function useCareInbox() {
  const context = useContext(CareInboxContext);
  if (!context) throw new Error('useCareInbox must be used within CareInboxProvider');
  return context;
}