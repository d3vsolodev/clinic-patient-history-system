import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';

export default function ProtectedRoute({ children, permission }) {
  const { user, loading, hasPermission } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (permission && !hasPermission(permission)) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-2 text-center">
        <p className="text-lg font-semibold">Access denied</p>
        <p className="text-sm text-slate-500">You don't have permission to view this page.</p>
      </div>
    );
  }

  return children;
}
