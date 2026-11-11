import React from 'react';
import { Outlet } from 'react-router-dom';

export default function AuthLayout() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f4f7f5] px-4 dark:bg-slate-950">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_15%,rgba(32,169,141,0.16),transparent_30%),radial-gradient(circle_at_85%_85%,rgba(245,158,11,0.12),transparent_28%)]" />
      <div className="relative w-full"><Outlet /></div>
    </div>
  );
}
