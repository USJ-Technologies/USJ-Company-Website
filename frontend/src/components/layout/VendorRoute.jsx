import React from 'react';
import { Navigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';

const VendorRoute = ({ children }) => {
  const { profile, isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!isAuthenticated || profile?.role !== 'vendor') {
    return <Navigate to="/" replace />;
  }

  // Optionally, also check if vendor is approved
  // For now, we allow vendor role; approval can be checked per-page if needed
  // const { data: vendor } = await supabase.from('vendors').select('status').eq('id', profile.vendor_id).single();
  // if (vendor?.status !== 'approved') return <Navigate to="/" replace />;

  return children;
};

export default VendorRoute;
