import { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FileText, CheckCircle, ArrowLeft, Package, Loader2, ChevronDown, Plus, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import useCartStore from '../store/cartStore';
import useAuthStore from '../store/authStore';
import { submitQuoteRequest } from '../lib/queries';

const ORG_STORAGE_KEY = 'usj_known_organizations';
const DEFAULT_ORGS = [
  'Government of Uttarakhand',
  'ITDA Uttarakhand',
  'ONGC',
  'BHEL',
  'Indian Army',
  'Indian Air Force',
  'CRPF',
  'Uttarakhand Police',
  'UPCL',
  'MDDA Dehradun',
  'Municipal Corporation Dehradun',
  'NIT Uttarakhand',
  'Graphic Era University',
  'DIT University',
];

function OrgCombobox({ value, onChange, placeholder }) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef(null);
  const searchRef = useRef(null);

  const [orgs, setOrgs] = useState(() => {
    try {
      const saved = localStorage.getItem(ORG_STORAGE_KEY);
      const parsed = saved ? JSON.parse(saved) : [];
      const merged = [...new Set([...DEFAULT_ORGS, ...parsed])];
      return merged;
    } catch {
      return DEFAULT_ORGS;
    }
  });

  const showSearch = orgs.length >= 10;
  const filtered = orgs.filter(o =>
    o.toLowerCase().includes((showSearch ? search : value).toLowerCase())
  );
  const trimmed = value.trim();
  const isNew = trimmed && !orgs.some(o => o.toLowerCase() === trimmed.toLowerCase());

  const saveOrg = (org) => {
    const updated = [...new Set([...orgs, org])];
    setOrgs(updated);
    const custom = updated.filter(o => !DEFAULT_ORGS.includes(o));
    localStorage.setItem(ORG_STORAGE_KEY, JSON.stringify(custom));
  };

  const select = (org) => {
    onChange(org);
    setIsOpen(false);
    setSearch('');
  };

  const addNew = () => {
    if (!trimmed) return;
    saveOrg(trimmed);
    setIsOpen(false);
    setSearch('');
  };

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && showSearch && searchRef.current) {
      setTimeout(() => searchRef.current?.focus(), 50);
    }
  }, [isOpen, showSearch]);

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="w-full px-3 py-2.5 pr-9 text-sm border border-[#E2E8F0] rounded-[6px] focus:outline-none focus:ring-2 focus:ring-[#C9A84C] bg-white"
          autoComplete="off"
        />
        <button
          type="button"
          tabIndex={-1}
          onClick={() => setIsOpen(o => !o)}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#718096] hover:text-[#0A1628] transition-colors"
        >
          <ChevronDown size={15} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {isOpen && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-[#E2E8F0] rounded-[8px] shadow-lg overflow-hidden">
          {showSearch && (
            <div className="px-2 pt-2 pb-1 border-b border-[#E2E8F0]">
              <div className="flex items-center gap-2 px-2 py-1.5 bg-[#F8F9FA] rounded-[6px]">
                <Search size={13} className="text-[#718096] flex-shrink-0" />
                <input
                  ref={searchRef}
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search organizations..."
                  className="flex-1 bg-transparent text-xs text-[#0A1628] placeholder-[#A0AEC0] outline-none"
                />
              </div>
            </div>
          )}

          <ul className="max-h-52 overflow-y-auto py-1">
            {filtered.length > 0 ? filtered.map(org => (
              <li key={org}>
                <button
                  type="button"
                  onClick={() => select(org)}
                  className={`w-full text-left px-3 py-2 text-sm transition-colors hover:bg-[#F8F9FA] ${
                    value === org ? 'text-[#C9A84C] font-semibold bg-[#FFF8E7]' : 'text-[#0A1628]'
                  }`}
                >
                  {org}
                </button>
              </li>
            )) : (
              <li className="px-3 py-2 text-xs text-[#A0AEC0]">No match found</li>
            )}
          </ul>

          {isNew && (
            <div className="border-t border-[#E2E8F0] p-2">
              <button
                type="button"
                onClick={addNew}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-[#1A56DB] hover:bg-[#EBF4FF] rounded-[6px] transition-colors"
              >
                <Plus size={13} />
                Add &quot;{trimmed}&quot; to list
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const EMPTY_FORM = {
  name: '',
  email: '',
  phone: '',
  organization: '',
  message: '',
};

export default function QuoteRequestPage() {
  const navigate = useNavigate();
  const { items, clearCart } = useCartStore();
  const { user, profile } = useAuthStore();

  const [form, setForm] = useState({
    ...EMPTY_FORM,
    name: profile?.name ?? '',
    email: user?.email ?? '',
    phone: profile?.phone ?? '',
    organization: profile?.organization ?? '',
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [referenceNumber, setReferenceNumber] = useState('');

  // Guard: redirect if cart is empty
  if (items.length === 0 && !submitted) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center py-20 px-4 bg-[#F8F9FA]">
        <Package size={56} className="text-gray-300 mb-4" />
        <h2 className="text-xl font-bold text-[#0A1628] mb-2">Your cart is empty</h2>
        <p className="text-sm text-[#718096] mb-6">Add products before requesting a quote.</p>
        <Link
          to="/shop"
          className="px-5 py-2.5 bg-[#0A1628] text-white rounded-[6px] text-sm font-semibold hover:bg-[#1a2a4a] transition-colors"
        >
          Browse Products
        </Link>
      </div>
    );
  }

  // ── Success screen ─────────────────────────────────────────
  if (submitted) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center py-20 px-4 bg-[#F8F9FA]">
        <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-10 max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-5">
            <CheckCircle size={32} className="text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-[#0A1628] mb-2">Quote Request Submitted!</h2>
          <p className="text-sm text-[#718096] mb-5">
            Thank you! Our team will review your requirements and get back to you within 24 business hours.
          </p>

          {referenceNumber && (
            <div className="bg-[#F8F9FA] border border-[#E2E8F0] rounded-[6px] p-4 mb-6">
              <p className="text-xs text-[#718096] mb-1">Your Reference Number</p>
              <p className="text-xl font-bold tracking-widest text-[#0A1628]">{referenceNumber}</p>
              <p className="text-xs text-[#718096] mt-1">Save this for follow-up queries</p>
            </div>
          )}

          <p className="text-xs text-[#718096] mb-6">
            A confirmation has been sent to <span className="font-medium text-[#0A1628]">{form.email}</span>
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              to="/shop"
              className="flex-1 py-2.5 border border-[#E2E8F0] rounded-[6px] text-sm font-semibold text-[#0A1628] hover:border-[#0A1628] transition-colors text-center"
            >
              Continue Shopping
            </Link>
            <Link
              to="/"
              className="flex-1 py-2.5 bg-[#0A1628] text-white rounded-[6px] text-sm font-semibold hover:bg-[#1a2a4a] transition-colors text-center"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── Validation ────────────────────────────────────────────
  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.email.trim()) e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email';
    return e;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (errors[name]) setErrors((er) => ({ ...er, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSubmitting(true);
    const { data, error } = await submitQuoteRequest({
      userId: user?.id ?? null,
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim() || null,
      organization: form.organization.trim() || null,
      message: form.message.trim() || null,
      items,
    });

    setSubmitting(false);

    if (error) {
      toast.error('Failed to submit quote request. Please try again.');
      console.error('Quote submission error:', error);
      return;
    }

    setReferenceNumber(data.reference_number);
    clearCart();
    setSubmitted(true);
  };

  const totalItems = items.reduce((acc, i) => acc + i.qty, 0);

  return (
    <div className="bg-[#F8F9FA] min-h-screen py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back link */}
        <Link
          to="/cart"
          className="inline-flex items-center gap-1.5 text-sm text-[#718096] hover:text-[#0A1628] mb-6 transition-colors"
        >
          <ArrowLeft size={15} /> Back to Cart
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* ── Form ────────────────────────────────────────── */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl border border-[#E2E8F0] p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-9 h-9 rounded-full bg-[#0A1628] flex items-center justify-center flex-shrink-0">
                  <FileText size={16} className="text-[#C9A84C]" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-[#0A1628]">Request a Quote</h1>
                  <p className="text-xs text-[#718096]">Fill in your details — we'll respond within 24 hours</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} noValidate className="space-y-4">
                {/* Name + Email */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#0A1628] mb-1.5">
                      Full Name <span className="text-[#C53030]">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="Your full name"
                      className={`w-full px-3 py-2.5 text-sm border rounded-[6px] focus:outline-none focus:ring-2 focus:ring-[#C9A84C] bg-white transition ${
                        errors.name ? 'border-[#C53030]' : 'border-[#E2E8F0]'
                      }`}
                    />
                    {errors.name && <p className="text-xs text-[#C53030] mt-1">{errors.name}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#0A1628] mb-1.5">
                      Email Address <span className="text-[#C53030]">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="you@example.com"
                      className={`w-full px-3 py-2.5 text-sm border rounded-[6px] focus:outline-none focus:ring-2 focus:ring-[#C9A84C] bg-white transition ${
                        errors.email ? 'border-[#C53030]' : 'border-[#E2E8F0]'
                      }`}
                    />
                    {errors.email && <p className="text-xs text-[#C53030] mt-1">{errors.email}</p>}
                  </div>
                </div>

                {/* Phone + Organization */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#0A1628] mb-1.5">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="+91 XXXXX XXXXX"
                      className="w-full px-3 py-2.5 text-sm border border-[#E2E8F0] rounded-[6px] focus:outline-none focus:ring-2 focus:ring-[#C9A84C] bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#0A1628] mb-1.5">
                      Organization / Department
                    </label>
                    <OrgCombobox
                      value={form.organization}
                      onChange={val => setForm(f => ({ ...f, organization: val }))}
                      placeholder="Company or govt. dept."
                    />
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label className="block text-xs font-semibold text-[#0A1628] mb-1.5">
                    Additional Requirements
                  </label>
                  <textarea
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Delivery timeline, bulk quantity, specific configuration, GeM order details..."
                    className="w-full px-3 py-2.5 text-sm border border-[#E2E8F0] rounded-[6px] focus:outline-none focus:ring-2 focus:ring-[#C9A84C] bg-white resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 bg-[#0A1628] text-white rounded-[6px] text-sm font-semibold flex items-center justify-center gap-2 hover:bg-[#1a2a4a] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <><Loader2 size={16} className="animate-spin" /> Submitting...</>
                  ) : (
                    <><FileText size={16} /> Submit Quote Request</>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* ── Order Summary ────────────────────────────────── */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl border border-[#E2E8F0] p-5 sticky top-24">
              <h3 className="text-sm font-bold text-[#0A1628] mb-4">
                {totalItems} item{totalItems !== 1 ? 's' : ''} in your quote
              </h3>

              <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                {items.map((item) => {
                  const p = item.product;
                  return (
                    <div key={p.id} className="flex items-center gap-3">
                      <div className="w-12 h-12 flex-shrink-0 bg-[#F8F9FA] rounded-[6px] border border-[#E2E8F0] flex items-center justify-center overflow-hidden">
                        {p.primary_image_url ? (
                          <img src={p.primary_image_url} alt={p.name} loading="lazy" className="w-full h-full object-contain p-0.5" />
                        ) : (
                          <Package size={20} className="text-gray-300" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-[#0A1628] line-clamp-2">{p.name}</p>
                        {p.brand_name && (
                          <p className="text-[10px] text-[#718096]">{p.brand_name}</p>
                        )}
                      </div>
                      <span className="text-xs font-bold text-[#0A1628] flex-shrink-0">×{item.qty}</span>
                    </div>
                  );
                })}
              </div>

              <div className="border-t border-[#E2E8F0] mt-4 pt-4">
                <p className="text-xs text-[#718096] leading-relaxed">
                  Pricing is negotiated per order. We offer competitive rates for bulk, government, and defence procurement.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
