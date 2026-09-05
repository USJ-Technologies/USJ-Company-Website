import { useState, useEffect } from 'react';
import { X, User, Phone, ShoppingCart } from 'lucide-react';
import useContactStore from '../../store/contactStore';
import useAuthStore from '../../store/authStore';

import { isPhone, normalizePhone } from '../../lib/validation';

export default function ContactCaptureModal() {
  const { isModalOpen, pendingProduct, closeModal, submitContact } = useContactStore();
  const { profile, isAuthenticated } = useAuthStore();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Pre-fill from profile when modal opens
  useEffect(() => {
    if (isModalOpen && isAuthenticated && profile) {
      if (profile.name) setName(profile.name);
      if (profile.phone) setPhone(profile.phone.replace(/^\+91/, '').replace(/\D/g, '').slice(-10));
    }
  }, [isModalOpen, isAuthenticated, profile]);

  // Reset when modal closes
  useEffect(() => {
    if (!isModalOpen) {
      setErrors({});
      setSubmitting(false);
      // Don't clear name/phone — let them persist if modal reopens
    }
  }, [isModalOpen]);

  if (!isModalOpen) return null;

  const validate = () => {
    const newErrors = {};
    if (!name.trim()) newErrors.name = 'Name is required';
    if (!phone.trim()) {
      newErrors.phone = 'Phone number is required';
      // isPhone strips +91, a leading 0, spaces and dashes first — the bare
      // regex rejected "+91 98765 43210", which is how many people type it.
    } else if (!isPhone(phone)) {
      newErrors.phone = 'Enter a valid 10-digit Indian mobile number';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    await submitContact({ name: name.trim(), phone: normalizePhone(phone) });
    setSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={closeModal}
      />

      {/* Modal */}
      <div
        className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden animate-in"
        style={{
          animation: 'modalSlideUp 0.3s ease-out',
        }}
      >
        {/* Header */}
        <div
          className="px-6 py-5 flex items-center justify-between"
          style={{ background: 'linear-gradient(135deg, #0A1628, #1A2E4A)' }}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#C9A84C]/20 flex items-center justify-center">
              <ShoppingCart size={18} className="text-[#C9A84C]" />
            </div>
            <div>
              <h2 className="text-white font-bold text-base">Before we add to cart</h2>
              <p className="text-[#A0AEC0] text-xs mt-0.5">
                Quick details so we can reach out with pricing
              </p>
            </div>
          </div>
          <button
            onClick={closeModal}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#A0AEC0] hover:text-white hover:bg-white/10 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Product preview */}
        {pendingProduct && (
          <div className="px-6 py-3 bg-[#F8F9FA] border-b border-[#E2E8F0] flex items-center gap-3">
            {pendingProduct.primary_image_url ? (
              <img
                src={pendingProduct.primary_image_url}
                alt={pendingProduct.name}
                className="w-12 h-12 rounded-lg object-contain bg-white border border-[#E2E8F0] p-1"
              />
            ) : (
              <div className="w-12 h-12 rounded-lg bg-white border border-[#E2E8F0] flex items-center justify-center">
                <ShoppingCart size={16} className="text-gray-300" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-[#0A1628] truncate">
                {pendingProduct.name}
              </p>
              {pendingProduct.brand_name && (
                <p className="text-xs text-[#718096]">{pendingProduct.brand_name}</p>
              )}
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {/* Name field */}
          <div>
            <label htmlFor="contact-name" className="block text-sm font-semibold text-[#0A1628] mb-1.5">
              Your Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8] pointer-events-none" />
              <input
                id="contact-name"
                type="text"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
                }}
                className={`w-full pl-10 pr-4 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                  errors.name
                    ? 'border-red-400 focus:ring-red-200'
                    : 'border-[#E2E8F0] focus:ring-[#C9A84C]/30 focus:border-[#C9A84C]'
                }`}
                autoFocus
              />
            </div>
            {errors.name && (
              <p className="mt-1 text-xs text-red-500">{errors.name}</p>
            )}
          </div>

          {/* Phone field */}
          <div>
            <label htmlFor="contact-phone" className="block text-sm font-semibold text-[#0A1628] mb-1.5">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8] pointer-events-none" />
              <div className="absolute left-10 top-1/2 -translate-y-1/2 text-sm text-[#4A5568] font-medium pointer-events-none">
                +91
              </div>
              <input
                id="contact-phone"
                type="tel"
                inputMode="numeric"
                placeholder="98765 43210"
                value={phone}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                  setPhone(val);
                  if (errors.phone) setErrors((prev) => ({ ...prev, phone: undefined }));
                }}
                className={`w-full pl-[4.5rem] pr-4 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                  errors.phone
                    ? 'border-red-400 focus:ring-red-200'
                    : 'border-[#E2E8F0] focus:ring-[#C9A84C]/30 focus:border-[#C9A84C]'
                }`}
              />
            </div>
            {errors.phone && (
              <p className="mt-1 text-xs text-red-500">{errors.phone}</p>
            )}
          </div>

          {/* Info text */}
          <p className="text-[11px] text-[#94A3B8] leading-relaxed">
            We'll use this only to follow up with product availability and pricing.
            Your info won't be shared with third parties.
          </p>

          {/* Submit button */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 rounded-lg text-sm font-bold text-white flex items-center justify-center gap-2 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            style={{
              background: submitting
                ? '#4A5568'
                : 'linear-gradient(135deg, #0A1628, #1A2E4A)',
            }}
          >
            {submitting ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <ShoppingCart size={15} />
                Continue & Add to Cart
              </>
            )}
          </button>
        </form>
      </div>

      {/* Slide-up animation */}
      <style>{`
        @keyframes modalSlideUp {
          from {
            opacity: 0;
            transform: translateY(24px) scale(0.97);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </div>
  );
}
