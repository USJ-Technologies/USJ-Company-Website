import React from 'react';
import { Link } from 'react-router-dom';
import useWishlistStore from '../store/wishlistStore';
import useCartStore from '../store/cartStore';
import Button from '../components/ui/Button';
import { Heart, ShoppingCart, Trash2 } from 'lucide-react';

const WishlistPage = () => {
  const { items, removeItem } = useWishlistStore();
  const { addItem } = useCartStore();

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center bg-gray-50 py-20 px-4">
        <div className="bg-white p-10 rounded-full shadow-sm mb-6 border border-gray-100">
          <Heart size={64} className="text-gray-300" />
        </div>
        <h2 className="text-2xl font-bold text-[#0A1628] mb-2">Your Wishlist is Empty</h2>
        <p className="text-gray-500 mb-8 text-center max-w-md">Save items you love to your wishlist to review or buy them later.</p>
        <Button as={Link} to="/shop" variant="primary" size="lg">
          Explore Products
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-[#0A1628] mb-8">My Wishlist</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {items.map((product) => (
            <div key={product._id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col hover:shadow-md transition-shadow">
              <Link to={`/product/${product.slug}`} className="relative aspect-square mb-4 rounded-xl overflow-hidden bg-gray-50 flex items-center justify-center p-4">
                <img 
                  src={product.images?.[0] || product.imageUrl || product.image || 'https://via.placeholder.com/300'} 
                  alt={product.name} 
                  className="max-w-full max-h-full object-contain"
                />
              </Link>
              
              <div className="flex-1 flex flex-col">
                <span className="text-xs font-semibold tracking-wider text-[#C9A84C] uppercase mb-1">
                  {product.categoryName || product.category?.name || (typeof product.category === 'string' ? product.category : '')}
                </span>
                <Link to={`/product/${product.slug}`} className="text-lg font-bold text-[#0A1628] line-clamp-1 mb-2 hover:text-[#C9A84C] transition-colors">
                  {product.name}
                </Link>
                
                <div className="mt-auto pt-4 flex items-center justify-between">
                  <span className="text-xl font-bold text-[#0A1628]">
                    ₹{(product.salePrice || product.price || 0).toLocaleString()}
                  </span>
                  
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => removeItem(product._id)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                      title="Remove from wishlist"
                    >
                      <Trash2 size={18} />
                    </button>
                    <Button 
                      variant="primary" 
                      size="sm"
                      onClick={() => addItem(product)}
                      disabled={product.stock <= 0}
                      title={product.stock > 0 ? "Add to cart" : "Out of stock"}
                    >
                      <ShoppingCart size={16} />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WishlistPage;
