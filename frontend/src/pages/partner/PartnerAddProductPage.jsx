import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import {
  ArrowLeft, Save, Upload, Plus, X, Loader, Trash2, TrendingDown,
} from 'lucide-react';
import toast from 'react-hot-toast';
import useAuthStore from '../../store/authStore';
import Modal from '../../components/ui/Modal';
import PriceComparisonPanel from '../../components/partner/PriceComparisonPanel';
import { fetchPartnerCategoryLinks } from '../../lib/partnerCatalog';

// ── Helpers ──────────────────────────────────────────────────────────────────

function toSlug(brand, name) {
  const base = `${brand}-${name}`
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-{2,}/g, '-');
  return `${base}-${Date.now()}`;
}

const MAX_UPLOAD_WIDTH = 1600;
const WEBP_QUALITY = 0.82;

function loadImageFromFile(file) {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    const url = URL.createObjectURL(file);
    img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Could not read image file')); };
    img.src = url;
  });
}

async function compressImageToWebp(file) {
  const img = await loadImageFromFile(file);
  const scale = Math.min(1, MAX_UPLOAD_WIDTH / img.width);
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(img.width * scale);
  canvas.height = Math.round(img.height * scale);
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('WebP compression failed'))),
      'image/webp',
      WEBP_QUALITY
    );
  });
}

// ── Reusable UI components ───────────────────────────────────────────────────

const inputCls = 'w-full px-3 py-2 text-sm border border-[#E2E8F0] rounded-[6px] focus:outline-none focus:ring-2 focus:ring-[#C9A84C] bg-white';
const addBtnCls = 'px-3 py-2 text-xs font-semibold bg-[#0A1628] text-white rounded-[6px] hover:bg-[#1A2E4A] transition-colors whitespace-nowrap';
const removeBtnCls = 'p-1 text-[#718096] hover:text-red-500 transition-colors flex-shrink-0';

const inr = (v) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(v);

function SectionHeader({ title }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <span className="text-xs font-bold text-[#0A1628] uppercase tracking-wider">{title}</span>
      <div className="flex-1 h-px bg-[#E2E8F0]" />
    </div>
  );
}

function FieldRow({ label, required, children }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-[#0A1628] mb-1">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

// ── Main page ────────────────────────────────────────────────────────────────

export default function PartnerAddProductPage() {
  const navigate = useNavigate();
  const { productId } = useParams();
  const isEditing = Boolean(productId);
  const { profile } = useAuthStore();
  const partnerId = profile?.partner_id;
  const fileRef = useRef(null);

  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loadingProduct, setLoadingProduct] = useState(isEditing);

  // Generated up front so "No — different product" has an id to write into
  // canonical_key before the row exists (see PriceComparisonPanel).
  const [newProductId] = useState(() => crypto.randomUUID());
  const ownProductId = isEditing ? productId : newProductId;

  // Reported by PriceComparisonPanel; gates the save.
  const [comparison, setComparison] = useState({
    groupKey: null, count: 0, lowest: null, lowestPartnerName: null,
  });
  const [priceWarning, setPriceWarning] = useState(null);

  // Form state
  const [form, setForm] = useState({
    name: '', model: '', brand_name: '', description: '',
    slug: '', key_features: [], specifications: {}, in_box: [], faqs: [],
    primary_image_url: '', product_url: '',
    is_active: true, unit_price: '', mrp: '', canonical_key: '',
    partner_category_id: '',
  });

  // The segments this partner registered for. RLS
  // (partner_insert_own_products / partner_update_own_products) rejects any
  // write outside this set, so the select is the only valid source.
  const [segments, setSegments] = useState([]);
  // Starts true and is only ever cleared by the fetch below. The "no linked
  // partner account" case never enters that effect, so it is handled as its
  // own branch in the Category field rather than as a loading state.
  const [segmentsLoading, setSegmentsLoading] = useState(true);

  // Temp input state
  const [newFeature, setNewFeature] = useState('');
  const [newSpecKey, setNewSpecKey] = useState('');
  const [newSpecVal, setNewSpecVal] = useState('');
  const [newBoxItem, setNewBoxItem] = useState('');
  const [newFaqQ, setNewFaqQ] = useState('');
  const [newFaqA, setNewFaqA] = useState('');

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  useEffect(() => {
    if (!partnerId) return;

    let cancelled = false;
    fetchPartnerCategoryLinks(partnerId)
      .then((rows) => { if (!cancelled) setSegments(rows); })
      .finally(() => { if (!cancelled) setSegmentsLoading(false); });

    return () => { cancelled = true; };
  }, [partnerId]);

  useEffect(() => {
    if (!isEditing || !partnerId) return;

    const loadProduct = async () => {
      setLoadingProduct(true);
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('id', productId)
          .eq('partner_id', partnerId)
          .single();

        if (error) throw error;

        setForm({
          name: data.name || '',
          model: data.model || '',
          brand_name: data.brand_name || '',
          description: data.description || '',
          slug: data.slug || '',
          key_features: data.key_features || [],
          specifications: data.specifications || {},
          in_box: data.in_box || [],
          faqs: data.faqs || [],
          primary_image_url: data.primary_image_url || '',
          product_url: data.product_url || '',
          is_active: data.is_active ?? true,
          unit_price: data.unit_price ?? '',
          mrp: data.mrp ?? '',
          canonical_key: data.canonical_key ?? '',
          partner_category_id: data.partner_category_id ?? '',
        });
      } catch (error) {
        console.error('Error loading product:', error);
        toast.error('Failed to load product');
        navigate('/partner/products');
      } finally {
        setLoadingProduct(false);
      }
    };

    loadProduct();
  }, [isEditing, productId, partnerId, navigate]);

  // Auto-generate slug for new products only
  useEffect(() => {
    if (isEditing) return;
    if (form.name && form.brand_name) {
      set('slug', toSlug(form.brand_name, form.name));
    }
  }, [form.name, form.brand_name, isEditing]);

  // ── List helpers ─────────────────────────────────────────────────────────

  const addFeature = () => {
    if (!newFeature.trim()) return;
    set('key_features', [...form.key_features, newFeature.trim()]);
    setNewFeature('');
  };
  const removeFeature = (i) => set('key_features', form.key_features.filter((_, idx) => idx !== i));

  const addSpec = () => {
    if (!newSpecKey.trim()) return;
    set('specifications', { ...form.specifications, [newSpecKey.trim()]: newSpecVal.trim() });
    setNewSpecKey(''); setNewSpecVal('');
  };
  const removeSpec = (key) => {
    const next = { ...form.specifications }; delete next[key];
    set('specifications', next);
  };

  const addBoxItem = () => {
    if (!newBoxItem.trim()) return;
    set('in_box', [...form.in_box, newBoxItem.trim()]);
    setNewBoxItem('');
  };
  const removeBoxItem = (i) => set('in_box', form.in_box.filter((_, idx) => idx !== i));

  const addFaq = () => {
    if (!newFaqQ.trim() || !newFaqA.trim()) return;
    set('faqs', [...form.faqs, { question: newFaqQ.trim(), answer: newFaqA.trim() }]);
    setNewFaqQ(''); setNewFaqA('');
  };
  const removeFaq = (i) => set('faqs', form.faqs.filter((_, idx) => idx !== i));

  // ── Price comparison ─────────────────────────────────────────────────────

  const handleUseLowestPrice = useCallback((price) => {
    setForm((f) => ({ ...f, unit_price: String(price) }));
  }, []);

  const handleCanonicalKeyChange = useCallback((key) => {
    setForm((f) => ({ ...f, canonical_key: key }));
  }, []);

  // ── Image upload ─────────────────────────────────────────────────────────

  const uploadFile = async (file) => {
    if (!file.type.startsWith('image/')) { toast.error('Please select an image file'); return; }
    setUploading(true);
    try {
      const webpBlob = await compressImageToWebp(file);
      const path = `partner/${partnerId}/${form.slug || `product-${Date.now()}`}/${Date.now()}.webp`;
      const { data, error } = await supabase.storage
        .from('product-images')
        .upload(path, webpBlob, { cacheControl: '31536000', upsert: true, contentType: 'image/webp' });
      if (error) throw error;
      const url = supabase.storage.from('product-images').getPublicUrl(data.path).data.publicUrl;
      set('primary_image_url', url);
      toast.success(`Image uploaded (${(webpBlob.size / 1024).toFixed(0)} KB)`);
    } catch (err) {
      toast.error('Upload failed: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  // ── Save product ─────────────────────────────────────────────────────────

  const saveProduct = async (priceOverride) => {
    const unitPrice =
      priceOverride != null
        ? priceOverride
        : form.unit_price !== '' ? parseFloat(form.unit_price) : null;

    setSaving(true);
    try {
      const row = {
        name: form.name.trim(),
        slug: form.slug.trim(),
        brand_name: form.brand_name.trim(),
        model: form.model.trim() || null,
        description: form.description.trim() || null,
        key_features: form.key_features,
        specifications: form.specifications,
        in_box: form.in_box,
        faqs: form.faqs,
        primary_image_url: form.primary_image_url || null,
        product_url: form.product_url || null,
        is_active: form.is_active,
        is_featured: false,
        is_b2b: false,
        unit_price: unitPrice,
        mrp: form.mrp ? parseFloat(form.mrp) : null,
        canonical_key: form.canonical_key || null,
        partner_category_id: form.partner_category_id || null,
        partner_id: partnerId,
        updated_at: new Date().toISOString(),
      };

      if (isEditing) {
        const { data, error } = await supabase
          .from('products')
          .update(row)
          .eq('id', productId)
          .eq('partner_id', partnerId)
          .select('id')
          .single();

        if (error) throw error;
        if (!data) throw new Error('Product not found or you do not have permission to update it');
      } else {
        const { error } = await supabase.from('products').insert({ ...row, id: newProductId });
        if (error) throw error;
      }

      toast.success(isEditing ? 'Product updated successfully!' : 'Product created successfully!');
      navigate('/partner/products');
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error(
        isEditing
          ? 'Failed to update product: ' + error.message
          : 'Failed to create product: ' + error.message
      );
    } finally {
      setSaving(false);
    }
  };

  const handleSave = () => {
    if (!form.name.trim()) { toast.error('Product name is required'); return; }
    if (!form.brand_name.trim()) { toast.error('Brand name is required'); return; }
    if (!form.slug.trim()) { toast.error('Slug is required'); return; }

    // Checked here as well as by RLS: a policy violation surfaces as an
    // opaque 42501, which tells the partner nothing about what to fix.
    if (!form.partner_category_id) { toast.error('Select a category for this product'); return; }
    if (!segments.some((s) => s.id === form.partner_category_id)) {
      toast.error('Pick a category you are registered to sell in');
      return;
    }

    // Advisory check against the lowest price among other sellers. The partner
    // can always override — this only makes sure they saw it.
    const { lowest, lowestPartnerName } = comparison;
    const myPrice = form.unit_price === '' ? null : parseFloat(form.unit_price);

    if (lowest != null && (myPrice == null || myPrice > lowest)) {
      setPriceWarning({ lowest, lowestPartnerName, myPrice });
      return;
    }

    saveProduct();
  };

  const specEntries = Object.entries(form.specifications);

  if (loadingProduct) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader size={32} className="animate-spin text-[#718096]" />
      </div>
    );
  }

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/partner/products')}
          className="p-2 rounded-md text-[#718096] hover:text-[#0A1628] hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-[#0A1628]">
            {isEditing ? 'Edit Product' : 'Add New Product'}
          </h1>
          <p className="text-sm text-[#718096] mt-0.5">
            {isEditing ? 'Update your product listing' : 'List a product on your storefront'}
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#0A1628] text-white text-sm font-semibold rounded-[6px] hover:bg-[#1A2E4A] transition-colors disabled:opacity-50"
        >
          {saving ? <Loader size={16} className="animate-spin" /> : <Save size={16} />}
          {saving ? 'Saving…' : isEditing ? 'Update Product' : 'Save Product'}
        </button>
      </div>

      {/* ── Basic Info ── */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] p-5">
        <SectionHeader title="Basic Information" />
        <div className="space-y-4">
          <FieldRow label="Product Name" required>
            <input value={form.name} onChange={(e) => set('name', e.target.value)} className={inputCls} placeholder="e.g. Tenda AC23 WiFi Router" />
          </FieldRow>

          <div className="grid grid-cols-2 gap-4">
            <FieldRow label="Brand Name" required>
              <input value={form.brand_name} onChange={(e) => set('brand_name', e.target.value)} className={inputCls} placeholder="e.g. TENDA" />
            </FieldRow>
            <FieldRow label="Model Number">
              <input value={form.model} onChange={(e) => set('model', e.target.value)} className={inputCls} placeholder="e.g. AC23" />
            </FieldRow>
          </div>

          <FieldRow label="Category" required>
            {!partnerId ? (
              <div className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-[6px] p-3">
                Your account isn't linked to a partner profile, so categories can't be loaded.
                Contact USJ Technologies.
              </div>
            ) : segmentsLoading ? (
              <div className="flex items-center gap-2 text-sm text-[#718096] py-2">
                <Loader size={14} className="animate-spin" /> Loading your categories…
              </div>
            ) : segments.length === 0 ? (
              <div className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-[6px] p-3">
                You have no registered categories, so you can't list products yet. Contact USJ
                Technologies to have categories added to your partner account.
              </div>
            ) : (
              <>
                <select
                  value={form.partner_category_id}
                  onChange={(e) => set('partner_category_id', e.target.value)}
                  className={inputCls}
                >
                  <option value="">Select a category…</option>
                  {segments.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
                <p className="text-[10px] text-[#718096] mt-0.5">
                  Only the categories you registered for at signup.
                </p>
                {/* Editing a product whose category was later removed from the
                    registration: the row still loads, but it cannot be saved
                    until a currently-registered category is chosen. */}
                {form.partner_category_id &&
                  !segments.some((s) => s.id === form.partner_category_id) && (
                    <p className="text-xs text-amber-700 mt-1">
                      This product's original category is no longer on your registration. Choose
                      one of your current categories to save.
                    </p>
                  )}
              </>
            )}
          </FieldRow>

          <FieldRow label="Slug" required>
            <input value={form.slug} onChange={(e) => set('slug', e.target.value)} className={inputCls} />
            <p className="text-[10px] text-[#718096] mt-0.5">Auto-generated. Used in URL.</p>
          </FieldRow>

          <FieldRow label="Description">
            <textarea value={form.description} onChange={(e) => set('description', e.target.value)} rows={4} className={inputCls} placeholder="Describe your product…" />
          </FieldRow>
        </div>
      </div>

      {/* ── Pricing ── */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] p-5">
        <SectionHeader title="Pricing" />
        <div className="grid grid-cols-2 gap-4">
          <FieldRow label="Selling Price (₹)">
            <input type="number" value={form.unit_price} onChange={(e) => set('unit_price', e.target.value)} className={inputCls} placeholder="0.00" />
          </FieldRow>
          <FieldRow label="MRP (₹)">
            <input type="number" value={form.mrp} onChange={(e) => set('mrp', e.target.value)} className={inputCls} placeholder="0.00" />
          </FieldRow>
        </div>

        <PriceComparisonPanel
          brandName={form.brand_name}
          model={form.model}
          unitPrice={form.unit_price}
          canonicalKey={form.canonical_key}
          ownProductId={ownProductId}
          partnerId={partnerId}
          onUseLowestPrice={handleUseLowestPrice}
          onCanonicalKeyChange={handleCanonicalKeyChange}
          onComparisonChange={setComparison}
        />
      </div>

      {/* ── Product Image ── */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] p-5">
        <SectionHeader title="Product Image" />
        <div className="space-y-3">
          {form.primary_image_url && (
            <div className="relative w-32 h-32">
              <img src={form.primary_image_url} alt="Preview" className="w-full h-full object-cover rounded-lg border border-[#E2E8F0]" />
              <button onClick={() => set('primary_image_url', '')} className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs">
                <X size={12} />
              </button>
            </div>
          )}
          <div className="flex gap-3">
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && uploadFile(e.target.files[0])} />
            <button onClick={() => fileRef.current?.click()} disabled={uploading} className={addBtnCls + ' flex items-center gap-1.5'}>
              {uploading ? <Loader size={14} className="animate-spin" /> : <Upload size={14} />}
              {uploading ? 'Uploading…' : 'Upload Image'}
            </button>
          </div>
          <FieldRow label="Or paste image URL">
            <input value={form.primary_image_url} onChange={(e) => set('primary_image_url', e.target.value)} className={inputCls} placeholder="https://..." />
          </FieldRow>
        </div>
      </div>

      {/* ── Key Features ── */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] p-5">
        <SectionHeader title="Key Features" />
        {form.key_features.length > 0 && (
          <ul className="space-y-1 mb-3">
            {form.key_features.map((f, i) => (
              <li key={i} className="flex items-center gap-2 text-sm text-[#0A1628]">
                <span className="flex-1">• {f}</span>
                <button onClick={() => removeFeature(i)} className={removeBtnCls}><Trash2 size={12} /></button>
              </li>
            ))}
          </ul>
        )}
        <div className="flex gap-2">
          <input value={newFeature} onChange={(e) => setNewFeature(e.target.value)} className={inputCls} placeholder="Add a feature…"
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addFeature(); } }} />
          <button onClick={addFeature} className={addBtnCls}><Plus size={14} /></button>
        </div>
      </div>

      {/* ── Specifications ── */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] p-5">
        <SectionHeader title="Specifications" />
        {specEntries.length > 0 && (
          <div className="space-y-1 mb-3">
            {specEntries.map(([key, val]) => (
              <div key={key} className="flex items-center gap-2 text-sm">
                <span className="font-semibold text-[#0A1628] w-1/3 truncate">{key}</span>
                <span className="text-[#4A5568] flex-1 truncate">{val}</span>
                <button onClick={() => removeSpec(key)} className={removeBtnCls}><Trash2 size={12} /></button>
              </div>
            ))}
          </div>
        )}
        <div className="flex gap-2">
          <input value={newSpecKey} onChange={(e) => setNewSpecKey(e.target.value)} className={inputCls} placeholder="Key (e.g. Weight)"
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSpec(); } }} />
          <input value={newSpecVal} onChange={(e) => setNewSpecVal(e.target.value)} className={inputCls} placeholder="Value (e.g. 500g)"
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSpec(); } }} />
          <button onClick={addSpec} className={addBtnCls}><Plus size={14} /></button>
        </div>
      </div>

      {/* ── What's in the Box ── */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] p-5">
        <SectionHeader title="What's in the Box" />
        {form.in_box.length > 0 && (
          <ul className="space-y-1 mb-3">
            {form.in_box.map((item, i) => (
              <li key={i} className="flex items-center gap-2 text-sm text-[#0A1628]">
                <span className="flex-1">• {item}</span>
                <button onClick={() => removeBoxItem(i)} className={removeBtnCls}><Trash2 size={12} /></button>
              </li>
            ))}
          </ul>
        )}
        <div className="flex gap-2">
          <input value={newBoxItem} onChange={(e) => setNewBoxItem(e.target.value)} className={inputCls} placeholder="Add item…"
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addBoxItem(); } }} />
          <button onClick={addBoxItem} className={addBtnCls}><Plus size={14} /></button>
        </div>
      </div>

      {/* ── FAQs ── */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] p-5">
        <SectionHeader title="FAQs" />
        {form.faqs.length > 0 && (
          <div className="space-y-2 mb-3">
            {form.faqs.map((faq, i) => (
              <div key={i} className="bg-[#F8F9FA] rounded-lg p-3 text-sm">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-[#0A1628]">Q: {faq.question}</p>
                    <p className="text-[#4A5568] mt-1">A: {faq.answer}</p>
                  </div>
                  <button onClick={() => removeFaq(i)} className={removeBtnCls}><Trash2 size={12} /></button>
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="space-y-2">
          <input value={newFaqQ} onChange={(e) => setNewFaqQ(e.target.value)} className={inputCls} placeholder="Question"
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addFaq(); } }} />
          <div className="flex gap-2">
            <input value={newFaqA} onChange={(e) => setNewFaqA(e.target.value)} className={inputCls} placeholder="Answer"
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addFaq(); } }} />
            <button onClick={addFaq} className={addBtnCls}><Plus size={14} /></button>
          </div>
        </div>
      </div>

      {/* ── Settings ── */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] p-5">
        <SectionHeader title="Settings" />
        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" checked={form.is_active} onChange={(e) => set('is_active', e.target.checked)}
            className="w-4 h-4 rounded border-[#E2E8F0] text-[#C9A84C] focus:ring-[#C9A84C]" />
          <div>
            <span className="text-sm font-semibold text-[#0A1628]">Active</span>
            <p className="text-xs text-[#718096]">Visible to customers when active</p>
          </div>
        </label>
      </div>

      {/* ── Product URL ── */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] p-5">
        <SectionHeader title="External Links" />
        <FieldRow label="Product URL (optional)">
          <input value={form.product_url} onChange={(e) => set('product_url', e.target.value)} className={inputCls} placeholder="https://..." />
        </FieldRow>
      </div>

      {/* ── Bottom Save ── */}
      <div className="flex justify-end gap-3 pb-8">
        <button onClick={() => navigate('/partner/products')} className="px-5 py-2.5 text-sm font-semibold text-[#718096] border border-[#E2E8F0] rounded-[6px] hover:bg-gray-50 transition-colors">
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#0A1628] text-white text-sm font-semibold rounded-[6px] hover:bg-[#1A2E4A] transition-colors disabled:opacity-50"
        >
          {saving ? <Loader size={16} className="animate-spin" /> : <Save size={16} />}
          {saving ? 'Saving…' : isEditing ? 'Update Product' : 'Save Product'}
        </button>
      </div>

      {/* ── Price warning ── */}
      <Modal
        isOpen={Boolean(priceWarning)}
        onClose={() => setPriceWarning(null)}
        title="Another seller lists this cheaper"
        size="md"
      >
        {priceWarning && (
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
                <TrendingDown size={18} className="text-amber-600" />
              </div>
              <div className="text-sm text-[#4A5568]">
                {priceWarning.myPrice == null ? (
                  <p>
                    You haven't set a selling price, so this will show as{' '}
                    <span className="font-semibold">Price on Request</span>. Customers can't
                    compare it against{' '}
                    <span className="font-bold text-[#0A1628]">{inr(priceWarning.lowest)}</span>
                    {priceWarning.lowestPartnerName
                      ? ` from ${priceWarning.lowestPartnerName}`
                      : ''}
                    .
                  </p>
                ) : (
                  <p>
                    Your price is{' '}
                    <span className="font-bold text-[#0A1628]">
                      {inr(priceWarning.myPrice - priceWarning.lowest)}
                    </span>{' '}
                    above the lowest price for this product.
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[#F8F9FA] border border-[#E2E8F0] rounded-lg p-3">
                <p className="text-[10px] font-semibold text-[#718096] uppercase tracking-wider">
                  Your price
                </p>
                <p className="text-lg font-bold text-[#0A1628] mt-0.5">
                  {priceWarning.myPrice == null ? 'On request' : inr(priceWarning.myPrice)}
                </p>
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <p className="text-[10px] font-semibold text-amber-700 uppercase tracking-wider">
                  Lowest available
                </p>
                <p className="text-lg font-bold text-[#0A1628] mt-0.5">
                  {inr(priceWarning.lowest)}
                </p>
                {priceWarning.lowestPartnerName && (
                  <p className="text-[10px] text-amber-800 mt-0.5 truncate">
                    {priceWarning.lowestPartnerName}
                  </p>
                )}
              </div>
            </div>

            <p className="text-xs text-[#718096]">
              Matching the lowest price wins more orders, but you can list at any price you like.
            </p>

            <div className="flex flex-col sm:flex-row gap-2 sm:justify-end pt-1">
              <button
                onClick={() => setPriceWarning(null)}
                className="px-4 py-2 text-sm font-semibold text-[#718096] border border-[#E2E8F0] rounded-[6px] hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => { setPriceWarning(null); saveProduct(); }}
                disabled={saving}
                className="px-4 py-2 text-sm font-semibold text-[#4A5568] border border-[#E2E8F0] rounded-[6px] hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                {priceWarning.myPrice == null
                  ? 'List without a price'
                  : `List at ${inr(priceWarning.myPrice)} anyway`}
              </button>
              <button
                onClick={() => {
                  const lowest = priceWarning.lowest;
                  setPriceWarning(null);
                  handleUseLowestPrice(lowest);
                  saveProduct(lowest);
                }}
                disabled={saving}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-amber-600 text-white text-sm font-semibold rounded-[6px] hover:bg-amber-700 transition-colors disabled:opacity-50"
              >
                {saving ? <Loader size={14} className="animate-spin" /> : <TrendingDown size={14} />}
                Use {inr(priceWarning.lowest)} and list
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
