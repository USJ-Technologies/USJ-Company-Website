import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Package, CheckCircle } from 'lucide-react';
import useCartStore from '../../store/cartStore';

export default function ProductCard({ product }) {
  const [imgError, setImgError] = useState(false);
  const [added, setAdded] = useState(false);
  const addItem = useCartStore((s) => s.addItem);

  const imageUrl = product.primary_image_url;

  const handleAddToCart = (e) => {
    e.preventDefault();
    addItem(product, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="bg-white rounded-[8px] border border-[#E2E8F0] overflow-hidden flex flex-col group transition-shadow hover:shadow-md">
      {/* Image */}
      <Link to={`/product/${product.slug}`} className="block">
        <div className="relative overflow-hidden bg-[#F8F9FA]" style={{ paddingTop: '72%' }}>
          {imageUrl && !imgError ? (
            <img
              src={imageUrl}
              alt={product.name}
              onError={() => setImgError(true)}
              loading="lazy"
              className="absolute inset-0 w-full h-full object-contain p-3 group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-[#F8F9FA]">
              <Package size={36} className="text-gray-300" />
            </div>
          )}

          {/* Brand badge */}
          {product.brand_name && (
            <div className="absolute top-2 left-2">
              <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-[#0A1628] text-white uppercase tracking-wide">
                {product.brand_name}
              </span>
            </div>
          )}

          {/* B2B tag */}
          {product.is_b2b && (
            <div className="absolute top-2 right-2">
              <span className="px-1.5 py-0.5 text-[10px] font-semibold rounded bg-[#C9A84C] text-white">
                B2B
              </span>
            </div>
          )}
        </div>
      </Link>

      {/* Info */}
      <div className="p-3 flex flex-col flex-1">
        {product.category_name && (
          <p className="text-[10px] text-[#718096] uppercase tracking-wide mb-1">{product.category_name}</p>
        )}

        <Link
          to={`/product/${product.slug}`}
          className="text-sm font-semibold text-[#0A1628] hover:text-[#C9A84C] transition-colors line-clamp-2 leading-snug mb-2 flex-1"
        >
          {product.name}
        </Link>

        {/* Price */}
        <div className="mb-2">
          {product.unit_price != null ? (
            <p className="text-base font-bold text-[#0A1628]">
              {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(product.unit_price)}
            </p>
          ) : (
            <p className="text-xs text-[#718096] italic">Price on Request</p>
          )}
          <p className="text-[10px] font-semibold text-[#C9A84C] mt-0.5">Special bulk pricing available</p>
        </div>

        {/* CTA */}
        <button
          onClick={handleAddToCart}
          className={`w-full py-2 rounded-[6px] text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
            added
              ? 'bg-green-600 text-white'
              : 'bg-[#0A1628] text-white hover:bg-[#1a2a4a]'
          }`}
        >
          {added ? (
            <><CheckCircle size={13} /> Added</>
          ) : (
            <><ShoppingCart size={13} /> Add to Cart</>
          )}
        </button>
      </div>
    </div>
  );
}
