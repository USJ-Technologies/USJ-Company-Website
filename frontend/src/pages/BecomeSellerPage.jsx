import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Upload, AlertCircle, CheckCircle, Loader, X, Plus, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import useAuthStore from '../store/authStore';
import { useNavigate, Link } from 'react-router-dom';
import {
  BUSINESS_TYPES,
  needsAuthorizationDocs,
  fetchPartnerCategories,
} from '../lib/partnerCatalog';

const STEPS = [
  { id: 0, label: 'Business' },
  { id: 1, label: 'What you sell' },
  { id: 2, label: 'Payment' },
];

const MAX_FILE_BYTES = 5 * 1024 * 1024;
const ACCEPTED_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];

// A GSTIN is 15 ALPHANUMERIC characters, not 15 digits:
//   22AAAAA0000A1Z5
//   \/ \________/\/\/
//    |      |     | └─ 'Z' (fixed), then a checksum char
//    |      |     └─── entity number, 1-9 or A-Z
//    |      └───────── the holder's 10-character PAN
//    └──────────────── 2-digit state code
const GSTIN_RE = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;
const PAN_RE = /^[A-Z]{5}[0-9]{4}[A-Z]$/;

// Typed in uppercase whatever the user does, so a lowercase paste of a
// perfectly valid GSTIN or PAN is not rejected.
const UPPERCASE_FIELDS = new Set(['gstNumber', 'panNumber', 'bankIfscCode']);

// Indian mobile numbers are 10 digits starting 6-9. People paste them with
// +91, a leading 0, spaces or dashes; all of that is stripped before checking
// so a valid number is never rejected over formatting.
const normalizePhone = (v) =>
  String(v ?? '')
    .replace(/[\s\-()]/g, '')
    .replace(/^\+?91/, '')
    .replace(/^0/, '');

const PHONE_RE = /^[6-9]\d{9}$/;
// Bank account numbers in India run 9-18 digits depending on the bank.
const BANK_ACCOUNT_RE = /^\d{9,18}$/;
// 4-letter bank code, a fixed 0, then a 6-character branch code.
const IFSC_RE = /^[A-Z]{4}0[A-Z0-9]{6}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;

// Upper bounds are sanity checks, not business rules: they only catch a
// mistyped figure, e.g. a phone number pasted into the SKU box.
const MAX_SKUS = 1000000;
const MAX_CAPACITY = 10000000;

const inputCls =
  'w-full px-3 py-2 text-sm border border-[#E2E8F0] rounded-[6px] focus:outline-none focus:ring-2 focus:ring-[#C9A84C]';

function fileError(file, label) {
  if (file.size > MAX_FILE_BYTES) return `${label} must be less than 5MB`;
  if (!ACCEPTED_TYPES.includes(file.type)) return `${label} must be a PDF, JPEG, or PNG`;
  return null;
}

const BecomeSellerPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, profile } = useAuthStore();

  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [newBrand, setNewBrand] = useState('');

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
    // Catalog profile
    businessType: '',
    categoryIds: [],
    brandsCarried: [],
    skuCount: '',
    monthlyCapacity: '',
    authFiles: [],
  });

  const [kycFileName, setKycFileName] = useState('');

  // Applicants don't need an existing customer account — when they're signed
  // out, the contact email and a password become their new partner login.
  const needsAccount = !isAuthenticated;
  const requiresAuthDocs = needsAuthorizationDocs(form.businessType);

  useEffect(() => {
    let cancelled = false;

    fetchPartnerCategories()
      .then((rows) => {
        if (!cancelled) setCategories(rows);
      })
      .catch((error) => {
        console.error('Failed to load partner categories:', error);
        if (!cancelled) toast.error('Could not load product categories — please reload the page');
      })
      .finally(() => {
        if (!cancelled) setCategoriesLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // ── Validation, split per step so Next and Submit share one source ────────

  const validateStep = (which) => {
    const e = {};

    if (which === 0) {
      if (!form.businessName.trim()) e.businessName = 'Business name is required';
      else if (form.businessName.trim().length < 3) {
        e.businessName = 'Business name must be at least 3 characters';
      }
      const gst = form.gstNumber.replace(/\s/g, '').toUpperCase();
      const pan = form.panNumber.replace(/\s/g, '').toUpperCase();

      if (!gst) e.gstNumber = 'GST number is required';
      else if (!GSTIN_RE.test(gst)) {
        e.gstNumber = 'Invalid GSTIN (e.g., 22AAAAA0000A1Z5)';
      }

      if (!pan) e.panNumber = 'PAN is required';
      else if (!PAN_RE.test(pan)) {
        e.panNumber = 'Invalid PAN format (e.g., AAAAA0000A)';
      }

      // Characters 3-12 of a GSTIN are the holder's PAN. Checking that the two
      // agree catches a transposed digit that both formats accept on their own.
      if (!e.gstNumber && !e.panNumber && gst.slice(2, 12) !== pan) {
        e.gstNumber = "GSTIN doesn't match the PAN below — characters 3–12 should be the PAN";
      }
      if (!form.contactPerson.trim()) e.contactPerson = 'Contact person name is required';
      else if (form.contactPerson.trim().length < 2) {
        e.contactPerson = 'Enter the full name of the contact person';
      }

      if (!form.contactPhone.trim()) e.contactPhone = 'Phone is required';
      else if (!PHONE_RE.test(normalizePhone(form.contactPhone))) {
        e.contactPhone = 'Enter a 10-digit Indian mobile number starting 6-9';
      }

      if (!form.contactEmail.trim()) e.contactEmail = 'Email is required';
      else if (!EMAIL_RE.test(form.contactEmail.trim())) {
        e.contactEmail = 'Invalid email format';
      }
      if (needsAccount) {
        if (!form.password) e.password = 'Password is required';
        else if (form.password.length < 6) e.password = 'Password must be at least 6 characters';
        if (form.confirmPassword !== form.password) {
          e.confirmPassword = 'Passwords do not match';
        }
      }
      if (!form.kycFile) e.kycFile = 'KYC document is required';
      else {
        const err = fileError(form.kycFile, 'KYC document');
        if (err) e.kycFile = err;
      }
    }

    if (which === 1) {
      if (!form.businessType) e.businessType = 'Select how your business operates';
      if (form.categoryIds.length === 0) {
        e.categoryIds = 'Select at least one category you sell in';
      }
      if (form.brandsCarried.length === 0) {
        e.brandsCarried = 'Add at least one brand — your own if you manufacture';
      }
      if (form.skuCount === '') e.skuCount = 'Approximate SKU count is required';
      else if (!/^\d+$/.test(String(form.skuCount)) || Number(form.skuCount) < 1) {
        e.skuCount = 'Enter a whole number of 1 or more';
      } else if (Number(form.skuCount) > MAX_SKUS) {
        e.skuCount = `That looks too high — enter at most ${MAX_SKUS.toLocaleString('en-IN')}`;
      }

      if (form.monthlyCapacity === '') e.monthlyCapacity = 'Monthly capacity is required';
      else if (!/^\d+$/.test(String(form.monthlyCapacity)) || Number(form.monthlyCapacity) < 1) {
        e.monthlyCapacity = 'Enter a whole number of 1 or more';
      } else if (Number(form.monthlyCapacity) > MAX_CAPACITY) {
        e.monthlyCapacity = `That looks too high — enter at most ${MAX_CAPACITY.toLocaleString('en-IN')}`;
      }
      if (!form.storefrontDescription.trim()) {
        e.storefrontDescription = 'Storefront description is required';
      } else if (form.storefrontDescription.trim().length < 50) {
        e.storefrontDescription = 'Description must be at least 50 characters';
      }
      // Manufacturers sell their own brand and have nobody to be authorised by.
      if (requiresAuthDocs && form.authFiles.length === 0) {
        e.authFiles = 'Upload at least one authorization or dealership letter';
      }
      for (const f of form.authFiles) {
        const err = fileError(f, 'Authorization document');
        if (err) {
          e.authFiles = err;
          break;
        }
      }
    }

    if (which === 2) {
      const account = form.bankAccountNumber.replace(/[\s-]/g, '');
      if (!account) e.bankAccountNumber = 'Bank account number is required';
      else if (!BANK_ACCOUNT_RE.test(account)) {
        e.bankAccountNumber = 'Account number must be 9-18 digits';
      }

      if (!form.bankIfscCode.trim()) e.bankIfscCode = 'IFSC code is required';
      else if (!IFSC_RE.test(form.bankIfscCode.trim().toUpperCase())) {
        e.bankIfscCode = 'Invalid IFSC format (e.g., SBIN0001234)';
      }
      if (!agreedToTerms) e.agreedToTerms = 'You must agree to the seller terms and agreement';
    }

    return e;
  };

  // ── Field handlers ────────────────────────────────────────────────────────

  const clearError = (key) =>
    setErrors((prev) => (prev[key] ? { ...prev, [key]: '' } : prev));

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: UPPERCASE_FIELDS.has(name) ? value.toUpperCase() : value,
    }));
    clearError(name);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setForm((prev) => ({ ...prev, kycFile: file }));
    setKycFileName(file.name);
    clearError('kycFile');
  };

  const handleAuthFilesChange = (e) => {
    const picked = Array.from(e.target.files ?? []);
    if (picked.length === 0) return;
    setForm((prev) => ({ ...prev, authFiles: [...prev.authFiles, ...picked] }));
    clearError('authFiles');
    // Let the same file be re-picked after removal.
    e.target.value = '';
  };

  const removeAuthFile = (index) =>
    setForm((prev) => ({ ...prev, authFiles: prev.authFiles.filter((_, i) => i !== index) }));

  const toggleCategory = (id) => {
    setForm((prev) => ({
      ...prev,
      categoryIds: prev.categoryIds.includes(id)
        ? prev.categoryIds.filter((c) => c !== id)
        : [...prev.categoryIds, id],
    }));
    clearError('categoryIds');
  };

  const addBrand = () => {
    const value = newBrand.trim();
    if (!value) return;
    // Case-insensitive dedupe so "Tenda" and "tenda" don't both land.
    if (form.brandsCarried.some((b) => b.toLowerCase() === value.toLowerCase())) {
      setNewBrand('');
      return;
    }
    setForm((prev) => ({ ...prev, brandsCarried: [...prev.brandsCarried, value] }));
    setNewBrand('');
    clearError('brandsCarried');
  };

  const removeBrand = (index) =>
    setForm((prev) => ({
      ...prev,
      brandsCarried: prev.brandsCarried.filter((_, i) => i !== index),
    }));

  // ── Step navigation ───────────────────────────────────────────────────────

  const goNext = () => {
    const stepErrors = validateStep(step);
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      toast.error('Please fix the errors below');
      return;
    }
    setErrors({});
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goBack = () => {
    setErrors({});
    setStep((s) => Math.max(s - 1, 0));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ── Submit ────────────────────────────────────────────────────────────────

  const uploadDoc = async (file, accountId, prefix) => {
    const safeName = file.name.replace(/[^A-Za-z0-9._-]/g, '_');
    // First path segment must be the uid — partner_upload_kyc checks it.
    const path = `${accountId}/${prefix}-${Date.now()}-${safeName}`;
    const { error } = await supabase.storage.from('partner-kyc').upload(path, file);
    if (error) throw error;
    return supabase.storage.from('partner-kyc').getPublicUrl(path).data?.publicUrl;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Enter inside an input on an earlier step advances rather than submits.
    if (step < STEPS.length - 1) {
      goNext();
      return;
    }

    // Re-validate every step: a field can be edited after its step was passed.
    const allErrors = { ...validateStep(0), ...validateStep(1), ...validateStep(2) };
    if (Object.keys(allErrors).length > 0) {
      setErrors(allErrors);
      const firstBadStep = [0, 1, 2].find(
        (s) => Object.keys(validateStep(s)).length > 0
      );
      setStep(firstBadStep);
      toast.error('Please fix the errors before submitting');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setLoading(true);

    try {
      // 0. Signed-out applicants get an account created from their contact
      //    details. The partner row and uploads both need a session, so
      //    this has to complete before anything else.
      let accountId = user?.id;

      if (needsAccount) {
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: form.contactEmail.trim().toLowerCase(),
          password: form.password,
          options: { data: { name: form.contactPerson.trim() } },
        });

        if (signUpError) {
          setErrors((prev) => ({ ...prev, contactEmail: signUpError.message }));
          setStep(0);
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

      // 1. Slug from business name
      const slug =
        form.businessName
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '')
          .trim()
          .replace(/\s+/g, '-')
          .replace(/-{2,}/g, '-') +
        '-' +
        Date.now();

      // 2. Uploads — KYC, then any authorization letters.
      const kycUrl = await uploadDoc(form.kycFile, accountId, 'kyc');
      const authUrls = [];
      for (const file of form.authFiles) {
        authUrls.push(await uploadDoc(file, accountId, 'auth'));
      }

      // 3. Partner row, status 'pending'
      const { data: partnerData, error: partnerError } = await supabase
        .from('usj_partners')
        .insert({
          business_name: form.businessName,
          slug,
          // Stored normalised, so two applications with the same GSTIN typed
          // differently are still comparable.
          gst_number: form.gstNumber.replace(/\s/g, '').toUpperCase(),
          pan_number: form.panNumber.replace(/\s/g, '').toUpperCase(),
          kyc_document_urls: [kycUrl],
          status: 'pending',
          contact_info: {
            contact_person: form.contactPerson.trim(),
            phone: normalizePhone(form.contactPhone),
            email: form.contactEmail.trim().toLowerCase(),
            bank_account_number: form.bankAccountNumber.replace(/[\s-]/g, ''),
            bank_ifsc_code: form.bankIfscCode.trim().toUpperCase(),
          },
          storefront_description: form.storefrontDescription.trim(),
          business_type: form.businessType,
          brands_carried: form.brandsCarried,
          sku_count: Number(form.skuCount),
          monthly_capacity: Number(form.monthlyCapacity),
          authorization_doc_urls: authUrls,
        })
        .select()
        .single();

      if (partnerError) throw partnerError;

      // 4. Registered segments. Written after the partner row because the
      //    RLS policy on usj_partner_categories resolves through
      //    usj_partners.created_by, which only exists once the row does.
      const { error: categoryError } = await supabase
        .from('usj_partner_categories')
        .insert(
          form.categoryIds.map((categoryId) => ({
            partner_id: partnerData.id,
            category_id: categoryId,
          }))
        );

      if (categoryError) throw categoryError;

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
      const { data: sessionData } = await supabase.auth.getSession();
      if (sessionData?.session) {
        await useAuthStore.getState()._applySession(sessionData.session);
      }

      toast.success('Your USJ Partner application has been submitted!');
      setSubmitted(true);
    } catch (error) {
      console.error('USJ Partner registration error:', error);
      const detail = [error.details, error.hint].filter(Boolean).join(' — ');
      toast.error(
        [error.message || 'Failed to submit application', detail].filter(Boolean).join(' — '),
        { duration: 8000 }
      );
    } finally {
      setLoading(false);
    }
  };

  // ── Post-submit / already-a-partner states ────────────────────────────────

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
            You're already registered as a USJ Partner. Access your dashboard to manage your
            products and orders.
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

  const isLastStep = step === STEPS.length - 1;

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#0A1628] mb-2">Become a Partner</h1>
        <p className="text-[#718096]">
          Join USJ Technologies marketplace and reach thousands of customers. Fill in your business
          details below to get started.
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

      {/* Progress */}
      <ol className="flex items-center mb-6" aria-label="Application progress">
        {STEPS.map((s, i) => {
          const state = i < step ? 'done' : i === step ? 'current' : 'todo';
          return (
            <li key={s.id} className="flex items-center flex-1 last:flex-none">
              <div className="flex items-center gap-2">
                <span
                  aria-current={state === 'current' ? 'step' : undefined}
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                    state === 'done'
                      ? 'bg-green-600 text-white'
                      : state === 'current'
                        ? 'bg-[#0A1628] text-white'
                        : 'bg-[#E2E8F0] text-[#718096]'
                  }`}
                >
                  {state === 'done' ? <Check size={14} /> : i + 1}
                </span>
                <span
                  className={`text-xs font-semibold hidden sm:inline ${
                    state === 'todo' ? 'text-[#718096]' : 'text-[#0A1628]'
                  }`}
                >
                  {s.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={`flex-1 h-px mx-3 ${i < step ? 'bg-green-600' : 'bg-[#E2E8F0]'}`}
                />
              )}
            </li>
          );
        })}
      </ol>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl border border-[#E2E8F0] p-8 space-y-6"
      >
        {/* ══ STEP 0 — Business ══════════════════════════════════════════ */}
        {step === 0 && (
          <>
            <div>
              <h2 className="text-sm font-bold text-[#0A1628] mb-4 uppercase tracking-wider">
                Business Information
              </h2>
              <div className="space-y-4">
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
                    className={inputCls}
                  />
                  {errors.businessName && (
                    <p className="text-xs text-red-500 mt-1">{errors.businessName}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#0A1628] mb-1">
                      GST Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="gstNumber"
                      value={form.gstNumber}
                      onChange={handleChange}
                      maxLength={15}
                      autoCapitalize="characters"
                      spellCheck={false}
                      placeholder="e.g., 22AAAAA0000A1Z5"
                      className={inputCls}
                    />
                    {errors.gstNumber && (
                      <p className="text-xs text-red-500 mt-1">{errors.gstNumber}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#0A1628] mb-1">
                      PAN Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="panNumber"
                      value={form.panNumber}
                      onChange={handleChange}
                      maxLength={10}
                      autoCapitalize="characters"
                      spellCheck={false}
                      placeholder="e.g., AAAAA0000A"
                      className={inputCls}
                    />
                    {errors.panNumber && (
                      <p className="text-xs text-red-500 mt-1">{errors.panNumber}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-sm font-bold text-[#0A1628] mb-4 uppercase tracking-wider">
                Contact Information
              </h2>
              <div className="space-y-4">
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
                    className={inputCls}
                  />
                  {errors.contactPerson && (
                    <p className="text-xs text-red-500 mt-1">{errors.contactPerson}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#0A1628] mb-1">
                      Phone <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      name="contactPhone"
                      value={form.contactPhone}
                      onChange={handleChange}
                      inputMode="tel"
                      autoComplete="tel"
                      maxLength={16}
                      placeholder="10-digit mobile"
                      className={inputCls}
                    />
                    {errors.contactPhone && (
                      <p className="text-xs text-red-500 mt-1">{errors.contactPhone}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#0A1628] mb-1">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="contactEmail"
                      value={form.contactEmail}
                      onChange={handleChange}
                      className={inputCls}
                    />
                    {errors.contactEmail && (
                      <p className="text-xs text-red-500 mt-1">{errors.contactEmail}</p>
                    )}
                  </div>
                </div>

                {needsAccount && (
                  <>
                    <p className="text-xs text-[#718096]">
                      Choose a password — you'll use the email above to sign in once your
                      application is approved.
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
                          className={inputCls}
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
                          className={inputCls}
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

            <div>
              <h2 className="text-sm font-bold text-[#0A1628] mb-4 uppercase tracking-wider">
                KYC Document
              </h2>
              <div className="border-2 border-dashed border-[#E2E8F0] rounded-[6px] p-6 text-center">
                <Upload size={32} className="mx-auto text-[#718096] mb-2" />
                <label className="block cursor-pointer">
                  <p className="text-sm font-semibold text-[#0A1628]">
                    {kycFileName || 'Click to upload'}
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
              {errors.kycFile && <p className="text-xs text-red-500 mt-1">{errors.kycFile}</p>}
            </div>
          </>
        )}

        {/* ══ STEP 1 — What you sell ═════════════════════════════════════ */}
        {step === 1 && (
          <>
            <div>
              <h2 className="text-sm font-bold text-[#0A1628] mb-1 uppercase tracking-wider">
                How you operate
              </h2>
              <p className="text-xs text-[#718096] mb-4">
                This tells us where you sit in the supply chain.
              </p>
              <div className="space-y-2">
                {BUSINESS_TYPES.map((t) => (
                  <label
                    key={t.value}
                    className={`flex items-start gap-3 p-3 rounded-[6px] border cursor-pointer transition-colors ${
                      form.businessType === t.value
                        ? 'border-[#C9A84C] bg-[#FDFBF5]'
                        : 'border-[#E2E8F0] hover:bg-[#F7FAFC]'
                    }`}
                  >
                    <input
                      type="radio"
                      name="businessType"
                      value={t.value}
                      checked={form.businessType === t.value}
                      onChange={handleChange}
                      className="mt-0.5 w-4 h-4 focus:outline-none focus:ring-2 focus:ring-[#C9A84C]"
                    />
                    <span>
                      <span className="block text-sm font-semibold text-[#0A1628]">{t.label}</span>
                      <span className="block text-xs text-[#718096]">{t.hint}</span>
                    </span>
                  </label>
                ))}
              </div>
              {errors.businessType && (
                <p className="text-xs text-red-500 mt-1">{errors.businessType}</p>
              )}
            </div>

            <div>
              <h2 className="text-sm font-bold text-[#0A1628] mb-1 uppercase tracking-wider">
                Product categories <span className="text-red-500">*</span>
              </h2>
              <p className="text-xs text-[#718096] mb-4">
                Pick every category you intend to sell in. Once approved you can only list products
                in these — ask us to add more later if your range grows.
              </p>

              {categoriesLoading ? (
                <div className="flex items-center gap-2 text-sm text-[#718096] py-4">
                  <Loader size={16} className="animate-spin" /> Loading categories…
                </div>
              ) : categories.length === 0 ? (
                <p className="text-sm text-red-500 py-2">
                  Categories could not be loaded. Please reload the page.
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {categories.map((c) => {
                    const checked = form.categoryIds.includes(c.id);
                    return (
                      <label
                        key={c.id}
                        className={`flex items-center gap-2.5 px-3 py-2.5 rounded-[6px] border cursor-pointer transition-colors ${
                          checked
                            ? 'border-[#C9A84C] bg-[#FDFBF5]'
                            : 'border-[#E2E8F0] hover:bg-[#F7FAFC]'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleCategory(c.id)}
                          className="w-4 h-4 rounded border-[#E2E8F0] focus:outline-none focus:ring-2 focus:ring-[#C9A84C]"
                        />
                        <span className="text-sm text-[#0A1628]">{c.name}</span>
                      </label>
                    );
                  })}
                </div>
              )}
              {errors.categoryIds && (
                <p className="text-xs text-red-500 mt-2">{errors.categoryIds}</p>
              )}
              {form.categoryIds.length > 0 && (
                <p className="text-xs text-[#718096] mt-2">
                  {form.categoryIds.length} selected
                </p>
              )}
            </div>

            <div>
              <h2 className="text-sm font-bold text-[#0A1628] mb-1 uppercase tracking-wider">
                Brands you carry <span className="text-red-500">*</span>
              </h2>
              <p className="text-xs text-[#718096] mb-3">
                If you manufacture, add your own brand.
              </p>

              {form.brandsCarried.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {form.brandsCarried.map((b, i) => (
                    <span
                      key={`${b}-${i}`}
                      className="inline-flex items-center gap-1.5 pl-3 pr-1.5 py-1 bg-[#F7FAFC] border border-[#E2E8F0] rounded-full text-xs font-semibold text-[#0A1628]"
                    >
                      {b}
                      <button
                        type="button"
                        onClick={() => removeBrand(i)}
                        aria-label={`Remove ${b}`}
                        className="p-0.5 text-[#718096] hover:text-red-500 transition-colors"
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              <div className="flex gap-2">
                <input
                  type="text"
                  value={newBrand}
                  onChange={(e) => setNewBrand(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addBrand();
                    }
                  }}
                  placeholder="e.g., Tenda"
                  className={inputCls}
                />
                <button
                  type="button"
                  onClick={addBrand}
                  className="px-3 py-2 text-xs font-semibold bg-[#0A1628] text-white rounded-[6px] hover:bg-[#1A2E4A] transition-colors whitespace-nowrap flex items-center gap-1"
                >
                  <Plus size={14} /> Add
                </button>
              </div>
              {errors.brandsCarried && (
                <p className="text-xs text-red-500 mt-1">{errors.brandsCarried}</p>
              )}
            </div>

            <div>
              <h2 className="text-sm font-bold text-[#0A1628] mb-4 uppercase tracking-wider">
                Scale
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#0A1628] mb-1">
                    Approx. SKUs <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    name="skuCount"
                    value={form.skuCount}
                    onChange={handleChange}
                    placeholder="e.g., 500"
                    className={inputCls}
                  />
                  {errors.skuCount && (
                    <p className="text-xs text-red-500 mt-1">{errors.skuCount}</p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#0A1628] mb-1">
                    Units / month <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    name="monthlyCapacity"
                    value={form.monthlyCapacity}
                    onChange={handleChange}
                    placeholder="e.g., 1000"
                    className={inputCls}
                  />
                  {errors.monthlyCapacity && (
                    <p className="text-xs text-red-500 mt-1">{errors.monthlyCapacity}</p>
                  )}
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-sm font-bold text-[#0A1628] mb-1 uppercase tracking-wider">
                Authorization documents{' '}
                {requiresAuthDocs ? (
                  <span className="text-red-500">*</span>
                ) : (
                  <span className="normal-case tracking-normal font-medium text-[#718096]">
                    — optional
                  </span>
                )}
              </h2>
              <p className="text-xs text-[#718096] mb-3">
                {requiresAuthDocs
                  ? 'Dealership or authorization letters for the brands you listed above.'
                  : 'Manufacturers sell their own brand, so this is not required. Attach anything that supports your application.'}
              </p>

              {form.authFiles.length > 0 && (
                <ul className="space-y-1.5 mb-3">
                  {form.authFiles.map((f, i) => (
                    <li
                      key={`${f.name}-${i}`}
                      className="flex items-center gap-2 text-sm text-[#0A1628] bg-[#F7FAFC] border border-[#E2E8F0] rounded-[6px] px-3 py-2"
                    >
                      <span className="flex-1 truncate">{f.name}</span>
                      <span className="text-xs text-[#718096] flex-shrink-0">
                        {(f.size / 1024).toFixed(0)} KB
                      </span>
                      <button
                        type="button"
                        onClick={() => removeAuthFile(i)}
                        aria-label={`Remove ${f.name}`}
                        className="p-0.5 text-[#718096] hover:text-red-500 transition-colors"
                      >
                        <X size={14} />
                      </button>
                    </li>
                  ))}
                </ul>
              )}

              <div className="border-2 border-dashed border-[#E2E8F0] rounded-[6px] p-5 text-center">
                <Upload size={26} className="mx-auto text-[#718096] mb-2" />
                <label className="block cursor-pointer">
                  <p className="text-sm font-semibold text-[#0A1628]">Click to upload</p>
                  <p className="text-xs text-[#718096] mt-1">
                    PDF, PNG, or JPEG (max 5MB each) — multiple allowed
                  </p>
                  <input
                    type="file"
                    multiple
                    accept=".pdf,image/png,image/jpeg"
                    onChange={handleAuthFilesChange}
                    className="hidden"
                  />
                </label>
              </div>
              {errors.authFiles && <p className="text-xs text-red-500 mt-1">{errors.authFiles}</p>}
            </div>

            <div>
              <h2 className="text-sm font-bold text-[#0A1628] mb-4 uppercase tracking-wider">
                Storefront
              </h2>
              <label className="block text-xs font-semibold text-[#0A1628] mb-1">
                Storefront Description <span className="text-red-500">*</span>
              </label>
              <textarea
                name="storefrontDescription"
                value={form.storefrontDescription}
                onChange={handleChange}
                placeholder="Describe your business, products, and what makes you unique (min. 50 characters)"
                rows={4}
                className={inputCls}
              />
              {errors.storefrontDescription && (
                <p className="text-xs text-red-500 mt-1">{errors.storefrontDescription}</p>
              )}
              <p className="text-xs text-[#718096] mt-1">
                {form.storefrontDescription.length}/50 minimum characters
              </p>
            </div>
          </>
        )}

        {/* ══ STEP 2 — Payment & terms ═══════════════════════════════════ */}
        {step === 2 && (
          <>
            <div>
              <h2 className="text-sm font-bold text-[#0A1628] mb-4 uppercase tracking-wider">
                Bank Details (for future payouts)
              </h2>
              <p className="text-xs text-[#718096] mb-4">
                These are stored securely and used only for USJ Partner payouts once payment
                splitting is enabled.
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#0A1628] mb-1">
                    Bank Account Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="bankAccountNumber"
                    value={form.bankAccountNumber}
                    onChange={handleChange}
                    inputMode="numeric"
                    maxLength={18}
                    autoComplete="off"
                    placeholder="9-18 digits"
                    className={inputCls}
                  />
                  {errors.bankAccountNumber && (
                    <p className="text-xs text-red-500 mt-1">{errors.bankAccountNumber}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#0A1628] mb-1">
                    IFSC Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="bankIfscCode"
                    value={form.bankIfscCode}
                    onChange={handleChange}
                    maxLength={11}
                    autoCapitalize="characters"
                    spellCheck={false}
                    autoComplete="off"
                    placeholder="e.g., SBIN0001234"
                    className={inputCls}
                  />
                  {errors.bankIfscCode && (
                    <p className="text-xs text-red-500 mt-1">{errors.bankIfscCode}</p>
                  )}
                </div>
              </div>
            </div>

            <div>
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => {
                    setAgreedToTerms(e.target.checked);
                    clearError('agreedToTerms');
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
          </>
        )}

        {/* ══ Navigation ═════════════════════════════════════════════════ */}
        <div className="flex gap-3 pt-2">
          {step > 0 && (
            <button
              type="button"
              onClick={goBack}
              disabled={loading}
              className="px-5 py-3 text-sm font-semibold text-[#718096] border border-[#E2E8F0] rounded-[6px] hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Back
            </button>
          )}

          {isLastStep ? (
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-3 bg-[#0A1628] text-white text-sm font-semibold rounded-[6px] hover:bg-[#1A2E4A] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading && <Loader size={16} className="animate-spin" />}
              {loading ? 'Submitting…' : 'Submit Application'}
            </button>
          ) : (
            <button
              type="button"
              onClick={goNext}
              className="flex-1 px-4 py-3 bg-[#0A1628] text-white text-sm font-semibold rounded-[6px] hover:bg-[#1A2E4A] transition-colors"
            >
              Continue
            </button>
          )}
        </div>

        {isLastStep && (
          <p className="text-xs text-[#718096] text-center">
            By submitting, you agree to our seller agreement and marketplace terms. We will review
            your application and contact you within 2-3 business days.
          </p>
        )}
      </form>
    </div>
  );
};

export default BecomeSellerPage;
