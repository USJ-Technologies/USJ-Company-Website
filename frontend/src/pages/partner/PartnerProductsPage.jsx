import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Package, Plus, Search, Edit2, Trash2, Eye, EyeOff, Loader } from 'lucide-react';
import toast from 'react-hot-toast';
import useAuthStore from '../../store/authStore';
import Skeleton from '../../components/ui/Skeleton';
import { Link } from 'react-router-dom';

const PAGE_SIZE = 20;

export default function PartnerProductsPage() {
  const { profile } = useAuthStore();
  const partnerId = profile?.partner_id;

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    if (!partnerId) return;
    fetchProducts();
  }, [partnerId, activeFilter, currentPage]);

  const fetchProducts = async () => {
    if (!partnerId) return;
    setLoading(true);
    try {
      let query = supabase
        .from('products')
        .select('*', { count: 'exact' })
        .eq('partner_id', partnerId);

      if (activeFilter !== 'all') {
        query = query.eq('is_active', activeFilter === 'active');
      }

      if (searchTerm) {
        query = query.or(`name.ilike.%${searchTerm}%,sku.ilike.%${searchTerm}%`);
      }

      const { data, count, error } = await query
        .order('created_at', { ascending: false })
        .range((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE - 1);

      if (error) throw error;

      setProducts(data ?? []);
      setTotalCount(count ?? 0);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (product) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ is_active: !product.is_active })
        .eq('id', product.id)
        .eq('partner_id', partnerId);

      if (error) throw error;

      setProducts((prev) =>
        prev.map((p) =>
          p.id === product.id ? { ...p, is_active: !p.is_active } : p
        )
      );

      toast.success(
        product.is_active
          ? 'Product hidden from catalog'
          : 'Product published to catalog'
      );
    } catch (error) {
      console.error('Error toggling product:', error);
      toast.error('Failed to update product');
    }
  };

  const handleDeleteProduct = async (product) => {
    if (
      !window.confirm(
        `Delete "${product.name}"? This action cannot be undone.`
      )
    ) {
      return;
    }

    setDeletingId(product.id);
    try {
      // 1. Delete product images from storage
      if (product.primary_image_url) {
        const { data: images } = await supabase
          .from('product_images')
          .select('url')
          .eq('product_id', product.id);

        if (images?.length) {
          for (const img of images) {
            const path = img.url.substring(img.url.indexOf('/product-images/') + 16);
            await supabase.storage.from('product-images').remove([path]);
          }
        }
      }

      // 2. Delete product row (CASCADE deletes images, variants, etc.)
      const { data, error } = await supabase
        .from('products')
        .delete()
        .eq('id', product.id)
        .eq('partner_id', partnerId)
        .select('id');

      if (error) throw error;
      if (!data?.length) {
        throw new Error('Could not delete product. You may not have permission.');
      }

      setProducts((prev) => prev.filter((p) => p.id !== product.id));
      setTotalCount((prev) => Math.max(0, prev - 1));
      toast.success('Product deleted');
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Failed to delete product');
    } finally {
      setDeletingId(null);
    }
  };

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0A1628]">My Products</h1>
          <p className="text-sm text-[#718096] mt-0.5">
            Manage your product catalog
          </p>
        </div>
        <Link
          to="/partner/products/new"
          className="flex items-center gap-2 px-4 py-2 bg-[#0A1628] text-white text-sm font-semibold rounded-[6px] hover:bg-[#1A2E4A] transition-colors"
        >
          <Plus size={16} /> Add Product
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] p-4 flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#718096]" />
          <input
            type="text"
            placeholder="Search by name or SKU..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-9 pr-3 py-2 text-sm border border-[#E2E8F0] rounded-[6px] focus:outline-none focus:ring-2 focus:ring-[#C9A84C]"
          />
        </div>

        {/* Status Filter */}
        <select
          value={activeFilter}
          onChange={(e) => {
            setActiveFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="px-3 py-2 text-sm border border-[#E2E8F0] rounded-[6px] focus:outline-none focus:ring-2 focus:ring-[#C9A84C] bg-white"
        >
          <option value="all">All Products</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* Products List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-12 text-center">
          <Package size={40} className="mx-auto text-gray-300 mb-3" />
          <p className="text-sm font-semibold text-[#0A1628]">No products found</p>
          <p className="text-xs text-[#718096] mt-1">
            {totalCount === 0
              ? 'Start by adding your first product'
              : 'No products match your search'}
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-xl border border-[#E2E8F0] p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex gap-4 flex-1">
                    {/* Product Image */}
                    {product.primary_image_url && (
                      <img
                        src={product.primary_image_url}
                        alt={product.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                    )}

                    {/* Product Info */}
                    <div className="flex-1">
                      <h3 className="text-sm font-bold text-[#0A1628]">
                        {product.name}
                      </h3>
                      {product.sku && (
                        <p className="text-xs text-[#718096] mt-0.5">
                          SKU: {product.sku}
                        </p>
                      )}
                      {product.brand_name && (
                        <p className="text-xs text-[#718096]">
                          Brand: {product.brand_name}
                        </p>
                      )}
                      <div className="flex items-center gap-3 mt-2">
                        <span
                          className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                            product.is_active
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {product.is_active ? 'Active' : 'Inactive'}
                        </span>
                        {product.is_featured && (
                          <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                            Featured
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleToggleActive(product)}
                      className="p-2 text-[#718096] hover:text-[#0A1628] hover:bg-[#F7FAFC] rounded-[6px] transition-colors"
                      title={product.is_active ? 'Hide product' : 'Show product'}
                    >
                      {product.is_active ? (
                        <Eye size={16} />
                      ) : (
                        <EyeOff size={16} />
                      )}
                    </button>

                    <Link
                      to={`/partner/products/${product.id}`}
                      className="p-2 text-[#718096] hover:text-[#0A1628] hover:bg-[#F7FAFC] rounded-[6px] transition-colors"
                      title="Edit product"
                    >
                      <Edit2 size={16} />
                    </Link>

                    <button
                      onClick={() => handleDeleteProduct(product)}
                      disabled={deletingId === product.id}
                      className="p-2 text-[#718096] hover:text-red-600 hover:bg-red-50 rounded-[6px] transition-colors disabled:opacity-50"
                      title="Delete product"
                    >
                      {deletingId === product.id ? (
                        <Loader size={16} className="animate-spin" />
                      ) : (
                        <Trash2 size={16} />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 text-sm border border-[#E2E8F0] rounded-[6px] hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-2 py-1 text-sm rounded-[4px] ${
                      currentPage === page
                        ? 'bg-[#0A1628] text-white'
                        : 'border border-[#E2E8F0] hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-2 text-sm border border-[#E2E8F0] rounded-[6px] hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
