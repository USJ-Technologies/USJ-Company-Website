import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useCartStore from '../store/cartStore';
import useAuthStore from '../store/authStore';
import api from '../services/api';
import { APP_CONFIG } from '../config/app';
import Button from '../components/ui/Button';
import toast from 'react-hot-toast';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { items, subtotal, clearCart } = useCartStore();
  const { user } = useAuthStore();
  
  const [loading, setLoading] = useState(false);
  const [shippingAddress, setShippingAddress] = useState({
    street: user?.address?.street || '',
    city: user?.address?.city || '',
    state: user?.address?.state || '',
    pinCode: user?.address?.pinCode || '',
    phone: user?.phone || '',
  });

  const gst = subtotal * 0.18;
  const shipping = subtotal > 0 ? (subtotal > 5000 ? 0 : 500) : 0;
  const total = subtotal + gst + shipping;

  useEffect(() => {
    if (items.length === 0) {
      navigate('/cart');
    }
  }, [items, navigate]);

  const handleInputChange = (e) => {
    setShippingAddress({ ...shippingAddress, [e.target.name]: e.target.value });
  };

  const initPayment = (data) => {
    const options = {
      key: APP_CONFIG.razorpayKeyId,
      amount: data.amount,
      currency: data.currency,
      name: APP_CONFIG.company.name,
      description: 'Order Payment',
      order_id: data.id,
      handler: async (response) => {
        try {
          const verifyUrl = '/orders/verify-payment';
          const { data: verifyData } = await api.post(verifyUrl, response);
          if (verifyData.success) {
            clearCart();
            toast.success('Payment successful! Order placed.');
            navigate('/orders');
          }
        } catch (error) {
          toast.error('Payment verification failed.');
        }
      },
      prefill: {
        name: user.name,
        email: user.email,
        contact: shippingAddress.phone,
      },
      theme: {
        color: '#0A1628',
      },
    };
    
    // Check if Razorpay is loaded
    if (window.Razorpay) {
      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response) {
        toast.error(response.error.description);
      });
      rzp.open();
    } else {
      toast.error('Razorpay SDK not loaded. Proceeding with dummy order creation for development.');
      // Fallback for development if Razorpay isn't loaded
      clearCart();
      toast.success('Order placed successfully (Dev Mode)');
      navigate('/orders');
    }
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // 1. Create order on backend
      const orderData = {
        items: items.map(i => ({ product: i.product._id, qty: i.qty, price: i.price })),
        shippingAddress,
      };
      
      const { data } = await api.post('/orders', orderData);
      
      // 2. Initialize Razorpay payment
      if (data.order && data.razorpayOrder) {
        initPayment(data.razorpayOrder);
      } else {
        // Fallback for Cash on Delivery or if no razorpay integration
        clearCart();
        toast.success('Order placed successfully!');
        navigate('/orders');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-[#0A1628] mb-8">Checkout</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold text-[#0A1628] mb-6">Shipping Address</h2>
              <form id="checkout-form" onSubmit={handleCheckout} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Street Address *</label>
                  <input 
                    type="text" 
                    name="street"
                    required
                    value={shippingAddress.street}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A84C] focus:border-transparent outline-none transition-all"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                    <input 
                      type="text" 
                      name="city"
                      required
                      value={shippingAddress.city}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A84C] focus:border-transparent outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
                    <input 
                      type="text" 
                      name="state"
                      required
                      value={shippingAddress.state}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A84C] focus:border-transparent outline-none transition-all"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">PIN Code *</label>
                    <input 
                      type="text" 
                      name="pinCode"
                      required
                      value={shippingAddress.pinCode}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A84C] focus:border-transparent outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                    <input 
                      type="text" 
                      name="phone"
                      required
                      value={shippingAddress.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A84C] focus:border-transparent outline-none transition-all"
                    />
                  </div>
                </div>
              </form>
            </div>
          </div>
          
          <div className="lg:col-span-1">
            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100 sticky top-24">
              <h2 className="text-xl font-bold text-[#0A1628] mb-6">Order Summary</h2>
              
              <div className="space-y-4 mb-6 max-h-60 overflow-y-auto pr-2">
                {items.map((item) => (
                  <div key={item.product._id} className="flex justify-between items-center text-sm">
                    <span className="text-gray-600 line-clamp-1 flex-1 pr-2">
                      {item.qty}x {item.product.name}
                    </span>
                    <span className="font-medium text-[#0A1628]">₹{(item.price * item.qty).toLocaleString()}</span>
                  </div>
                ))}
              </div>
              
              <div className="border-t border-gray-100 pt-4 space-y-3 mb-6">
                <div className="flex justify-between text-gray-600 text-sm">
                  <span>Subtotal</span>
                  <span className="font-medium text-[#0A1628]">₹{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-600 text-sm">
                  <span>GST (18%)</span>
                  <span className="font-medium text-[#0A1628]">₹{gst.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-600 text-sm">
                  <span>Shipping</span>
                  <span className="font-medium text-[#0A1628]">{shipping === 0 ? 'Free' : `₹${shipping.toLocaleString()}`}</span>
                </div>
              </div>
              
              <div className="border-t border-gray-100 pt-4 mb-8">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-[#0A1628]">Total</span>
                  <span className="text-2xl font-bold text-[#C9A84C]">₹{total.toLocaleString()}</span>
                </div>
              </div>
              
              <Button 
                type="submit"
                form="checkout-form"
                variant="primary" 
                size="lg" 
                className="w-full"
                isLoading={loading}
              >
                Pay & Place Order
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
