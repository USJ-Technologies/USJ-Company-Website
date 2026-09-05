import { Navigate, Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import { ROUTES } from '../../config/app';
import useAuthStore from '../../store/authStore';

export default function Layout() {
  const { profile } = useAuthStore();

  // USJ Partner accounts are dashboard-only — the public storefront isn't
  // theirs to browse. Guests and customers are untouched: `profile` stays null
  // until a signed-in user's row loads, so first paint is never gated on auth.
  // None of the /partner/* routes render through this layout, so redirecting
  // here cannot loop.
  if (profile?.role === 'usj_partner') {
    return <Navigate to={ROUTES.PARTNER_DASHBOARD} replace />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <main style={{ flex: 1 }}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
