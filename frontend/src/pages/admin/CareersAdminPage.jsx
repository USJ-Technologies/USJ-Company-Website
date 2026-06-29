import { useState, useEffect, useCallback } from 'react';
import {
  Plus, Pencil, Trash2, Eye, EyeOff, Star, StarOff,
  ChevronDown, ChevronUp, Briefcase, MapPin, Clock, Users,
  ExternalLink, X, Check, RefreshCw, Copy,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '../../lib/supabase';
import { isSafeExternalUrl } from '../../lib/url';

// ── Constants ─────────────────────────────────────────────────
const DEPARTMENTS = ['Technology', 'Sales', 'Operations', 'Business Development', 'Marketing', 'Finance', 'HR', 'Other'];
const JOB_TYPES = [
  { value: 'full_time',  label: 'Full-time' },
  { value: 'part_time',  label: 'Part-time' },
  { value: 'internship', label: 'Internship' },
  { value: 'contract',   label: 'Contract' },
  { value: 'remote',     label: 'Remote' },
];
const EXPERIENCE_LEVELS = [
  { value: 'entry',  label: 'Entry Level (0–2 yrs)' },
  { value: 'mid',    label: 'Mid Level (2–5 yrs)' },
  { value: 'senior', label: 'Senior Level (5–8 yrs)' },
  { value: 'lead',   label: 'Lead / Manager (8+ yrs)' },
];
const APP_STATUSES = [
  { value: 'new',         label: 'New',         color: '#4299E1' },
  { value: 'reviewing',   label: 'Reviewing',   color: '#ED8936' },
  { value: 'shortlisted', label: 'Shortlisted', color: '#48BB78' },
  { value: 'rejected',    label: 'Rejected',    color: '#FC8181' },
  { value: 'hired',       label: 'Hired',       color: '#38A169' },
];

const emptyForm = {
  title: '', department: 'Technology', location: 'Dehradun, Uttarakhand',
  type: 'full_time', experience: 'mid', description: '',
  requirements: [''], responsibilities: [''],
  salary_min: '', salary_max: '', deadline: '',
  is_active: true, is_featured: false,
};

function slugify(text) {
  return text.toLowerCase().trim()
    .replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');
}

// ── BulletListEditor ──────────────────────────────────────────
function BulletListEditor({ label, items, onChange }) {
  const update = (i, val) => { const n = [...items]; n[i] = val; onChange(n); };
  const add = () => onChange([...items, '']);
  const remove = (i) => onChange(items.filter((_, idx) => idx !== i));
  return (
    <div>
      <label className="block text-xs font-semibold text-[#0A1628] mb-1.5">{label}</label>
      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={i} className="flex gap-2">
            <input type="text" value={item} onChange={(e) => update(i, e.target.value)}
              placeholder={`${label} point ${i + 1}`}
              className="flex-1 px-3 py-2 text-sm border border-[#E2E8F0] rounded-[6px] focus:outline-none focus:ring-2 focus:ring-[#C9A84C]" />
            <button type="button" onClick={() => remove(i)} disabled={items.length === 1}
              className="p-2 text-red-400 hover:text-red-600 disabled:opacity-30"><X size={14} /></button>
          </div>
        ))}
      </div>
      <button type="button" onClick={add}
        className="mt-2 text-xs text-[#C9A84C] font-semibold hover:underline flex items-center gap-1">
        <Plus size={12} /> Add point
      </button>
    </div>
  );
}

// ── Job Form Slide-over ───────────────────────────────────────
function JobFormPanel({ job, onClose, onSaved }) {
  const isEdit = !!job;
  const [form, setForm] = useState(() => job ? {
    title: job.title || '', department: job.department || 'Technology',
    location: job.location || 'Dehradun, Uttarakhand', type: job.type || 'full_time',
    experience: job.experience || 'mid', description: job.description || '',
    requirements: job.requirements?.length ? job.requirements : [''],
    responsibilities: job.responsibilities?.length ? job.responsibilities : [''],
    salary_min: job.salary_min ?? '', salary_max: job.salary_max ?? '',
    deadline: job.deadline ? job.deadline.slice(0, 10) : '',
    is_active: job.is_active ?? true, is_featured: job.is_featured ?? false,
  } : emptyForm);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const set = (k, v) => { setForm((f) => ({ ...f, [k]: v })); setErrors((e) => ({ ...e, [k]: undefined })); };

  const validate = () => {
    const e = {};
    if (!form.title.trim() || form.title.trim().length < 3) e.title = 'Title must be at least 3 characters';
    if (!form.location.trim()) e.location = 'Location is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) { toast.error('Please fix the errors below'); return; }
    setSaving(true);
    const payload = {
      title: form.title.trim(),
      slug: isEdit ? job.slug : `${slugify(form.title)}-${Date.now().toString(36)}`,
      department: form.department, location: form.location.trim(),
      type: form.type, experience: form.experience,
      description: form.description.trim() || null,
      requirements: form.requirements.map((r) => r.trim()).filter(Boolean),
      responsibilities: form.responsibilities.map((r) => r.trim()).filter(Boolean),
      salary_min: form.salary_min ? parseInt(form.salary_min) : null,
      salary_max: form.salary_max ? parseInt(form.salary_max) : null,
      deadline: form.deadline || null,
      is_active: form.is_active, is_featured: form.is_featured,
      updated_at: new Date().toISOString(),
    };
    const { error } = isEdit
      ? await supabase.from('job_postings').update(payload).eq('id', job.id)
      : await supabase.from('job_postings').insert(payload);
    setSaving(false);
    if (error) { toast.error('Save failed: ' + error.message); return; }
    toast.success(isEdit ? 'Job updated' : 'Job posted');
    onSaved();
  };

  const ic = `w-full px-3 py-2 text-sm border rounded-[6px] focus:outline-none focus:ring-2 focus:ring-[#C9A84C]`;
  const fieldCls = (k) => `${ic} ${errors[k] ? 'border-red-400' : 'border-[#E2E8F0]'}`;
  const lc = 'block text-xs font-semibold text-[#0A1628] mb-1';
  const errMsg = (k) => errors[k] && <p className="text-xs text-red-500 mt-1">{errors[k]}</p>;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white h-full w-full max-w-2xl shadow-2xl flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E2E8F0] bg-white sticky top-0 z-10">
          <h2 className="text-lg font-bold text-[#0A1628]">{isEdit ? 'Edit Job Posting' : 'Post New Job'}</h2>
          <button onClick={onClose} className="p-2 rounded-md hover:bg-gray-100"><X size={18} className="text-[#718096]" /></button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {/* Title */}
          <div>
            <label className={lc}>Job Title *</label>
            <input type="text" value={form.title} onChange={(e) => set('title', e.target.value)}
              placeholder="e.g. Software Engineer – React" className={fieldCls('title')} />
            {errMsg('title')}
          </div>

          {/* Department + Location */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={lc}>Department *</label>
              <select value={form.department} onChange={(e) => set('department', e.target.value)} className={ic + ' border-[#E2E8F0]'}>
                {DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className={lc}>Location *</label>
              <input type="text" value={form.location} onChange={(e) => set('location', e.target.value)} className={fieldCls('location')} />
              {errMsg('location')}
            </div>
          </div>

          {/* Type + Experience */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={lc}>Job Type *</label>
              <select value={form.type} onChange={(e) => set('type', e.target.value)} className={ic + ' border-[#E2E8F0]'}>
                {JOB_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <label className={lc}>Experience Level</label>
              <select value={form.experience} onChange={(e) => set('experience', e.target.value)} className={ic + ' border-[#E2E8F0]'}>
                {EXPERIENCE_LEVELS.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
              </select>
            </div>
          </div>

          {/* Salary */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={lc}>Min Salary (₹/month)</label>
              <input type="number" min="0" value={form.salary_min}
                onChange={(e) => set('salary_min', e.target.value)} placeholder="e.g. 25000" className={ic + ' border-[#E2E8F0]'} />
            </div>
            <div>
              <label className={lc}>Max Salary (₹/month)</label>
              <input type="number" min="0" value={form.salary_max}
                onChange={(e) => set('salary_max', e.target.value)} placeholder="e.g. 50000" className={ic + ' border-[#E2E8F0]'} />
            </div>
          </div>

          {/* Deadline + Flags */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={lc}>Application Deadline</label>
              <input type="date" value={form.deadline} onChange={(e) => set('deadline', e.target.value)} className={ic + ' border-[#E2E8F0]'} />
            </div>
            <div className="flex flex-col gap-2 justify-end pb-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input type="checkbox" checked={form.is_active} onChange={(e) => set('is_active', e.target.checked)}
                  className="w-4 h-4 rounded accent-[#0A1628]" />
                <span className="text-sm font-medium text-[#0A1628]">Active (visible on site)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input type="checkbox" checked={form.is_featured} onChange={(e) => set('is_featured', e.target.checked)}
                  className="w-4 h-4 rounded accent-[#C9A84C]" />
                <span className="text-sm font-medium text-[#0A1628]">Featured (pinned to top)</span>
              </label>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className={lc}>Job Description</label>
            <textarea rows={5} value={form.description} onChange={(e) => set('description', e.target.value)}
              placeholder="Full job description — what the role involves, team context, goals..."
              className={`${ic} border-[#E2E8F0] resize-y`} />
          </div>

          <BulletListEditor label="Responsibilities" items={form.responsibilities} onChange={(v) => set('responsibilities', v)} />
          <BulletListEditor label="Requirements / Qualifications" items={form.requirements} onChange={(v) => set('requirements', v)} />

          <div className="h-4" />
        </form>

        <div className="border-t border-[#E2E8F0] px-6 py-4 flex gap-3 bg-white">
          <button type="button" onClick={onClose}
            className="flex-1 py-2.5 text-sm font-medium border border-[#E2E8F0] rounded-[6px] text-[#4A5568] hover:border-[#0A1628] transition-colors">
            Cancel
          </button>
          <button type="button" onClick={handleSubmit} disabled={saving}
            className="flex-1 py-2.5 text-sm font-semibold rounded-[6px] text-white bg-[#0A1628] hover:bg-[#1A2E4A] disabled:opacity-60 transition-colors">
            {saving ? 'Saving...' : isEdit ? 'Update Job' : 'Post Job'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Application Detail Panel ───────────────────────────────────
function AppDetailPanel({ app, onClose, onStatusChange }) {
  const [notes, setNotes] = useState(app.admin_notes || '');
  const [savingNotes, setSavingNotes] = useState(false);

  const saveNotes = async () => {
    setSavingNotes(true);
    const { error } = await supabase.from('job_applications').update({ admin_notes: notes }).eq('id', app.id);
    setSavingNotes(false);
    if (error) toast.error('Failed to save notes');
    else toast.success('Notes saved');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white h-full w-full max-w-xl shadow-2xl flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E2E8F0]">
          <div>
            <h2 className="text-lg font-bold text-[#0A1628]">{app.name}</h2>
            <p className="text-xs text-[#718096]">Applied for: {app.job_title}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-md hover:bg-gray-100"><X size={18} /></button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {/* Status pipeline */}
          <div>
            <p className="text-xs font-semibold text-[#0A1628] mb-2">Update Status</p>
            <div className="flex flex-wrap gap-2">
              {APP_STATUSES.map((s) => (
                <button key={s.value} onClick={() => onStatusChange(app.id, s.value)}
                  className="px-3 py-1.5 rounded-full text-xs font-semibold border-2 transition-all"
                  style={{
                    borderColor: app.status === s.value ? s.color : '#E2E8F0',
                    backgroundColor: app.status === s.value ? s.color + '20' : 'transparent',
                    color: app.status === s.value ? s.color : '#718096',
                  }}>
                  {app.status === s.value && <Check size={10} className="inline mr-1" />}
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div className="bg-[#F8F9FA] rounded-lg p-4 space-y-2 text-sm text-[#4A5568]">
            <p className="text-xs font-semibold text-[#0A1628] mb-2">Contact Info</p>
            <p><span className="font-medium text-[#0A1628]">Email:</span>{' '}
              <a href={`mailto:${app.email}`} className="text-[#C9A84C] hover:underline">{app.email}</a></p>
            {app.phone && <p><span className="font-medium text-[#0A1628]">Phone:</span> {app.phone}</p>}
            {app.linkedin_url && isSafeExternalUrl(app.linkedin_url) && (
              <p><span className="font-medium text-[#0A1628]">LinkedIn:</span>{' '}
                <a href={app.linkedin_url} target="_blank" rel="noopener noreferrer"
                  className="text-[#C9A84C] hover:underline inline-flex items-center gap-1">
                  View Profile <ExternalLink size={11} />
                </a>
              </p>
            )}
            {app.resume_url && (
              <p><span className="font-medium text-[#0A1628]">Resume:</span>{' '}
                <a href={app.resume_url} target="_blank" rel="noopener noreferrer"
                  className="text-[#C9A84C] hover:underline inline-flex items-center gap-1">
                  View / Download <ExternalLink size={11} />
                </a>
              </p>
            )}
            <p><span className="font-medium text-[#0A1628]">Applied:</span>{' '}
              {new Date(app.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
            </p>
          </div>

          {/* Cover note */}
          {app.cover_note && (
            <div>
              <p className="text-xs font-semibold text-[#0A1628] mb-2">Cover Note</p>
              <p className="text-sm text-[#4A5568] leading-relaxed whitespace-pre-wrap bg-[#F8F9FA] rounded-lg p-4">
                {app.cover_note}
              </p>
            </div>
          )}

          {/* Admin notes */}
          <div>
            <p className="text-xs font-semibold text-[#0A1628] mb-2">Internal Notes (private)</p>
            <textarea rows={4} value={notes} onChange={(e) => setNotes(e.target.value)}
              placeholder="Add private notes about this applicant..."
              className="w-full px-3 py-2 text-sm border border-[#E2E8F0] rounded-[6px] focus:outline-none focus:ring-2 focus:ring-[#C9A84C] resize-none" />
            <button onClick={saveNotes} disabled={savingNotes}
              className="mt-2 px-4 py-2 text-xs font-semibold bg-[#0A1628] text-white rounded-[6px] hover:bg-[#1A2E4A] disabled:opacity-60">
              {savingNotes ? 'Saving...' : 'Save Notes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Inline Applications for a single job ─────────────────────
function JobApplications({ jobId, jobTitle }) {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState(null);
  const [filterStatus, setFilterStatus] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('job_applications')
        .select('*')
        .eq('job_id', jobId)
        .order('created_at', { ascending: false });
      if (cancelled) return;
      if (error) {
        console.error('[careers] load applications error:', error);
        toast.error(`Failed to load applications: ${error.message}`);
      } else {
        setApps(data ?? []);
      }
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [jobId]);

  const updateStatus = async (appId, status) => {
    const { error } = await supabase.from('job_applications')
      .update({ status, updated_at: new Date().toISOString() }).eq('id', appId);
    if (error) { toast.error('Failed'); return; }
    toast.success(`Marked as ${status}`);
    setApps((prev) => prev.map((a) => a.id === appId ? { ...a, status } : a));
    if (selectedApp?.id === appId) setSelectedApp((a) => ({ ...a, status }));
  };

  const si = (s) => APP_STATUSES.find((x) => x.value === s) ?? { label: s, color: '#718096' };
  const filtered = filterStatus ? apps.filter((a) => a.status === filterStatus) : apps;

  if (loading) {
    return <div className="px-5 py-4 border-t border-[#E2E8F0]">
      <div className="h-16 bg-gray-100 rounded animate-pulse" />
    </div>;
  }

  if (apps.length === 0) {
    return <div className="px-5 py-5 border-t border-[#E2E8F0] text-center">
      <p className="text-sm text-[#718096]">No applications yet for this position.</p>
    </div>;
  }

  return (
    <div className="border-t border-[#E2E8F0] bg-[#F8FAFF]">
      {/* Applications header */}
      <div className="px-5 py-3 flex flex-wrap items-center gap-3 border-b border-[#E2E8F0]">
        <span className="text-xs font-bold text-[#0A1628]">{apps.length} Application{apps.length !== 1 ? 's' : ''}</span>
        <div className="flex flex-wrap gap-1.5">
          {APP_STATUSES.map((s) => {
            const count = apps.filter((a) => a.status === s.value).length;
            if (count === 0) return null;
            return (
              <button key={s.value}
                onClick={() => setFilterStatus(filterStatus === s.value ? '' : s.value)}
                className="px-2 py-0.5 rounded-full text-[10px] font-bold border transition-all"
                style={{
                  borderColor: s.color,
                  backgroundColor: filterStatus === s.value ? s.color + '25' : 'transparent',
                  color: s.color,
                }}>
                {s.label} ({count})
              </button>
            );
          })}
          {filterStatus && (
            <button onClick={() => setFilterStatus('')}
              className="px-2 py-0.5 rounded-full text-[10px] font-bold text-[#718096] border border-[#E2E8F0]">
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[#E2E8F0]">
            <th className="text-left px-5 py-2.5 text-[10px] font-semibold text-[#718096] uppercase tracking-wider">Applicant</th>
            <th className="text-left px-4 py-2.5 text-[10px] font-semibold text-[#718096] uppercase tracking-wider hidden sm:table-cell">Applied</th>
            <th className="text-left px-4 py-2.5 text-[10px] font-semibold text-[#718096] uppercase tracking-wider">Status</th>
            <th className="text-left px-4 py-2.5 text-[10px] font-semibold text-[#718096] uppercase tracking-wider hidden md:table-cell">Resume</th>
            <th className="px-4 py-2.5" />
          </tr>
        </thead>
        <tbody className="divide-y divide-[#F0F4F8]">
          {filtered.map((app) => {
            const info = si(app.status);
            return (
              <tr key={app.id} className="hover:bg-white/60 transition-colors">
                <td className="px-5 py-3">
                  <p className="font-semibold text-[#0A1628] text-sm">{app.name}</p>
                  <p className="text-xs text-[#718096]">{app.email}</p>
                  {app.phone && <p className="text-xs text-[#718096]">{app.phone}</p>}
                </td>
                <td className="px-4 py-3 hidden sm:table-cell text-xs text-[#718096]">
                  {new Date(app.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </td>
                <td className="px-4 py-3">
                  <select value={app.status} onChange={(e) => updateStatus(app.id, e.target.value)}
                    className="text-xs font-semibold rounded-full px-2.5 py-1 border-0 focus:outline-none focus:ring-2 focus:ring-[#C9A84C] cursor-pointer"
                    style={{ backgroundColor: info.color + '20', color: info.color }}>
                    {APP_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                </td>
                <td className="px-4 py-3 hidden md:table-cell">
                  {app.resume_url
                    ? <a href={app.resume_url} target="_blank" rel="noopener noreferrer"
                        className="text-xs text-[#C9A84C] hover:underline inline-flex items-center gap-1">
                        View <ExternalLink size={10} />
                      </a>
                    : <span className="text-xs text-[#CBD5E0]">—</span>
                  }
                </td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => setSelectedApp(app)}
                    className="text-xs font-semibold text-[#0A1628] hover:text-[#C9A84C] transition-colors">
                    Details
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Application detail panel */}
      {selectedApp && (
        <AppDetailPanel
          app={selectedApp}
          onClose={() => setSelectedApp(null)}
          onStatusChange={(id, status) => { updateStatus(id, status); }}
        />
      )}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────
export default function CareersAdminPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [expandedJobId, setExpandedJobId] = useState(null);   // for JD preview
  const [openAppsJobId, setOpenAppsJobId] = useState(null);   // for inline applications

  const loadJobs = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('job_postings')
      .select('*, job_applications(count)')
      .order('is_featured', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) toast.error('Failed to load jobs');
    else setJobs(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { loadJobs(); }, [loadJobs]);

  const toggleActive = async (job) => {
    const { error } = await supabase.from('job_postings').update({ is_active: !job.is_active }).eq('id', job.id);
    if (error) { toast.error('Failed'); return; }
    toast.success(job.is_active ? 'Job hidden from site' : 'Job published to site');
    loadJobs();
  };

  const toggleFeatured = async (job) => {
    const { error } = await supabase.from('job_postings').update({ is_featured: !job.is_featured }).eq('id', job.id);
    if (error) { toast.error('Failed'); return; }
    toast.success(job.is_featured ? 'Removed from featured' : 'Marked as featured');
    loadJobs();
  };

  const handleDelete = async (job) => {
    const appCount = job.job_applications?.[0]?.count ?? 0;
    const confirmMsg = appCount > 0
      ? `Delete "${job.title}"?\n\nThis will permanently delete the job AND ${appCount} application${appCount !== 1 ? 's' : ''} with any uploaded resumes. This cannot be undone.`
      : `Delete "${job.title}"? This cannot be undone.`;
    if (!window.confirm(confirmMsg)) return;

    setDeletingId(job.id);

    // 1. Fetch resume URLs for this job's applications
    if (appCount > 0) {
      const { data: apps } = await supabase
        .from('job_applications').select('resume_url').eq('job_id', job.id);

      const MARKER = '/resumes/';
      const paths = (apps ?? [])
        .map((a) => { if (!a.resume_url) return null; const i = a.resume_url.indexOf(MARKER); return i === -1 ? null : a.resume_url.slice(i + MARKER.length); })
        .filter(Boolean);

      if (paths.length) {
        await supabase.storage.from('resumes').remove(paths).catch(console.warn);
      }
    }

    // 2. Delete job — CASCADE removes job_applications rows
    const { error } = await supabase.from('job_postings').delete().eq('id', job.id);
    setDeletingId(null);

    if (error) { toast.error('Delete failed: ' + error.message); return; }
    toast.success('Job and all associated data deleted');

    // Close expanded panels for the deleted job
    if (expandedJobId === job.id) setExpandedJobId(null);
    if (openAppsJobId === job.id) setOpenAppsJobId(null);
    loadJobs();
  };

  const copyId = (id) => {
    navigator.clipboard.writeText(id).then(() => toast.success('Job ID copied'));
  };

  const totalApps = jobs.reduce((acc, j) => acc + (j.job_applications?.[0]?.count ?? 0), 0);
  const activeCount = jobs.filter((j) => j.is_active).length;
  const typeLabel = (t) => JOB_TYPES.find((x) => x.value === t)?.label ?? t;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0A1628]">Careers</h1>
          <p className="text-sm text-[#718096] mt-0.5">
            {jobs.length} job{jobs.length !== 1 ? 's' : ''} · {activeCount} active · {totalApps} total application{totalApps !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={loadJobs}
            className="p-2 rounded-[6px] border border-[#E2E8F0] text-[#718096] hover:text-[#0A1628] hover:border-[#0A1628] transition-colors" title="Refresh">
            <RefreshCw size={15} />
          </button>
          <button onClick={() => { setEditingJob(null); setShowForm(true); }}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold bg-[#0A1628] text-white rounded-[6px] hover:bg-[#1A2E4A] transition-colors">
            <Plus size={16} /> Post Job
          </button>
        </div>
      </div>

      {/* Job list */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-24 rounded-[8px] bg-gray-100 animate-pulse" />)}
        </div>
      ) : jobs.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-[8px] border border-[#E2E8F0]">
          <Briefcase size={40} className="mx-auto text-gray-300 mb-3" />
          <p className="font-semibold text-[#0A1628]">No jobs posted yet</p>
          <p className="text-sm text-[#718096] mt-1 mb-4">Click "Post Job" to create your first opening.</p>
          <button onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold bg-[#0A1628] text-white rounded-[6px] hover:bg-[#1A2E4A] transition-colors">
            <Plus size={16} /> Post First Job
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {jobs.map((job) => {
            const appCount = job.job_applications?.[0]?.count ?? 0;
            const isJDOpen = expandedJobId === job.id;
            const isAppsOpen = openAppsJobId === job.id;
            const shortId = job.id.slice(-8).toUpperCase();

            return (
              <div key={job.id} className="bg-white rounded-[8px] border border-[#E2E8F0] overflow-hidden">
                {/* Job row */}
                <div className="px-5 py-4">
                  <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                    <div className="flex-1 min-w-0">
                      {/* Badges */}
                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        {job.is_featured && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold"
                            style={{ backgroundColor: '#FEF3C7', color: '#92400E' }}>★ Featured</span>
                        )}
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${job.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                          {job.is_active ? '● Active' : '○ Hidden'}
                        </span>
                      </div>

                      <h3 className="font-bold text-[#0A1628]">{job.title}</h3>

                      {/* Meta row */}
                      <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-[#718096]">
                        <span className="flex items-center gap-1"><Briefcase size={10} /> {job.department}</span>
                        <span className="flex items-center gap-1"><MapPin size={10} /> {job.location}</span>
                        <span className="flex items-center gap-1"><Clock size={10} /> {typeLabel(job.type)}</span>
                        {job.deadline && (
                          <span className="text-orange-500 font-medium">
                            Deadline: {new Date(job.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                          </span>
                        )}
                      </div>

                      {/* Job ID */}
                      <div className="flex items-center gap-1.5 mt-2">
                        <span className="text-[10px] text-[#A0AEC0] font-mono bg-[#F8F9FA] border border-[#E2E8F0] px-2 py-0.5 rounded">
                          ID: ...{shortId}
                        </span>
                        <button onClick={() => copyId(job.id)} title="Copy full Job ID"
                          className="text-[#A0AEC0] hover:text-[#718096] transition-colors">
                          <Copy size={11} />
                        </button>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                      {/* Applications toggle */}
                      <button
                        onClick={() => setOpenAppsJobId(isAppsOpen ? null : job.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-[6px] border transition-colors"
                        style={{
                          borderColor: isAppsOpen ? '#0A1628' : '#E2E8F0',
                          backgroundColor: isAppsOpen ? '#0A1628' : 'transparent',
                          color: isAppsOpen ? '#fff' : appCount > 0 ? '#C9A84C' : '#718096',
                        }}
                      >
                        <Users size={12} />
                        {appCount} Application{appCount !== 1 ? 's' : ''}
                        {isAppsOpen ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
                      </button>

                      {/* JD preview */}
                      <button onClick={() => setExpandedJobId(isJDOpen ? null : job.id)}
                        className="p-2 rounded-[6px] border border-[#E2E8F0] text-[#718096] hover:text-[#0A1628] transition-colors" title="Preview JD">
                        {isJDOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </button>

                      {/* Feature toggle */}
                      <button onClick={() => toggleFeatured(job)}
                        className="p-2 rounded-[6px] border border-[#E2E8F0] transition-colors"
                        style={{ color: job.is_featured ? '#C9A84C' : '#718096' }} title="Toggle featured">
                        {job.is_featured ? <Star size={14} /> : <StarOff size={14} />}
                      </button>

                      {/* Active toggle */}
                      <button onClick={() => toggleActive(job)}
                        className="p-2 rounded-[6px] border border-[#E2E8F0] transition-colors"
                        style={{ color: job.is_active ? '#48BB78' : '#718096' }} title="Toggle visibility">
                        {job.is_active ? <Eye size={14} /> : <EyeOff size={14} />}
                      </button>

                      {/* Edit */}
                      <button onClick={() => { setEditingJob(job); setShowForm(true); }}
                        className="p-2 rounded-[6px] border border-[#E2E8F0] text-[#718096] hover:text-[#0A1628] transition-colors" title="Edit job">
                        <Pencil size={14} />
                      </button>

                      {/* Delete */}
                      <button onClick={() => handleDelete(job)} disabled={deletingId === job.id}
                        className="p-2 rounded-[6px] border border-[#E2E8F0] text-[#718096] hover:text-red-600 hover:border-red-200 transition-colors disabled:opacity-40" title="Delete job">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* JD Preview (expandable) */}
                {isJDOpen && (
                  <div className="border-t border-[#E2E8F0] px-5 py-4 bg-[#F8F9FA] space-y-4">
                    {(job.salary_min || job.salary_max) && (
                      <p className="text-sm text-green-700 font-semibold">
                        ₹{job.salary_min?.toLocaleString('en-IN') ?? '?'}
                        {job.salary_max ? ` – ₹${job.salary_max.toLocaleString('en-IN')}` : '+'}/month
                      </p>
                    )}
                    {job.description && (
                      <div>
                        <p className="text-xs font-bold text-[#0A1628] mb-1">Description</p>
                        <p className="text-sm text-[#4A5568] whitespace-pre-wrap leading-relaxed">{job.description}</p>
                      </div>
                    )}
                    {job.responsibilities?.length > 0 && (
                      <div>
                        <p className="text-xs font-bold text-[#0A1628] mb-1">Responsibilities</p>
                        <ul className="list-disc list-inside space-y-0.5">
                          {job.responsibilities.map((r, i) => <li key={i} className="text-sm text-[#4A5568]">{r}</li>)}
                        </ul>
                      </div>
                    )}
                    {job.requirements?.length > 0 && (
                      <div>
                        <p className="text-xs font-bold text-[#0A1628] mb-1">Requirements</p>
                        <ul className="list-disc list-inside space-y-0.5">
                          {job.requirements.map((r, i) => <li key={i} className="text-sm text-[#4A5568]">{r}</li>)}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {/* Inline applications for THIS job */}
                {isAppsOpen && (
                  <JobApplications jobId={job.id} jobTitle={job.title} />
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Job form slide-over */}
      {showForm && (
        <JobFormPanel
          job={editingJob}
          onClose={() => { setShowForm(false); setEditingJob(null); }}
          onSaved={() => { setShowForm(false); setEditingJob(null); loadJobs(); }}
        />
      )}
    </div>
  );
}
