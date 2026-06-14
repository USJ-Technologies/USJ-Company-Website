import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import Badge from '../../components/ui/Badge';
import Skeleton from '../../components/ui/Skeleton';
import { Mail, FileText, Package, ChevronDown, ChevronUp } from 'lucide-react';
import toast from 'react-hot-toast';

const STATUS_OPTIONS = ['new', 'in_review', 'responded', 'closed'];

const statusVariant = (s) => ({
  new: 'warning',
  in_review: 'primary',
  responded: 'success',
  closed: 'secondary',
}[s] ?? 'secondary');

const InquiriesAdminPage = () => {
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [filterStatus, setFilterStatus] = useState('');

  useEffect(() => { fetchQuotes(); }, [filterStatus]);

  const fetchQuotes = async () => {
    setLoading(true);
    let query = supabase
      .from('quote_requests')
      .select('*, quote_items(id, product_name, product_sku, brand_name, image_url, quantity)')
      .order('created_at', { ascending: false });

    if (filterStatus) query = query.eq('status', filterStatus);

    const { data, error } = await query;
    if (error) {
      toast.error('Failed to load quote requests');
    } else {
      setQuotes(data ?? []);
    }
    setLoading(false);
  };

  const updateStatus = async (id, status) => {
    const { error } = await supabase
      .from('quote_requests')
      .update({
        status,
        responded_at: status === 'responded' ? new Date().toISOString() : null,
      })
      .eq('id', id);
    if (error) {
      toast.error('Failed to update status');
    } else {
      toast.success(`Status updated to "${status}"`);
      setQuotes((prev) => prev.map((q) => q.id === id ? { ...q, status } : q));
    }
  };

  const toggle = (id) => setExpanded((prev) => (prev === id ? null : id));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-3xl font-bold text-[#0A1628]">Quote Requests</h1>

        <div className="flex items-center gap-3">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="text-sm border border-[#E2E8F0] rounded-[6px] px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#C9A84C] bg-white"
          >
            <option value="">All statuses</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>{s.replace('_', ' ')}</option>
            ))}
          </select>
          <button
            onClick={fetchQuotes}
            className="px-4 py-2 text-sm font-semibold bg-[#0A1628] text-white rounded-[6px] hover:bg-[#1A2E4A] transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {loading ? (
          [1, 2, 3].map((i) => <Skeleton key={i} className="h-32 rounded-xl" />)
        ) : quotes.length === 0 ? (
          <div className="bg-white p-16 text-center rounded-xl border border-[#E2E8F0]">
            <FileText size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-medium text-[#0A1628]">No Quote Requests</h3>
            <p className="text-[#718096] mt-2 text-sm">
              {filterStatus ? `No quotes with status "${filterStatus}".` : 'No quote requests yet.'}
            </p>
          </div>
        ) : (
          quotes.map((q) => (
            <div
              key={q.id}
              className={`bg-white rounded-xl border transition-all ${
                q.status === 'new' ? 'border-[#C9A84C] shadow-md' : 'border-[#E2E8F0] shadow-sm'
              }`}
            >
              {/* Header row */}
              <div className="flex items-start justify-between p-5 gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-base font-bold flex-shrink-0 ${
                      q.status === 'new' ? 'bg-[#0A1628] text-[#C9A84C]' : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {q.name?.[0]?.toUpperCase() ?? '?'}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-bold text-[#0A1628]">{q.name}</p>
                      <Badge variant={statusVariant(q.status)}>
                        {q.status?.replace('_', ' ')}
                      </Badge>
                    </div>
                    <p className="text-xs text-[#718096] flex items-center gap-1 mt-0.5">
                      <Mail size={11} /> {q.email}
                      {q.organization && <> · {q.organization}</>}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  <p className="text-xs font-mono text-[#C9A84C] font-bold">{q.reference_number}</p>
                  <p className="text-[10px] text-[#718096]">
                    {new Date(q.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
              </div>

              {/* Expand / collapse */}
              <button
                onClick={() => toggle(q.id)}
                className="w-full flex items-center justify-between px-5 py-2.5 border-t border-[#E2E8F0] text-sm text-[#718096] hover:bg-gray-50 transition-colors"
              >
                <span>{q.quote_items?.length ?? 0} product{(q.quote_items?.length ?? 0) !== 1 ? 's' : ''} requested</span>
                {expanded === q.id ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
              </button>

              {expanded === q.id && (
                <div className="px-5 pb-5 space-y-4">
                  {/* Items list */}
                  <div className="space-y-2 pt-2">
                    {q.quote_items?.map((item) => (
                      <div key={item.id} className="flex items-center gap-3 py-2 border-b border-[#F0F0F0] last:border-0">
                        <div className="w-10 h-10 flex-shrink-0 bg-[#F8F9FA] rounded-md border border-[#E2E8F0] flex items-center justify-center overflow-hidden">
                          {item.image_url ? (
                            <img src={item.image_url} alt={item.product_name} className="w-full h-full object-contain p-0.5" />
                          ) : (
                            <Package size={16} className="text-gray-300" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-[#0A1628] truncate">{item.product_name}</p>
                          <p className="text-xs text-[#718096]">
                            {item.brand_name && `${item.brand_name} · `}Qty: <strong>{item.quantity}</strong>
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Message */}
                  {q.message && (
                    <div className="bg-[#F8F9FA] rounded-lg p-3">
                      <p className="text-xs font-semibold text-[#718096] mb-1">Customer note</p>
                      <p className="text-sm text-[#4A5568] whitespace-pre-wrap">{q.message}</p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex flex-wrap gap-3 pt-2">
                    <a
                      href={`mailto:${q.email}?subject=Re: Quote Request ${q.reference_number}&body=Dear ${q.name},%0A%0AThank you for your quote request (Ref: ${q.reference_number}).%0A%0A`}
                      className="px-4 py-2 text-sm font-semibold bg-[#0A1628] text-white rounded-[6px] hover:bg-[#1A2E4A] transition-colors"
                    >
                      Reply via Email
                    </a>
                    {STATUS_OPTIONS.filter((s) => s !== q.status).map((s) => (
                      <button
                        key={s}
                        onClick={() => updateStatus(q.id, s)}
                        className="px-3 py-2 text-xs font-semibold border border-[#E2E8F0] rounded-[6px] text-[#4A5568] hover:border-[#0A1628] transition-colors"
                      >
                        Mark {s.replace('_', ' ')}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default InquiriesAdminPage;
