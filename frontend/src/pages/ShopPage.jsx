import { useState, useEffect, useCallback } from 'react';
import { Package } from 'lucide-react';
import ProductCard from '../components/shop/ProductCard';
import ProductFilters from '../components/shop/ProductFilters';
import { SkeletonProductCard } from '../components/ui/Skeleton';
import Button from '../components/ui/Button';
import api from '../services/api';

const SORT_OPTIONS = [
  { label: 'Featured', value: 'featured' },
  { label: 'Price: Low to High', value: 'price_asc' },
  { label: 'Price: High to Low', value: 'price_desc' },
  { label: 'Newest', value: 'newest' },
];

const PAGE_SIZE = 20;

const emptyFilters = {
  search: '',
  categories: [],
  minPrice: '',
  maxPrice: '',
  inStock: false,
  isB2B: false,
};

export default function ShopPage() {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState(emptyFilters);
  const [sort, setSort] = useState('featured');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchProducts = useCallback(() => {
    setIsLoading(true);
    const params = {
      page,
      limit: PAGE_SIZE,
      sort,
      ...(filters.search && { search: filters.search }),
      ...(filters.categories?.length && { category: filters.categories.join(',') }),
      ...(filters.minPrice && { minPrice: filters.minPrice }),
      ...(filters.maxPrice && { maxPrice: filters.maxPrice }),
      ...(filters.inStock && { inStock: true }),
      ...(filters.isB2B !== undefined && filters.isB2B && { isB2B: true }),
    };
    api.get('/products', { params })
      .then(({ data }) => {
        const productsList = data.data?.products || (Array.isArray(data.products) ? data.products : (Array.isArray(data) ? data : []));
        setProducts(productsList);
        setTotal(data.data?.total || data.total || productsList.length);
        setIsLoading(false);
      })
      .catch(() => {
        setProducts([]);
        setIsLoading(false);
      });
  }, [filters, sort, page]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const handleFilterChange = (key, value) => {
    setFilters((f) => ({ ...f, [key]: value }));
    setPage(1);
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div>
      {/* Header */}
      <section className="py-8 bg-white border-b border-[#E2E8F0]">
        <div className="container-max">
          <h1 className="text-2xl md:text-3xl font-bold text-[#0A1628] mb-1">Shop Our Products</h1>
          <p className="text-sm text-[#718096]">Quality technology products for government, defence, and commercial buyers</p>
        </div>
      </section>

      <section className="section-py" style={{ backgroundColor: '#F8F9FA' }}>
        <div className="container-max">
          {/* Mobile filters toggle is inside ProductFilters */}
          <div className="flex gap-6">
            <ProductFilters filters={filters} onFilterChange={handleFilterChange} onClear={() => setFilters(emptyFilters)} />

            <div className="flex-1 min-w-0">
              {/* Sort + count bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                <p className="text-sm text-[#718096]">
                  {isLoading ? 'Loading...' : `${total} product${total !== 1 ? 's' : ''} found`}
                </p>
                <select
                  value={sort}
                  onChange={(e) => { setSort(e.target.value); setPage(1); }}
                  className="px-3 py-1.5 text-sm border border-[#E2E8F0] rounded-[6px] focus:outline-none focus:ring-2 focus:ring-[#C9A84C] bg-white"
                >
                  {SORT_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>

              {/* Search bar (mobile & desktop) */}
              <div className="mb-4 lg:hidden">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="w-full px-4 py-2 text-sm border border-[#E2E8F0] rounded-[6px] focus:outline-none focus:ring-2 focus:ring-[#C9A84C] bg-white"
                />
              </div>

              {/* Grid */}
              {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
                  {Array.from({ length: 8 }).map((_, i) => <SkeletonProductCard key={i} />)}
                </div>
              ) : products.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <Package size={48} className="text-gray-300 mb-4" />
                  <h3 className="font-semibold text-[#0A1628] mb-2">No products found</h3>
                  <p className="text-sm text-[#718096] mb-4">Try adjusting your filters or search term.</p>
                  <Button variant="secondary" size="sm" onClick={() => setFilters(emptyFilters)}>
                    Clear Filters
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
                  {products.map((product) => (
                    <ProductCard key={product._id} product={product} />
                  ))}
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-3 py-1.5 text-sm rounded-[6px] border border-[#E2E8F0] text-[#4A5568] hover:border-[#0A1628] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                    const p = i + 1;
                    return (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        className="w-9 h-9 text-sm rounded-[6px] border transition-colors"
                        style={{
                          borderColor: page === p ? '#0A1628' : '#E2E8F0',
                          backgroundColor: page === p ? '#0A1628' : 'transparent',
                          color: page === p ? '#fff' : '#4A5568',
                        }}
                      >
                        {p}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-3 py-1.5 text-sm rounded-[6px] border border-[#E2E8F0] text-[#4A5568] hover:border-[#0A1628] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
