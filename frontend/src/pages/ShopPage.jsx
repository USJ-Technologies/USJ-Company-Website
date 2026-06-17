import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Package, SlidersHorizontal, X, Sparkles } from 'lucide-react';
import SEOHead from '../components/seo/SEOHead';
import ProductCard from '../components/shop/ProductCard';
import { SkeletonProductCard } from '../components/ui/Skeleton';
import Button from '../components/ui/Button';
import { getProducts, getBrands, getAllCategories, getRecommendedForUser } from '../lib/queries';
import useAuthStore from '../store/authStore';

const PAGE_SIZE = 24;
const emptyFilters = { search: '', brand: '', category: '' };

function RecommendedStrip({ userId }) {
  const [recs, setRecs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) { setLoading(false); return; }
    getRecommendedForUser(userId, 4).then(({ data }) => {
      setRecs(data ?? []);
      setLoading(false);
    });
  }, [userId]);

  if (!loading && recs.length === 0) return null;

  return (
    <div className="mb-8 bg-white rounded-[8px] border border-[#E2E8F0] p-5">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles size={15} className="text-[#C9A84C]" />
        <h3 className="text-sm font-bold text-[#0A1628]">Recommended for You</h3>
        <span className="text-xs text-[#718096]">Based on your activity</span>
      </div>
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1,2,3,4].map((i) => <SkeletonProductCard key={i} />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {recs.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </div>
  );
}

// FilterPanel must be defined OUTSIDE ShopPage to prevent remount on every render
function FilterPanel({ filters, brands, visibleCategories, activeFilterCount, onFilter, onClear }) {
  return (
    <div className="space-y-6">
      {/* Search */}
      <div>
        <label className="block text-xs font-semibold text-[#0A1628] uppercase tracking-wider mb-2">
          Search
        </label>
        <input
          type="text"
          placeholder="Product name..."
          value={filters.search}
          onChange={(e) => onFilter('search', e.target.value)}
          className="w-full px-3 py-2 text-sm border border-[#E2E8F0] rounded-[6px] focus:outline-none focus:ring-2 focus:ring-[#C9A84C] bg-white"
        />
      </div>

      {/* Brand */}
      <div>
        <label className="block text-xs font-semibold text-[#0A1628] uppercase tracking-wider mb-2">
          Brand
        </label>
        <div className="flex flex-col gap-1.5">
          <button
            onClick={() => onFilter('brand', '')}
            className={`text-left px-3 py-1.5 rounded-[6px] text-sm transition-colors ${
              !filters.brand ? 'bg-[#0A1628] text-white' : 'text-[#4A5568] hover:bg-gray-100'
            }`}
          >
            All Brands
          </button>
          {brands.map((b) => (
            <button
              key={b.id}
              onClick={() => onFilter('brand', b.name)}
              className={`text-left px-3 py-1.5 rounded-[6px] text-sm transition-colors ${
                filters.brand === b.name ? 'bg-[#0A1628] text-white' : 'text-[#4A5568] hover:bg-gray-100'
              }`}
            >
              {b.name}
            </button>
          ))}
        </div>
      </div>

      {/* Category */}
      {visibleCategories.length > 0 && (
        <div>
          <label className="block text-xs font-semibold text-[#0A1628] uppercase tracking-wider mb-2">
            Category
          </label>
          <div className="flex flex-col gap-1.5 max-h-64 overflow-y-auto pr-1">
            <button
              onClick={() => onFilter('category', '')}
              className={`text-left px-3 py-1.5 rounded-[6px] text-sm transition-colors ${
                !filters.category ? 'bg-[#0A1628] text-white' : 'text-[#4A5568] hover:bg-gray-100'
              }`}
            >
              All Categories
            </button>
            {visibleCategories.map((c) => (
              <button
                key={c.id}
                onClick={() => onFilter('category', c.name)}
                className={`text-left px-3 py-1.5 rounded-[6px] text-sm transition-colors ${
                  filters.category === c.name ? 'bg-[#0A1628] text-white' : 'text-[#4A5568] hover:bg-gray-100'
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {activeFilterCount > 0 && (
        <button
          onClick={onClear}
          className="w-full py-2 text-sm text-[#C53030] border border-[#C53030] rounded-[6px] hover:bg-red-50 transition-colors"
        >
          Clear All Filters
        </button>
      )}
    </div>
  );
}

export default function ShopPage() {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState(() => ({
    ...emptyFilters,
    brand: searchParams.get('brand') || '',
    category: searchParams.get('category') || '',
  }));
  const [page, setPage] = useState(1);
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const { user, isAuthenticated } = useAuthStore();
  const hasActiveFilters = Object.values(filters).some(Boolean);

  useEffect(() => {
    getBrands().then(({ data }) => { if (data) setBrands(data); });
    getAllCategories().then(({ data }) => { if (data) setCategories(data); });
  }, []);

  const visibleCategories = filters.brand
    ? categories.filter((c) => c.brands?.name === filters.brand)
    : categories;

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    const { data, count, error } = await getProducts({
      page,
      limit: PAGE_SIZE,
      search: filters.search,
      brand: filters.brand,
      category: filters.category,
    });
    if (!error) {
      setProducts(data ?? []);
      setTotal(count ?? 0);
    }
    setIsLoading(false);
  }, [filters, page]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const handleFilter = (key, value) => {
    setFilters((f) => {
      const next = { ...f, [key]: value };
      if (key === 'brand') next.category = '';
      return next;
    });
    setPage(1);
  };

  const clearFilters = () => {
    setFilters(emptyFilters);
    setPage(1);
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);
  const activeFilterCount = [filters.brand, filters.category, filters.search].filter(Boolean).length;

  const filterProps = { filters, brands, visibleCategories, activeFilterCount, onFilter: handleFilter, onClear: clearFilters };

  return (
    <div>
      <SEOHead
        title="Shop – Networking, Electronics & IT Products"
        description="Buy ENTER switches, TENDA routers, ZOOOK speakers and 700+ electronics products from USJ Technologies – GeM registered B2B supplier in Dehradun. Bulk pricing, pan-India delivery, government procurement supported."
        keywords="buy networking products Dehradun, ENTER switch price India, TENDA router Uttarakhand, ZOOOK speaker buy, electronics wholesale Dehradun, B2B IT hardware supplier, network switch supplier Uttarakhand, PoE switch Dehradun, WiFi router bulk buy India, managed switch GeM, government electronics purchase, bulk IT equipment Uttarakhand"
        canonical="/shop"
        structuredData={{
          '@context': 'https://schema.org',
          '@type': 'ItemList',
          'name': 'IT & Electronics Products – USJ Technologies',
          'description': 'ENTER, TENDA, and ZOOOK brand networking and electronics products available for B2B purchase.',
          'url': 'https://usjtechnologies.com/shop',
          'itemListElement': [
            { '@type': 'ListItem', 'position': 1, 'name': 'ENTER Networking Products' },
            { '@type': 'ListItem', 'position': 2, 'name': 'TENDA WiFi & Networking' },
            { '@type': 'ListItem', 'position': 3, 'name': 'ZOOOK Audio & Accessories' },
          ],
        }}
      />
      {/* Page header */}
      <section className="py-8 bg-white border-b border-[#E2E8F0]">
        <div className="container-max">
          <h1 className="text-2xl md:text-3xl font-bold text-[#0A1628] mb-1">Shop Products</h1>
          <p className="text-sm text-[#718096]">
            Quality technology products for government, defence, and commercial buyers
          </p>
        </div>
      </section>

      {/* Mobile filter toggle */}
      <div className="lg:hidden sticky top-0 z-20 bg-white border-b border-[#E2E8F0] px-4 py-3 flex items-center justify-between">
        <p className="text-sm text-[#718096]">
          {isLoading ? 'Loading...' : `${total} products`}
          {activeFilterCount > 0 && (
            <span className="ml-2 px-1.5 py-0.5 text-xs bg-[#0A1628] text-white rounded-full">
              {activeFilterCount}
            </span>
          )}
        </p>
        <button
          onClick={() => setShowMobileFilters(true)}
          className="flex items-center gap-2 px-3 py-1.5 text-sm border border-[#E2E8F0] rounded-[6px] text-[#0A1628]"
        >
          <SlidersHorizontal size={14} />
          Filters
        </button>
      </div>

      {/* Mobile filter drawer */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowMobileFilters(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-72 bg-white p-6 overflow-y-auto shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-[#0A1628]">Filters</h3>
              <button onClick={() => setShowMobileFilters(false)}>
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            <FilterPanel {...filterProps} />
          </div>
        </div>
      )}

      <section className="section-py bg-[#F8F9FA]">
        <div className="container-max">
          <div className="flex gap-8">
            {/* Desktop sidebar */}
            <aside className="hidden lg:block w-56 flex-shrink-0">
              <div className="bg-white rounded-[8px] border border-[#E2E8F0] p-5 sticky top-24">
                <h3 className="font-bold text-sm text-[#0A1628] mb-4">Filters</h3>
                <FilterPanel {...filterProps} />
              </div>
            </aside>

            {/* Product grid */}
            <div className="flex-1 min-w-0">
              {/* Recommendations — only for logged-in users with no active filters */}
              {isAuthenticated && !hasActiveFilters && (
                <RecommendedStrip userId={user?.id} />
              )}

              <div className="flex items-center justify-between mb-5">
                <p className="text-sm text-[#718096]">
                  {isLoading ? (
                    <span className="inline-block w-24 h-4 bg-gray-200 rounded animate-pulse" />
                  ) : (
                    `${total} product${total !== 1 ? 's' : ''} found`
                  )}
                </p>
              </div>

              {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-5">
                  {Array.from({ length: 12 }).map((_, i) => <SkeletonProductCard key={i} />)}
                </div>
              ) : products.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                  <Package size={48} className="text-gray-300 mb-4" />
                  <h3 className="font-semibold text-[#0A1628] mb-2">No products found</h3>
                  <p className="text-sm text-[#718096] mb-4">Try adjusting your filters or search term.</p>
                  <Button variant="secondary" size="sm" onClick={clearFilters}>Clear Filters</Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-5">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-10">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-3 py-1.5 text-sm rounded-[6px] border border-[#E2E8F0] text-[#4A5568] hover:border-[#0A1628] disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  {Array.from({ length: Math.min(7, totalPages) }, (_, i) => {
                    const p = i + Math.max(1, Math.min(page - 3, totalPages - 6));
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
                    className="px-3 py-1.5 text-sm rounded-[6px] border border-[#E2E8F0] text-[#4A5568] hover:border-[#0A1628] disabled:opacity-40 disabled:cursor-not-allowed"
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
