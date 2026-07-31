import React, { useState, useEffect } from 'react';
import { Star, CheckCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import Skeleton from '../ui/Skeleton';

export default function ReviewsList({ productSlug, externalRefresh }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('product_reviews')
          .select('*')
          .eq('product_slug', productSlug)
          .eq('is_approved', true)
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        setReviews(data || []);
      } catch (err) {
        console.error('Error fetching reviews:', err);
      } finally {
        setLoading(false);
      }
    };
    
    if (productSlug) {
      fetchReviews();
    }
  }, [productSlug, externalRefresh]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex gap-6 items-center">
          <Skeleton className="w-24 h-24 rounded-full" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-full max-w-[200px]" />
            <Skeleton className="h-4 w-full max-w-[150px]" />
          </div>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="p-5 border border-[#E2E8F0] rounded-xl">
              <Skeleton className="w-24 h-4 mb-3" />
              <Skeleton className="w-full h-16 mb-3" />
              <Skeleton className="w-32 h-3" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const formatName = (fullName) => {
    if (!fullName) return 'Anonymous';
    const parts = fullName.trim().split(/\s+/);
    if (parts.length === 1) return parts[0];
    return `${parts[0]} ${parts[parts.length - 1][0].toUpperCase()}.`;
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const totalReviews = reviews.length;
  const avgRating = totalReviews ? (reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews).toFixed(1) : 0;
  
  const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  reviews.forEach(r => {
    if (distribution[r.rating] !== undefined) distribution[r.rating]++;
  });

  return (
    <div className="mt-8">
      {totalReviews === 0 ? (
        <div className="bg-[#F8F9FA] border border-[#E2E8F0] rounded-2xl p-10 text-center">
          <Star size={40} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-bold text-[#0A1628] mb-2">No reviews yet</h3>
          <p className="text-[#718096] text-sm">Be the first to review this product</p>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="flex flex-col sm:flex-row gap-8 items-start sm:items-center bg-white p-6 md:p-8 rounded-2xl border border-[#E2E8F0] shadow-sm">
            <div className="text-center sm:text-left min-w-[120px]">
              <p className="text-5xl font-bold text-[#0A1628] mb-1">{avgRating}</p>
              <div className="flex justify-center sm:justify-start text-[#C9A84C] mb-1">
                {[1, 2, 3, 4, 5].map(star => (
                  <Star key={star} size={16} className={star <= Math.round(avgRating) ? 'fill-[#C9A84C]' : 'text-gray-300'} />
                ))}
              </div>
              <p className="text-xs text-[#718096]">{totalReviews} Review{totalReviews !== 1 && 's'}</p>
            </div>
            
            <div className="flex-1 w-full space-y-2">
              {[5, 4, 3, 2, 1].map(star => {
                const count = distribution[star];
                const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
                return (
                  <div key={star} className="flex items-center gap-3 text-sm">
                    <span className="w-12 text-[#4A5568] font-medium">{star} Stars</span>
                    <div className="flex-1 h-2 bg-[#F0F4F8] rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-[#C9A84C] rounded-full" 
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="w-8 text-right text-[#718096] text-xs">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="space-y-4">
            {reviews.map(review => (
              <div key={review.id} className="bg-white p-5 md:p-6 rounded-xl border border-[#E2E8F0] shadow-sm">
                <div className="flex items-center gap-4 mb-3">
                  <div className="flex text-[#C9A84C]">
                    {[1, 2, 3, 4, 5].map(star => (
                      <Star key={star} size={14} className={star <= review.rating ? 'fill-[#C9A84C]' : 'text-gray-300'} />
                    ))}
                  </div>
                  {review.is_verified_purchase && (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
                      <CheckCircle size={12} /> Verified Purchase
                    </span>
                  )}
                </div>
                
                {review.review_title && (
                  <h4 className="text-sm font-bold text-[#0A1628] mb-1.5">{review.review_title}</h4>
                )}
                <p className="text-sm text-[#4A5568] leading-relaxed mb-4 whitespace-pre-line">
                  {review.review_body}
                </p>

                {review.images && review.images.length > 0 && (
                  <div className="flex flex-wrap gap-3 mb-4">
                    {review.images.map((url, idx) => (
                      <a 
                        key={idx} 
                        href={url} 
                        target="_blank" 
                        rel="noreferrer"
                        className="block w-16 h-16 rounded-lg border border-[#E2E8F0] overflow-hidden hover:opacity-80 transition-opacity"
                      >
                        <img 
                          src={url} 
                          alt="Review" 
                          className="w-full h-full object-cover" 
                        />
                      </a>
                    ))}
                  </div>
                )}
                
                <div className="flex items-center justify-between text-xs text-[#718096]">
                  <span className="font-semibold text-[#0A1628]">{formatName(review.reviewer_name)}</span>
                  <span>{formatDate(review.created_at)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
