import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import useCartStore from '../store/cartStore';
import useWishlistStore from '../store/wishlistStore';
import Button from '../components/ui/Button';
import Skeleton from '../components/ui/Skeleton';
import Badge from '../components/ui/Badge';
import { ShoppingCart, Heart, ArrowLeft, Check, ShieldCheck, Truck } from 'lucide-react';
import toast from 'react-hot-toast';

const ProductDetailPage = () => {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mainImage, setMainImage] = useState(null);
  const [qty, setQty] = useState(1);

  const { addItem: addToCart } = useCartStore();
  const { toggleItem: toggleWishlist, isInWishlist } = useWishlistStore();

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/products/${slug}`);
        const productData = data.data?.product || data.product || data;
        setProduct(productData);
        setMainImage(productData?.images?.[0] || productData?.imageUrl || null);
      } catch (error) {
        toast.error('Failed to load product details');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <Skeleton className="h-[500px] w-full rounded-2xl" />
          <div className="space-y-6">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 text-center">
        <h2 className="text-3xl font-bold text-[#0A1628] mb-4">Product Not Found</h2>
        <p className="text-gray-600 mb-8">The product you are looking for does not exist or has been removed.</p>
        <Button as={Link} to="/shop" variant="primary" leftIcon={<ArrowLeft size={18} />}>
          Back to Shop
        </Button>
      </div>
    );
  }

  const isWished = isInWishlist(product._id);
  const inStock = product.stock > 0;
  const hasDiscount = product.salePrice && product.salePrice < product.price;

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link to="/shop" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-[#0A1628] transition-colors">
            <ArrowLeft size={16} className="mr-2" />
            Back to Products
          </Link>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
            {/* Image Gallery */}
            <div className="p-8 lg:p-12 bg-gray-50/50 flex flex-col justify-center">
              <div className="relative aspect-square w-full max-w-md mx-auto mb-6 bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
                <img 
                  src={mainImage || 'https://via.placeholder.com/600'} 
                  alt={product.name}
                  className="w-full h-full object-contain p-8"
                />
                {!inStock && (
                  <div className="absolute top-4 left-4">
                    <Badge variant="danger">Out of Stock</Badge>
                  </div>
                )}
                {inStock && hasDiscount && (
                  <div className="absolute top-4 left-4">
                    <Badge variant="success">Sale</Badge>
                  </div>
                )}
              </div>
              {product.images && product.images.length > 0 && (
                <div className="flex gap-4 overflow-x-auto py-2 px-2 justify-center">
                  {product.images.map((img, i) => (
                    <button 
                      key={i}
                      onClick={() => setMainImage(img)}
                      className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${mainImage === img ? 'border-[#C9A84C]' : 'border-transparent hover:border-gray-200'} bg-white`}
                    >
                      <img src={img} alt={`Gallery ${i}`} className="w-full h-full object-contain p-2" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="p-8 lg:p-12 flex flex-col justify-center border-l border-gray-100">
              <div className="mb-2">
                <span className="text-sm font-semibold tracking-wider text-[#C9A84C] uppercase">
                  {product.categoryName || product.category?.name || (typeof product.category === 'string' ? product.category : '')}
                </span>
              </div>
              <h1 className="text-3xl lg:text-4xl font-bold text-[#0A1628] leading-tight mb-4">
                {product.name}
              </h1>
              
              <div className="flex items-center gap-4 mb-6">
                {hasDiscount ? (
                  <div className="flex items-baseline gap-3">
                    <span className="text-3xl font-bold text-[#0A1628]">₹{product.salePrice.toLocaleString()}</span>
                    <span className="text-xl text-gray-400 line-through">₹{product.price.toLocaleString()}</span>
                  </div>
                ) : (
                  <span className="text-3xl font-bold text-[#0A1628]">₹{product.price?.toLocaleString() || 0}</span>
                )}
              </div>

              <div className="prose prose-sm text-gray-600 mb-8 leading-relaxed">
                <p>{product.description}</p>
              </div>

              {/* Actions */}
              <div className="space-y-6">
                <div className="flex items-center gap-6">
                  <div className="flex items-center border border-gray-200 rounded-lg bg-gray-50">
                    <button 
                      onClick={() => setQty(Math.max(1, qty - 1))}
                      disabled={!inStock}
                      className="px-4 py-3 text-gray-500 hover:text-[#0A1628] disabled:opacity-50 transition-colors"
                    >
                      -
                    </button>
                    <span className="w-12 text-center font-semibold text-[#0A1628]">{qty}</span>
                    <button 
                      onClick={() => setQty(Math.min(product.stock || 1, qty + 1))}
                      disabled={!inStock || qty >= product.stock}
                      className="px-4 py-3 text-gray-500 hover:text-[#0A1628] disabled:opacity-50 transition-colors"
                    >
                      +
                    </button>
                  </div>
                  <span className="text-sm text-gray-500">
                    {inStock ? (
                      <span className="flex items-center text-green-600 font-medium">
                        <Check size={16} className="mr-1" /> {product.stock} in stock
                      </span>
                    ) : (
                      'Out of stock'
                    )}
                  </span>
                </div>

                <div className="flex gap-4">
                  <Button 
                    variant="primary" 
                    size="lg" 
                    className="flex-1"
                    disabled={!inStock}
                    leftIcon={<ShoppingCart size={20} />}
                    onClick={() => addToCart(product, qty)}
                  >
                    Add to Cart
                  </Button>
                  <Button 
                    variant={isWished ? 'accent' : 'secondary'} 
                    size="lg" 
                    className="px-6"
                    onClick={() => toggleWishlist(product)}
                  >
                    <Heart size={20} className={isWished ? 'fill-current' : ''} />
                  </Button>
                </div>
              </div>

              {/* Features list */}
              <div className="mt-10 pt-8 border-t border-gray-100 grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <ShieldCheck size={20} className="text-[#C9A84C]" />
                  <span>Genuine Products</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Truck size={20} className="text-[#C9A84C]" />
                  <span>Fast Delivery</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Specifications */}
        {product.specifications && Object.keys(product.specifications).length > 0 && (
          <div className="mt-12 bg-white rounded-3xl p-8 lg:p-12 shadow-sm border border-gray-100">
            <h3 className="text-2xl font-bold text-[#0A1628] mb-6">Technical Specifications</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-12">
              {Object.entries(product.specifications).map(([key, value]) => (
                <div key={key} className="flex justify-between py-3 border-b border-gray-100">
                  <span className="text-gray-500 capitalize">{key}</span>
                  <span className="font-medium text-[#0A1628] text-right">{value}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetailPage;
