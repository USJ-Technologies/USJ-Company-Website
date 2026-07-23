import { useEffect, useMemo, useState } from 'react';
import { Plus, Pencil, Trash2, Eye, EyeOff, Image as ImageIcon, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '../../lib/supabase';
import { slugify } from '../../utils/slugify';

const emptyForm = {
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  category: 'Buying Guide',
  cover_image: '',
  published: false,
};

const MAX_UPLOAD_WIDTH = 1600;
const WEBP_QUALITY = 0.82;

function loadImageFromFile(file) {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Could not read image'));
    };
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
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('Compression failed'))), 'image/webp', WEBP_QUALITY);
  });
}

function formatDate(value) {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function BlogAdminPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const fetchPosts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .order('created_at', { ascending: false });
    setLoading(false);

    if (error) {
      toast.error('Failed to load blog posts');
      console.error(error);
      return;
    }

    setPosts(data ?? []);
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleOpenCreate = () => {
    setEditingPost(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const handleOpenEdit = (post) => {
    setEditingPost(post);
    setForm({
      title: post.title || '',
      slug: post.slug || '',
      excerpt: post.excerpt || '',
      content: post.content || '',
      category: post.category || 'Buying Guide',
      cover_image: post.cover_image || '',
      published: post.published ?? false,
    });
    setShowForm(true);
  };

  const handleFieldChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleTitleChange = (value) => {
    setForm((prev) => ({
      ...prev,
      title: value,
      slug: prev.slug ? prev.slug : slugify(value),
    }));
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      const blob = await compressImageToWebp(file);
      const storagePath = `blog-covers/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '-')}.webp`;
      const { error: uploadError } = await supabase.storage.from('product-images').upload(storagePath, blob, {
        contentType: 'image/webp',
        upsert: true,
      });
      if (uploadError) throw uploadError;
      const { data: publicData } = supabase.storage.from('product-images').getPublicUrl(storagePath);
      handleFieldChange('cover_image', publicData.publicUrl);
      toast.success('Cover image uploaded');
    } catch (error) {
      toast.error(error.message || 'Image upload failed');
    } finally {
      setUploadingImage(false);
      event.target.value = '';
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.title.trim() || !form.content.trim()) {
      toast.error('Title and content are required');
      return;
    }

    setSaving(true);
    const slug = (form.slug || slugify(form.title)).trim();
    const payload = {
      title: form.title.trim(),
      slug: slug || `${slugify(form.title)}-${Date.now().toString(36)}`,
      excerpt: form.excerpt.trim() || null,
      content: form.content.trim(),
      cover_image: form.cover_image || null,
      category: form.category.trim() || 'Buying Guide',
      published: form.published,
      updated_at: new Date().toISOString(),
      ...(form.published ? { published_at: new Date().toISOString() } : { published_at: null }),
    };

    const { error } = editingPost
      ? await supabase.from('blog_posts').update(payload).eq('id', editingPost.id)
      : await supabase.from('blog_posts').insert(payload);

    setSaving(false);
    if (error) {
      toast.error(error.message || 'Failed to save blog post');
      return;
    }

    toast.success(editingPost ? 'Blog post updated' : 'Blog post created');
    setShowForm(false);
    fetchPosts();
  };

  const handleDelete = async (post) => {
    const ok = window.confirm(`Delete “${post.title}”?`);
    if (!ok) return;
    const { error } = await supabase.from('blog_posts').delete().eq('id', post.id);
    if (error) {
      toast.error('Delete failed');
      return;
    }
    toast.success('Blog post deleted');
    fetchPosts();
  };

  const summary = useMemo(() => ({
    published: posts.filter((post) => post.published).length,
    drafts: posts.filter((post) => !post.published).length,
  }), [posts]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#0A1628]">Blog Management</h2>
          <p className="text-sm text-[#718096]">Publish helpful buying guides and company updates.</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center justify-center gap-2 rounded-[6px] bg-[#0A1628] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1A2E4A]"
        >
          <Plus size={16} /> New Post
        </button>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div className="rounded-[10px] border border-[#E2E8F0] bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#718096]">Published</p>
          <p className="mt-2 text-2xl font-bold text-[#0A1628]">{summary.published}</p>
        </div>
        <div className="rounded-[10px] border border-[#E2E8F0] bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#718096]">Drafts</p>
          <p className="mt-2 text-2xl font-bold text-[#0A1628]">{summary.drafts}</p>
        </div>
      </div>

      {showForm && (
        <div className="rounded-[12px] border border-[#E2E8F0] bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-[#0A1628]">{editingPost ? 'Edit Blog Post' : 'Create Blog Post'}</h3>
            <button onClick={() => setShowForm(false)} className="rounded-md p-2 text-[#718096] hover:bg-gray-100">
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-semibold text-[#0A1628]">Title *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(event) => handleTitleChange(event.target.value)}
                  className="w-full rounded-[6px] border border-[#E2E8F0] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A84C]"
                  placeholder="How to choose the right networking switch"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-[#0A1628]">Slug</label>
                <input
                  type="text"
                  value={form.slug}
                  onChange={(event) => handleFieldChange('slug', event.target.value)}
                  className="w-full rounded-[6px] border border-[#E2E8F0] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A84C]"
                  placeholder="choose-a-url-slug"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-semibold text-[#0A1628]">Category</label>
                <input
                  type="text"
                  value={form.category}
                  onChange={(event) => handleFieldChange('category', event.target.value)}
                  className="w-full rounded-[6px] border border-[#E2E8F0] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A84C]"
                  placeholder="Buying Guide"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-[#0A1628]">Cover image</label>
                <div className="flex items-center gap-2">
                  <label className="flex cursor-pointer items-center justify-center gap-2 rounded-[6px] border border-[#E2E8F0] px-3 py-2 text-sm font-medium text-[#0A1628] hover:bg-[#F8F9FA]">
                    <ImageIcon size={16} />
                    {uploadingImage ? 'Uploading…' : 'Upload image'}
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>
                  <input
                    type="url"
                    value={form.cover_image}
                    onChange={(event) => handleFieldChange('cover_image', event.target.value)}
                    className="w-full rounded-[6px] border border-[#E2E8F0] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A84C]"
                    placeholder="https://..."
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-[#0A1628]">Excerpt</label>
              <textarea
                rows={3}
                value={form.excerpt}
                onChange={(event) => handleFieldChange('excerpt', event.target.value)}
                className="w-full rounded-[6px] border border-[#E2E8F0] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A84C]"
                placeholder="Short summary shown on the blog list page"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-[#0A1628]">Content *</label>
              <textarea
                rows={10}
                value={form.content}
                onChange={(event) => handleFieldChange('content', event.target.value)}
                className="w-full rounded-[6px] border border-[#E2E8F0] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A84C]"
                placeholder="Write markdown or plain text. Supports headings, bullet lists, and links."
              />
            </div>

            <label className="flex items-center gap-2 text-sm text-[#0A1628]">
              <input
                type="checkbox"
                checked={form.published}
                onChange={(event) => handleFieldChange('published', event.target.checked)}
                className="h-4 w-4 rounded border-[#E2E8F0] accent-[#C9A84C]"
              />
              Publish immediately
            </label>

            <div className="flex gap-3 border-t border-[#E2E8F0] pt-4">
              <button type="button" onClick={() => setShowForm(false)} className="rounded-[6px] border border-[#E2E8F0] px-4 py-2 text-sm font-medium text-[#4A5568] hover:border-[#0A1628]">
                Cancel
              </button>
              <button type="submit" disabled={saving} className="rounded-[6px] bg-[#0A1628] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1A2E4A] disabled:opacity-60">
                {saving ? 'Saving…' : editingPost ? 'Update Post' : 'Create Post'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="rounded-[12px] border border-[#E2E8F0] bg-white shadow-sm overflow-hidden">
        <div className="border-b border-[#E2E8F0] bg-[#F8F9FA] px-5 py-4">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-[#0A1628]">All Posts</h3>
        </div>

        {loading ? (
          <div className="space-y-3 p-5">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="h-16 animate-pulse rounded-[8px] bg-gray-100" />
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="p-8 text-center text-sm text-[#718096]">No posts yet. Create your first article.</div>
        ) : (
          <div className="divide-y divide-[#E2E8F0]">
            {posts.map((post) => (
              <div key={post.id} className="flex flex-col gap-3 p-5 md:flex-row md:items-center md:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="text-base font-semibold text-[#0A1628]">{post.title}</h4>
                    <span className="rounded-full border border-[#E2E8F0] bg-[#F8F9FA] px-2.5 py-0.5 text-[11px] font-medium text-[#718096]">
                      {post.category || 'General'}
                    </span>
                    <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${post.published ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                      {post.published ? 'Published' : 'Draft'}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-[#718096]">{post.excerpt || 'No excerpt yet'}</p>
                  <p className="mt-1 text-xs text-[#A0AEC0]">Updated {formatDate(post.updated_at || post.created_at)}</p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => handleOpenEdit(post)}
                    className="inline-flex items-center gap-1 rounded-[6px] border border-[#E2E8F0] px-3 py-2 text-sm font-medium text-[#0A1628] hover:bg-[#F8F9FA]"
                  >
                    <Pencil size={14} /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(post)}
                    className="inline-flex items-center gap-1 rounded-[6px] border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                  >
                    <Trash2 size={14} /> Delete
                  </button>
                  <button
                    onClick={async () => {
                      const next = !post.published;
                      const { error } = await supabase.from('blog_posts').update({
                        published: next,
                        published_at: next ? new Date().toISOString() : null,
                        updated_at: new Date().toISOString(),
                      }).eq('id', post.id);
                      if (error) {
                        toast.error('Publish toggle failed');
                        return;
                      }
                      toast.success(next ? 'Post published' : 'Post moved to draft');
                      fetchPosts();
                    }}
                    className="inline-flex items-center gap-1 rounded-[6px] border border-[#E2E8F0] px-3 py-2 text-sm font-medium text-[#0A1628] hover:bg-[#F8F9FA]"
                  >
                    {post.published ? <EyeOff size={14} /> : <Eye size={14} />}
                    {post.published ? 'Unpublish' : 'Publish'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
