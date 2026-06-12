import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import Skeleton from '../components/ui/Skeleton';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { Package, ArrowRight, Eye } from 'lucide-react';
import toast from 'react-hot-toast';

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await api.get('/orders');
        setOrders(data.data?.orders || data.orders || []);
      } catch (error) {
        toast.error('Failed to load orders');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const getStatusColor = (status) => {
    switch(status) {
      case 'Processing': return 'warning';
      case 'Shipped': return 'primary';
      case 'Delivered': return 'success';
      case 'Cancelled': return 'danger';
      default: return 'secondary';
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-[#0A1628] mb-8">My Orders</h1>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32 w-full rounded-2xl" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center shadow-sm border border-gray-100">
            <Package size={64} className="mx-auto text-gray-300 mb-6" />
            <h2 className="text-2xl font-bold text-[#0A1628] mb-2">No Orders Yet</h2>
            <p className="text-gray-500 mb-8">You haven't placed any orders with us yet.</p>
            <Button as={Link} to="/shop" variant="primary">
              Start Shopping
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex flex-wrap justify-between items-center gap-4">
                  <div className="flex gap-8">
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Order Placed</p>
                      <p className="font-medium text-[#0A1628]">{new Date(order.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Total Amount</p>
                      <p className="font-medium text-[#0A1628]">₹{(order.pricing?.total || order.totalPrice || 0).toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Order ID</p>
                      <p className="font-medium text-[#0A1628]">#{order._id.substring(order._id.length - 8).toUpperCase()}</p>
                    </div>
                  </div>
                  <div>
                    <Badge variant={getStatusColor(order.status)} className="px-3 py-1 text-sm">
                      {order.status}
                    </Badge>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="space-y-4">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex items-center gap-4 py-2">
                        <div className="w-16 h-16 bg-gray-50 rounded-lg flex items-center justify-center p-2 overflow-hidden">
                          {item.product?.image ? (
                            <img src={item.product.image} alt={item.product.name} className="max-w-full max-h-full object-contain" />
                          ) : (
                            <Package size={24} className="text-gray-400" />
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-[#0A1628] line-clamp-1">
                            {item.product?.name || 'Product unavailable'}
                          </h4>
                          <p className="text-sm text-gray-500">Qty: {item.qty}</p>
                        </div>
                        <div className="font-medium text-[#0A1628]">
                          ₹{(item.price * item.qty).toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* <div className="mt-6 pt-4 border-t border-gray-100 flex justify-end">
                    <Button variant="secondary" size="sm" rightIcon={<Eye size={16} />}>
                      View Invoice
                    </Button>
                  </div> */}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersPage;
