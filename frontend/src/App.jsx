import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './components/Toast.jsx';
import ProtectedRoute from './routes/ProtectedRoute.jsx';
import AuthLayout from './layouts/AuthLayout.jsx';
import MainLayout from './layouts/MainLayout.jsx';

import Login from './pages/auth/Login.jsx';
import Dashboard from './pages/dashboard/Dashboard.jsx';
import PatientList from './pages/patients/PatientList.jsx';
import PatientProfile from './pages/patients/PatientProfile.jsx';
import DoctorList from './pages/doctors/DoctorList.jsx';
import DoctorProfile from './pages/doctors/DoctorProfile.jsx';
import DepartmentList from './pages/departments/DepartmentList.jsx';
import AppointmentList from './pages/appointments/AppointmentList.jsx';
import SecurityOperations from './pages/security/SecurityOperations.jsx';
import CareInbox from './pages/inbox/CareInbox.jsx';
import { CareInboxProvider } from './hooks/useCareInbox.jsx';

export default function App() {
  return (
    <ToastProvider>
      <CareInboxProvider>
      <Routes>
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
        </Route>

        <Route
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<Dashboard />} handle={{ title: 'Dashboard' }} />
          <Route path="/patients" element={<PatientList />} handle={{ title: 'Patients' }} />
          <Route path="/patients/:id" element={<PatientProfile />} handle={{ title: 'Patient Profile' }} />
          <Route path="/doctors" element={<DoctorList />} handle={{ title: 'Doctors' }} />
          <Route path="/doctors/:id" element={<DoctorProfile />} handle={{ title: 'Doctor Workspace' }} />
          <Route path="/departments" element={<DepartmentList />} handle={{ title: 'Departments' }} />
          <Route path="/appointments" element={<AppointmentList />} handle={{ title: 'Appointments' }} />
          <Route path="/inbox" element={<CareInbox />} handle={{ title: 'Care Inbox' }} />
          <Route path="/soc" element={<SecurityOperations />} handle={{ title: 'Security Operations' }} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      </CareInboxProvider>
    </ToastProvider>
  );
}
