import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import useAuthStore from './store/authStore';
import useCartStore from './store/cartStore';

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
import WishlistPage from './pages/WishlistPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

// Protected User Pages
import ProfilePage from './pages/ProfilePage';
import CheckoutPage from './pages/CheckoutPage';
import OrdersPage from './pages/OrdersPage';

// Admin Pages
import DashboardPage from './pages/admin/DashboardPage';
import ProductsAdminPage from './pages/admin/ProductsAdminPage';
import OrdersAdminPage from './pages/admin/OrdersAdminPage';
import InquiriesAdminPage from './pages/admin/InquiriesAdminPage';
import VenturesAdminPage from './pages/admin/VenturesAdminPage';
import CertificationsAdminPage from './pages/admin/CertificationsAdminPage';
import PDFImportPage from './pages/admin/PDFImportPage';

const App = () => {
  const { getMe } = useAuthStore();
  const { syncWithBackend } = useCartStore();

  useEffect(() => {
    getMe();
    syncWithBackend();
  }, [getMe, syncWithBackend]);

  return (
    <Routes>
      {/* Public & Protected Routes with Standard Layout */}
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
        <Route path="/wishlist" element={<WishlistPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        
        {/* Protected User */}
        <Route path="/profile" element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        } />
        <Route path="/checkout" element={
          <ProtectedRoute>
            <CheckoutPage />
          </ProtectedRoute>
        } />
        <Route path="/orders" element={
          <ProtectedRoute>
            <OrdersPage />
          </ProtectedRoute>
        } />
      </Route>

      {/* Admin Routes with Admin Layout */}
      <Route path="/admin" element={
        <AdminRoute>
          <AdminLayout />
        </AdminRoute>
      }>
        <Route index element={<DashboardPage />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="products" element={<ProductsAdminPage />} />
        <Route path="orders" element={<OrdersAdminPage />} />
        <Route path="inquiries" element={<InquiriesAdminPage />} />
        <Route path="ventures" element={<VenturesAdminPage />} />
        <Route path="certifications" element={<CertificationsAdminPage />} />
        <Route path="pdf-import" element={<PDFImportPage />} />
      </Route>
    </Routes>
  );
};

export default App;
