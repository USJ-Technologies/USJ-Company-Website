import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import useAuthStore from './store/authStore';
import useCartStore from './store/cartStore';
import { getCartFromDb } from './lib/queries';

// Layouts & Wrappers
import Layout from './components/layout/Layout';
import AdminLayout from './components/layout/AdminLayout';
import ProtectedRoute from './components/layout/ProtectedRoute';
import AdminRoute from './components/layout/AdminRoute';

// Public Pages
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import ServicesPage from './pages/ServicesPage';
import VenturesPage from './pages/VenturesPage';
import ProjectsPage from './pages/ProjectsPage';
import CertificationsPage from './pages/CertificationsPage';
import CareersPage from './pages/CareersPage';
import ContactPage from './pages/ContactPage';
import ShopPage from './pages/ShopPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import QuoteRequestPage from './pages/QuoteRequestPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import WishlistPage from './pages/WishlistPage';

// Protected User Pages
import ProfilePage from './pages/ProfilePage';
import OrdersPage from './pages/OrdersPage';

// Admin Pages
import DashboardPage from './pages/admin/DashboardPage';
import ProductsAdminPage from './pages/admin/ProductsAdminPage';
import OrdersAdminPage from './pages/admin/OrdersAdminPage';
import InquiriesAdminPage from './pages/admin/InquiriesAdminPage';
import VenturesAdminPage from './pages/admin/VenturesAdminPage';
import CertificationsAdminPage from './pages/admin/CertificationsAdminPage';
import TeamAdminPage from './pages/admin/TeamAdminPage';
import AccessControlAdminPage from './pages/admin/AccessControlAdminPage';
import CareersAdminPage from './pages/admin/CareersAdminPage';

const App = () => {
  const { init, isAuthenticated } = useAuthStore();
  const { mergeWithDb } = useCartStore();

  // Init Supabase Auth listener on mount
  useEffect(() => { init(); }, [init]);

  // When user logs in, merge guest cart with any server cart
  useEffect(() => {
    if (!isAuthenticated) return;
    const userId = useAuthStore.getState().user?.id;
    if (userId) {
      getCartFromDb(userId).then(({ data }) => {
        if (data?.length) mergeWithDb(data);
      });
    }
  }, [isAuthenticated, mergeWithDb]);

  return (
    <Routes>
      {/* Public & user routes with standard Layout */}
      <Route element={<Layout />}>
        {/* Public */}
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/ventures" element={<VenturesPage />} />
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/certifications" element={<CertificationsPage />} />
        <Route path="/careers" element={<CareersPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/shop" element={<ShopPage />} />
        <Route path="/product/:slug" element={<ProductDetailPage />} />
        <Route path="/shop/product/:slug" element={<ProductDetailPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/quote-request" element={<QuoteRequestPage />} />
        <Route path="/wishlist" element={<WishlistPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected user */}
        <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="/orders" element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
      </Route>

      {/* Admin routes */}
      <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
        <Route index element={<DashboardPage />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="products" element={<ProductsAdminPage />} />
        <Route path="orders" element={<OrdersAdminPage />} />
        <Route path="inquiries" element={<InquiriesAdminPage />} />
        <Route path="ventures" element={<VenturesAdminPage />} />
        <Route path="certifications" element={<CertificationsAdminPage />} />
        <Route path="team" element={<TeamAdminPage />} />
        <Route path="access-control" element={<AccessControlAdminPage />} />
        <Route path="careers" element={<CareersAdminPage />} />
      </Route>
    </Routes>
  );
};

export default App;
