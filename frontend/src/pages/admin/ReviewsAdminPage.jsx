import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import Skeleton from '../../components/ui/Skeleton';
import { Search, Star, Trash2, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ReviewsAdminPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('pending');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('product_reviews')
      .select(`
        *,
        products (name)
      `)
      .order('is_approved', { ascending: true }) // false first
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Failed to load reviews');
      console.error(error);
    } else {
      setReviews(data || []);
    }
    setLoading(false);
  };

  const handleApprove = async (id) => {
    const { error } = await supabase
      .from('product_reviews')
      .update({ is_approved: true })
      .eq('id', id);

    if (error) {
      toast.error('Failed to approve review');
    } else {
      toast.success('Review approved');
      setReviews(reviews.map(r => r.id === id ? { ...r, is_approved: true } : r));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;

    const { error } = await supabase
      .from('product_reviews')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('Failed to delete review');
    } else {
      toast.success('Review deleted');
      setReviews(reviews.filter(r => r.id !== id));
    }
  };

  const filteredReviews = reviews.filter(r => {
    const matchesStatus = filterStatus === 'all' 
      ? true 
      : filterStatus === 'pending' 
        ? !r.is_approved 
        : r.is_approved;
        
    const matchesSearch = r.products?.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          r.reviewer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          r.product_slug?.toLowerCase().includes(searchQuery.toLowerCase());
                          
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-[#0A1628]">Manage Reviews</h1>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#718096]" />
          <input
            type="text"
            placeholder="Search by product or reviewer name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/30 focus:border-[#C9A84C] text-sm"
          />
        </div>

        {/* Status Filter */}
        <div className="flex gap-2">
          {['pending', 'approved', 'all'].map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold capitalize transition-colors border ${
                filterStatus === status
                  ? 'bg-[#0A1628] text-white border-[#0A1628]'
                  : 'bg-white text-[#718096] border-[#E2E8F0] hover:bg-[#F8F9FA]'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-32 w-full rounded-xl" />)}
        </div>
      ) : filteredReviews.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-xl border border-[#E2E8F0]">
          <Star size={40} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-[#0A1628]">No reviews found</h3>
          <p className="text-[#718096] mt-2 text-sm">
            Try adjusting your filters or search query.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReviews.map(review => (
            <div key={review.id} className="bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-sm flex flex-col md:flex-row gap-5">
              
              <div className="flex-1 space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-[#0A1628]">{review.products?.name || review.product_slug}</h4>
                    <p className="text-xs text-[#718096] flex items-center gap-2 mt-1">
                      <span className="font-medium text-[#4A5568]">{review.reviewer_name}</span>
                      <span>•</span>
                      <span>{new Date(review.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      <span>•</span>
                      <span className="flex items-center text-[#C9A84C]">
                        {review.rating} <Star size={12} className="fill-[#C9A84C] ml-0.5" />
                      </span>
                    </p>
                  </div>
                  
                  {!review.is_approved && (
                    <span className="px-2.5 py-1 bg-yellow-100 text-yellow-800 text-[10px] font-bold rounded-full uppercase tracking-wider">
                      Pending
                    </span>
                  )}
                  {review.is_approved && (
                    <span className="px-2.5 py-1 bg-green-100 text-green-800 text-[10px] font-bold rounded-full uppercase tracking-wider">
                      Approved
                    </span>
                  )}
                </div>

                <div className="bg-[#F8F9FA] p-3 rounded-lg border border-[#E2E8F0]">
                  {review.review_title && (
                    <p className="text-sm font-bold text-[#0A1628] mb-1">{review.review_title}</p>
                  )}
                  <p className="text-sm text-[#4A5568] line-clamp-2">{review.review_body}</p>
                  
                  {review.images && review.images.length > 0 && (
                    <div className="flex gap-2 mt-3">
                      {review.images.map((url, idx) => (
                        <a key={idx} href={url} target="_blank" rel="noreferrer" className="block w-12 h-12 rounded border border-[#E2E8F0] overflow-hidden hover:opacity-80">
                          <img src={url} alt="Review attachment" className="w-full h-full object-cover" />
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex md:flex-col gap-2 justify-center border-t md:border-t-0 md:border-l border-[#E2E8F0] pt-4 md:pt-0 md:pl-5">
                {!review.is_approved && (
                  <button
                    onClick={() => handleApprove(review.id)}
                    className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-4 py-2 bg-green-600 text-white text-xs font-bold rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <CheckCircle size={14} /> Approve
                  </button>
                )}
                <button
                  onClick={() => handleDelete(review.id)}
                  className={`flex-1 md:flex-none flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg transition-colors ${
                    review.is_approved
                      ? 'bg-red-50 text-red-600 hover:bg-red-100'
                      : 'bg-white border border-red-200 text-red-600 hover:bg-red-50'
                  }`}
                >
                  <Trash2 size={14} /> {review.is_approved ? 'Delete' : 'Reject'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
