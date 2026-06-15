import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Package, CheckCircle } from 'lucide-react';
import useCartStore from '../../store/cartStore';

const BRAND_COLOR = { ENTER: '#1A56DB', TENDA: '#2D7D46', ZOOOK: '#C9A84C' };

export default function ProductCard({ product }) {
  const [imgError, setImgError] = useState(false);
  const [added, setAdded] = useState(false);
  const addItem = useCartStore((s) => s.addItem);

  const imageUrl = product.primary_image_url;
  const brandColor = BRAND_COLOR[product.brand_name] || '#0A1628';

  const handleAddToCart = (e) => {
    e.preventDefault();
    addItem(product, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="bg-white rounded-xl overflow-hidden flex flex-col group transition-all duration-200 hover:-translate-y-0.5"
      style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)', border: '1px solid #EAF0F8' }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.10)'}
      onMouseLeave={e => e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)'}
    >
      {/* Image well */}
      <Link to={`/product/${product.slug}`} className="block">
        <div
          className="relative overflow-hidden"
          style={{
            paddingTop: '75%',
            background: 'linear-gradient(135deg, #EBF2FA 0%, #DCE9F7 100%)',
          }}
        >
          {imageUrl && !imgError ? (
            <img
              src={imageUrl}
              alt={product.name}
              onError={() => setImgError(true)}
              loading="lazy"
              className="absolute inset-0 w-full h-full object-contain p-4 group-hover:scale-[1.04] transition-transform duration-300"
              style={{ filter: 'drop-shadow(0 4px 16px rgba(0,0,0,0.14))' }}
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
              <Package size={32} className="text-[#B0BEC5]" />
              <span className="text-[10px] text-[#90A4AE] font-medium">No image</span>
            </div>
          )}

          {/* Brand pill */}
          {product.brand_name && (
            <div className="absolute top-2.5 left-2.5">
              <span
                className="px-2 py-0.5 text-[10px] font-bold rounded-full uppercase tracking-wider text-white"
                style={{ backgroundColor: brandColor }}
              >
                {product.brand_name}
              </span>
            </div>
          )}

          {/* B2B tag */}
          {product.is_b2b && (
            <div className="absolute top-2.5 right-2.5">
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-[#0A1628]/80 text-[#C9A84C] backdrop-blur-sm">
                B2B
              </span>
            </div>
          )}
        </div>
      </Link>

      {/* Info */}
      <div className="p-3.5 flex flex-col flex-1">
        {product.category_name && (
          <p className="text-[10px] text-[#94A3B8] uppercase tracking-wider font-semibold mb-1">
            {product.category_name}
          </p>
        )}

        <Link
          to={`/product/${product.slug}`}
          className="text-[13px] font-semibold text-[#0A1628] hover:text-[#C9A84C] transition-colors line-clamp-2 leading-snug mb-2.5 flex-1"
        >
          {product.name}
        </Link>

        {/* Price */}
        <div className="mb-3">
          {product.unit_price != null ? (
            <p className="text-base font-bold text-[#0A1628]">
              {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(product.unit_price)}
            </p>
          ) : (
            <p className="text-xs text-[#64748B]">Price on Request</p>
          )}
          <p className="text-[10px] font-semibold text-[#C9A84C] mt-0.5">Bulk pricing available</p>
        </div>

        {/* CTA */}
        <button
          onClick={handleAddToCart}
          className={`w-full py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
            added
              ? 'bg-emerald-600 text-white'
              : 'bg-[#0A1628] text-white hover:bg-[#162640]'
          }`}
        >
          {added ? (
            <><CheckCircle size={13} /> Added to Cart</>
          ) : (
            <><ShoppingCart size={13} /> Add to Cart</>
          )}
        </button>
      </div>
    </div>
  );
}
