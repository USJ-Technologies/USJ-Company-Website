import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import Skeleton from '../../components/ui/Skeleton';
import {
  Search, Package, ExternalLink, Star, Plus, Edit2, Trash2, X,
  Save, Upload, Link as LinkIcon, ChevronDown, CheckCircle, Image,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

const PAGE_SIZE = 30;
const BRAND_COLORS = { ENTER: '#1A56DB', TENDA: '#2D7D46', ZOOOK: '#C9A84C' };

function toSlug(brand, name) {
  const base = `${brand}-${name}`
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-{2,}/g, '-');
  return `${base}-${Date.now()}`;
}

// Resize (max width) + re-encode any selected image to WebP in the browser
// before it ever hits the network. This keeps the storage bucket WebP-only
// and is the main fix for slow uploads — a 2-3MB phone photo becomes a
// ~50-150KB WebP, so the upload itself takes a fraction of the time.
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

const inputCls = 'w-full px-3 py-2 text-sm border border-[#E2E8F0] rounded-[6px] focus:outline-none focus:ring-2 focus:ring-[#C9A84C] bg-white';
const addBtnCls = 'px-3 py-2 text-xs font-semibold bg-[#0A1628] text-white rounded-[6px] hover:bg-[#1A2E4A] transition-colors whitespace-nowrap';
const removeBtnCls = 'p-1 text-[#718096] hover:text-red-500 transition-colors flex-shrink-0';

const emptyForm = {
  name: '', model: '', brand_name: 'ENTER', category_name: '', description: '',
  slug: '', key_features: [], specifications: {}, in_box: [],
  primary_image_url: '', additionalImages: [], product_url: '',
  is_active: true, is_featured: false, is_b2b: true, unit_price: '', mrp: '',
};

function toFormData(p) {
  const additionalImages = (p.images || [])
    .filter(img => img?.url && img.url !== p.primary_image_url)
    .map(img => img.url);
  return {
    name: p.name || '',
    model: p.model || '',
    brand_name: p.brand_name || 'ENTER',
    category_name: p.category_name || '',
    description: p.description || '',
    slug: p.slug || '',
    key_features: Array.isArray(p.key_features) ? p.key_features : [],
    specifications: (p.specifications && typeof p.specifications === 'object' && !Array.isArray(p.specifications)) ? p.specifications : {},
    in_box: Array.isArray(p.in_box) ? p.in_box : [],
    primary_image_url: p.primary_image_url || '',
    additionalImages,
    product_url: p.product_url || '',
    is_active: p.is_active ?? true,
    is_featured: p.is_featured ?? false,
    is_b2b: p.is_b2b ?? true,
    unit_price: p.unit_price != null ? String(p.unit_price) : '',
    mrp: p.mrp != null ? String(p.mrp) : '',
  };
}

// ── BrandCombobox ─────────────────────────────────────────────────────────────
function BrandCombobox({ value, onChange }) {
  const [brands, setBrands] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [adding, setAdding] = useState(false);
  const [newBrand, setNewBrand] = useState('');
  const [saving, setSaving] = useState(false);
  const containerRef = useRef(null);
  const newInputRef = useRef(null);

  useEffect(() => {
    supabase.from('brands').select('id, name').order('name').then(({ data }) => {
      if (data?.length) setBrands(data.map(b => b.name));
    });
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
        setAdding(false);
        setNewBrand('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (adding && newInputRef.current) newInputRef.current.focus();
  }, [adding]);

  const handleAddBrand = async () => {
    const name = newBrand.trim().toUpperCase();
    if (!name) return;
    if (brands.includes(name)) { onChange(name); setIsOpen(false); setAdding(false); setNewBrand(''); return; }
    setSaving(true);
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const { error } = await supabase.from('brands').insert({ name, slug });
    setSaving(false);
    if (error) { toast.error('Failed to add brand: ' + error.message); return; }
    setBrands(prev => [...prev, name].sort());
    onChange(name);
    setIsOpen(false);
    setAdding(false);
    setNewBrand('');
    toast.success(`Brand "${name}" added`);
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(o => !o)}
        className={`${inputCls} flex items-center justify-between text-left`}
      >
        <span className={value ? 'text-[#0A1628]' : 'text-[#A0AEC0]'}>{value || 'Select brand…'}</span>
        <ChevronDown size={14} className={`text-[#718096] transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-[#E2E8F0] rounded-[8px] shadow-lg overflow-hidden">
          <ul className="max-h-48 overflow-y-auto py-1">
            {brands.map(b => (
              <li key={b}>
                <button
                  type="button"
                  onClick={() => { onChange(b); setIsOpen(false); }}
                  className={`w-full text-left px-3 py-2 text-sm transition-colors hover:bg-[#F8F9FA] ${value === b ? 'text-[#C9A84C] font-semibold bg-[#FFF8E7]' : 'text-[#0A1628]'}`}
                >
                  {b}
                </button>
              </li>
            ))}
          </ul>
          <div className="border-t border-[#E2E8F0] p-2">
            {adding ? (
              <div className="flex gap-1.5">
                <input
                  ref={newInputRef}
                  value={newBrand}
                  onChange={e => setNewBrand(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddBrand(); } if (e.key === 'Escape') { setAdding(false); setNewBrand(''); } }}
                  placeholder="Brand name (e.g. NETGEAR)"
                  className="flex-1 px-2 py-1.5 text-xs border border-[#E2E8F0] rounded-[4px] focus:outline-none focus:ring-1 focus:ring-[#C9A84C]"
                />
                <button
                  type="button"
                  onClick={handleAddBrand}
                  disabled={saving || !newBrand.trim()}
                  className="px-2.5 py-1.5 text-xs font-semibold bg-[#0A1628] text-white rounded-[4px] disabled:opacity-50"
                >
                  {saving ? '…' : 'Add'}
                </button>
                <button type="button" onClick={() => { setAdding(false); setNewBrand(''); }} className="px-2 py-1.5 text-xs text-[#718096] hover:text-[#0A1628]">
                  <X size={12} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setAdding(true)}
                className="w-full flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-[#1A56DB] hover:bg-[#EBF4FF] rounded-[6px] transition-colors"
              >
                <Plus size={13} /> Add new brand
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── ProductForm (top-level to avoid remount) ──────────────────────────────────
function ProductForm({ initialData, onSave, onClose, saving }) {
  const [form, setForm] = useState(() => initialData ? toFormData(initialData) : { ...emptyForm });
  const [slugManual, setSlugManual] = useState(!!initialData);
  const [newFeature, setNewFeature] = useState('');
  const [newSpecKey, setNewSpecKey] = useState('');
  const [newSpecVal, setNewSpecVal] = useState('');
  const [newBoxItem, setNewBoxItem] = useState('');
  const [newImgUrl, setNewImgUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  useEffect(() => {
    if (!slugManual && form.name && form.brand_name) {
      set('slug', toSlug(form.brand_name, form.name));
    }
  }, [form.name, form.brand_name, slugManual]);

  // Key features
  const addFeature = () => {
    if (!newFeature.trim()) return;
    set('key_features', [...form.key_features, newFeature.trim()]);
    setNewFeature('');
  };
  const removeFeature = (i) => set('key_features', form.key_features.filter((_, idx) => idx !== i));

  // Specifications
  const addSpec = () => {
    if (!newSpecKey.trim()) return;
    set('specifications', { ...form.specifications, [newSpecKey.trim()]: newSpecVal.trim() });
    setNewSpecKey(''); setNewSpecVal('');
  };
  const removeSpec = (key) => {
    const next = { ...form.specifications };
    delete next[key];
    set('specifications', next);
  };

  // In box
  const addBoxItem = () => {
    if (!newBoxItem.trim()) return;
    set('in_box', [...form.in_box, newBoxItem.trim()]);
    setNewBoxItem('');
  };
  const removeBoxItem = (i) => set('in_box', form.in_box.filter((_, idx) => idx !== i));

  // Additional images
  const addImgUrl = () => {
    if (!newImgUrl.trim()) return;
    set('additionalImages', [...form.additionalImages, newImgUrl.trim()]);
    setNewImgUrl('');
  };
  const removeImg = (i) => set('additionalImages', form.additionalImages.filter((_, idx) => idx !== i));

  const uploadFile = async (file) => {
    if (!file.type.startsWith('image/')) { toast.error('Please select an image file'); return; }
    setUploading(true);
    try {
      const webpBlob = await compressImageToWebp(file);
      const path = `manual/${form.slug || `product-${Date.now()}`}/${Date.now()}.webp`;
      const { data, error } = await supabase.storage
        .from('product-images')
        .upload(path, webpBlob, { cacheControl: '31536000', upsert: true, contentType: 'image/webp' });
      if (error) throw error;
      const url = supabase.storage.from('product-images').getPublicUrl(data.path).data.publicUrl;
      set('primary_image_url', url);
      toast.success(`Image uploaded (${(webpBlob.size / 1024).toFixed(0)} KB as WebP)`);
    } catch (err) {
      toast.error('Upload failed: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = () => {
    if (!form.name.trim()) { toast.error('Product name is required'); return; }
    if (!form.brand_name) { toast.error('Brand is required'); return; }
    if (!form.slug.trim()) { toast.error('Slug is required'); return; }
    onSave(form);
  };

  const specEntries = Object.entries(form.specifications);

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="flex-1 bg-black/40" onClick={onClose} />
      <div className="w-full max-w-2xl bg-white flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E2E8F0] bg-[#0A1628]">
          <div>
            <h2 className="font-bold text-white">{initialData ? 'Edit Product' : 'Add New Product'}</h2>
            <p className="text-xs text-[#A0AEC0] mt-0.5">Fill in the details below. * fields are required.</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-md text-[#A0AEC0] hover:text-white hover:bg-white/10">
            <X size={18} />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8 bg-[#F8F9FA]">

          {/* ── Basic Info ── */}
          <div className="bg-white rounded-xl border border-[#E2E8F0] p-5">
            <SectionHeader title="Basic Information" />
            <div className="space-y-4">
              <FieldRow label="Product Name" required>
                <input
                  value={form.name}
                  onChange={e => set('name', e.target.value)}
                  className={inputCls}
                  placeholder="e.g. Tenda AC23 AC2100 Dual-Band WiFi Router"
                />
              </FieldRow>

              <div className="grid grid-cols-2 gap-4">
                <FieldRow label="Brand" required>
                  <BrandCombobox value={form.brand_name} onChange={v => set('brand_name', v)} />
                </FieldRow>
                <FieldRow label="Model Number">
                  <input
                    value={form.model}
                    onChange={e => set('model', e.target.value)}
                    className={inputCls}
                    placeholder="e.g. AC23"
                  />
                </FieldRow>
              </div>

              <FieldRow label="Category">
                <input
                  value={form.category_name}
                  onChange={e => set('category_name', e.target.value)}
                  className={inputCls}
                  placeholder="e.g. Routers, Switches, IP Camera"
                />
              </FieldRow>

              <FieldRow label="URL Slug" required>
                <div className="flex gap-2">
                  <input
                    value={form.slug}
                    onChange={e => { setSlugManual(true); set('slug', e.target.value); }}
                    className={inputCls}
                    placeholder="auto-generated-from-name"
                  />
                  <button
                    type="button"
                    onClick={() => { setSlugManual(false); set('slug', toSlug(form.brand_name, form.name)); }}
                    className="px-3 py-2 text-xs border border-[#E2E8F0] rounded-[6px] text-[#718096] hover:border-[#0A1628] whitespace-nowrap"
                  >
                    Auto
                  </button>
                </div>
                <p className="text-[10px] text-[#718096] mt-1">Used in the product URL. Must be unique.</p>
              </FieldRow>

              <FieldRow label="Manufacturer / Product URL">
                <input
                  value={form.product_url}
                  onChange={e => set('product_url', e.target.value)}
                  className={inputCls}
                  placeholder="https://www.manufacturer.com/product/..."
                />
              </FieldRow>

              <div className="grid grid-cols-2 gap-4">
                <FieldRow label="MRP (₹)">
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#718096] pointer-events-none">₹</span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.mrp}
                      onChange={e => set('mrp', e.target.value)}
                      className={`${inputCls} pl-7`}
                      placeholder="Optional"
                    />
                  </div>
                  <p className="text-[10px] text-[#718096] mt-1">Shown struck-through next to our price.</p>
                </FieldRow>
                <FieldRow label="Our Price (₹)">
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#718096] pointer-events-none">₹</span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.unit_price}
                      onChange={e => set('unit_price', e.target.value)}
                      className={`${inputCls} pl-7`}
                      placeholder="Leave blank for 'Price on Request'"
                    />
                  </div>
                  <p className="text-[10px] text-[#718096] mt-1">Leave blank for B2B quote-only pricing.</p>
                </FieldRow>
              </div>
            </div>
          </div>

          {/* ── Description ── */}
          <div className="bg-white rounded-xl border border-[#E2E8F0] p-5">
            <SectionHeader title="Description" />
            <textarea
              value={form.description}
              onChange={e => set('description', e.target.value)}
              rows={5}
              className={`${inputCls} resize-none`}
              placeholder="Describe what this product does, who it's for, and why customers should choose it. For B2B products, mention use cases (office, government, surveillance, etc.)"
            />
          </div>

          {/* ── Key Features ── */}
          <div className="bg-white rounded-xl border border-[#E2E8F0] p-5">
            <SectionHeader title="Key Features" />
            <div className="space-y-2 mb-3">
              {form.key_features.map((f, i) => (
                <div key={i} className="flex items-center gap-2 bg-[#F8F9FA] px-3 py-2 rounded-[6px] border border-[#E2E8F0]">
                  <CheckCircle size={13} className="text-[#C9A84C] flex-shrink-0" />
                  <span className="text-sm flex-1 text-[#0A1628]">{f}</span>
                  <button onClick={() => removeFeature(i)} className={removeBtnCls}><X size={13} /></button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                value={newFeature}
                onChange={e => setNewFeature(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                className={inputCls}
                placeholder="e.g. Dual-band AC2100 with MU-MIMO technology"
              />
              <button onClick={addFeature} className={addBtnCls}><Plus size={14} /></button>
            </div>
          </div>

          {/* ── Specifications ── */}
          <div className="bg-white rounded-xl border border-[#E2E8F0] p-5">
            <SectionHeader title="Technical Specifications" />
            {specEntries.length > 0 && (
              <div className="border border-[#E2E8F0] rounded-[6px] overflow-hidden mb-3 divide-y divide-[#E2E8F0]">
                {specEntries.map(([key, val]) => (
                  <div key={key} className="flex items-center gap-0">
                    <span className="px-3 py-2 text-xs font-semibold text-[#718096] w-40 flex-shrink-0 bg-[#F8F9FA] border-r border-[#E2E8F0]">{key}</span>
                    <span className="px-3 py-2 text-sm text-[#0A1628] flex-1">{val}</span>
                    <button onClick={() => removeSpec(key)} className={`${removeBtnCls} px-3`}><X size={13} /></button>
                  </div>
                ))}
              </div>
            )}
            <div className="flex gap-2">
              <input
                value={newSpecKey}
                onChange={e => setNewSpecKey(e.target.value)}
                className={inputCls}
                placeholder="Parameter (e.g. Speed)"
                style={{ width: '40%' }}
              />
              <input
                value={newSpecVal}
                onChange={e => setNewSpecVal(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSpec())}
                className={inputCls}
                placeholder="Value (e.g. 2100 Mbps)"
              />
              <button onClick={addSpec} className={addBtnCls}><Plus size={14} /></button>
            </div>
          </div>

          {/* ── In The Box ── */}
          <div className="bg-white rounded-xl border border-[#E2E8F0] p-5">
            <SectionHeader title="In The Box" />
            <div className="flex flex-wrap gap-2 mb-3">
              {form.in_box.map((item, i) => (
                <span key={i} className="flex items-center gap-1.5 px-2.5 py-1 bg-[#F8F9FA] border border-[#E2E8F0] rounded-full text-xs text-[#0A1628]">
                  {item}
                  <button onClick={() => removeBoxItem(i)} className="text-[#718096] hover:text-red-500"><X size={11} /></button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                value={newBoxItem}
                onChange={e => setNewBoxItem(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addBoxItem())}
                className={inputCls}
                placeholder="e.g. Power Adapter, Ethernet Cable, Quick Guide"
              />
              <button onClick={addBoxItem} className={addBtnCls}><Plus size={14} /></button>
            </div>
          </div>

          {/* ── Media / Images ── */}
          <div className="bg-white rounded-xl border border-[#E2E8F0] p-5">
            <SectionHeader title="Product Images" />

            {/* Primary image */}
            <FieldRow label="Primary Image">
              <div className="flex gap-3 items-start">
                <div className="flex-1 space-y-2">
                  <input
                    value={form.primary_image_url}
                    onChange={e => set('primary_image_url', e.target.value)}
                    className={inputCls}
                    placeholder="https://... or upload below"
                  />
                  <div className="flex items-center gap-2">
                    <input
                      ref={fileRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={e => e.target.files[0] && uploadFile(e.target.files[0])}
                    />
                    <button
                      onClick={() => fileRef.current?.click()}
                      disabled={uploading}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-[#E2E8F0] rounded-[6px] text-[#4A5568] hover:border-[#0A1628] disabled:opacity-50"
                    >
                      <Upload size={13} /> {uploading ? 'Compressing & uploading…' : 'Upload Image'}
                    </button>
                    <span className="text-[10px] text-[#718096]">Auto-resized & converted to WebP</span>
                  </div>
                </div>
                {form.primary_image_url && (
                  <img
                    src={form.primary_image_url}
                    alt="preview"
                    className="w-20 h-20 object-contain border border-[#E2E8F0] rounded-[6px] bg-[#F8F9FA] flex-shrink-0"
                  />
                )}
              </div>
            </FieldRow>

            {/* Additional images */}
            <div className="mt-4">
              <label className="block text-xs font-semibold text-[#0A1628] mb-2">Additional Images (Gallery)</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {form.additionalImages.map((url, i) => (
                  <div key={i} className="relative group w-16 h-16">
                    <img src={url} alt="" className="w-full h-full object-contain border border-[#E2E8F0] rounded-[6px] bg-[#F8F9FA]" />
                    <button
                      onClick={() => removeImg(i)}
                      className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={10} />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  value={newImgUrl}
                  onChange={e => setNewImgUrl(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addImgUrl())}
                  className={inputCls}
                  placeholder="Paste additional image URL..."
                />
                <button onClick={addImgUrl} className={addBtnCls}><Plus size={14} /></button>
              </div>
            </div>
          </div>

          {/* ── Settings ── */}
          <div className="bg-white rounded-xl border border-[#E2E8F0] p-5">
            <SectionHeader title="Settings & Visibility" />
            <div className="space-y-3">
              {[
                { key: 'is_active', label: 'Active (visible on storefront)', desc: 'Show this product to customers' },
                { key: 'is_b2b', label: 'B2B Product', desc: 'Suitable for bulk / government orders' },
                { key: 'is_featured', label: 'Featured', desc: 'Show in highlighted sections and home page' },
              ].map(({ key, label, desc }) => (
                <label key={key} className="flex items-start gap-3 cursor-pointer p-3 rounded-[6px] hover:bg-[#F8F9FA] transition-colors">
                  <input
                    type="checkbox"
                    checked={form[key]}
                    onChange={e => set(key, e.target.checked)}
                    className="mt-0.5 accent-[#C9A84C]"
                  />
                  <div>
                    <p className="text-sm font-semibold text-[#0A1628]">{label}</p>
                    <p className="text-xs text-[#718096]">{desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-[#E2E8F0] bg-white">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-[#4A5568] border border-[#E2E8F0] rounded-[6px] hover:border-[#0A1628]">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-[#0A1628] rounded-[6px] hover:bg-[#1A2E4A] disabled:opacity-60 transition-colors"
          >
            <Save size={15} /> {saving ? 'Saving…' : (initialData ? 'Update Product' : 'Add Product')}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
const ProductsAdminPage = () => {
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [brandFilter, setBrandFilter] = useState('');
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null); // null = new
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [filterBrands, setFilterBrands] = useState([]);

  useEffect(() => {
    supabase.from('brands').select('name').order('name').then(({ data }) => {
      if (data) setFilterBrands(data.map(b => b.name));
    });
  }, []);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from('products')
      .select('id, name, slug, brand_name, category_name, primary_image_url, is_active, is_featured, is_b2b, model', { count: 'exact' })
      .order('brand_name')
      .order('name')
      .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);
    if (search) query = query.ilike('name', `%${search}%`);
    if (brandFilter) query = query.eq('brand_name', brandFilter);
    const { data, count, error } = await query;
    if (error) toast.error('Failed to load products');
    else { setProducts(data ?? []); setTotal(count ?? 0); }
    setLoading(false);
  }, [search, brandFilter, page]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const openAdd = () => { setEditingProduct(null); setShowForm(true); };

  const openEdit = async (id) => {
    const [{ data, error }, { data: images }] = await Promise.all([
      supabase.from('products').select('*').eq('id', id).single(),
      supabase.from('product_images').select('url, is_primary, display_order').eq('product_id', id).order('display_order'),
    ]);
    if (error) { toast.error('Failed to load product'); return; }
    setEditingProduct({ ...data, images: images ?? [] });
    setShowForm(true);
  };

  const handleSave = async (formData) => {
    setSaving(true);

    // Generate ID client-side so we can sync product_images without a SELECT round-trip
    const productId = editingProduct?.id ?? crypto.randomUUID();

    // NOTE: 'images' is NOT a column on products — images live in the product_images table
    const payload = {
      name: formData.name.trim(),
      slug: formData.slug.trim(),
      model: formData.model?.trim() || null,
      brand_name: formData.brand_name,
      category_name: formData.category_name?.trim() || null,
      description: formData.description?.trim() || null,
      key_features: formData.key_features.filter(Boolean),
      specifications: formData.specifications,
      in_box: formData.in_box.filter(Boolean),
      primary_image_url: formData.primary_image_url?.trim() || null,
      product_url: formData.product_url?.trim() || null,
      is_active: formData.is_active,
      is_featured: formData.is_featured,
      is_b2b: formData.is_b2b,
      unit_price: formData.unit_price !== '' && formData.unit_price != null ? parseFloat(formData.unit_price) : null,
      mrp: formData.mrp !== '' && formData.mrp != null ? parseFloat(formData.mrp) : null,
      updated_at: new Date().toISOString(),
    };

    let error;
    if (editingProduct) {
      ({ error } = await supabase.from('products').update(payload).eq('id', productId));
    } else {
      ({ error } = await supabase.from('products').insert({ id: productId, ...payload, created_at: new Date().toISOString() }));
    }

    if (error) {
      setSaving(false);
      if (error.code === '23505') toast.error('Slug already in use — choose a different slug');
      else toast.error('Save failed: ' + error.message);
      return;
    }

    // Sync product_images table separately
    const imageRows = [];
    if (formData.primary_image_url?.trim()) {
      imageRows.push({ product_id: productId, url: formData.primary_image_url.trim(), is_primary: true, display_order: 0 });
    }
    (formData.additionalImages || []).forEach((url, i) => {
      if (url && url !== formData.primary_image_url) {
        imageRows.push({ product_id: productId, url, is_primary: false, display_order: i + 1 });
      }
    });

    // Delete existing image rows then re-insert (simple upsert pattern)
    await supabase.from('product_images').delete().eq('product_id', productId);
    if (imageRows.length > 0) {
      const { error: imgError } = await supabase.from('product_images').insert(imageRows);
      if (imgError) console.warn('product_images sync warning:', imgError.message);
    }

    setSaving(false);
    toast.success(editingProduct ? 'Product updated' : 'Product added');
    setShowForm(false);
    setEditingProduct(null);
    fetchProducts();
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;
    setDeleting(id);

    // Fetch image URLs before deleting (CASCADE removes DB rows but not storage files)
    const { data: images } = await supabase
      .from('product_images')
      .select('url')
      .eq('product_id', id);

    const { error } = await supabase.from('products').delete().eq('id', id);
    setDeleting(null);

    if (error) {
      toast.error('Delete failed');
    } else {
      // Remove orphan files from storage (non-blocking)
      const MARKER = '/product-images/';
      const paths = (images ?? [])
        .map((img) => { const i = img.url.indexOf(MARKER); return i === -1 ? null : img.url.slice(i + MARKER.length); })
        .filter(Boolean);
      if (paths.length) supabase.storage.from('product-images').remove(paths).catch(console.warn);

      toast.success('Product deleted');
      setProducts((p) => p.filter((x) => x.id !== id));
      setTotal((t) => t - 1);
    }
  };

  const toggleField = async (id, field, current) => {
    const { error } = await supabase.from('products').update({ [field]: !current }).eq('id', id);
    if (error) toast.error(`Failed to update`);
    else setProducts(prev => prev.map(p => p.id === id ? { ...p, [field]: !current } : p));
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#0A1628]">Products</h1>
          <p className="text-sm text-[#718096]">{total} products in catalog</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2 bg-[#0A1628] text-white text-sm font-semibold rounded-[6px] hover:bg-[#1A2E4A] transition-colors self-start sm:self-auto"
        >
          <Plus size={16} /> Add Product
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#718096]" />
          <input
            type="text"
            placeholder="Search products…"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-9 pr-3 py-2 text-sm border border-[#E2E8F0] rounded-[6px] focus:outline-none focus:ring-2 focus:ring-[#C9A84C] bg-white"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {['', ...filterBrands].map(b => (
            <button
              key={b}
              onClick={() => { setBrandFilter(b); setPage(1); }}
              className="px-3 py-2 text-xs font-semibold rounded-[6px] border transition-colors"
              style={{
                borderColor: brandFilter === b ? '#0A1628' : '#E2E8F0',
                backgroundColor: brandFilter === b ? '#0A1628' : 'transparent',
                color: brandFilter === b ? '#fff' : '#4A5568',
              }}
            >
              {b || 'All'}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#F8F9FA] border-b border-[#E2E8F0] text-xs uppercase tracking-wider text-[#718096]">
                <th className="px-4 py-3 font-semibold">Product</th>
                <th className="px-4 py-3 font-semibold hidden sm:table-cell">Brand / Category</th>
                <th className="px-4 py-3 font-semibold text-center">Active</th>
                <th className="px-4 py-3 font-semibold text-center">Featured</th>
                <th className="px-4 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0F4F8]">
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i}>
                    <td className="px-4 py-3"><Skeleton className="h-8 w-48" /></td>
                    <td className="px-4 py-3 hidden sm:table-cell"><Skeleton className="h-5 w-32" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-6 w-10 mx-auto" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-6 w-10 mx-auto" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-6 w-20 ml-auto" /></td>
                  </tr>
                ))
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-4 py-16 text-center text-[#718096] text-sm">
                    <Package size={36} className="mx-auto text-gray-300 mb-3" />
                    No products found
                  </td>
                </tr>
              ) : (
                products.map(p => (
                  <tr key={p.id} className="hover:bg-[#F8F9FA] transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 flex-shrink-0 bg-[#F8F9FA] rounded-[6px] border border-[#E2E8F0] flex items-center justify-center overflow-hidden">
                          {p.primary_image_url
                            ? <img src={p.primary_image_url} alt={p.name} className="w-full h-full object-contain p-0.5" />
                            : <Package size={14} className="text-gray-300" />}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-[#0A1628] truncate max-w-[160px] sm:max-w-[200px]">{p.name}</p>
                          {p.model && <p className="text-[10px] text-[#718096]">{p.model}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[10px] font-bold tracking-wider" style={{ color: BRAND_COLORS[p.brand_name] ?? '#718096' }}>{p.brand_name}</span>
                        <span className="text-xs text-[#718096] truncate max-w-[120px]">{p.category_name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => toggleField(p.id, 'is_active', p.is_active)}
                        className={`w-8 h-4 rounded-full transition-colors ${p.is_active ? 'bg-green-500' : 'bg-gray-300'}`}
                        title={p.is_active ? 'Active' : 'Inactive'}
                      >
                        <span className={`block w-3.5 h-3.5 rounded-full bg-white shadow-sm transition-transform mx-auto ${p.is_active ? 'translate-x-2' : '-translate-x-2'}`} />
                      </button>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => toggleField(p.id, 'is_featured', p.is_featured)}
                        title={p.is_featured ? 'Featured' : 'Not featured'}
                      >
                        <Star size={16} className={p.is_featured ? 'fill-[#C9A84C] text-[#C9A84C]' : 'text-gray-300 hover:text-[#C9A84C]'} />
                      </button>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          to={`/product/${p.slug}`}
                          target="_blank"
                          className="p-1.5 text-[#718096] hover:text-[#0A1628] transition-colors"
                          title="View on storefront"
                        >
                          <ExternalLink size={14} />
                        </Link>
                        <button
                          onClick={() => openEdit(p.id)}
                          className="p-1.5 text-[#718096] hover:text-blue-600 transition-colors"
                          title="Edit product"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(p.id, p.name)}
                          disabled={deleting === p.id}
                          className="p-1.5 text-[#718096] hover:text-red-500 transition-colors disabled:opacity-40"
                          title="Delete product"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-[#E2E8F0]">
            <p className="text-xs text-[#718096]">Page {page} of {totalPages} · {total} products</p>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="px-3 py-1.5 text-xs border border-[#E2E8F0] rounded-[6px] text-[#4A5568] hover:border-[#0A1628] disabled:opacity-40">
                Previous
              </button>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="px-3 py-1.5 text-xs border border-[#E2E8F0] rounded-[6px] text-[#4A5568] hover:border-[#0A1628] disabled:opacity-40">
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Product Form Drawer */}
      {showForm && (
        <ProductForm
          key={editingProduct?.id ?? 'new'}
          initialData={editingProduct}
          onSave={handleSave}
          onClose={() => { setShowForm(false); setEditingProduct(null); }}
          saving={saving}
        />
      )}
    </div>
  );
};

export default ProductsAdminPage;
