import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Package } from 'lucide-react';
import { supabase } from '../lib/supabase';
import useAuthStore from '../store/authStore';
import Skeleton from '../components/ui/Skeleton';
import Badge from '../components/ui/Badge';

const STATUS_VARIANT = { new: 'warning', in_review: 'primary', responded: 'success', closed: 'secondary' };

export default function OrdersPage() {
  const { user } = useAuthStore();
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    supabase
      .from('quote_requests')
      .select('id, reference_number, status, created_at, quote_items(product_name, quantity)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setQuotes(data ?? []);
        setLoading(false);
      });
  }, [user?.id]);

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold text-[#0A1628] mb-1">My Quote Requests</h1>
      <p className="text-sm text-[#718096] mb-8">Track all your quote submissions with USJ Technologies.</p>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
      ) : quotes.length === 0 ? (
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-16 text-center">
          <Package size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-semibold text-[#0A1628] mb-2">No quotes yet</h3>
          <p className="text-sm text-[#718096] mb-6">Browse our catalog and request a quote for your procurement needs.</p>
          <Link
            to="/shop"
            className="inline-block px-5 py-2.5 bg-[#0A1628] text-white text-sm font-semibold rounded-[6px] hover:bg-[#1A2E4A] transition-colors"
          >
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {quotes.map((q) => {
            const itemCount = q.quote_items?.reduce((sum, i) => sum + i.quantity, 0) ?? 0;
            return (
              <div key={q.id} className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <FileText size={14} className="text-[#C9A84C]" />
                      <span className="text-sm font-bold font-mono text-[#0A1628]">{q.reference_number}</span>
                    </div>
                    <p className="text-xs text-[#718096]">
                      {itemCount} item{itemCount !== 1 ? 's' : ''} ·{' '}
                      {new Date(q.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                    {q.quote_items?.slice(0, 2).map((item, i) => (
                      <p key={i} className="text-xs text-[#4A5568] mt-1 truncate">{item.product_name} ×{item.quantity}</p>
                    ))}
                    {(q.quote_items?.length ?? 0) > 2 && (
                      <p className="text-xs text-[#718096]">+{q.quote_items.length - 2} more</p>
                    )}
                  </div>
                  <Badge variant={STATUS_VARIANT[q.status] ?? 'secondary'}>
                    {q.status?.replace('_', ' ')}
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
