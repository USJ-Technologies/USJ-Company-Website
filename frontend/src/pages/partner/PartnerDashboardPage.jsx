import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Package, ShoppingCart, Eye, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';
import useAuthStore from '../../store/authStore';
import Skeleton from '../../components/ui/Skeleton';

export default function PartnerDashboardPage() {
  const { profile, user } = useAuthStore();
  const partnerId = profile?.partner_id;

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalProducts: 0,
    activeProducts: 0,
    totalOrders: 0,
    totalViews: 0,
  });

  useEffect(() => {
    if (!partnerId) return;
    fetchStats();
  }, [partnerId]);

  const fetchStats = async () => {
    setLoading(true);
    try {
      // 1. Count USJ Partner's products
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('id', { count: 'exact', head: false })
        .eq('partner_id', partnerId);

      if (productsError) throw productsError;

      // 2. Count active products
      const { data: activeProducts, error: activeError } = await supabase
        .from('products')
        .select('id', { count: 'exact', head: false })
        .eq('partner_id', partnerId)
        .eq('is_active', true);

      if (activeError) throw activeError;

      // 3. Count order_items for USJ Partner's products
      const { data: orders, error: ordersError } = await supabase
        .from('order_items')
        .select('id', { count: 'exact', head: false })
        .eq('partner_id', partnerId);

      if (ordersError) throw ordersError;

      // 4. Count product views from analytics_events
      const { data: views, error: viewsError } = await supabase
        .from('analytics_events')
        .select('id', { count: 'exact', head: false })
        .eq('event_name', 'product_viewed')
        .in(
          'metadata->product_id',
          products?.map((p) => p.id) || []
        );

      if (viewsError) throw viewsError;

      setStats({
        totalProducts: products?.length || 0,
        activeProducts: activeProducts?.length || 0,
        totalOrders: orders?.length || 0,
        totalViews: views?.length || 0,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      toast.error('Failed to load dashboard stats');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold text-[#0A1628]">Welcome back!</h1>
        <p className="text-[#718096] mt-1">
          Manage your products, orders, and view your storefront analytics.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Products */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-6">
          {loading ? (
            <Skeleton className="h-20" />
          ) : (
            <>
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs font-semibold text-[#718096] uppercase tracking-wider">Total Products</p>
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Package size={20} className="text-blue-600" />
                </div>
              </div>
              <p className="text-3xl font-bold text-[#0A1628]">{stats.totalProducts}</p>
              <p className="text-xs text-[#718096] mt-2">
                {stats.activeProducts} active
              </p>
            </>
          )}
        </div>

        {/* Total Orders */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-6">
          {loading ? (
            <Skeleton className="h-20" />
          ) : (
            <>
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs font-semibold text-[#718096] uppercase tracking-wider">Total Orders</p>
                <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                  <ShoppingCart size={20} className="text-green-600" />
                </div>
              </div>
              <p className="text-3xl font-bold text-[#0A1628]">{stats.totalOrders}</p>
              <p className="text-xs text-[#718096] mt-2">
                Order items from customers
              </p>
            </>
          )}
        </div>

        {/* Total Views */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-6">
          {loading ? (
            <Skeleton className="h-20" />
          ) : (
            <>
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs font-semibold text-[#718096] uppercase tracking-wider">Total Views</p>
                <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                  <Eye size={20} className="text-purple-600" />
                </div>
              </div>
              <p className="text-3xl font-bold text-[#0A1628]">{stats.totalViews}</p>
              <p className="text-xs text-[#718096] mt-2">
                Product page views
              </p>
            </>
          )}
        </div>

        {/* Performance */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-6">
          {loading ? (
            <Skeleton className="h-20" />
          ) : (
            <>
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs font-semibold text-[#718096] uppercase tracking-wider">Performance</p>
                <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                  <TrendingUp size={20} className="text-orange-600" />
                </div>
              </div>
              <p className="text-3xl font-bold text-[#0A1628]">
                {stats.totalViews > 0 && stats.totalOrders > 0
                  ? ((stats.totalOrders / stats.totalViews) * 100).toFixed(1)
                  : '0'}
                %
              </p>
              <p className="text-xs text-[#718096] mt-2">
                Conversion rate
              </p>
            </>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Add Product Quick Link */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 text-center hover:shadow-md transition-shadow">
          <Package size={32} className="mx-auto text-blue-600 mb-3" />
          <h3 className="text-sm font-bold text-[#0A1628] mb-1">Add New Product</h3>
          <p className="text-xs text-[#718096] mb-4">
            List a new product to your storefront
          </p>
          <a
            href="/partner/products"
            className="inline-block px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-[6px] hover:bg-blue-700 transition-colors"
          >
            Go to Products
          </a>
        </div>

        {/* View Orders Quick Link */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 text-center hover:shadow-md transition-shadow">
          <ShoppingCart size={32} className="mx-auto text-green-600 mb-3" />
          <h3 className="text-sm font-bold text-[#0A1628] mb-1">View Orders</h3>
          <p className="text-xs text-[#718096] mb-4">
            Manage orders from your customers
          </p>
          <a
            href="/partner/orders"
            className="inline-block px-4 py-2 bg-green-600 text-white text-xs font-semibold rounded-[6px] hover:bg-green-700 transition-colors"
          >
            View All Orders
          </a>
        </div>
      </div>

      {/* Info Section */}
      <div className="bg-blue-50 rounded-xl border border-blue-200 p-6">
        <p className="text-sm text-blue-900 mb-2 font-semibold">💡 Tip</p>
        <p className="text-sm text-blue-800">
          Higher quality product descriptions, images, and competitive pricing can significantly boost your views and conversion rates. 
          Keep your inventory updated and respond quickly to customer inquiries for best results.
        </p>
      </div>
    </div>
  );
}
