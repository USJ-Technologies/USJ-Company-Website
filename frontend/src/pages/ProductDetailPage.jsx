import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, ExternalLink, ChevronRight, Package, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { getProductBySlug, trackProductView } from '../lib/queries';
import useCartStore from '../store/cartStore';
import useAuthStore from '../store/authStore';
import Button from '../components/ui/Button';
import Skeleton from '../components/ui/Skeleton';

export default function ProductDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(null);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const addItem = useCartStore((s) => s.addItem);
  const { user, isAuthenticated } = useAuthStore();

  useEffect(() => {
    setLoading(true);
    setAdded(false);
    getProductBySlug(slug).then(({ data, error }) => {
      if (error || !data) {
        toast.error('Product not found');
      } else {
        setProduct(data);
        const primary = data.images?.find((i) => i.is_primary)?.url || data.images?.[0]?.url || data.primary_image_url;
        setActiveImage(primary);
        // Track this view for registered users (fire-and-forget)
        if (isAuthenticated && user?.id) {
          trackProductView(user.id, data.id, data.brand_name, data.category_name);
        }
      }
      setLoading(false);
    });
  }, [slug, isAuthenticated, user?.id]);

  const handleAddToCart = () => {
    addItem(product, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  };

  const handleRequestQuote = () => {
    addItem(product, qty);
    navigate('/cart');
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <Skeleton className="aspect-square rounded-2xl" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-2/3" />
            <Skeleton className="h-5 w-1/3" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-32 text-center">
        <Package size={56} className="mx-auto text-gray-300 mb-4" />
        <h2 className="text-2xl font-bold text-[#0A1628] mb-3">Product Not Found</h2>
        <p className="text-[#718096] mb-6">This product may have been removed or the link is incorrect.</p>
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0A1628] text-white rounded-[6px] text-sm font-semibold hover:bg-[#1a2a4a] transition-colors"
        >
          <ArrowLeft size={16} /> Back to Shop
        </Link>
      </div>
    );
  }

  const allImages = product.images?.length
    ? product.images.map((i) => i.url)
    : product.primary_image_url ? [product.primary_image_url] : [];

  const hasSpecs = product.specifications && Object.keys(product.specifications).length > 0;
  const hasKeyFeatures = product.key_features?.length > 0;
  const hasInBox = product.in_box?.length > 0;

  return (
    <div className="bg-[#F8F9FA] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1 text-sm text-[#718096] mb-6">
          <Link to="/" className="hover:text-[#0A1628]">Home</Link>
          <ChevronRight size={14} />
          <Link to="/shop" className="hover:text-[#0A1628]">Shop</Link>
          {product.brand_name && (
            <>
              <ChevronRight size={14} />
              <Link to={`/shop?brand=${product.brand_name}`} className="hover:text-[#0A1628]">
                {product.brand_name}
              </Link>
            </>
          )}
          <ChevronRight size={14} />
          <span className="text-[#0A1628] font-medium line-clamp-1">{product.name}</span>
        </nav>

        {/* Main content card */}
        <div className="bg-white rounded-2xl shadow-sm border border-[#E2E8F0] overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
            {/* ── Image Gallery ────────────────────────────── */}
            <div className="p-6 lg:p-10 bg-white border-b lg:border-b-0 lg:border-r border-[#E2E8F0] flex flex-col">
              {/* Main image */}
              <div className="flex-1 flex items-center justify-center bg-[#F8F9FA] rounded-xl overflow-hidden mb-4"
                style={{ minHeight: '300px', maxHeight: '420px' }}>
                {activeImage ? (
                  <img
                    src={activeImage}
                    alt={product.name}
                    className="max-h-full max-w-full object-contain p-6"
                  />
                ) : (
                  <div className="flex items-center justify-center h-64">
                    <Package size={64} className="text-gray-300" />
                  </div>
                )}
              </div>

              {/* Thumbnail strip */}
              {allImages.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-1">
                  {allImages.map((url, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImage(url)}
                      className={`flex-shrink-0 w-16 h-16 rounded-lg border-2 overflow-hidden transition-all ${
                        activeImage === url ? 'border-[#C9A84C]' : 'border-transparent hover:border-gray-300'
                      } bg-[#F8F9FA]`}
                    >
                      <img src={url} alt={`View ${i + 1}`} className="w-full h-full object-contain p-1" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* ── Product Info ─────────────────────────────── */}
            <div className="p-6 lg:p-10 flex flex-col">
              {/* Brand + category */}
              <div className="flex items-center gap-2 mb-3">
                {product.brand_name && (
                  <span className="text-xs font-bold tracking-widest text-[#C9A84C] uppercase">
                    {product.brand_name}
                  </span>
                )}
                {product.brand_name && product.category_name && (
                  <span className="text-[#E2E8F0]">•</span>
                )}
                {product.category_name && (
                  <span className="text-xs text-[#718096]">{product.category_name}</span>
                )}
              </div>

              <h1 className="text-2xl lg:text-3xl font-bold text-[#0A1628] leading-tight mb-2">
                {product.name}
              </h1>

              {product.model && (
                <p className="text-sm text-[#718096] mb-4">Model: <span className="font-medium text-[#4A5568]">{product.model}</span></p>
              )}

              {product.description && (
                <p className="text-sm text-[#4A5568] leading-relaxed mb-6 border-t border-[#E2E8F0] pt-4">
                  {product.description}
                </p>
              )}

              {/* Quantity selector */}
              <div className="flex items-center gap-4 mb-6">
                <span className="text-sm font-medium text-[#0A1628]">Quantity</span>
                <div className="flex items-center border border-[#E2E8F0] rounded-[6px] bg-[#F8F9FA]">
                  <button
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    className="w-9 h-9 flex items-center justify-center text-[#4A5568] hover:text-[#0A1628] text-lg font-medium transition-colors"
                  >
                    −
                  </button>
                  <span className="w-10 text-center text-sm font-bold text-[#0A1628]">{qty}</span>
                  <button
                    onClick={() => setQty((q) => q + 1)}
                    className="w-9 h-9 flex items-center justify-center text-[#4A5568] hover:text-[#0A1628] text-lg font-medium transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* CTA buttons */}
              <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <button
                  onClick={handleAddToCart}
                  className={`flex-1 py-3 rounded-[6px] text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
                    added
                      ? 'bg-green-600 text-white'
                      : 'bg-[#0A1628] text-white hover:bg-[#1a2a4a]'
                  }`}
                >
                  {added ? <><CheckCircle size={16} /> Added!</> : <><ShoppingCart size={16} /> Add to Cart</>}
                </button>
                <button
                  onClick={handleRequestQuote}
                  className="flex-1 py-3 rounded-[6px] text-sm font-semibold border-2 border-[#C9A84C] text-[#0A1628] hover:bg-[#C9A84C] hover:text-white transition-colors"
                >
                  Request Quote
                </button>
              </div>

              {/* Trust signals */}
              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-[#E2E8F0]">
                <div className="flex items-center gap-2 text-xs text-[#4A5568]">
                  <CheckCircle size={14} className="text-[#C9A84C] flex-shrink-0" />
                  <span>Genuine products</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-[#4A5568]">
                  <CheckCircle size={14} className="text-[#C9A84C] flex-shrink-0" />
                  <span>B2B &amp; Govt orders</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-[#4A5568]">
                  <CheckCircle size={14} className="text-[#C9A84C] flex-shrink-0" />
                  <span>GeM registered seller</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-[#4A5568]">
                  <CheckCircle size={14} className="text-[#C9A84C] flex-shrink-0" />
                  <span>Custom bulk pricing</span>
                </div>
              </div>

              {product.product_url && (
                <a
                  href={product.product_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-[#718096] hover:text-[#C9A84C] mt-4 transition-colors"
                >
                  <ExternalLink size={12} /> View on manufacturer site
                </a>
              )}
            </div>
          </div>
        </div>

        {/* ── Tabs: Key Features / Specifications / In the Box ── */}
        {(hasKeyFeatures || hasSpecs || hasInBox) && (
          <ProductTabs
            keyFeatures={product.key_features}
            specifications={product.specifications}
            inBox={product.in_box}
          />
        )}
      </div>
    </div>
  );
}

function ProductTabs({ keyFeatures = [], specifications = {}, inBox = [] }) {
  const tabs = [
    { id: 'features', label: 'Key Features', show: keyFeatures.length > 0 },
    { id: 'specs', label: 'Specifications', show: Object.keys(specifications).length > 0 },
    { id: 'inbox', label: 'In the Box', show: inBox.length > 0 },
  ].filter((t) => t.show);

  const [active, setActive] = useState(tabs[0]?.id ?? 'features');

  if (tabs.length === 0) return null;

  return (
    <div className="mt-6 bg-white rounded-2xl shadow-sm border border-[#E2E8F0] overflow-hidden">
      {/* Tab bar */}
      <div className="flex border-b border-[#E2E8F0]">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActive(tab.id)}
            className={`px-6 py-4 text-sm font-semibold transition-colors border-b-2 -mb-px ${
              active === tab.id
                ? 'border-[#C9A84C] text-[#0A1628]'
                : 'border-transparent text-[#718096] hover:text-[#0A1628]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="p-6 lg:p-10">
        {active === 'features' && (
          <ul className="space-y-3">
            {keyFeatures.map((f, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-[#4A5568]">
                <CheckCircle size={16} className="text-[#C9A84C] flex-shrink-0 mt-0.5" />
                <span>{f}</span>
              </li>
            ))}
          </ul>
        )}

        {active === 'specs' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
            {Object.entries(specifications).map(([key, value], i) => (
              <div
                key={key}
                className={`flex justify-between py-3 px-2 text-sm ${
                  i % 2 === 0 ? 'bg-[#F8F9FA]' : 'bg-white'
                } border-b border-[#E2E8F0]`}
              >
                <span className="text-[#718096] font-medium">{key}</span>
                <span className="text-[#0A1628] font-semibold text-right ml-4">{String(value)}</span>
              </div>
            ))}
          </div>
        )}

        {active === 'inbox' && (
          <ul className="space-y-2">
            {inBox.map((item, i) => (
              <li key={i} className="flex items-center gap-3 text-sm text-[#4A5568]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#C9A84C] flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
