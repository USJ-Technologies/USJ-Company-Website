import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Menu, X, Search, ShoppingCart, User, ChevronDown,
  LogOut, Package, Settings,
} from 'lucide-react';
import { APP_CONFIG, ROUTES } from '../../config/app';
import useAuthStore from '../../store/authStore';
import useCartStore from '../../store/cartStore';

const navLinks = [
  { label: 'Home', to: ROUTES.HOME },
  { label: 'About', to: ROUTES.ABOUT },
  { label: 'Services', to: ROUTES.SERVICES },
  { label: 'Ventures', to: ROUTES.VENTURES },
  { label: 'Shop', to: ROUTES.SHOP },
  { label: 'Certifications', to: ROUTES.CERTIFICATIONS },
  { label: 'Contact', to: ROUTES.CONTACT },
];

export default function Navbar() {
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  const { user, profile, isAuthenticated, logout } = useAuthStore();
  const items = useCartStore((s) => s.items);
  const itemCount = items.reduce((acc, i) => acc + i.qty, 0);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setDrawerOpen(false);
    setProfileOpen(false);
  }, [location]);

  useEffect(() => {
    const handleClick = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const isActive = (to) =>
    to === '/' ? location.pathname === '/' : location.pathname.startsWith(to);

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 z-40 bg-white transition-all duration-200"
        style={{
          height: 64,
          boxShadow: scrolled ? '0 2px 12px rgba(0,0,0,0.08)' : '0 1px 0 #E2E8F0',
          backdropFilter: scrolled ? 'blur(8px)' : 'none',
        }}
      >
        <div className="container-max h-full flex items-center justify-between">
          {/* Logo */}
          <Link to={ROUTES.HOME} className="flex items-center gap-1 select-none">
            <span className="text-xl font-bold text-[#0A1628]">USJ</span>
            <span className="text-xl font-bold text-[#C9A84C]">Technologies</span>
            <span className="hidden sm:block text-xs text-[#718096] ml-1 mt-0.5 font-medium">Pvt Ltd</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1" aria-label="Main navigation">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="relative px-3 py-2 text-sm font-medium transition-colors"
                style={{
                  color: isActive(link.to) ? '#0A1628' : '#4A5568',
                }}
              >
                {link.label}
                {isActive(link.to) && (
                  <span
                    className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full bg-[#C9A84C]"
                    style={{ animation: 'none' }}
                  />
                )}
              </Link>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            <Link
              to={ROUTES.SHOP}
              className="p-2 rounded-md text-[#4A5568] hover:text-[#0A1628] hover:bg-gray-100 transition-colors"
              aria-label="Search products"
            >
              <Search size={18} />
            </Link>

            <Link
              to={ROUTES.CART}
              className="relative p-2 rounded-md text-[#4A5568] hover:text-[#0A1628] hover:bg-gray-100 transition-colors"
              aria-label={`Cart (${itemCount} items)`}
            >
              <ShoppingCart size={18} />
              {itemCount > 0 && (
                <span
                  className="absolute -top-0.5 -right-0.5 flex items-center justify-center text-white text-[10px] font-bold rounded-full"
                  style={{ backgroundColor: '#C9A84C', minWidth: 18, height: 18, padding: '0 3px' }}
                >
                  {itemCount > 9 ? '9+' : itemCount}
                </span>
              )}
            </Link>

            {isAuthenticated && user ? (
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setProfileOpen((v) => !v)}
                  className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium text-[#0A1628] hover:bg-gray-100 transition-colors"
                  aria-expanded={profileOpen}
                  aria-haspopup="true"
                >
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold"
                    style={{ backgroundColor: '#0A1628' }}
                  >
                    {(profile?.name || user?.email)?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <span className="max-w-[80px] truncate">{profile?.name?.split(' ')[0] || user?.email?.split('@')[0]}</span>
                  <ChevronDown size={14} />
                </button>

                {profileOpen && (
                  <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg border border-[#E2E8F0] shadow-lg py-1 z-50">
                    <Link to={ROUTES.PROFILE} className="flex items-center gap-2 px-4 py-2 text-sm text-[#0A1628] hover:bg-gray-50">
                      <User size={15} /> Profile
                    </Link>
                    <Link to={ROUTES.ORDERS} className="flex items-center gap-2 px-4 py-2 text-sm text-[#0A1628] hover:bg-gray-50">
                      <Package size={15} /> My Orders
                    </Link>
                    {['admin', 'manager', 'staff'].includes(profile?.role) && (
                      <Link to={ROUTES.ADMIN_DASHBOARD} className="flex items-center gap-2 px-4 py-2 text-sm text-[#0A1628] hover:bg-gray-50">
                        <Settings size={15} /> Admin Panel
                      </Link>
                    )}
                    <div className="border-t border-[#E2E8F0] mt-1 pt-1">
                      <button
                        onClick={logout}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                      >
                        <LogOut size={15} /> Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to={ROUTES.LOGIN}
                className="hidden md:flex items-center gap-1.5 px-4 py-1.5 rounded-[6px] text-sm font-semibold text-white bg-[#0A1628] hover:bg-[#1A2E4A] transition-colors"
              >
                <User size={15} /> Login
              </Link>
            )}

            {/* Mobile hamburger */}
            <button
              onClick={() => setDrawerOpen(true)}
              className="lg:hidden p-2 rounded-md text-[#0A1628] hover:bg-gray-100 transition-colors"
              aria-label="Open menu"
            >
              <Menu size={22} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setDrawerOpen(false)}
          />
          <div
            className="absolute right-0 top-0 bottom-0 w-72 bg-white shadow-2xl flex flex-col"
            style={{ animation: 'fadeUp 0.2s ease' }}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#E2E8F0]">
              <span className="font-bold text-[#0A1628]">
                USJ <span className="text-[#C9A84C]">Technologies</span>
              </span>
              <button
                onClick={() => setDrawerOpen(false)}
                className="p-1.5 rounded-md text-gray-500 hover:bg-gray-100"
                aria-label="Close menu"
              >
                <X size={20} />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto py-4 px-4 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="flex items-center px-3 py-2.5 rounded-md text-sm font-medium transition-colors"
                  style={{
                    backgroundColor: isActive(link.to) ? '#EBF4FF' : 'transparent',
                    color: isActive(link.to) ? '#0A1628' : '#4A5568',
                  }}
                  onClick={() => setDrawerOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="p-4 border-t border-[#E2E8F0]">
              {isAuthenticated && user ? (
                <div className="space-y-1">
                  <Link to={ROUTES.PROFILE} className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-[#0A1628] hover:bg-gray-50">
                    <User size={15} /> Profile
                  </Link>
                  <button
                    onClick={logout}
                    className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-red-600 hover:bg-red-50 w-full"
                  >
                    <LogOut size={15} /> Logout
                  </button>
                </div>
              ) : (
                <Link
                  to={ROUTES.LOGIN}
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-[6px] text-sm font-semibold text-white bg-[#0A1628]"
                  onClick={() => setDrawerOpen(false)}
                >
                  <User size={15} /> Login / Register
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Spacer */}
      <div style={{ height: 64 }} />
    </>
  );
}
