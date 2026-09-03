import React from 'react';
import { Navigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';

const PartnerRoute = ({ children }) => {
  const { profile, isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!isAuthenticated || profile?.role !== 'usj_partner') {
    return <Navigate to="/login?type=usj_partner" replace />;
  }

  // Optionally, also check if the USJ Partner is approved
  // For now, we allow the usj_partner role; approval can be checked per-page if needed
  // const { data: partner } = await supabase.from('usj_partners').select('status').eq('id', profile.partner_id).single();
  // if (partner?.status !== 'approved') return <Navigate to="/" replace />;

  return children;
};

export default PartnerRoute;
