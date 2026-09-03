import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { ShoppingCart, Search, Package, User, Calendar, DollarSign } from 'lucide-react';
import toast from 'react-hot-toast';
import useAuthStore from '../../store/authStore';
import Skeleton from '../../components/ui/Skeleton';

const STATUS_BADGE = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  processing: 'bg-purple-100 text-purple-800',
  shipped: 'bg-cyan-100 text-cyan-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-gray-100 text-gray-800',
};

const PAGE_SIZE = 20;

export default function PartnerOrdersPage() {
  const { profile } = useAuthStore();
  const partnerId = profile?.partner_id;

  const [orderItems, setOrderItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    if (!partnerId) return;
    fetchOrderItems();
  }, [partnerId, statusFilter, currentPage]);

  const fetchOrderItems = async () => {
    if (!partnerId) return;
    setLoading(true);
    try {
      let query = supabase
        .from('order_items')
        .select(
          `
          *,
          order:orders(id, reference_number, user_id, status, created_at),
          product:products(name, sku)
          `,
          { count: 'exact' }
        )
        .eq('partner_id', partnerId);

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, count, error } = await query
        .order('created_at', { ascending: false })
        .range((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE - 1);

      if (error) throw error;

      setOrderItems(data ?? []);
      setTotalCount(count ?? 0);
    } catch (error) {
      console.error('Error fetching order items:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderItemId, newStatus) => {
    try {
      const { error } = await supabase
        .from('order_items')
        .update({ status: newStatus })
        .eq('id', orderItemId)
        .eq('partner_id', partnerId);

      if (error) throw error;

      setOrderItems((prev) =>
        prev.map((item) =>
          item.id === orderItemId ? { ...item, status: newStatus } : item
        )
      );

      toast.success('Order status updated');
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Failed to update order status');
    }
  };

  const filteredOrderItems = orderItems.filter((item) =>
    item.order?.reference_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.product?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#0A1628]">Orders</h1>
        <p className="text-sm text-[#718096] mt-0.5">
          Manage orders for your products
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] p-4 flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#718096]" />
          <input
            type="text"
            placeholder="Search by order number or product name..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-9 pr-3 py-2 text-sm border border-[#E2E8F0] rounded-[6px] focus:outline-none focus:ring-2 focus:ring-[#C9A84C]"
          />
        </div>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="px-3 py-2 text-sm border border-[#E2E8F0] rounded-[6px] focus:outline-none focus:ring-2 focus:ring-[#C9A84C] bg-white"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="processing">Processing</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      ) : filteredOrderItems.length === 0 ? (
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-12 text-center">
          <ShoppingCart size={40} className="mx-auto text-gray-300 mb-3" />
          <p className="text-sm font-semibold text-[#0A1628]">No orders found</p>
          <p className="text-xs text-[#718096] mt-1">
            {totalCount === 0
              ? 'You have no orders yet. When customers buy your products, they will appear here.'
              : 'No orders match your search'}
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {filteredOrderItems.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-xl border border-[#E2E8F0] p-4 hover:shadow-md transition-shadow"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                  {/* Order Number */}
                  <div>
                    <p className="text-xs font-semibold text-[#718096] uppercase tracking-wider">
                      Order
                    </p>
                    <p className="text-sm font-mono font-semibold text-[#0A1628] mt-1">
                      {item.order?.reference_number}
                    </p>
                  </div>

                  {/* Product */}
                  <div>
                    <p className="text-xs font-semibold text-[#718096] uppercase tracking-wider">
                      Product
                    </p>
                    <p className="text-sm text-[#0A1628] mt-1 truncate">
                      {item.product?.name}
                    </p>
                    <p className="text-xs text-[#718096]">
                      SKU: {item.product?.sku || 'N/A'}
                    </p>
                  </div>

                  {/* Quantity & Price */}
                  <div>
                    <p className="text-xs font-semibold text-[#718096] uppercase tracking-wider">
                      Details
                    </p>
                    <p className="text-sm text-[#0A1628] mt-1">
                      Qty: {item.quantity}
                    </p>
                    <p className="text-xs text-[#718096]">
                      ₹{item.unit_price.toFixed(2)} each
                    </p>
                  </div>

                  {/* Order Date */}
                  <div>
                    <p className="text-xs font-semibold text-[#718096] uppercase tracking-wider">
                      Order Date
                    </p>
                    <p className="text-sm text-[#0A1628] mt-1">
                      {new Date(item.order?.created_at).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-[#718096]">
                      {new Date(item.order?.created_at).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>

                  {/* Status */}
                  <div>
                    <p className="text-xs font-semibold text-[#718096] uppercase tracking-wider">
                      Status
                    </p>
                    <select
                      value={item.status}
                      onChange={(e) => handleStatusChange(item.id, e.target.value)}
                      className={`mt-1 px-2 py-1 text-xs font-semibold rounded-full border-0 cursor-pointer ${
                        STATUS_BADGE[item.status] || 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 text-sm border border-[#E2E8F0] rounded-[6px] hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(
                  (page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-2 py-1 text-sm rounded-[4px] ${
                        currentPage === page
                          ? 'bg-[#0A1628] text-white'
                          : 'border border-[#E2E8F0] hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  )
                )}
              </div>

              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-2 text-sm border border-[#E2E8F0] rounded-[6px] hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
