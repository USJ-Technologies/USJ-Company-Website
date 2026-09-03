import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Grid, List, ChevronLeft, Star, Package, MapPin, Mail, Phone } from 'lucide-react';
import toast from 'react-hot-toast';
import Skeleton from '../components/ui/Skeleton';
import SEOHead from '../components/seo/SEOHead';

const PAGE_SIZE = 20;

export default function PartnerStorefrontPage() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [partner, setPartner] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    fetchPartner();
  }, [slug]);

  useEffect(() => {
    if (!partner?.id) return;
    fetchProducts();
  }, [partner?.id, currentPage, searchTerm]);

  const fetchPartner = async () => {
    try {
      const { data, error } = await supabase
        .from('usj_partners')
        .select('*')
        .eq('slug', slug)
        .eq('status', 'approved')
        .single();

      if (error || !data) {
        toast.error('USJ Partner not found');
        navigate('/shop');
        return;
      }

      setPartner(data);
    } catch (error) {
      console.error('Error fetching USJ Partner:', error);
      toast.error('Failed to load USJ Partner');
      navigate('/shop');
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('products')
        .select('*', { count: 'exact' })
        .eq('partner_id', partner.id)
        .eq('is_active', true);

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

  if (!partner && !loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <Package size={48} className="mx-auto text-gray-300 mb-4" />
        <p className="text-lg font-semibold text-[#0A1628]">USJ Partner not found</p>
      </div>
    );
  }

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  return (
    <>
      <SEOHead
        title={`${partner?.business_name || 'USJ Partner'} Store - USJ Technologies`}
        description={partner?.storefront_description || 'Browse products from this USJ Partner'}
        canonical={`https://www.usjtechnologies.com/store/${slug}`}
      />

      <div className="min-h-screen bg-[#F8F9FA]">
        {/* Back Button */}
        <div className="bg-white border-b border-[#E2E8F0]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-sm text-[#0A1628] hover:text-[#0A1628] font-semibold"
            >
              <ChevronLeft size={18} /> Back
            </button>
          </div>
        </div>

        {/* USJ Partner Header */}
        {partner && (
          <div className="bg-white border-b border-[#E2E8F0]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
              <div className="flex items-start gap-6">
                {/* Logo */}
                {partner.logo_url && (
                  <img
                    src={partner.logo_url}
                    alt={partner.business_name}
                    className="w-24 h-24 object-contain bg-[#F8F9FA] rounded-lg p-2"
                  />
                )}

                {/* Info */}
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-[#0A1628] mb-2">
                    {partner.business_name}
                  </h1>
                  <p className="text-[#718096] mb-4 max-w-2xl">
                    {partner.storefront_description}
                  </p>

                  {/* Contact Info */}
                  <div className="flex flex-wrap gap-6 text-sm">
                    {partner.contact_info?.email && (
                      <div className="flex items-center gap-2 text-[#0A1628]">
                        <Mail size={16} className="text-[#C9A84C]" />
                        {partner.contact_info.email}
                      </div>
                    )}
                    {partner.contact_info?.phone && (
                      <div className="flex items-center gap-2 text-[#0A1628]">
                        <Phone size={16} className="text-[#C9A84C]" />
                        {partner.contact_info.phone}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Products Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Filters & Controls */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8 items-center justify-between">
            {/* Search */}
            <div className="w-full sm:flex-1 relative">
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-4 py-2 text-sm border border-[#E2E8F0] rounded-[6px] focus:outline-none focus:ring-2 focus:ring-[#C9A84C]"
              />
            </div>

            {/* View Mode Toggle */}
            <div className="flex gap-2 bg-white rounded-[6px] border border-[#E2E8F0] p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-[4px] transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-[#0A1628] text-white'
                    : 'text-[#718096] hover:text-[#0A1628]'
                }`}
              >
                <Grid size={18} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-[4px] transition-colors ${
                  viewMode === 'list'
                    ? 'bg-[#0A1628] text-white'
                    : 'text-[#718096] hover:text-[#0A1628]'
                }`}
              >
                <List size={18} />
              </button>
            </div>
          </div>

          {/* Products Grid/List */}
          {loading ? (
            <div className={`grid ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4' : 'gap-3'}`}>
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-48 rounded-xl" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12">
              <Package size={48} className="mx-auto text-gray-300 mb-3" />
              <p className="text-lg font-semibold text-[#0A1628]">No products found</p>
              <p className="text-sm text-[#718096]">
                {searchTerm ? 'Try adjusting your search' : 'This USJ Partner has no active products yet'}
              </p>
            </div>
          ) : (
            <>
              {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {products.map((product) => (
                    <Link
                      key={product.id}
                      to={`/product/${product.slug}`}
                      className="bg-white rounded-xl border border-[#E2E8F0] p-3 hover:shadow-lg transition-shadow"
                    >
                      {/* Image */}
                      {product.primary_image_url && (
                        <img
                          src={product.primary_image_url}
                          alt={product.name}
                          className="w-full h-40 object-cover rounded-lg mb-3"
                        />
                      )}

                      {/* Info */}
                      <h3 className="text-sm font-bold text-[#0A1628] truncate mb-1">
                        {product.name}
                      </h3>
                      {product.brand_name && (
                        <p className="text-xs text-[#718096] mb-2">{product.brand_name}</p>
                      )}

                      {/* Price */}
                      {product.unit_price != null ? (
                        <p className="text-sm font-bold text-[#0A1628]">
                          ₹{product.unit_price.toLocaleString('en-IN')}
                        </p>
                      ) : (
                        <p className="text-xs text-[#718096]">Price on Request</p>
                      )}
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {products.map((product) => (
                    <Link
                      key={product.id}
                      to={`/product/${product.slug}`}
                      className="bg-white rounded-xl border border-[#E2E8F0] p-4 hover:shadow-md transition-shadow flex gap-4"
                    >
                      {/* Image */}
                      {product.primary_image_url && (
                        <img
                          src={product.primary_image_url}
                          alt={product.name}
                          className="w-24 h-24 object-cover rounded-lg flex-shrink-0"
                        />
                      )}

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-bold text-[#0A1628] truncate">
                          {product.name}
                        </h3>
                        {product.brand_name && (
                          <p className="text-xs text-[#718096] mb-2">{product.brand_name}</p>
                        )}
                        {product.description && (
                          <p className="text-xs text-[#4A5568] line-clamp-2 mb-2">
                            {product.description}
                          </p>
                        )}

                        {/* Price */}
                        {product.unit_price != null ? (
                          <p className="text-sm font-bold text-[#0A1628]">
                            ₹{product.unit_price.toLocaleString('en-IN')}
                          </p>
                        ) : (
                          <p className="text-xs text-[#718096]">Price on Request</p>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8">
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
      </div>
    </>
  );
}
