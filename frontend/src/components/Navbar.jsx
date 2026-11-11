import React, { useState } from 'react';
import { Menu, LogOut, User, ChevronDown, Bell } from 'lucide-react';
import { useAuth } from '../hooks/useAuth.jsx';
import { useNavigate } from 'react-router-dom';
import { initials } from '../utils/formatters.js';
import { useCareInbox } from '../hooks/useCareInbox.jsx';

export default function Navbar({ onMenuClick, title }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const { notifications } = useCareInbox();
  const unreadCount = notifications.filter((notification) => notification.unread).length;

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const [first, ...rest] = (user?.fullName || '').split(' ');

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-100 bg-[#f4f7f5]/85 px-4 py-3 backdrop-blur dark:border-slate-800 dark:bg-slate-950/85 lg:px-8">
      <div className="flex items-center gap-3">
        <button onClick={onMenuClick} className="lg:hidden text-slate-500">
          <Menu className="h-5 w-5" />
        </button>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-brand-600">CareLedger / clinic workspace</p>
          <h1 className="text-lg font-bold tracking-tight">{title}</h1>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button title="Open care inbox" aria-label="Open care inbox" onClick={() => navigate('/inbox')} className="relative rounded-lg p-2 text-slate-500 hover:bg-white hover:text-brand-600 dark:hover:bg-slate-800">
          <Bell className="h-[18px] w-[18px]" />
          {unreadCount > 0 && <span className="absolute right-1 top-1 min-w-4 rounded-full bg-amber-500 px-1 text-[9px] font-bold leading-4 text-white">{unreadCount}</span>}
        </button>
      <div className="relative">
        <button
          onClick={() => setMenuOpen((o) => !o)}
          className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-800"
        >
          <div className="grid h-8 w-8 place-items-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700 dark:bg-brand-900/40 dark:text-brand-300">
            {initials(first, rest.join(' '))}
          </div>
          <div className="hidden text-left sm:block">
            <p className="text-sm font-medium leading-tight">{user?.fullName}</p>
            <p className="text-xs text-slate-400 leading-tight">{user?.role}</p>
          </div>
          <ChevronDown className="h-4 w-4 text-slate-400" />
        </button>

        {menuOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
            <div className="card absolute right-0 z-20 mt-2 w-48 overflow-hidden p-1">
              <div className="px-3 py-2 text-xs text-slate-400 flex items-center gap-2">
                <User className="h-3.5 w-3.5" /> {user?.email}
              </div>
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <LogOut className="h-4 w-4" /> Log out
              </button>
            </div>
          </>
        )}
      </div>
      </div>
    </header>
  );
}
