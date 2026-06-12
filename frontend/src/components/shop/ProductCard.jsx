import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Image, Star } from 'lucide-react';
import Badge from '../ui/Badge';
import { formatPrice } from '../../utils/formatPrice';
import { ROUTES } from '../../config/app';
import useCartStore from '../../store/cartStore';
import useWishlistStore from '../../store/wishlistStore';

/**
 * @param {{ product: object, compact?: boolean }} props
 */
export default function ProductCard({ product, compact = false }) {
  const [imgError, setImgError] = useState(false);
  const addItem = useCartStore((s) => s.addItem);
  const { toggleItem, isInWishlist } = useWishlistStore();
  const inWishlist = isInWishlist(product._id);

  const mainImage = product.images?.[0] || product.imageUrl || null;
  const price = product.salePrice || product.price;
  const hasDiscount = product.salePrice && product.price && product.salePrice < product.price;
  const inStock = product.stock === undefined || product.stock > 0;

  const catName = product.categoryName || product.category?.name || (typeof product.category === 'string' ? product.category : '') || 'Product';

  const categoryBadgeType = () => {
    const cat = catName.toLowerCase();
    if (cat.includes('surveillance') || cat.includes('defence')) return 'defence';
    if (cat.includes('govt') || cat.includes('government')) return 'govt';
    if (cat.includes('network')) return 'tech';
    return 'private';
  };

  return (
    <div
      className="bg-white rounded-[8px] border border-[#E2E8F0] overflow-hidden card-hover flex flex-col"
      style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}
    >
      {/* Image */}
      <div className="relative overflow-hidden bg-gray-100" style={{ paddingTop: compact ? '60%' : '70%' }}>
        {mainImage && !imgError ? (
          <img
            src={mainImage}
            alt={product.name}
            onError={() => setImgError(true)}
            className="absolute inset-0 w-full h-full object-contain p-3"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <Image size={32} className="text-gray-300" />
          </div>
        )}

        {/* Category badge */}
        <div className="absolute top-2 left-2">
          <Badge type={categoryBadgeType()}>
            {catName}
          </Badge>
        </div>

        {/* Wishlist button */}
        <button
          onClick={(e) => { e.preventDefault(); toggleItem(product); }}
          className="absolute top-2 right-2 p-1.5 rounded-full bg-white/80 hover:bg-white transition-colors shadow-sm"
          aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart
            size={15}
            style={{ fill: inWishlist ? '#C53030' : 'none', color: inWishlist ? '#C53030' : '#718096' }}
          />
        </button>

        {/* Stock badge */}
        {!inStock && (
          <div className="absolute bottom-2 left-2">
            <Badge type="danger">Out of Stock</Badge>
          </div>
        )}

        {/* Discount badge */}
        {hasDiscount && (
          <div
            className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded text-xs font-bold text-white"
            style={{ backgroundColor: '#C53030' }}
          >
            -{Math.round((1 - product.salePrice / product.price) * 100)}%
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col flex-1">
        {product.brand && (
          <p className="text-xs text-[#718096] mb-1">{product.brand}</p>
        )}
        <Link
          to={ROUTES.PRODUCT_DETAIL(product.slug || product._id)}
          className="text-sm font-bold text-[#0A1628] hover:text-[#C9A84C] transition-colors line-clamp-2 mb-2 leading-snug"
        >
          {product.name}
        </Link>

        {/* Price or B2B */}
        <div className="mb-3 flex-1 flex items-end">
          {product.isB2B ? (
            <span className="text-xs font-semibold text-[#4A5568] bg-[#F8F9FA] px-2 py-1 rounded border border-[#E2E8F0]">
              Contact for Quote
            </span>
          ) : (
            <div>
              {hasDiscount && (
                <span className="text-xs text-[#718096] line-through mr-1">
                  {formatPrice(product.price)}
                </span>
              )}
              <span className="text-base font-bold" style={{ color: hasDiscount ? '#C53030' : '#0A1628' }}>
                {formatPrice(price)}
              </span>
            </div>
          )}
        </div>

        {/* CTA */}
        {product.isB2B ? (
          <Link
            to={ROUTES.CONTACT}
            className="w-full py-2 rounded-[6px] text-xs font-semibold text-center text-[#0A1628] border border-[#0A1628] hover:bg-[#0A1628] hover:text-white transition-colors"
          >
            Get Quote
          </Link>
        ) : (
          <button
            onClick={() => inStock && addItem(product, 1)}
            disabled={!inStock}
            className="w-full py-2 rounded-[6px] text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
            style={{
              backgroundColor: inStock ? '#0A1628' : '#E2E8F0',
              color: inStock ? '#fff' : '#A0AEC0',
              cursor: inStock ? 'pointer' : 'not-allowed',
            }}
          >
            <ShoppingCart size={13} />
            {inStock ? 'Add to Cart' : 'Out of Stock'}
          </button>
        )}
      </div>
    </div>
  );
}
