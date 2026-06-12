import React from 'react';
import { Link } from 'react-router-dom';
import useCartStore from '../store/cartStore';
import Button from '../components/ui/Button';
import { ShoppingBag, Trash2, ArrowRight } from 'lucide-react';

const CartPage = () => {
  const { items, updateQty, removeItem, subtotal } = useCartStore();
  
  const gst = subtotal * 0.18;
  const shipping = subtotal > 0 ? (subtotal > 5000 ? 0 : 500) : 0;
  const total = subtotal + gst + shipping;

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center bg-gray-50 py-20 px-4">
        <div className="bg-white p-10 rounded-full shadow-sm mb-6 border border-gray-100">
          <ShoppingBag size={64} className="text-gray-300" />
        </div>
        <h2 className="text-2xl font-bold text-[#0A1628] mb-2">Your Cart is Empty</h2>
        <p className="text-gray-500 mb-8 text-center max-w-md">Looks like you haven't added anything to your cart yet.</p>
        <Button as={Link} to="/shop" variant="primary" size="lg">
          Start Shopping
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-[#0A1628] mb-8">Shopping Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div key={item.product._id} className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row items-center gap-6">
                <div className="w-24 h-24 bg-gray-50 rounded-xl flex-shrink-0 flex items-center justify-center overflow-hidden p-2">
                  <img src={item.product.images?.[0] || item.product.imageUrl || item.product.image || 'https://via.placeholder.com/150'} alt={item.product.name} className="max-w-full max-h-full object-contain" />
                </div>
                
                <div className="flex-1 flex flex-col justify-center w-full text-center sm:text-left">
                  <Link to={`/product/${item.product.slug}`} className="text-lg font-semibold text-[#0A1628] hover:text-[#C9A84C] transition-colors line-clamp-1 mb-1">
                    {item.product.name}
                  </Link>
                  <span className="text-sm text-gray-500 mb-3">
                    {item.product.categoryName || item.product.category?.name || (typeof item.product.category === 'string' ? item.product.category : '')}
                  </span>
                  <div className="font-bold text-[#0A1628]">₹{(item.price || 0).toLocaleString()}</div>
                </div>

                <div className="flex items-center justify-between w-full sm:w-auto gap-6 sm:gap-4 mt-4 sm:mt-0">
                  <div className="flex items-center border border-gray-200 rounded-lg bg-gray-50">
                    <button 
                      onClick={() => updateQty(item.product._id, item.qty - 1)}
                      className="px-3 py-1.5 text-gray-500 hover:text-[#0A1628] transition-colors"
                    >
                      -
                    </button>
                    <span className="w-10 text-center font-medium text-sm">{item.qty}</span>
                    <button 
                      onClick={() => updateQty(item.product._id, item.qty + 1)}
                      className="px-3 py-1.5 text-gray-500 hover:text-[#0A1628] transition-colors"
                    >
                      +
                    </button>
                  </div>
                  
                  <div className="font-bold text-[#0A1628] min-w-[80px] text-right">
                    ₹{(item.price * item.qty).toLocaleString()}
                  </div>

                  <button 
                    onClick={() => removeItem(item.product._id)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="Remove item"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100 sticky top-24">
              <h2 className="text-xl font-bold text-[#0A1628] mb-6">Order Summary</h2>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-medium text-[#0A1628]">₹{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>GST (18%)</span>
                  <span className="font-medium text-[#0A1628]">₹{gst.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span className="font-medium text-[#0A1628]">{shipping === 0 ? 'Free' : `₹${shipping.toLocaleString()}`}</span>
                </div>
                {shipping > 0 && (
                  <div className="text-xs text-[#C9A84C] mt-1 bg-yellow-50 p-2 rounded border border-yellow-100">
                    Add ₹{(5000 - subtotal).toLocaleString()} more for free shipping!
                  </div>
                )}
              </div>
              
              <div className="border-t border-gray-100 pt-4 mb-8">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-[#0A1628]">Total</span>
                  <span className="text-2xl font-bold text-[#C9A84C]">₹{total.toLocaleString()}</span>
                </div>
              </div>
              
              <Button 
                as={Link} 
                to="/checkout" 
                variant="primary" 
                size="lg" 
                className="w-full"
                rightIcon={<ArrowRight size={18} />}
              >
                Proceed to Checkout
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
