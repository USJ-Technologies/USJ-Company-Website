import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

export default function Layout() {
  // Public pages are public — for guests, customers, partners and staff
  // alike. A partner needs to be able to open their own /store/:slug and
  // check how a product page reads, and staff need to preview the live
  // site; neither is possible if this layout redirects them away.
  //
  // Role separation is enforced where it belongs instead: login lands each
  // role in its own portal (LoginPage DEFAULT_DESTINATIONS), and the portal
  // layouts carry no storefront chrome — no cart, no shop, no add-to-cart.
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
