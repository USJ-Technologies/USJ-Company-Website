import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import Badge from '../../components/ui/Badge';
import Skeleton from '../../components/ui/Skeleton';
import { Search, Package, ExternalLink, Star } from 'lucide-react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

const PAGE_SIZE = 30;

const BRAND_COLORS = { ENTER: '#1A56DB', TENDA: '#2D7D46', ZOOOK: '#C9A84C' };

const ProductsAdminPage = () => {
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [brandFilter, setBrandFilter] = useState('');
  const [page, setPage] = useState(1);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from('products')
      .select('id, name, slug, brand_name, category_name, primary_image_url, is_active, is_featured, is_b2b, model', { count: 'exact' })
      .order('brand_name')
      .order('name')
      .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);

    if (search) query = query.ilike('name', `%${search}%`);
    if (brandFilter) query = query.eq('brand_name', brandFilter);

    const { data, count, error } = await query;
    if (error) {
      toast.error('Failed to load products');
    } else {
      setProducts(data ?? []);
      setTotal(count ?? 0);
    }
    setLoading(false);
  }, [search, brandFilter, page]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const toggleField = async (id, field, current) => {
    const { error } = await supabase
      .from('products')
      .update({ [field]: !current })
      .eq('id', id);
    if (error) {
      toast.error(`Failed to update ${field}`);
    } else {
      setProducts((prev) => prev.map((p) => p.id === id ? { ...p, [field]: !current } : p));
    }
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0A1628]">Products</h1>
          <p className="text-sm text-[#718096]">{total} total products in the catalog</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#718096]" />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-9 pr-3 py-2 text-sm border border-[#E2E8F0] rounded-[6px] focus:outline-none focus:ring-2 focus:ring-[#C9A84C] bg-white"
          />
        </div>
        <div className="flex gap-2">
          {['', 'ENTER', 'TENDA', 'ZOOOK'].map((b) => (
            <button
              key={b}
              onClick={() => { setBrandFilter(b); setPage(1); }}
              className="px-3 py-2 text-xs font-semibold rounded-[6px] border transition-colors"
              style={{
                borderColor: brandFilter === b ? '#0A1628' : '#E2E8F0',
                backgroundColor: brandFilter === b ? '#0A1628' : 'transparent',
                color: brandFilter === b ? '#fff' : '#4A5568',
              }}
            >
              {b || 'All'}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#F8F9FA] border-b border-[#E2E8F0] text-xs uppercase tracking-wider text-[#718096]">
                <th className="px-4 py-3 font-semibold">Product</th>
                <th className="px-4 py-3 font-semibold hidden sm:table-cell">Brand / Category</th>
                <th className="px-4 py-3 font-semibold text-center">Active</th>
                <th className="px-4 py-3 font-semibold text-center">Featured</th>
                <th className="px-4 py-3 font-semibold text-right">View</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0F4F8]">
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i}>
                    <td className="px-4 py-3"><Skeleton className="h-8 w-48" /></td>
                    <td className="px-4 py-3 hidden sm:table-cell"><Skeleton className="h-5 w-32" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-6 w-10 mx-auto" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-6 w-10 mx-auto" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-6 w-8 ml-auto" /></td>
                  </tr>
                ))
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-4 py-16 text-center text-[#718096] text-sm">
                    <Package size={36} className="mx-auto text-gray-300 mb-3" />
                    No products found
                  </td>
                </tr>
              ) : (
                products.map((p) => (
                  <tr key={p.id} className="hover:bg-[#F8F9FA] transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 flex-shrink-0 bg-[#F8F9FA] rounded-[6px] border border-[#E2E8F0] flex items-center justify-center overflow-hidden">
                          {p.primary_image_url ? (
                            <img src={p.primary_image_url} alt={p.name} className="w-full h-full object-contain p-0.5" />
                          ) : (
                            <Package size={14} className="text-gray-300" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-[#0A1628] truncate max-w-[180px]">{p.name}</p>
                          {p.model && <p className="text-[10px] text-[#718096]">{p.model}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <div className="flex flex-col gap-0.5">
                        <span
                          className="text-[10px] font-bold tracking-wider"
                          style={{ color: BRAND_COLORS[p.brand_name] ?? '#718096' }}
                        >
                          {p.brand_name}
                        </span>
                        <span className="text-xs text-[#718096] truncate max-w-[120px]">{p.category_name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => toggleField(p.id, 'is_active', p.is_active)}
                        className={`w-8 h-4 rounded-full transition-colors ${p.is_active ? 'bg-green-500' : 'bg-gray-300'}`}
                        title={p.is_active ? 'Active — click to deactivate' : 'Inactive — click to activate'}
                      >
                        <span className={`block w-3.5 h-3.5 rounded-full bg-white shadow-sm transition-transform mx-auto ${p.is_active ? 'translate-x-2' : '-translate-x-2'}`} />
                      </button>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => toggleField(p.id, 'is_featured', p.is_featured)}
                        title={p.is_featured ? 'Featured — click to unfeature' : 'Not featured — click to feature'}
                      >
                        <Star
                          size={16}
                          className={p.is_featured ? 'fill-[#C9A84C] text-[#C9A84C]' : 'text-gray-300 hover:text-[#C9A84C]'}
                        />
                      </button>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        to={`/product/${p.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 text-[#718096] hover:text-[#0A1628] transition-colors inline-block"
                        title="View on storefront"
                      >
                        <ExternalLink size={14} />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-[#E2E8F0]">
            <p className="text-xs text-[#718096]">
              Page {page} of {totalPages} · {total} products
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 text-xs border border-[#E2E8F0] rounded-[6px] text-[#4A5568] hover:border-[#0A1628] disabled:opacity-40"
              >
                Previous
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1.5 text-xs border border-[#E2E8F0] rounded-[6px] text-[#4A5568] hover:border-[#0A1628] disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductsAdminPage;
