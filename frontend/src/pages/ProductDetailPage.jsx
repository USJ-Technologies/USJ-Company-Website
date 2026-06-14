import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, ShoppingCart, ExternalLink, ChevronRight, Package,
  CheckCircle, Phone, Mail, MessageSquare, Shield, Truck, Award,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getProductBySlug, trackProductView } from '../lib/queries';
import useCartStore from '../store/cartStore';
import useAuthStore from '../store/authStore';
import Skeleton from '../components/ui/Skeleton';
import { APP_CONFIG, ROUTES } from '../config/app';

const BRAND_COLOR = { ENTER: '#1A56DB', TENDA: '#2D7D46', ZOOOK: '#C9A84C' };

const WHY_US = [
  { icon: Shield, label: 'Genuine Products', sub: 'Brand-authorised stock only' },
  { icon: Award, label: 'GeM Registered', sub: 'Trusted government supplier' },
  { icon: Truck, label: 'Pan-India Delivery', sub: 'Fast B2B shipping nationwide' },
  { icon: MessageSquare, label: 'Dedicated Support', sub: 'Pre & post-sales assistance' },
];

export default function ProductDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(null);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const addItem = useCartStore(s => s.addItem);
  const { user, isAuthenticated } = useAuthStore();

  useEffect(() => {
    setLoading(true);
    setAdded(false);
    getProductBySlug(slug).then(({ data, error }) => {
      if (error || !data) {
        toast.error('Product not found');
      } else {
        setProduct(data);
        const primary = data.images?.find(i => i.is_primary)?.url || data.images?.[0]?.url || data.primary_image_url;
        setActiveImage(primary);
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10">
          <Skeleton className="aspect-square rounded-2xl" />
          <div className="space-y-4">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-8 w-3/4" />
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
        <Link to="/shop" className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0A1628] text-white rounded-[6px] text-sm font-semibold hover:bg-[#1a2a4a] transition-colors">
          <ArrowLeft size={16} /> Back to Shop
        </Link>
      </div>
    );
  }

  const allImages = product.images?.length
    ? product.images.map(i => i.url)
    : product.primary_image_url ? [product.primary_image_url] : [];

  const hasSpecs = product.specifications && Object.keys(product.specifications).length > 0;
  const hasKeyFeatures = Array.isArray(product.key_features) && product.key_features.length > 0;
  const hasInBox = Array.isArray(product.in_box) && product.in_box.length > 0;
  const hasRichData = hasSpecs || hasKeyFeatures || hasInBox || product.description;
  const brandColor = BRAND_COLOR[product.brand_name] || '#0A1628';

  return (
    <div className="bg-[#F8F9FA] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-1 text-sm text-[#718096] mb-5 overflow-x-auto whitespace-nowrap">
          <Link to="/" className="hover:text-[#0A1628] shrink-0">Home</Link>
          <ChevronRight size={14} className="shrink-0" />
          <Link to="/shop" className="hover:text-[#0A1628] shrink-0">Shop</Link>
          {product.brand_name && (
            <>
              <ChevronRight size={14} className="shrink-0" />
              <Link to={`/shop?brand=${product.brand_name}`} className="hover:text-[#0A1628] shrink-0">{product.brand_name}</Link>
            </>
          )}
          {product.category_name && (
            <>
              <ChevronRight size={14} className="shrink-0" />
              <Link to={`/shop?category=${encodeURIComponent(product.category_name)}`} className="hover:text-[#0A1628] shrink-0">{product.category_name}</Link>
            </>
          )}
          <ChevronRight size={14} className="shrink-0" />
          <span className="text-[#0A1628] font-medium truncate max-w-[160px] sm:max-w-none">{product.name}</span>
        </nav>

        {/* Main content */}
        <div className="bg-white rounded-2xl shadow-sm border border-[#E2E8F0] overflow-hidden mb-5">
          <div className="grid grid-cols-1 lg:grid-cols-2">

            {/* ── Image Gallery ── */}
            <div className="p-5 sm:p-8 lg:p-10 border-b lg:border-b-0 lg:border-r border-[#E2E8F0] flex flex-col">
              <div
                className="flex items-center justify-center bg-[#F8F9FA] rounded-xl overflow-hidden mb-4 w-full"
                style={{ minHeight: 260, maxHeight: 420 }}
              >
                {activeImage ? (
                  <img src={activeImage} alt={product.name} className="max-h-full max-w-full object-contain p-4 sm:p-8" />
                ) : (
                  <div className="flex flex-col items-center justify-center h-64 text-gray-300">
                    <Package size={64} />
                    <p className="text-xs mt-2">No image</p>
                  </div>
                )}
              </div>
              {allImages.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {allImages.map((url, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImage(url)}
                      className={`flex-shrink-0 w-16 h-16 rounded-lg border-2 overflow-hidden transition-all bg-[#F8F9FA] ${activeImage === url ? 'border-[#C9A84C]' : 'border-transparent hover:border-gray-300'}`}
                    >
                      <img src={url} alt={`View ${i + 1}`} className="w-full h-full object-contain p-1" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* ── Product Info ── */}
            <div className="p-5 sm:p-8 lg:p-10 flex flex-col">
              {/* Brand + category badges */}
              <div className="flex items-center gap-2 flex-wrap mb-3">
                {product.brand_name && (
                  <span
                    className="text-xs font-bold tracking-widest uppercase px-2 py-0.5 rounded"
                    style={{ backgroundColor: `${brandColor}15`, color: brandColor }}
                  >
                    {product.brand_name}
                  </span>
                )}
                {product.category_name && (
                  <span className="text-xs text-[#718096] bg-[#F8F9FA] px-2 py-0.5 rounded border border-[#E2E8F0]">
                    {product.category_name}
                  </span>
                )}
              </div>

              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#0A1628] leading-tight mb-2">
                {product.name}
              </h1>

              {product.model && (
                <p className="text-sm text-[#718096] mb-4">
                  Model: <span className="font-semibold text-[#4A5568]">{product.model}</span>
                </p>
              )}

              {/* Description */}
              {product.description ? (
                <p className="text-sm text-[#4A5568] leading-relaxed mb-5 border-t border-[#E2E8F0] pt-4">
                  {product.description}
                </p>
              ) : (
                /* No description — show a helpful notice with manufacturer link */
                <div className="mb-5 border-t border-[#E2E8F0] pt-4">
                  <div className="bg-[#EBF4FF] rounded-xl p-4 border border-[#BFDBFE]">
                    <p className="text-sm font-semibold text-[#1A3A5C] mb-1">Looking for full specifications?</p>
                    <p className="text-xs text-[#3B5A8A] mb-3 leading-relaxed">
                      Our team can provide complete technical datasheets, comparison charts, and custom pricing for bulk orders.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Link
                        to={ROUTES.CONTACT}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0A1628] text-white text-xs font-semibold rounded-[6px] hover:bg-[#1A2E4A] transition-colors"
                      >
                        <Mail size={12} /> Request Datasheet
                      </Link>
                      {product.product_url && (
                        <a
                          href={product.product_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-[#BFDBFE] bg-white text-[#1A3A5C] text-xs font-semibold rounded-[6px] hover:border-[#0A1628] transition-colors"
                        >
                          <ExternalLink size={12} /> Manufacturer Site
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div className="flex items-center gap-4 mb-5">
                <span className="text-sm font-medium text-[#0A1628]">Quantity</span>
                <div className="flex items-center border border-[#E2E8F0] rounded-[6px] bg-[#F8F9FA]">
                  <button onClick={() => setQty(q => Math.max(1, q - 1))} className="w-9 h-9 flex items-center justify-center text-[#4A5568] hover:text-[#0A1628] text-lg font-medium">−</button>
                  <span className="w-10 text-center text-sm font-bold text-[#0A1628]">{qty}</span>
                  <button onClick={() => setQty(q => q + 1)} className="w-9 h-9 flex items-center justify-center text-[#4A5568] hover:text-[#0A1628] text-lg font-medium">+</button>
                </div>
              </div>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-3 mb-5">
                <button
                  onClick={handleAddToCart}
                  className={`flex-1 py-3 rounded-[6px] text-sm font-semibold flex items-center justify-center gap-2 transition-all ${added ? 'bg-green-600 text-white' : 'bg-[#0A1628] text-white hover:bg-[#1a2a4a]'}`}
                >
                  {added ? <><CheckCircle size={16} /> Added to Cart!</> : <><ShoppingCart size={16} /> Add to Cart</>}
                </button>
                <button
                  onClick={handleRequestQuote}
                  className="flex-1 py-3 rounded-[6px] text-sm font-semibold border-2 border-[#C9A84C] text-[#0A1628] hover:bg-[#C9A84C] hover:text-white transition-colors"
                >
                  Request Quote
                </button>
              </div>

              {/* Trust signals grid */}
              <div className="grid grid-cols-2 gap-2 pt-4 border-t border-[#E2E8F0]">
                {[
                  'Genuine products',
                  'B2B & Govt orders',
                  'GeM registered seller',
                  'Custom bulk pricing',
                ].map(t => (
                  <div key={t} className="flex items-center gap-2 text-xs text-[#4A5568]">
                    <CheckCircle size={13} className="text-[#C9A84C] flex-shrink-0" />
                    {t}
                  </div>
                ))}
              </div>

              {/* Manufacturer link (if description exists, show it here subtly) */}
              {product.product_url && product.description && (
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

        {/* Tabs: Key Features / Specifications / In The Box */}
        {(hasKeyFeatures || hasSpecs || hasInBox) && (
          <ProductTabs
            keyFeatures={product.key_features}
            specifications={product.specifications}
            inBox={product.in_box}
          />
        )}

        {/* Why Buy from USJ (shown when product has no rich content) */}
        {!hasRichData && (
          <div className="mt-5 bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-6 md:p-8">
            <h3 className="text-base font-bold text-[#0A1628] mb-4">Why Source From USJ Technologies?</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {WHY_US.map(({ icon: Icon, label, sub }) => (
                <div key={label} className="flex flex-col items-center text-center gap-2 p-4 bg-[#F8F9FA] rounded-xl border border-[#E2E8F0]">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#EBF4FF' }}>
                    <Icon size={18} className="text-[#0A1628]" />
                  </div>
                  <p className="text-xs font-bold text-[#0A1628]">{label}</p>
                  <p className="text-[10px] text-[#718096] leading-tight">{sub}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* B2B Bulk Order CTA — always shown */}
        <div className="mt-5 bg-[#0A1628] rounded-2xl p-6 md:p-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
            <div>
              <h3 className="text-lg font-bold text-white mb-1">Need a Bulk / Government Order?</h3>
              <p className="text-sm text-[#A0AEC0] max-w-xl leading-relaxed">
                We supply to government departments, defence establishments, corporate enterprises, and MSMEs. Get competitive B2B pricing, fast delivery, and full GST billing.
              </p>
              <div className="flex flex-wrap gap-3 mt-4">
                <div className="flex items-center gap-1.5 text-xs text-[#A0AEC0]">
                  <CheckCircle size={13} className="text-[#C9A84C]" /> GeM portal supplier
                </div>
                <div className="flex items-center gap-1.5 text-xs text-[#A0AEC0]">
                  <CheckCircle size={13} className="text-[#C9A84C]" /> GST invoice provided
                </div>
                <div className="flex items-center gap-1.5 text-xs text-[#A0AEC0]">
                  <CheckCircle size={13} className="text-[#C9A84C]" /> Pan-India delivery
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0">
              <Link
                to={ROUTES.CONTACT}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#C9A84C] text-[#0A1628] text-sm font-bold rounded-[6px] hover:bg-[#F0D585] transition-colors whitespace-nowrap"
              >
                <MessageSquare size={15} /> Request a Quote
              </Link>
              <a
                href={`tel:${APP_CONFIG.company.phone}`}
                className="flex items-center gap-2 px-5 py-2.5 border border-white/20 text-white text-sm font-semibold rounded-[6px] hover:bg-white/10 transition-colors whitespace-nowrap"
              >
                <Phone size={15} /> {APP_CONFIG.company.phone}
              </a>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

// ── Tabs Component ────────────────────────────────────────────────────────────
function ProductTabs({ keyFeatures = [], specifications = {}, inBox = [] }) {
  const tabs = [
    { id: 'features', label: 'Key Features', show: Array.isArray(keyFeatures) && keyFeatures.length > 0 },
    { id: 'specs', label: 'Specifications', show: specifications && Object.keys(specifications).length > 0 },
    { id: 'inbox', label: 'In The Box', show: Array.isArray(inBox) && inBox.length > 0 },
  ].filter(t => t.show);

  const [active, setActive] = useState(tabs[0]?.id ?? 'features');

  if (tabs.length === 0) return null;

  return (
    <div className="mt-5 bg-white rounded-2xl shadow-sm border border-[#E2E8F0] overflow-hidden">
      {/* Tab bar */}
      <div className="flex border-b border-[#E2E8F0] overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActive(tab.id)}
            className={`px-5 py-4 text-sm font-semibold transition-colors border-b-2 -mb-px whitespace-nowrap flex-shrink-0 ${
              active === tab.id ? 'border-[#C9A84C] text-[#0A1628]' : 'border-transparent text-[#718096] hover:text-[#0A1628]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="p-5 md:p-8 lg:p-10">
        {active === 'features' && (
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {keyFeatures.map((f, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-[#4A5568]">
                <CheckCircle size={16} className="text-[#C9A84C] flex-shrink-0 mt-0.5" />
                <span>{f}</span>
              </li>
            ))}
          </ul>
        )}

        {active === 'specs' && (
          <div className="rounded-xl overflow-hidden border border-[#E2E8F0]">
            {Object.entries(specifications).map(([key, value], i) => (
              <div
                key={key}
                className={`flex text-sm border-b border-[#E2E8F0] last:border-b-0 ${i % 2 === 0 ? 'bg-[#F8F9FA]' : 'bg-white'}`}
              >
                <span className="px-4 py-3 text-[#718096] font-medium w-2/5 flex-shrink-0 border-r border-[#E2E8F0]">{key}</span>
                <span className="px-4 py-3 text-[#0A1628] font-semibold">{String(value)}</span>
              </div>
            ))}
          </div>
        )}

        {active === 'inbox' && (
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {inBox.map((item, i) => (
              <li key={i} className="flex items-center gap-3 text-sm text-[#4A5568] bg-[#F8F9FA] rounded-lg px-4 py-2.5 border border-[#E2E8F0]">
                <span className="w-2 h-2 rounded-full bg-[#C9A84C] flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
