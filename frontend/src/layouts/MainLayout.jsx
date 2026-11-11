import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar.jsx';
import Navbar from '../components/Navbar.jsx';

export default function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { pathname } = useLocation();
  const title = pathname.startsWith('/patients/')
    ? 'Patient Profile'
    : pathname.startsWith('/doctors/')
      ? 'Doctor Workspace'
    : pathname.startsWith('/soc')
      ? 'Security Operations'
    : pathname.startsWith('/inbox')
      ? 'Care Inbox'
    : ({
        '/': 'Dashboard',
        '/patients': 'Patients',
        '/appointments': 'Appointments',
        '/doctors': 'Doctors',
        '/departments': 'Departments',
      }[pathname] || 'Dashboard');

  return (
    <div className="flex min-h-screen">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex min-h-screen flex-1 flex-col">
        <Navbar onMenuClick={() => setSidebarOpen(true)} title={title} />
        <main className="flex-1 px-4 py-6 lg:px-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
