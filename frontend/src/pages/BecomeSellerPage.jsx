import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Upload, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import toast from 'react-hot-toast';
import useAuthStore from '../store/authStore';
import { useNavigate, Link } from 'react-router-dom';

const BecomeSellerPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, profile } = useAuthStore();

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    businessName: '',
    gstNumber: '',
    panNumber: '',
    contactPerson: '',
    contactPhone: '',
    contactEmail: user?.email || '',
    password: '',
    confirmPassword: '',
    bankAccountNumber: '',
    bankIfscCode: '',
    storefrontDescription: '',
    kycFile: null,
  });

  const [kycFileName, setKycFileName] = useState('');

  // Applicants don't need an existing customer account — when they're signed
  // out, the contact email and a password become their new partner login.
  const needsAccount = !isAuthenticated;

  // Validation rules
  const validateForm = () => {
    const newErrors = {};

    if (!form.businessName.trim()) newErrors.businessName = 'Business name is required';
    if (!form.gstNumber.trim()) newErrors.gstNumber = 'GST number is required';
    if (!/^\d{15}$/.test(form.gstNumber.replace(/\s/g, ''))) {
      newErrors.gstNumber = 'GST number must be 15 digits';
    }
    if (!form.panNumber.trim()) newErrors.panNumber = 'PAN is required';
    if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(form.panNumber)) {
      newErrors.panNumber = 'Invalid PAN format (e.g., AAAAA0000A)';
    }
    if (!form.contactPerson.trim()) newErrors.contactPerson = 'Contact person name is required';
    if (!form.contactPhone.trim()) newErrors.contactPhone = 'Phone is required';
    if (!/^\d{10}$/.test(form.contactPhone.replace(/\D/g, ''))) {
      newErrors.contactPhone = 'Phone must be 10 digits';
    }
    if (!form.contactEmail.trim()) newErrors.contactEmail = 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.contactEmail)) {
      newErrors.contactEmail = 'Invalid email format';
    }
    if (needsAccount) {
      if (!form.password) newErrors.password = 'Password is required';
      else if (form.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
      if (form.confirmPassword !== form.password) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }
    if (!form.bankAccountNumber.trim()) newErrors.bankAccountNumber = 'Bank account number is required';
    if (!form.bankIfscCode.trim()) newErrors.bankIfscCode = 'IFSC code is required';
    if (!form.storefrontDescription.trim()) newErrors.storefrontDescription = 'Storefront description is required';
    if (form.storefrontDescription.trim().length < 50) {
      newErrors.storefrontDescription = 'Description must be at least 50 characters';
    }
    if (!form.kycFile) newErrors.kycFile = 'KYC document is required';
    if (form.kycFile && form.kycFile.size > 5 * 1024 * 1024) {
      newErrors.kycFile = 'File must be less than 5MB';
    }
    if (form.kycFile && !['application/pdf', 'image/jpeg', 'image/png'].includes(form.kycFile.type)) {
      newErrors.kycFile = 'Only PDF, JPEG, and PNG files are accepted';
    }
    if (!agreedToTerms) {
      newErrors.agreedToTerms = 'You must agree to the seller terms and agreement';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setForm((prev) => ({ ...prev, kycFile: file }));
      setKycFileName(file.name);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fix the errors below');
      return;
    }

    setLoading(true);

    try {
      // 0. Signed-out applicants get an account created from their contact
      //    details. The partner row and KYC upload both need a session, so
      //    this has to complete before anything else.
      let accountId = user?.id;

      if (needsAccount) {
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: form.contactEmail.trim(),
          password: form.password,
          options: { data: { name: form.contactPerson.trim() } },
        });

        if (signUpError) {
          // Most commonly "User already registered"
          setErrors((prev) => ({ ...prev, contactEmail: signUpError.message }));
          toast.error(
            /registered|exists/i.test(signUpError.message)
              ? 'An account with this email already exists — please log in first.'
              : signUpError.message
          );
          setLoading(false);
          return;
        }

        // No session means the project requires email confirmation, so we
        // cannot write the application yet.
        if (!signUpData.session) {
          toast.error('Check your email to confirm your address, then sign in and re-apply.');
          setLoading(false);
          return;
        }

        accountId = signUpData.user.id;
      }

      // 1. Generate partner slug from business name
      const slug = form.businessName
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-')
        .replace(/-{2,}/g, '-') + '-' + Date.now();

      // 2. Upload KYC file to partner-kyc storage
      const fileName = `${accountId}/${Date.now()}-${form.kycFile.name}`;
      const { error: uploadError } = await supabase.storage
        .from('partner-kyc')
        .upload(fileName, form.kycFile);

      if (uploadError) throw uploadError;

      // 3. Get public URL for the uploaded file
      const { data: urlData } = supabase.storage
        .from('partner-kyc')
        .getPublicUrl(fileName);

      const kycUrl = urlData?.publicUrl;

      // 4. Create partner row with status 'pending'
      const { data: partnerData, error: partnerError } = await supabase
        .from('usj_partners')
        .insert({
          business_name: form.businessName,
          slug,
          gst_number: form.gstNumber.replace(/\s/g, ''),
          pan_number: form.panNumber,
          kyc_document_urls: [kycUrl],
          status: 'pending',
          contact_info: {
            contact_person: form.contactPerson,
            phone: form.contactPhone,
            email: form.contactEmail,
            bank_account_number: form.bankAccountNumber,
            bank_ifsc_code: form.bankIfscCode,
          },
          storefront_description: form.storefrontDescription,
        })
        .select()
        .single();

      if (partnerError) throw partnerError;

      // 5. Link user profile to partner (role stays 'customer' until an admin
      //    approves — PartnerRoute only admits role 'usj_partner').
      //    .select().single() makes a zero-row update fail loudly rather than
      //    silently leaving the application unlinked.
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ partner_id: partnerData.id })
        .eq('id', accountId)
        .select('id')
        .single();

      if (profileError) throw profileError;

      // 6. Refresh the cached profile so the pending state renders on return.
      //    Read the session from the client rather than the store — a brand new
      //    signUp session may not have propagated through onAuthStateChange yet.
      const { data: sessionData } = await supabase.auth.getSession();
      if (sessionData?.session) {
        await useAuthStore.getState()._applySession(sessionData.session);
      }

      toast.success('Your USJ Partner application has been submitted!');
      setSubmitted(true);
    } catch (error) {
      console.error('USJ Partner registration error:', error);
      toast.error(error.message || 'Failed to submit application');
    } finally {
      setLoading(false);
    }
  };

  // An application exists but the role is still 'customer' — PartnerRoute would
  // bounce them straight back to the login page, so send them here instead of
  // to the dashboard.
  const awaitingReview = submitted || (profile?.partner_id && profile?.role !== 'usj_partner');

  if (awaitingReview && profile?.role !== 'usj_partner') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-8 text-center">
          <CheckCircle size={40} className="mx-auto text-green-500 mb-4" />
          <h2 className="text-lg font-semibold text-[#0A1628] mb-2">Application received</h2>
          <p className="text-sm text-[#718096] mb-6">
            Thanks — your USJ Partner application is with our team. We review applications within
            2–3 business days and will email you at{' '}
            <span className="font-semibold text-[#0A1628]">{form.contactEmail || user?.email}</span>{' '}
            once it's approved. Your partner dashboard unlocks at that point.
          </p>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-[#0A1628] text-white text-sm font-semibold rounded-[6px] hover:bg-[#1A2E4A] transition-colors"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  if (profile?.role === 'usj_partner') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-8 text-center">
          <CheckCircle size={40} className="mx-auto text-green-500 mb-4" />
          <h2 className="text-lg font-semibold text-[#0A1628] mb-2">Already a seller</h2>
          <p className="text-sm text-[#718096] mb-6">
            You're already registered as a USJ Partner. Access your dashboard to manage your products and orders.
          </p>
          <button
            onClick={() => navigate('/partner/dashboard')}
            className="px-4 py-2 bg-[#0A1628] text-white text-sm font-semibold rounded-[6px] hover:bg-[#1A2E4A] transition-colors"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#0A1628] mb-2">Become a Partner</h1>
        <p className="text-[#718096]">
          Join USJ Technologies marketplace and reach thousands of customers. Fill in your business details below to get started.
        </p>
        {needsAccount && (
          <p className="text-sm text-[#718096] mt-3 flex items-center gap-1.5">
            <AlertCircle size={14} className="text-[#C9A84C] flex-shrink-0" />
            No account needed — one is created for you. Already have one?{' '}
            <Link to="/login" className="font-semibold text-[#0A1628] hover:underline">
              Log in
            </Link>
          </p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-[#E2E8F0] p-8 space-y-6">
        {/* Business Information Section */}
        <div>
          <h2 className="text-sm font-bold text-[#0A1628] mb-4 uppercase tracking-wider">Business Information</h2>

          <div className="space-y-4">
            {/* Business Name */}
            <div>
              <label className="block text-xs font-semibold text-[#0A1628] mb-1">
                Business Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="businessName"
                value={form.businessName}
                onChange={handleChange}
                placeholder="e.g., Tech Solutions India Pvt Ltd"
                className="w-full px-3 py-2 text-sm border border-[#E2E8F0] rounded-[6px] focus:outline-none focus:ring-2 focus:ring-[#C9A84C]"
              />
              {errors.businessName && (
                <p className="text-xs text-red-500 mt-1">{errors.businessName}</p>
              )}
            </div>

            {/* GST Number */}
            <div>
              <label className="block text-xs font-semibold text-[#0A1628] mb-1">
                GST Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="gstNumber"
                value={form.gstNumber}
                onChange={handleChange}
                placeholder="e.g., 01ABCDE1234F1Z5"
                className="w-full px-3 py-2 text-sm border border-[#E2E8F0] rounded-[6px] focus:outline-none focus:ring-2 focus:ring-[#C9A84C]"
              />
              {errors.gstNumber && (
                <p className="text-xs text-red-500 mt-1">{errors.gstNumber}</p>
              )}
            </div>

            {/* PAN Number */}
            <div>
              <label className="block text-xs font-semibold text-[#0A1628] mb-1">
                PAN Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="panNumber"
                value={form.panNumber}
                onChange={handleChange}
                placeholder="e.g., AAAAA0000A"
                className="w-full px-3 py-2 text-sm border border-[#E2E8F0] rounded-[6px] focus:outline-none focus:ring-2 focus:ring-[#C9A84C]"
              />
              {errors.panNumber && (
                <p className="text-xs text-red-500 mt-1">{errors.panNumber}</p>
              )}
            </div>
          </div>
        </div>

        {/* Contact Information Section */}
        <div>
          <h2 className="text-sm font-bold text-[#0A1628] mb-4 uppercase tracking-wider">Contact Information</h2>

          <div className="space-y-4">
            {/* Contact Person */}
            <div>
              <label className="block text-xs font-semibold text-[#0A1628] mb-1">
                Contact Person Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="contactPerson"
                value={form.contactPerson}
                onChange={handleChange}
                placeholder="Full name"
                className="w-full px-3 py-2 text-sm border border-[#E2E8F0] rounded-[6px] focus:outline-none focus:ring-2 focus:ring-[#C9A84C]"
              />
              {errors.contactPerson && (
                <p className="text-xs text-red-500 mt-1">{errors.contactPerson}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Phone */}
              <div>
                <label className="block text-xs font-semibold text-[#0A1628] mb-1">
                  Phone <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="contactPhone"
                  value={form.contactPhone}
                  onChange={handleChange}
                  placeholder="10-digit number"
                  className="w-full px-3 py-2 text-sm border border-[#E2E8F0] rounded-[6px] focus:outline-none focus:ring-2 focus:ring-[#C9A84C]"
                />
                {errors.contactPhone && (
                  <p className="text-xs text-red-500 mt-1">{errors.contactPhone}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-[#0A1628] mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="contactEmail"
                  value={form.contactEmail}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-sm border border-[#E2E8F0] rounded-[6px] focus:outline-none focus:ring-2 focus:ring-[#C9A84C]"
                />
                {errors.contactEmail && (
                  <p className="text-xs text-red-500 mt-1">{errors.contactEmail}</p>
                )}
              </div>
            </div>

            {/* Password — only for applicants without an account yet */}
            {needsAccount && (
              <>
                <p className="text-xs text-[#718096]">
                  Choose a password — you'll use the email above to sign in once your application is
                  approved.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#0A1628] mb-1">
                      Password <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      name="password"
                      value={form.password}
                      onChange={handleChange}
                      autoComplete="new-password"
                      placeholder="At least 6 characters"
                      className="w-full px-3 py-2 text-sm border border-[#E2E8F0] rounded-[6px] focus:outline-none focus:ring-2 focus:ring-[#C9A84C]"
                    />
                    {errors.password && (
                      <p className="text-xs text-red-500 mt-1">{errors.password}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#0A1628] mb-1">
                      Confirm Password <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={form.confirmPassword}
                      onChange={handleChange}
                      autoComplete="new-password"
                      placeholder="Re-enter password"
                      className="w-full px-3 py-2 text-sm border border-[#E2E8F0] rounded-[6px] focus:outline-none focus:ring-2 focus:ring-[#C9A84C]"
                    />
                    {errors.confirmPassword && (
                      <p className="text-xs text-red-500 mt-1">{errors.confirmPassword}</p>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Bank Details Section */}
        <div>
          <h2 className="text-sm font-bold text-[#0A1628] mb-4 uppercase tracking-wider">Bank Details (for future payouts)</h2>
          <p className="text-xs text-[#718096] mb-4">These are stored securely and used only for USJ Partner payouts once payment splitting is enabled.</p>

          <div className="space-y-4">
            {/* Account Number */}
            <div>
              <label className="block text-xs font-semibold text-[#0A1628] mb-1">
                Bank Account Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="bankAccountNumber"
                value={form.bankAccountNumber}
                onChange={handleChange}
                placeholder="Account number"
                className="w-full px-3 py-2 text-sm border border-[#E2E8F0] rounded-[6px] focus:outline-none focus:ring-2 focus:ring-[#C9A84C]"
              />
              {errors.bankAccountNumber && (
                <p className="text-xs text-red-500 mt-1">{errors.bankAccountNumber}</p>
              )}
            </div>

            {/* IFSC Code */}
            <div>
              <label className="block text-xs font-semibold text-[#0A1628] mb-1">
                IFSC Code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="bankIfscCode"
                value={form.bankIfscCode}
                onChange={handleChange}
                placeholder="e.g., SBIN0001234"
                className="w-full px-3 py-2 text-sm border border-[#E2E8F0] rounded-[6px] focus:outline-none focus:ring-2 focus:ring-[#C9A84C]"
              />
              {errors.bankIfscCode && (
                <p className="text-xs text-red-500 mt-1">{errors.bankIfscCode}</p>
              )}
            </div>
          </div>
        </div>

        {/* Storefront Information Section */}
        <div>
          <h2 className="text-sm font-bold text-[#0A1628] mb-4 uppercase tracking-wider">Storefront</h2>

          <div>
            <label className="block text-xs font-semibold text-[#0A1628] mb-1">
              Storefront Description <span className="text-red-500">*</span>
            </label>
            <textarea
              name="storefrontDescription"
              value={form.storefrontDescription}
              onChange={handleChange}
              placeholder="Describe your business, products, and what makes you unique (min. 50 characters)"
              rows={4}
              className="w-full px-3 py-2 text-sm border border-[#E2E8F0] rounded-[6px] focus:outline-none focus:ring-2 focus:ring-[#C9A84C]"
            />
            {errors.storefrontDescription && (
              <p className="text-xs text-red-500 mt-1">{errors.storefrontDescription}</p>
            )}
            <p className="text-xs text-[#718096] mt-1">
              {form.storefrontDescription.length}/50 minimum characters
            </p>
          </div>
        </div>

        {/* KYC Document Section */}
        <div>
          <h2 className="text-sm font-bold text-[#0A1628] mb-4 uppercase tracking-wider">KYC Document</h2>

          <div className="border-2 border-dashed border-[#E2E8F0] rounded-[6px] p-6 text-center">
            <Upload size={32} className="mx-auto text-[#718096] mb-2" />
            <label className="block cursor-pointer">
              <p className="text-sm font-semibold text-[#0A1628]">
                {kycFileName || 'Click to upload or drag and drop'}
              </p>
              <p className="text-xs text-[#718096] mt-1">PDF, PNG, or JPEG (max 5MB)</p>
              <input
                type="file"
                accept=".pdf,image/png,image/jpeg"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          </div>
          {errors.kycFile && (
            <p className="text-xs text-red-500 mt-1">{errors.kycFile}</p>
          )}
        </div>

        {/* Terms Agreement Section */}
        <div>
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={agreedToTerms}
              onChange={(e) => {
                setAgreedToTerms(e.target.checked);
                if (errors.agreedToTerms) {
                  setErrors((prev) => ({ ...prev, agreedToTerms: '' }));
                }
              }}
              className="mt-1 w-4 h-4 rounded border border-[#E2E8F0] focus:outline-none focus:ring-2 focus:ring-[#C9A84C]"
            />
            <span className="text-sm text-[#4A5568]">
              I have read and agree to the{' '}
              <Link
                to="/seller-terms"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-[#0A1628] hover:underline"
              >
                Seller Agreement & Marketplace Terms
              </Link>
              <span className="text-red-500">*</span>
            </span>
          </label>
          {errors.agreedToTerms && (
            <p className="text-xs text-red-500 mt-2">{errors.agreedToTerms}</p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full px-4 py-3 bg-[#0A1628] text-white text-sm font-semibold rounded-[6px] hover:bg-[#1A2E4A] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading && <Loader size={16} className="animate-spin" />}
          {loading ? 'Submitting...' : 'Submit Application'}
        </button>

        <p className="text-xs text-[#718096] text-center">
          By submitting, you agree to our seller agreement and marketplace terms. We will review your application and contact you within 2-3 business days.
        </p>
      </form>
    </div>
  );
};

export default BecomeSellerPage;
