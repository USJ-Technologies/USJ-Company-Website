import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PackageOpen } from 'lucide-react';
import SectionHeader from '../ui/SectionHeader';
import { SkeletonProductCard } from '../ui/Skeleton';
import Button from '../ui/Button';
import { ROUTES } from '../../config/app';
import api from '../../services/api';
import ProductCard from '../shop/ProductCard';

export default function FeaturedProducts() {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    api.get('/products', { params: { isFeatured: true, limit: 8 } })
      .then(({ data }) => {
        if (!cancelled) {
          setProducts(data.data?.products || (Array.isArray(data.products) ? data.products : (Array.isArray(data) ? data : [])));
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError(true);
          setIsLoading(false);
        }
      });
    return () => { cancelled = true; };
  }, []);

  return (
    <section className="section-py" style={{ backgroundColor: '#F8F9FA' }}>
      <div className="container-max">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <SectionHeader
            label="OUR PRODUCTS"
            title="Explore Our Product Range"
            subtitle="Quality electronics and technology products for government, defence, and commercial procurement."
            className="mb-0"
          />
          <Button as={Link} to={ROUTES.SHOP} variant="secondary" size="sm" className="self-start sm:self-auto shrink-0">
            View All
          </Button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <SkeletonProductCard key={i} />
            ))}
          </div>
        ) : error || products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <PackageOpen size={48} className="text-gray-300 mb-4" />
            <h3 className="text-base font-semibold text-[#0A1628] mb-2">No featured products yet</h3>
            <p className="text-sm text-[#718096] mb-5">Check back soon or browse all our products.</p>
            <Button as={Link} to={ROUTES.SHOP} variant="primary">
              Browse All Products
            </Button>
          </div>
        ) : (
          <>
            {/* Desktop grid */}
            <div className="hidden md:grid grid-cols-4 gap-5">
              {products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
            {/* Mobile horizontal scroll */}
            <div className="md:hidden flex gap-4 overflow-x-auto pb-2 -mx-4 px-4" style={{ scrollSnapType: 'x mandatory' }}>
              {products.map((product) => (
                <div key={product._id} style={{ minWidth: 220, scrollSnapAlign: 'start' }}>
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </>
        )}

        <div className="mt-10 text-center">
          <Button as={Link} to={ROUTES.SHOP} variant="primary" size="lg">
            View All Products
          </Button>
        </div>
      </div>
    </section>
  );
}
