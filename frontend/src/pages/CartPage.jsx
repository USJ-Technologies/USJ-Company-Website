import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Trash2, ArrowRight, Package, FileText } from 'lucide-react';
import useCartStore from '../store/cartStore';

export default function CartPage() {
  const { items, updateQty, removeItem, clearCart } = useCartStore();
  const navigate = useNavigate();

  const totalItems = items.reduce((acc, i) => acc + i.qty, 0);

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center bg-[#F8F9FA] py-20 px-4">
        <div className="bg-white p-10 rounded-full shadow-sm mb-6 border border-[#E2E8F0]">
          <ShoppingBag size={64} className="text-gray-300" />
        </div>
        <h2 className="text-2xl font-bold text-[#0A1628] mb-2">Your Cart is Empty</h2>
        <p className="text-[#718096] mb-8 text-center max-w-md">
          Browse our product catalog and add items you'd like to request a quote for.
        </p>
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#0A1628] text-white rounded-[6px] font-semibold hover:bg-[#1a2a4a] transition-colors"
        >
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-[#F8F9FA] min-h-screen py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-[#0A1628]">Your Cart</h1>
            <p className="text-sm text-[#718096] mt-1">
              {totalItems} item{totalItems !== 1 ? 's' : ''} — review your selection before requesting a quote
            </p>
          </div>
          <button
            onClick={clearCart}
            className="text-sm text-[#718096] hover:text-[#C53030] transition-colors"
          >
            Clear all
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-3">
            {items.map((item) => {
              const p = item.product;
              return (
                <div
                  key={p.id}
                  className="bg-white rounded-[8px] border border-[#E2E8F0] p-4 flex items-start gap-4"
                >
                  {/* Thumbnail */}
                  <div className="w-20 h-20 flex-shrink-0 bg-[#F8F9FA] rounded-[6px] flex items-center justify-center overflow-hidden border border-[#E2E8F0]">
                    {p.primary_image_url ? (
                      <img
                        src={p.primary_image_url}
                        alt={p.name}
                        className="w-full h-full object-contain p-1"
                      />
                    ) : (
                      <Package size={28} className="text-gray-300" />
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        {p.brand_name && (
                          <p className="text-[10px] font-bold text-[#C9A84C] uppercase tracking-wide mb-0.5">
                            {p.brand_name}
                          </p>
                        )}
                        <Link
                          to={`/product/${p.slug}`}
                          className="text-sm font-semibold text-[#0A1628] hover:text-[#C9A84C] transition-colors line-clamp-2"
                        >
                          {p.name}
                        </Link>
                        {p.model && (
                          <p className="text-xs text-[#718096] mt-0.5">Model: {p.model}</p>
                        )}
                        {p.category_name && (
                          <p className="text-xs text-[#718096]">{p.category_name}</p>
                        )}
                      </div>

                      <button
                        onClick={() => removeItem(p.id)}
                        className="flex-shrink-0 p-1.5 text-gray-400 hover:text-[#C53030] hover:bg-red-50 rounded transition-colors"
                        aria-label="Remove"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>

                    {/* Quantity control */}
                    <div className="flex items-center gap-3 mt-3">
                      <span className="text-xs text-[#718096]">Qty:</span>
                      <div className="flex items-center border border-[#E2E8F0] rounded-[6px] bg-[#F8F9FA]">
                        <button
                          onClick={() => updateQty(p.id, item.qty - 1)}
                          className="w-7 h-7 flex items-center justify-center text-[#4A5568] hover:text-[#0A1628] font-medium text-base"
                        >
                          −
                        </button>
                        <span className="w-8 text-center text-sm font-bold text-[#0A1628]">
                          {item.qty}
                        </span>
                        <button
                          onClick={() => updateQty(p.id, item.qty + 1)}
                          className="w-7 h-7 flex items-center justify-center text-[#4A5568] hover:text-[#0A1628] font-medium text-base"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quote Summary Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-[8px] border border-[#E2E8F0] p-6 sticky top-24">
              <h2 className="text-base font-bold text-[#0A1628] mb-1">Quote Summary</h2>
              <p className="text-xs text-[#718096] mb-5">
                We'll review your requirements and send you a custom quote within 24 hours.
              </p>

              {/* Items summary */}
              <div className="space-y-2 mb-5">
                {items.map((item) => (
                  <div key={item.product.id} className="flex justify-between text-sm">
                    <span className="text-[#4A5568] line-clamp-1 flex-1 mr-2">{item.product.name}</span>
                    <span className="text-[#0A1628] font-semibold flex-shrink-0">×{item.qty}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-[#E2E8F0] pt-4 mb-5">
                <div className="flex justify-between text-sm font-semibold">
                  <span className="text-[#4A5568]">Total items</span>
                  <span className="text-[#0A1628]">{totalItems}</span>
                </div>
              </div>

              {/* Info box */}
              <div className="bg-[#F8F9FA] border border-[#E2E8F0] rounded-[6px] p-3 mb-5">
                <p className="text-xs text-[#4A5568] leading-relaxed">
                  <span className="font-semibold text-[#0A1628]">How it works: </span>
                  Submit your quote request with your contact details. Our team will provide
                  competitive pricing and delivery timelines within 24 business hours.
                </p>
              </div>

              <button
                onClick={() => navigate('/quote-request')}
                className="w-full py-3 bg-[#0A1628] text-white rounded-[6px] text-sm font-semibold flex items-center justify-center gap-2 hover:bg-[#1a2a4a] transition-colors"
              >
                <FileText size={16} />
                Request a Quote
              </button>

              <Link
                to="/shop"
                className="block text-center text-xs text-[#718096] hover:text-[#0A1628] mt-3 transition-colors"
              >
                ← Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
