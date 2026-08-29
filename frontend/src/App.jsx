import React, { useEffect } from 'react';
import useAuthStore from './store/authStore';
import useCartStore from './store/cartStore';
import { getCartFromDb } from './lib/queries';
import { trackSessionEndBeacon } from './lib/analytics';
import { Routes, Route, useLocation } from 'react-router-dom';

// Layouts & Wrappers
import Layout from './components/layout/Layout';
import AdminLayout from './components/layout/AdminLayout';
import VendorLayout from './components/layout/VendorLayout';
import ProtectedRoute from './components/layout/ProtectedRoute';
import AdminRoute from './components/layout/AdminRoute';
import VendorRoute from './components/layout/VendorRoute';
import ContactCaptureModal from './components/shop/ContactCaptureModal';

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
import BlogListPage from './pages/BlogListPage';
import BlogPostPage from './pages/BlogPostPage';
import CartPage from './pages/CartPage';
import QuoteRequestPage from './pages/QuoteRequestPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import WishlistPage from './pages/WishlistPage';
import BecomeSellerPage from './pages/BecomeSellerPage';
import VendorStorefrontPage from './pages/VendorStorefrontPage';
import SellerTermsPage from './pages/SellerTermsPage';

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
import BlogAdminPage from './pages/admin/BlogAdminPage';
import ReviewsAdminPage from './pages/admin/ReviewsAdminPage';
import AnalyticsPage from './pages/admin/AnalyticsPage';
import VendorsAdminPage from './pages/admin/VendorsAdminPage';

// Vendor Pages
import VendorDashboardPage from './pages/vendor/VendorDashboardPage';
import VendorProductsPage from './pages/vendor/VendorProductsPage';
import VendorOrdersPage from './pages/vendor/VendorOrdersPage';
import VendorAddProductPage from './pages/vendor/VendorAddProductPage';

const App = () => {
  const { init, isAuthenticated } = useAuthStore();
  const { mergeWithDb } = useCartStore();

  // Init Supabase Auth listener on mount and track session end on unload
  useEffect(() => {
    init();
    let ended = false;
    const handleSessionEnd = () => {
      if (ended) return;
      ended = true;
      trackSessionEndBeacon();
    };

    window.addEventListener('beforeunload', handleSessionEnd);
    window.addEventListener('pagehide', handleSessionEnd);

    return () => {
      window.removeEventListener('beforeunload', handleSessionEnd);
      window.removeEventListener('pagehide', handleSessionEnd);
    };
  }, [init]);

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

// Track pageviews in GA4 on every route change (SPA navigation doesn't reload the page)
const location = useLocation();
useEffect(() => {
  if (typeof window.gtag !== 'function') return;
  window.gtag('event', 'page_view', {
    page_path: location.pathname + location.search,
    page_location: window.location.href,
    page_title: document.title,
  });
}, [location]);

  return (
    <>
      <ContactCaptureModal />
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
        <Route path="/blog" element={<BlogListPage />} />
        <Route path="/blog/:slug" element={<BlogPostPage />} />
        <Route path="/product/:slug" element={<ProductDetailPage />} />
        <Route path="/shop/product/:slug" element={<ProductDetailPage />} />
        <Route path="/store/:slug" element={<VendorStorefrontPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/quote-request" element={<QuoteRequestPage />} />
        <Route path="/seller-terms" element={<SellerTermsPage />} />
        <Route path="/wishlist" element={<WishlistPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/become-a-seller" element={<BecomeSellerPage />} />

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
        <Route path="vendors" element={<VendorsAdminPage />} />
        <Route path="careers" element={<CareersAdminPage />} />
        <Route path="blog" element={<BlogAdminPage />} />
        <Route path="reviews" element={<ReviewsAdminPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
      </Route>

      {/* Vendor routes */}
      <Route path="/vendor" element={<VendorRoute><VendorLayout /></VendorRoute>}>
        <Route index element={<VendorDashboardPage />} />
        <Route path="dashboard" element={<VendorDashboardPage />} />
        <Route path="products" element={<VendorProductsPage />} />
        <Route path="products/new" element={<VendorAddProductPage />} />
        <Route path="products/:productId" element={<VendorAddProductPage />} />
        <Route path="orders" element={<VendorOrdersPage />} />
      </Route>
      </Routes>
    </>
  );
};

export default App;