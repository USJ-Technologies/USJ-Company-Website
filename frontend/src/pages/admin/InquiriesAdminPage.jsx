import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { getAbandonedCarts, getFailedSearches } from '../../lib/queries';
import Badge from '../../components/ui/Badge';
import Skeleton from '../../components/ui/Skeleton';
import { Mail, Phone, FileText, Package, ChevronDown, ChevronUp, ShoppingCart, PhoneCall, Clock, Search } from 'lucide-react';
import toast from 'react-hot-toast';

const STATUS_OPTIONS = ['new', 'in_review', 'responded', 'closed'];

const statusVariant = (s) => ({
  new: 'warning',
  in_review: 'primary',
  responded: 'success',
  closed: 'secondary',
}[s] ?? 'secondary');

// ── Quote Requests Tab ──────────────────────────────────────────

const QuotesTab = () => {
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
    <div className="space-y-4">
      {/* Filters */}
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
                  <p className="text-xs text-[#718096] flex items-center gap-1 mt-0.5 flex-wrap">
                    <Mail size={11} /> {q.email}
                    {q.phone && (
                      <><span className="text-[#CBD5E0]">·</span><Phone size={11} />{q.phone}</>
                    )}
                    {q.organization && <><span className="text-[#CBD5E0]">·</span>{q.organization}</>}
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
  );
};

// ── Abandoned Carts Tab ─────────────────────────────────────────

const AbandonedCartsTab = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => { fetchLeads(); }, []);

  const fetchLeads = async () => {
    setLoading(true);
    const { data, error } = await getAbandonedCarts();
    if (error) {
      toast.error('Failed to load abandoned carts');
    } else {
      setLeads(data ?? []);
    }
    setLoading(false);
  };

  const toggle = (id) => setExpanded((prev) => (prev === id ? null : id));

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
    });

  const timeAgo = (dateStr) => {
    const diffMs = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diffMs / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button
          onClick={fetchLeads}
          className="px-4 py-2 text-sm font-semibold bg-[#0A1628] text-white rounded-[6px] hover:bg-[#1A2E4A] transition-colors"
        >
          Refresh
        </button>
        <p className="text-sm text-[#718096]">
          {leads.length} abandoned lead{leads.length !== 1 ? 's' : ''}
        </p>
      </div>

      {loading ? (
        [1, 2, 3].map((i) => <Skeleton key={i} className="h-28 rounded-xl" />)
      ) : leads.length === 0 ? (
        <div className="bg-white p-16 text-center rounded-xl border border-[#E2E8F0]">
          <ShoppingCart size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-xl font-medium text-[#0A1628]">No Abandoned Carts</h3>
          <p className="text-[#718096] mt-2 text-sm">
            All leads have submitted quote requests — great job following up!
          </p>
        </div>
      ) : (
        leads.map((lead) => {
          const items = lead.guest_cart_items ?? [];
          const totalQty = items.reduce((sum, i) => sum + i.quantity, 0);

          return (
            <div
              key={lead.id}
              className="bg-white rounded-xl border border-amber-200 shadow-sm hover:shadow-md transition-all"
            >
              {/* Header row */}
              <div className="flex items-start justify-between p-5 gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-base font-bold flex-shrink-0">
                    {lead.name?.[0]?.toUpperCase() ?? '?'}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-bold text-[#0A1628]">{lead.name}</p>
                      <Badge variant="warning">Abandoned</Badge>
                      {lead.user_id && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 font-semibold">
                          Registered
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#718096] flex items-center gap-1 mt-0.5">
                      <Phone size={11} />
                      <a href={`tel:+91${lead.phone}`} className="text-[#0A1628] font-semibold hover:text-[#C9A84C] transition-colors">
                        +91 {lead.phone}
                      </a>
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  <p className="text-xs text-amber-600 font-semibold flex items-center gap-1">
                    <Clock size={11} /> {timeAgo(lead.created_at)}
                  </p>
                  <p className="text-[10px] text-[#718096]">
                    {formatDate(lead.created_at)}
                  </p>
                </div>
              </div>

              {/* Items summary + expand */}
              {items.length > 0 && (
                <>
                  <button
                    onClick={() => toggle(lead.id)}
                    className="w-full flex items-center justify-between px-5 py-2.5 border-t border-amber-100 text-sm text-[#718096] hover:bg-amber-50/50 transition-colors"
                  >
                    <span>
                      {items.length} product{items.length !== 1 ? 's' : ''} in cart
                      <span className="text-[#94A3B8] ml-1">({totalQty} total qty)</span>
                    </span>
                    {expanded === lead.id ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                  </button>

                  {expanded === lead.id && (
                    <div className="px-5 pb-4 space-y-2 pt-1">
                      {items.map((item) => (
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
                  )}
                </>
              )}

              {items.length === 0 && (
                <div className="px-5 py-2.5 border-t border-amber-100 text-sm text-[#94A3B8] italic">
                  No product details captured
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-3 px-5 py-3 border-t border-amber-100 bg-amber-50/30 rounded-b-xl">
                <a
                  href={`tel:+91${lead.phone}`}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold bg-[#0A1628] text-white rounded-[6px] hover:bg-[#1A2E4A] transition-colors"
                >
                  <PhoneCall size={14} /> Call Now
                </a>
                <a
                  href={`https://wa.me/91${lead.phone}?text=${encodeURIComponent(
                    `Hi ${lead.name}, this is USJ Technologies. We noticed you were interested in some of our products. Can we help you with a quote?`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold border border-emerald-300 text-emerald-700 rounded-[6px] hover:bg-emerald-50 transition-colors"
                >
                  WhatsApp
                </a>
                <span className="ml-auto text-xs text-[#94A3B8]">
                  Quote submitted: <strong className="text-red-500">No</strong>
                </span>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};

// ── Failed Searches Tab ─────────────────────────────────────────

const FailedSearchesTab = () => {
  const [terms, setTerms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchTerms(); }, []);

  const fetchTerms = async () => {
    setLoading(true);
    const { data, error } = await getFailedSearches();
    if (error) {
      toast.error('Failed to load search data');
    } else {
      setTerms(data ?? []);
    }
    setLoading(false);
  };

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
    });

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button
          onClick={fetchTerms}
          className="px-4 py-2 text-sm font-semibold bg-[#0A1628] text-white rounded-[6px] hover:bg-[#1A2E4A] transition-colors"
        >
          Refresh
        </button>
        <p className="text-sm text-[#718096]">
          {terms.length} unique term{terms.length !== 1 ? 's' : ''}
        </p>
      </div>

      {loading ? (
        [1, 2, 3].map((i) => <Skeleton key={i} className="h-14 rounded-xl" />)
      ) : terms.length === 0 ? (
        <div className="bg-white p-16 text-center rounded-xl border border-[#E2E8F0]">
          <Search size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-xl font-medium text-[#0A1628]">No Failed Searches</h3>
          <p className="text-[#718096] mt-2 text-sm">
            No users have searched for products that returned zero results yet.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm overflow-hidden">
          {/* Table header */}
          <div className="grid grid-cols-[1fr_80px_180px] sm:grid-cols-[1fr_100px_200px] gap-3 px-5 py-3 border-b border-[#E2E8F0] bg-[#F8F9FA]">
            <p className="text-xs font-semibold text-[#718096] uppercase tracking-wider">Search Term</p>
            <p className="text-xs font-semibold text-[#718096] uppercase tracking-wider text-center">Count</p>
            <p className="text-xs font-semibold text-[#718096] uppercase tracking-wider text-right">Last Searched</p>
          </div>

          {/* Table rows */}
          {terms.map((item, i) => (
            <div
              key={item.search_term}
              className={`grid grid-cols-[1fr_80px_180px] sm:grid-cols-[1fr_100px_200px] gap-3 px-5 py-3 items-center border-b border-[#F0F4F8] last:border-0 hover:bg-[#F8F9FA] transition-colors`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <Search size={14} className="text-[#94A3B8] flex-shrink-0" />
                <p className="text-sm font-semibold text-[#0A1628] truncate">
                  {item.search_term}
                </p>
              </div>
              <div className="flex justify-center">
                <span
                  className="inline-flex items-center justify-center min-w-[32px] px-2 py-0.5 text-xs font-bold rounded-full"
                  style={{
                    backgroundColor: item.count >= 5 ? '#FEF3C7' : '#F0F4F8',
                    color: item.count >= 5 ? '#D97706' : '#4A5568',
                  }}
                >
                  {item.count}
                </span>
              </div>
              <p className="text-xs text-[#718096] text-right">
                {formatDate(item.latest)}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ── Main Page with Tab Switcher ────────────────────────────────

const TABS = [
  { key: 'quotes', label: 'Quote Requests', icon: FileText },
  { key: 'abandoned', label: 'Abandoned Carts', icon: ShoppingCart },
  { key: 'searches', label: 'Failed Searches', icon: Search },
];

const InquiriesAdminPage = () => {
  const [activeTab, setActiveTab] = useState('quotes');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-3xl font-bold text-[#0A1628]">Inquiries</h1>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold transition-all ${
              activeTab === key
                ? 'bg-white text-[#0A1628] shadow-sm'
                : 'text-[#718096] hover:text-[#4A5568]'
            }`}
          >
            <Icon size={15} />
            {label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'quotes' && <QuotesTab />}
      {activeTab === 'abandoned' && <AbandonedCartsTab />}
      {activeTab === 'searches' && <FailedSearchesTab />}
    </div>
  );
};

export default InquiriesAdminPage;
