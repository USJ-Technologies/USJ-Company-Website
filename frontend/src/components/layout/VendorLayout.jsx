import { useState } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import {
  LayoutDashboard, Package, ShoppingCart, Menu, X, LogOut, ChevronRight,
} from 'lucide-react';
import { ROUTES } from '../../config/app';
import useAuthStore from '../../store/authStore';

const VENDOR_NAV_ITEMS = [
  { label: 'Dashboard', to: ROUTES.VENDOR_DASHBOARD, icon: LayoutDashboard },
  { label: 'Products', to: ROUTES.VENDOR_PRODUCTS, icon: Package },
  { label: 'Orders', to: ROUTES.VENDOR_ORDERS, icon: ShoppingCart },
];

function Sidebar({ user, onClose }) {
  const location = useLocation();
  const { logout } = useAuthStore();
  const isActive = (to) => location.pathname === to || location.pathname.startsWith(to + '/');

  return (
    <aside className="h-full flex flex-col" style={{ backgroundColor: '#0A1628', width: 240 }}>
      <div className="px-5 py-5 border-b" style={{ borderColor: '#1A2E4A' }}>
        <Link to={ROUTES.HOME} className="block" onClick={onClose}>
          <span className="text-lg font-bold text-white">USJ</span>
          <span className="text-lg font-bold text-[#C9A84C]"> Seller</span>
        </Link>
        <p className="text-xs text-[#4A5568] mt-0.5">Your Store</p>
      </div>

      <nav className="flex-1 py-4 px-3 space-y-0.5 overflow-y-auto">
        {VENDOR_NAV_ITEMS.map(({ label, to, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            onClick={onClose}
            className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors"
            style={{
              backgroundColor: isActive(to) ? '#1A2E4A' : 'transparent',
              color: isActive(to) ? '#C9A84C' : '#A0AEC0',
            }}
          >
            <Icon size={17} />
            {label}
            {isActive(to) && <ChevronRight size={14} className="ml-auto" />}
          </Link>
        ))}
      </nav>

      <div className="px-3 py-4 border-t" style={{ borderColor: '#1A2E4A' }}>
        <div className="flex items-center gap-2 px-3 mb-3">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
            style={{ backgroundColor: '#C9A84C', color: '#0A1628' }}
          >
            {user?.name?.[0] || 'V'}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-white truncate">{user?.name || 'Vendor'}</p>
            <p className="text-xs text-[#4A5568] truncate">Seller · {user?.email}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-2 px-3 py-2 w-full rounded-md text-sm text-[#A0AEC0] hover:bg-red-900/20 hover:text-red-400 transition-colors"
        >
          <LogOut size={15} /> Logout
        </button>
      </div>
    </aside>
  );
}

export default function VendorLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { user, profile } = useAuthStore();

  const currentPage = VENDOR_NAV_ITEMS.find(
    (n) => location.pathname === n.to || location.pathname.startsWith(n.to + '/')
  );

  const sidebarUser = { ...user, name: profile?.name ?? user?.email };

  return (
    <div className="flex h-screen overflow-hidden bg-[#F8F9FA]">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex shrink-0">
        <Sidebar user={sidebarUser} onClose={undefined} />
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0">
            <Sidebar user={sidebarUser} onClose={() => setSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header
          className="shrink-0 flex items-center justify-between px-6 py-4 bg-white border-b border-[#E2E8F0]"
          style={{ height: 64 }}
        >
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-md text-[#4A5568] hover:bg-gray-100"
              aria-label="Open sidebar"
            >
              <Menu size={20} />
            </button>
            <h1 className="text-lg font-semibold text-[#0A1628]">
              {currentPage?.label || 'Vendor Dashboard'}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to={ROUTES.HOME}
              className="text-sm text-[#4A5568] hover:text-[#0A1628] transition-colors hidden sm:block"
              target="_blank"
              rel="noopener noreferrer"
            >
              View Site →
            </Link>
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
              style={{ backgroundColor: '#C9A84C', color: '#0A1628' }}
            >
              {sidebarUser?.name?.[0] || 'V'}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
