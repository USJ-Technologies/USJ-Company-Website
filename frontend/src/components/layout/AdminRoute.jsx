import React from 'react';
import { Navigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';

const AdminRoute = ({ children }) => {
  const { profile, isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!isAuthenticated || !['admin', 'manager', 'staff'].includes(profile?.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default AdminRoute;
