import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import {
  ArrowLeft, Save, Upload, Plus, X, Loader, Trash2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import useAuthStore from '../../store/authStore';

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

  // Form state
  const [form, setForm] = useState({
    name: '', model: '', brand_name: '', description: '',
    slug: '', key_features: [], specifications: {}, in_box: [], faqs: [],
    primary_image_url: '', product_url: '',
    is_active: true, unit_price: '', mrp: '',
  });

  // Temp input state
  const [newFeature, setNewFeature] = useState('');
  const [newSpecKey, setNewSpecKey] = useState('');
  const [newSpecVal, setNewSpecVal] = useState('');
  const [newBoxItem, setNewBoxItem] = useState('');
  const [newFaqQ, setNewFaqQ] = useState('');
  const [newFaqA, setNewFaqA] = useState('');

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

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

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error('Product name is required'); return; }
    if (!form.brand_name.trim()) { toast.error('Brand name is required'); return; }
    if (!form.slug.trim()) { toast.error('Slug is required'); return; }

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
        unit_price: form.unit_price ? parseFloat(form.unit_price) : null,
        mrp: form.mrp ? parseFloat(form.mrp) : null,
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
        const { error } = await supabase.from('products').insert(row);
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
    </div>
  );
}
