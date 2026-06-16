import { useState, useEffect, useRef } from 'react';
import { Plus, Pencil, Trash2, Eye, EyeOff, Award, Upload, X, Loader2, Image } from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '../../lib/supabase';

const BUCKET = 'product-images';
const CERT_PATH = 'certifications';

const EMPTY_FORM = {
  name: '',
  issuing_body: '',
  description: '',
  cert_id: '',
  issue_date: '',
  image_url: '',
  is_visible: true,
  display_order: 0,
};

function normalise(row) {
  return {
    id: row.id,
    name: row.name ?? '',
    issuing_body: row.issuing_body ?? '',
    description: row.description ?? '',
    cert_id: row.cert_id ?? '',
    issue_date: row.issue_date ?? '',
    image_url: row.image_url ?? '',
    is_visible: row.is_visible ?? true,
    display_order: row.display_order ?? 0,
  };
}

export default function CertificationsAdminPage() {
  const [certs, setCerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('certifications')
      .select('*')
      .order('display_order')
      .order('created_at');
    if (error) toast.error('Failed to load certifications');
    else setCerts(data ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const openAdd = () => {
    setEditId(null);
    setForm(EMPTY_FORM);
    setDrawerOpen(true);
  };

  const openEdit = (cert) => {
    setEditId(cert.id);
    setForm(normalise(cert));
    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setEditId(null);
    setForm(EMPTY_FORM);
  };

  const compressImage = (file) => new Promise((resolve) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      const MAX_W = 1400;
      let { width, height } = img;
      if (width > MAX_W) {
        height = Math.round((height * MAX_W) / width);
        width = MAX_W;
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      canvas.getContext('2d').drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          URL.revokeObjectURL(objectUrl);
          resolve(new File([blob], file.name.replace(/\.[^.]+$/, '.jpg'), { type: 'image/jpeg' }));
        },
        'image/jpeg',
        0.82,
      );
    };
    img.src = objectUrl;
  });

  const uploadImage = async (file) => {
    const ext = file.name.split('.').pop().toLowerCase();
    if (!['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext)) {
      toast.error('Only image files (JPG, PNG, WEBP) are allowed');
      return;
    }

    setUploading(true);
    const compressed = await compressImage(file);
    const filename = `${Date.now()}-${compressed.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
    const path = `${CERT_PATH}/${filename}`;

    const { data, error } = await supabase.storage
      .from(BUCKET)
      .upload(path, compressed, { cacheControl: '3600', upsert: false });

    if (error) {
      toast.error('Upload failed: ' + error.message);
    } else {
      const url = supabase.storage.from(BUCKET).getPublicUrl(data.path).data.publicUrl;
      set('image_url', url);
      toast.success('Image uploaded');
    }
    setUploading(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error('Name is required'); return; }

    setSaving(true);
    const payload = {
      name: form.name.trim(),
      issuing_body: form.issuing_body.trim() || null,
      description: form.description.trim() || null,
      cert_id: form.cert_id.trim() || null,
      issue_date: form.issue_date.trim() || null,
      image_url: form.image_url.trim() || null,
      is_visible: form.is_visible,
      display_order: Number(form.display_order) || 0,
    };

    let error;
    if (editId) {
      ({ error } = await supabase.from('certifications').update(payload).eq('id', editId));
    } else {
      ({ error } = await supabase.from('certifications').insert(payload));
    }

    setSaving(false);
    if (error) {
      toast.error('Save failed: ' + error.message);
    } else {
      toast.success(editId ? 'Certification updated' : 'Certification added');
      closeDrawer();
      load();
    }
  };

  const toggleVisibility = async (cert) => {
    const { error } = await supabase
      .from('certifications')
      .update({ is_visible: !cert.is_visible })
      .eq('id', cert.id);
    if (error) toast.error('Failed to update visibility');
    else {
      toast.success(cert.is_visible ? 'Hidden from public' : 'Now visible');
      load();
    }
  };

  const handleDelete = async (cert) => {
    if (!window.confirm(`Delete "${cert.name}"? This cannot be undone.`)) return;
    setDeleting(cert.id);
    const { error } = await supabase.from('certifications').delete().eq('id', cert.id);
    setDeleting(null);
    if (error) {
      toast.error('Delete failed: ' + error.message);
    } else {
      // Remove storage file (non-blocking)
      if (cert.image_url) {
        const MARKER = '/product-images/';
        const i = cert.image_url.indexOf(MARKER);
        if (i !== -1) {
          supabase.storage.from('product-images').remove([cert.image_url.slice(i + MARKER.length)]).catch(console.warn);
        }
      }
      toast.success('Deleted');
      load();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0A1628]">Certifications</h1>
          <p className="text-sm text-[#718096] mt-0.5">{certs.length} certification{certs.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2 bg-[#0A1628] text-white text-sm font-semibold rounded-[6px] hover:bg-[#1A2E4A] transition-colors"
        >
          <Plus size={16} /> Add Certification
        </button>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={28} className="animate-spin text-[#C9A84C]" />
        </div>
      ) : certs.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-16 text-center">
          <Award size={56} className="mx-auto text-gray-300 mb-4" />
          <h2 className="text-lg font-bold text-[#0A1628] mb-2">No certifications yet</h2>
          <p className="text-sm text-[#718096] mb-6">Add your Udyam, GeM, Startup India, and other certificates here.</p>
          <button onClick={openAdd} className="px-4 py-2 bg-[#0A1628] text-white text-sm font-semibold rounded-[6px] hover:bg-[#1A2E4A] transition-colors">
            Add First Certification
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#E2E8F0] bg-[#F8F9FA]">
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#718096] uppercase tracking-wide">Certificate</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#718096] uppercase tracking-wide hidden md:table-cell">Issued By</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#718096] uppercase tracking-wide hidden lg:table-cell">Cert ID</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-[#718096] uppercase tracking-wide">Image</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-[#718096] uppercase tracking-wide">Visible</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-[#718096] uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody>
              {certs.map((cert, i) => (
                <tr key={cert.id} className={`border-b border-[#E2E8F0] last:border-0 ${i % 2 === 0 ? '' : 'bg-[#FAFAFA]'}`}>
                  <td className="px-4 py-3">
                    <p className="font-semibold text-[#0A1628] text-sm">{cert.name}</p>
                    {cert.issue_date && <p className="text-xs text-[#718096] mt-0.5">{cert.issue_date}</p>}
                  </td>
                  <td className="px-4 py-3 text-[#4A5568] hidden md:table-cell">{cert.issuing_body ?? '—'}</td>
                  <td className="px-4 py-3 font-mono text-xs text-[#718096] hidden lg:table-cell">{cert.cert_id ?? '—'}</td>
                  <td className="px-4 py-3 text-center">
                    {cert.image_url ? (
                      <a href={cert.image_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-[#1A56DB] hover:underline">
                        <Image size={12} /> View
                      </a>
                    ) : (
                      <span className="text-xs text-[#A0AEC0]">None</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => toggleVisibility(cert)}
                      className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full transition-colors ${
                        cert.is_visible
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                      }`}
                    >
                      {cert.is_visible ? <><Eye size={11} /> On</> : <><EyeOff size={11} /> Off</>}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEdit(cert)}
                        className="p-1.5 text-[#718096] hover:text-[#0A1628] hover:bg-[#F8F9FA] rounded transition-colors"
                        title="Edit"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(cert)}
                        disabled={deleting === cert.id}
                        className="p-1.5 text-[#718096] hover:text-[#C53030] hover:bg-red-50 rounded transition-colors"
                        title="Delete"
                      >
                        {deleting === cert.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-1 bg-black/40" onClick={closeDrawer} />
          <div className="w-full max-w-md bg-white h-full overflow-y-auto shadow-2xl flex flex-col">
            {/* Drawer header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#E2E8F0]">
              <h2 className="text-base font-bold text-[#0A1628]">
                {editId ? 'Edit Certification' : 'Add Certification'}
              </h2>
              <button onClick={closeDrawer} className="p-1.5 hover:bg-[#F8F9FA] rounded transition-colors text-[#718096]">
                <X size={18} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-5 space-y-4">

              {/* Name */}
              <div>
                <label className="block text-xs font-semibold text-[#0A1628] mb-1.5">
                  Certificate Name <span className="text-[#C53030]">*</span>
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => set('name', e.target.value)}
                  placeholder="e.g. MSME / Udyam Registration"
                  className="w-full px-3 py-2 text-sm border border-[#E2E8F0] rounded-[6px] focus:outline-none focus:ring-2 focus:ring-[#C9A84C]"
                />
              </div>

              {/* Issuing body */}
              <div>
                <label className="block text-xs font-semibold text-[#0A1628] mb-1.5">Issuing Authority</label>
                <input
                  type="text"
                  value={form.issuing_body}
                  onChange={e => set('issuing_body', e.target.value)}
                  placeholder="e.g. Ministry of MSME, Government of India"
                  className="w-full px-3 py-2 text-sm border border-[#E2E8F0] rounded-[6px] focus:outline-none focus:ring-2 focus:ring-[#C9A84C]"
                />
              </div>

              {/* Cert ID + Issue date */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#0A1628] mb-1.5">Certificate ID / Number</label>
                  <input
                    type="text"
                    value={form.cert_id}
                    onChange={e => set('cert_id', e.target.value)}
                    placeholder="UDYAM-UK-XX-XXXXXXX"
                    className="w-full px-3 py-2 text-sm border border-[#E2E8F0] rounded-[6px] focus:outline-none focus:ring-2 focus:ring-[#C9A84C]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#0A1628] mb-1.5">Issue Date</label>
                  <input
                    type="text"
                    value={form.issue_date}
                    onChange={e => set('issue_date', e.target.value)}
                    placeholder="e.g. January 2024"
                    className="w-full px-3 py-2 text-sm border border-[#E2E8F0] rounded-[6px] focus:outline-none focus:ring-2 focus:ring-[#C9A84C]"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-[#0A1628] mb-1.5">Description</label>
                <textarea
                  value={form.description}
                  onChange={e => set('description', e.target.value)}
                  rows={3}
                  placeholder="Brief description of what this certification means..."
                  className="w-full px-3 py-2 text-sm border border-[#E2E8F0] rounded-[6px] focus:outline-none focus:ring-2 focus:ring-[#C9A84C] resize-none"
                />
              </div>

              {/* Image upload */}
              <div>
                <label className="block text-xs font-semibold text-[#0A1628] mb-1.5">Certificate Image</label>
                {form.image_url ? (
                  <div className="relative border border-[#E2E8F0] rounded-[6px] overflow-hidden">
                    <img
                      src={form.image_url}
                      alt="Certificate preview"
                      className="w-full max-h-40 object-contain bg-[#F8F9FA] p-4"
                      onError={e => { e.target.style.display = 'none'; }}
                    />
                    <button
                      type="button"
                      onClick={() => set('image_url', '')}
                      className="absolute top-2 right-2 p-1 bg-white border border-[#E2E8F0] rounded-full hover:bg-red-50 hover:border-red-200 transition-colors"
                    >
                      <X size={13} className="text-[#718096]" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    disabled={uploading}
                    className="w-full border-2 border-dashed border-[#E2E8F0] rounded-[6px] p-6 text-center hover:border-[#C9A84C] hover:bg-[#FFFBF0] transition-colors"
                  >
                    {uploading ? (
                      <><Loader2 size={20} className="animate-spin text-[#C9A84C] mx-auto mb-2" /><p className="text-xs text-[#718096]">Uploading...</p></>
                    ) : (
                      <><Upload size={20} className="text-[#A0AEC0] mx-auto mb-2" /><p className="text-xs text-[#718096]">Click to upload JPG, PNG, or WEBP</p><p className="text-[10px] text-[#A0AEC0] mt-1">Auto-compressed before upload</p></>
                    )}
                  </button>
                )}
                {/* Or paste URL */}
                {!form.image_url && (
                  <input
                    type="url"
                    value={form.image_url}
                    onChange={e => set('image_url', e.target.value)}
                    placeholder="Or paste image URL..."
                    className="w-full mt-2 px-3 py-2 text-xs border border-[#E2E8F0] rounded-[6px] focus:outline-none focus:ring-2 focus:ring-[#C9A84C] text-[#718096]"
                  />
                )}
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={e => { const f = e.target.files?.[0]; if (f) uploadImage(f); e.target.value = ''; }}
                />
              </div>

              {/* Order + Visibility */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#0A1628] mb-1.5">Display Order</label>
                  <input
                    type="number"
                    value={form.display_order}
                    onChange={e => set('display_order', e.target.value)}
                    min={0}
                    className="w-full px-3 py-2 text-sm border border-[#E2E8F0] rounded-[6px] focus:outline-none focus:ring-2 focus:ring-[#C9A84C]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#0A1628] mb-1.5">Visibility</label>
                  <button
                    type="button"
                    onClick={() => set('is_visible', !form.is_visible)}
                    className={`w-full py-2 text-sm font-semibold rounded-[6px] border transition-colors ${
                      form.is_visible
                        ? 'bg-green-50 border-green-200 text-green-700'
                        : 'bg-gray-50 border-gray-200 text-gray-500'
                    }`}
                  >
                    {form.is_visible ? '● Visible' : '○ Hidden'}
                  </button>
                </div>
              </div>
            </form>

            {/* Footer */}
            <div className="px-5 py-4 border-t border-[#E2E8F0] flex gap-3">
              <button
                type="button"
                onClick={closeDrawer}
                className="flex-1 py-2.5 text-sm font-semibold border border-[#E2E8F0] rounded-[6px] text-[#4A5568] hover:bg-[#F8F9FA] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 py-2.5 text-sm font-semibold bg-[#0A1628] text-white rounded-[6px] hover:bg-[#1A2E4A] transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {saving ? <><Loader2 size={15} className="animate-spin" /> Saving...</> : editId ? 'Save Changes' : 'Add Certification'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
