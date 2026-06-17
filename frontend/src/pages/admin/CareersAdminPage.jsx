import { useState, useEffect, useCallback } from 'react';
import {
  Plus, Pencil, Trash2, Eye, EyeOff, Star, StarOff,
  ChevronDown, ChevronUp, Briefcase, MapPin, Clock, Users,
  ExternalLink, FileText, X, Check, RefreshCw,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '../../lib/supabase';

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
  title: '',
  department: 'Technology',
  location: 'Dehradun, Uttarakhand',
  type: 'full_time',
  experience: 'mid',
  description: '',
  requirements: [''],
  responsibilities: [''],
  salary_min: '',
  salary_max: '',
  deadline: '',
  is_active: true,
  is_featured: false,
};

function slugify(text) {
  return text.toLowerCase().trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// ── Array-of-strings field ─────────────────────────────────────
function BulletListEditor({ label, items, onChange }) {
  const update = (i, val) => {
    const next = [...items];
    next[i] = val;
    onChange(next);
  };
  const add = () => onChange([...items, '']);
  const remove = (i) => onChange(items.filter((_, idx) => idx !== i));

  return (
    <div>
      <label className="block text-xs font-semibold text-[#0A1628] mb-1.5">{label}</label>
      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={i} className="flex gap-2">
            <input
              type="text"
              value={item}
              onChange={(e) => update(i, e.target.value)}
              placeholder={`${label} point ${i + 1}`}
              className="flex-1 px-3 py-2 text-sm border border-[#E2E8F0] rounded-[6px] focus:outline-none focus:ring-2 focus:ring-[#C9A84C]"
            />
            <button
              type="button"
              onClick={() => remove(i)}
              disabled={items.length === 1}
              className="p-2 text-red-400 hover:text-red-600 disabled:opacity-30"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={add}
        className="mt-2 text-xs text-[#C9A84C] font-semibold hover:underline flex items-center gap-1"
      >
        <Plus size={12} /> Add point
      </button>
    </div>
  );
}

// ── Job Form Modal ─────────────────────────────────────────────
function JobFormModal({ job, onClose, onSaved }) {
  const isEdit = !!job;
  const [form, setForm] = useState(() =>
    job ? {
      title: job.title || '',
      department: job.department || 'Technology',
      location: job.location || 'Dehradun, Uttarakhand',
      type: job.type || 'full_time',
      experience: job.experience || 'mid',
      description: job.description || '',
      requirements: job.requirements?.length ? job.requirements : [''],
      responsibilities: job.responsibilities?.length ? job.responsibilities : [''],
      salary_min: job.salary_min ?? '',
      salary_max: job.salary_max ?? '',
      deadline: job.deadline ? job.deadline.slice(0, 10) : '',
      is_active: job.is_active ?? true,
      is_featured: job.is_featured ?? false,
    } : emptyForm
  );
  const [saving, setSaving] = useState(false);

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { toast.error('Title is required'); return; }

    setSaving(true);
    const payload = {
      title: form.title.trim(),
      slug: isEdit ? job.slug : `${slugify(form.title)}-${Date.now().toString(36)}`,
      department: form.department,
      location: form.location.trim() || 'Dehradun, Uttarakhand',
      type: form.type,
      experience: form.experience,
      description: form.description.trim() || null,
      requirements: form.requirements.map((r) => r.trim()).filter(Boolean),
      responsibilities: form.responsibilities.map((r) => r.trim()).filter(Boolean),
      salary_min: form.salary_min ? parseInt(form.salary_min) : null,
      salary_max: form.salary_max ? parseInt(form.salary_max) : null,
      deadline: form.deadline || null,
      is_active: form.is_active,
      is_featured: form.is_featured,
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

  const inputCls = 'w-full px-3 py-2 text-sm border border-[#E2E8F0] rounded-[6px] focus:outline-none focus:ring-2 focus:ring-[#C9A84C]';
  const labelCls = 'block text-xs font-semibold text-[#0A1628] mb-1';

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white h-full w-full max-w-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E2E8F0] bg-white sticky top-0 z-10">
          <h2 className="text-lg font-bold text-[#0A1628]">{isEdit ? 'Edit Job' : 'Post New Job'}</h2>
          <button onClick={onClose} className="p-2 rounded-md hover:bg-gray-100">
            <X size={18} className="text-[#718096]" />
          </button>
        </div>

        {/* Scrollable form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {/* Title */}
          <div>
            <label className={labelCls}>Job Title *</label>
            <input
              type="text"
              required
              value={form.title}
              onChange={(e) => set('title', e.target.value)}
              placeholder="e.g. Software Engineer – React"
              className={inputCls}
            />
          </div>

          {/* Department + Location */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Department *</label>
              <select value={form.department} onChange={(e) => set('department', e.target.value)} className={inputCls}>
                {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Location *</label>
              <input type="text" value={form.location} onChange={(e) => set('location', e.target.value)} className={inputCls} />
            </div>
          </div>

          {/* Type + Experience */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Job Type *</label>
              <select value={form.type} onChange={(e) => set('type', e.target.value)} className={inputCls}>
                {JOB_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Experience Level</label>
              <select value={form.experience} onChange={(e) => set('experience', e.target.value)} className={inputCls}>
                {EXPERIENCE_LEVELS.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
              </select>
            </div>
          </div>

          {/* Salary */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Min Salary (₹/month)</label>
              <input type="number" min="0" value={form.salary_min} onChange={(e) => set('salary_min', e.target.value)} placeholder="e.g. 25000" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Max Salary (₹/month)</label>
              <input type="number" min="0" value={form.salary_max} onChange={(e) => set('salary_max', e.target.value)} placeholder="e.g. 50000" className={inputCls} />
            </div>
          </div>

          {/* Deadline */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Application Deadline</label>
              <input type="date" value={form.deadline} onChange={(e) => set('deadline', e.target.value)} className={inputCls} />
            </div>
            <div className="flex flex-col gap-2 justify-end pb-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input type="checkbox" checked={form.is_active} onChange={(e) => set('is_active', e.target.checked)}
                  className="w-4 h-4 rounded border-[#E2E8F0] accent-[#0A1628]" />
                <span className="text-sm font-medium text-[#0A1628]">Active (visible on site)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input type="checkbox" checked={form.is_featured} onChange={(e) => set('is_featured', e.target.checked)}
                  className="w-4 h-4 rounded border-[#E2E8F0] accent-[#C9A84C]" />
                <span className="text-sm font-medium text-[#0A1628]">Featured (shown at top)</span>
              </label>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className={labelCls}>Job Description</label>
            <textarea
              rows={6}
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              placeholder="Full job description — what the role involves, team context, goals..."
              className={`${inputCls} resize-y`}
            />
          </div>

          {/* Responsibilities */}
          <BulletListEditor
            label="Responsibilities"
            items={form.responsibilities}
            onChange={(v) => set('responsibilities', v)}
          />

          {/* Requirements */}
          <BulletListEditor
            label="Requirements / Qualifications"
            items={form.requirements}
            onChange={(v) => set('requirements', v)}
          />

          <div className="h-4" />
        </form>

        {/* Footer */}
        <div className="border-t border-[#E2E8F0] px-6 py-4 flex gap-3 bg-white">
          <button type="button" onClick={onClose}
            className="flex-1 py-2.5 text-sm font-medium border border-[#E2E8F0] rounded-[6px] text-[#4A5568] hover:border-[#0A1628] transition-colors">
            Cancel
          </button>
          <button
            form="job-form"
            type="submit"
            onClick={handleSubmit}
            disabled={saving}
            className="flex-1 py-2.5 text-sm font-semibold rounded-[6px] text-white bg-[#0A1628] hover:bg-[#1A2E4A] disabled:opacity-60 transition-colors"
          >
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

  const statusInfo = APP_STATUSES.find((s) => s.value === app.status);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white h-full w-full max-w-xl shadow-2xl flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E2E8F0]">
          <div>
            <h2 className="text-lg font-bold text-[#0A1628]">{app.name}</h2>
            <p className="text-xs text-[#718096]">{app.job_title}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-md hover:bg-gray-100"><X size={18} /></button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {/* Status pipeline */}
          <div>
            <p className="text-xs font-semibold text-[#0A1628] mb-2">Status</p>
            <div className="flex flex-wrap gap-2">
              {APP_STATUSES.map((s) => (
                <button
                  key={s.value}
                  onClick={() => onStatusChange(app.id, s.value)}
                  className="px-3 py-1.5 rounded-full text-xs font-semibold border-2 transition-all"
                  style={{
                    borderColor: app.status === s.value ? s.color : '#E2E8F0',
                    backgroundColor: app.status === s.value ? s.color + '20' : 'transparent',
                    color: app.status === s.value ? s.color : '#718096',
                  }}
                >
                  {app.status === s.value && <Check size={10} className="inline mr-1" />}
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Contact info */}
          <div className="bg-[#F8F9FA] rounded-lg p-4 space-y-2">
            <p className="text-xs font-semibold text-[#0A1628] mb-2">Contact</p>
            <div className="text-sm text-[#4A5568] space-y-1.5">
              <p><span className="font-medium text-[#0A1628]">Email:</span>{' '}
                <a href={`mailto:${app.email}`} className="text-[#C9A84C] hover:underline">{app.email}</a>
              </p>
              {app.phone && <p><span className="font-medium text-[#0A1628]">Phone:</span> {app.phone}</p>}
              {app.linkedin_url && (
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
            <p className="text-xs font-semibold text-[#0A1628] mb-2">Internal Notes</p>
            <textarea
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add private notes about this applicant..."
              className="w-full px-3 py-2 text-sm border border-[#E2E8F0] rounded-[6px] focus:outline-none focus:ring-2 focus:ring-[#C9A84C] resize-none"
            />
            <button
              onClick={saveNotes}
              disabled={savingNotes}
              className="mt-2 px-4 py-2 text-xs font-semibold bg-[#0A1628] text-white rounded-[6px] hover:bg-[#1A2E4A] disabled:opacity-60"
            >
              {savingNotes ? 'Saving...' : 'Save Notes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────
export default function CareersAdminPage() {
  const [tab, setTab] = useState('jobs'); // 'jobs' | 'applications'
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [appLoading, setAppLoading] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [deletingJob, setDeletingJob] = useState(null);
  const [selectedApp, setSelectedApp] = useState(null);
  const [expandedJob, setExpandedJob] = useState(null);

  // Application filters
  const [filterJob, setFilterJob] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // Stats
  const [stats, setStats] = useState({ total: 0, active: 0, totalApps: 0 });

  const loadJobs = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('job_postings')
      .select('*, job_applications(count)')
      .order('is_featured', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) { toast.error('Failed to load jobs'); setLoading(false); return; }
    setJobs(data ?? []);
    setStats({
      total: (data ?? []).length,
      active: (data ?? []).filter((j) => j.is_active).length,
      totalApps: (data ?? []).reduce((acc, j) => acc + (j.job_applications?.[0]?.count ?? 0), 0),
    });
    setLoading(false);
  }, []);

  const loadApplications = useCallback(async () => {
    setAppLoading(true);
    let query = supabase
      .from('job_applications')
      .select('*')
      .order('created_at', { ascending: false });

    if (filterJob) query = query.eq('job_id', filterJob);
    if (filterStatus) query = query.eq('status', filterStatus);

    const { data, error } = await query;
    if (error) toast.error('Failed to load applications');
    else setApplications(data ?? []);
    setAppLoading(false);
  }, [filterJob, filterStatus]);

  useEffect(() => { loadJobs(); }, [loadJobs]);
  useEffect(() => { if (tab === 'applications') loadApplications(); }, [tab, loadApplications]);

  const toggleActive = async (job) => {
    const { error } = await supabase.from('job_postings').update({ is_active: !job.is_active }).eq('id', job.id);
    if (error) toast.error('Failed');
    else { toast.success(job.is_active ? 'Job hidden' : 'Job published'); loadJobs(); }
  };

  const toggleFeatured = async (job) => {
    const { error } = await supabase.from('job_postings').update({ is_featured: !job.is_featured }).eq('id', job.id);
    if (error) toast.error('Failed');
    else { toast.success(job.is_featured ? 'Unfeatured' : 'Featured'); loadJobs(); }
  };

  const handleDeleteJob = async (job) => {
    if (!window.confirm(`Delete "${job.title}"? All applications for this job will also be deleted.`)) return;
    setDeletingJob(job.id);
    const { error } = await supabase.from('job_postings').delete().eq('id', job.id);
    setDeletingJob(null);
    if (error) toast.error('Delete failed');
    else { toast.success('Job deleted'); loadJobs(); }
  };

  const updateAppStatus = async (appId, status) => {
    const { error } = await supabase.from('job_applications').update({ status, updated_at: new Date().toISOString() }).eq('id', appId);
    if (error) { toast.error('Failed'); return; }
    toast.success(`Marked as ${status}`);
    setApplications((prev) => prev.map((a) => a.id === appId ? { ...a, status } : a));
    if (selectedApp?.id === appId) setSelectedApp((a) => ({ ...a, status }));
  };

  const typeLabel = (t) => JOB_TYPES.find((x) => x.value === t)?.label ?? t;
  const expLabel = (e) => EXPERIENCE_LEVELS.find((x) => x.value === e)?.label ?? e;
  const statusInfo = (s) => APP_STATUSES.find((x) => x.value === s) ?? { label: s, color: '#718096' };

  const tabBtnCls = (active) =>
    `px-5 py-2.5 text-sm font-semibold rounded-[6px] transition-colors ${
      active ? 'bg-[#0A1628] text-white' : 'text-[#4A5568] hover:bg-gray-100'
    }`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0A1628]">Careers</h1>
          <p className="text-sm text-[#718096] mt-0.5">
            {stats.active} active job{stats.active !== 1 ? 's' : ''} · {stats.totalApps} application{stats.totalApps !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => tab === 'jobs' ? loadJobs() : loadApplications()}
            className="p-2 rounded-[6px] border border-[#E2E8F0] text-[#718096] hover:text-[#0A1628] hover:border-[#0A1628] transition-colors">
            <RefreshCw size={15} />
          </button>
          {tab === 'jobs' && (
            <button
              onClick={() => { setEditingJob(null); setShowForm(true); }}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold bg-[#0A1628] text-white rounded-[6px] hover:bg-[#1A2E4A] transition-colors"
            >
              <Plus size={16} /> Post Job
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-[#E2E8F0] pb-0">
        <button className={tabBtnCls(tab === 'jobs')} onClick={() => setTab('jobs')}>
          Job Postings <span className="ml-1 text-xs opacity-70">({stats.total})</span>
        </button>
        <button className={tabBtnCls(tab === 'applications')} onClick={() => setTab('applications')}>
          Applications <span className="ml-1 text-xs opacity-70">({stats.totalApps})</span>
        </button>
      </div>

      {/* ── JOBS TAB ─── */}
      {tab === 'jobs' && (
        <div className="space-y-3">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-24 rounded-[8px] bg-gray-100 animate-pulse" />
            ))
          ) : jobs.length === 0 ? (
            <div className="text-center py-20">
              <Briefcase size={40} className="mx-auto text-gray-300 mb-3" />
              <p className="font-semibold text-[#0A1628]">No jobs posted yet</p>
              <p className="text-sm text-[#718096] mt-1">Click "Post Job" to create your first opening.</p>
            </div>
          ) : jobs.map((job) => {
            const appCount = job.job_applications?.[0]?.count ?? 0;
            const isExpanded = expandedJob === job.id;
            return (
              <div key={job.id} className="bg-white rounded-[8px] border border-[#E2E8F0] overflow-hidden">
                <div className="px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      {job.is_featured && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold" style={{ backgroundColor: '#FEF3C7', color: '#92400E' }}>
                          ★ Featured
                        </span>
                      )}
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${job.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {job.is_active ? 'Active' : 'Hidden'}
                      </span>
                    </div>
                    <h3 className="font-bold text-[#0A1628] leading-tight">{job.title}</h3>
                    <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-[#718096]">
                      <span className="flex items-center gap-1"><Briefcase size={11} /> {job.department}</span>
                      <span className="flex items-center gap-1"><MapPin size={11} /> {job.location}</span>
                      <span className="flex items-center gap-1"><Clock size={11} /> {typeLabel(job.type)}</span>
                      {appCount > 0 && (
                        <span className="flex items-center gap-1 text-[#C9A84C] font-semibold">
                          <Users size={11} /> {appCount} applicant{appCount !== 1 ? 's' : ''}
                        </span>
                      )}
                      {job.deadline && (
                        <span className="text-orange-500">
                          Deadline: {new Date(job.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button onClick={() => setExpandedJob(isExpanded ? null : job.id)}
                      className="p-2 rounded-[6px] border border-[#E2E8F0] text-[#718096] hover:text-[#0A1628] transition-colors" title="Preview">
                      {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                    </button>
                    <button onClick={() => toggleFeatured(job)}
                      className="p-2 rounded-[6px] border border-[#E2E8F0] transition-colors"
                      style={{ color: job.is_featured ? '#C9A84C' : '#718096' }} title="Toggle featured">
                      {job.is_featured ? <Star size={15} /> : <StarOff size={15} />}
                    </button>
                    <button onClick={() => toggleActive(job)}
                      className="p-2 rounded-[6px] border border-[#E2E8F0] transition-colors"
                      style={{ color: job.is_active ? '#48BB78' : '#718096' }} title="Toggle active">
                      {job.is_active ? <Eye size={15} /> : <EyeOff size={15} />}
                    </button>
                    <button onClick={() => { setEditingJob(job); setShowForm(true); }}
                      className="p-2 rounded-[6px] border border-[#E2E8F0] text-[#718096] hover:text-[#0A1628] transition-colors" title="Edit">
                      <Pencil size={15} />
                    </button>
                    <button onClick={() => handleDeleteJob(job)} disabled={deletingJob === job.id}
                      className="p-2 rounded-[6px] border border-[#E2E8F0] text-[#718096] hover:text-red-600 hover:border-red-200 transition-colors disabled:opacity-40" title="Delete">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                {/* Expanded preview */}
                {isExpanded && (
                  <div className="border-t border-[#E2E8F0] px-5 py-4 bg-[#F8F9FA] space-y-4">
                    {job.description && (
                      <div>
                        <p className="text-xs font-semibold text-[#0A1628] mb-1">Description</p>
                        <p className="text-sm text-[#4A5568] leading-relaxed whitespace-pre-wrap">{job.description}</p>
                      </div>
                    )}
                    {job.responsibilities?.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-[#0A1628] mb-1">Responsibilities</p>
                        <ul className="list-disc list-inside space-y-0.5">
                          {job.responsibilities.map((r, i) => <li key={i} className="text-sm text-[#4A5568]">{r}</li>)}
                        </ul>
                      </div>
                    )}
                    {job.requirements?.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-[#0A1628] mb-1">Requirements</p>
                        <ul className="list-disc list-inside space-y-0.5">
                          {job.requirements.map((r, i) => <li key={i} className="text-sm text-[#4A5568]">{r}</li>)}
                        </ul>
                      </div>
                    )}
                    {(job.salary_min || job.salary_max) && (
                      <p className="text-sm text-[#4A5568]">
                        <span className="font-semibold text-[#0A1628]">Salary:</span>{' '}
                        {job.salary_min ? `₹${job.salary_min.toLocaleString('en-IN')}` : ''}
                        {job.salary_min && job.salary_max ? ' – ' : ''}
                        {job.salary_max ? `₹${job.salary_max.toLocaleString('en-IN')}` : ''}/month
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── APPLICATIONS TAB ─── */}
      {tab === 'applications' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            <select
              value={filterJob}
              onChange={(e) => setFilterJob(e.target.value)}
              className="text-sm border border-[#E2E8F0] rounded-[6px] px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#C9A84C] bg-white"
            >
              <option value="">All jobs</option>
              {jobs.map((j) => <option key={j.id} value={j.id}>{j.title}</option>)}
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="text-sm border border-[#E2E8F0] rounded-[6px] px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#C9A84C] bg-white"
            >
              <option value="">All statuses</option>
              {APP_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
            <button onClick={loadApplications}
              className="px-4 py-2 text-sm font-semibold bg-[#0A1628] text-white rounded-[6px] hover:bg-[#1A2E4A] transition-colors">
              Filter
            </button>
          </div>

          {/* Status pipeline counters */}
          <div className="flex flex-wrap gap-2">
            {APP_STATUSES.map((s) => {
              const count = applications.filter((a) => a.status === s.value).length;
              return (
                <button
                  key={s.value}
                  onClick={() => setFilterStatus(filterStatus === s.value ? '' : s.value)}
                  className="px-3 py-1 rounded-full text-xs font-semibold border-2 transition-all"
                  style={{
                    borderColor: s.color,
                    backgroundColor: filterStatus === s.value ? s.color + '20' : 'transparent',
                    color: s.color,
                  }}
                >
                  {s.label} {count > 0 && `(${count})`}
                </button>
              );
            })}
          </div>

          {/* Applications list */}
          {appLoading ? (
            Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-16 rounded-[8px] bg-gray-100 animate-pulse" />)
          ) : applications.length === 0 ? (
            <div className="text-center py-20">
              <FileText size={40} className="mx-auto text-gray-300 mb-3" />
              <p className="font-semibold text-[#0A1628]">No applications yet</p>
              <p className="text-sm text-[#718096] mt-1">Applications will appear here once candidates apply.</p>
            </div>
          ) : (
            <div className="bg-white rounded-[8px] border border-[#E2E8F0] overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#E2E8F0] bg-[#F8F9FA]">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-[#718096] uppercase tracking-wider">Applicant</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-[#718096] uppercase tracking-wider hidden md:table-cell">Role</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-[#718096] uppercase tracking-wider hidden sm:table-cell">Applied</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-[#718096] uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0]">
                  {applications.map((app) => {
                    const si = statusInfo(app.status);
                    return (
                      <tr key={app.id} className="hover:bg-[#F8F9FA] transition-colors">
                        <td className="px-4 py-3">
                          <p className="font-semibold text-[#0A1628]">{app.name}</p>
                          <p className="text-xs text-[#718096]">{app.email}</p>
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell">
                          <p className="text-[#4A5568] text-sm">{app.job_title}</p>
                        </td>
                        <td className="px-4 py-3 hidden sm:table-cell text-xs text-[#718096]">
                          {new Date(app.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </td>
                        <td className="px-4 py-3">
                          <select
                            value={app.status}
                            onChange={(e) => updateAppStatus(app.id, e.target.value)}
                            className="text-xs font-semibold rounded-full px-2.5 py-1 border-0 focus:outline-none focus:ring-2 focus:ring-[#C9A84C] cursor-pointer"
                            style={{ backgroundColor: si.color + '20', color: si.color }}
                          >
                            {APP_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                          </select>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => setSelectedApp(app)}
                            className="text-xs font-semibold text-[#C9A84C] hover:underline"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Job form slide-over */}
      {showForm && (
        <JobFormModal
          job={editingJob}
          onClose={() => { setShowForm(false); setEditingJob(null); }}
          onSaved={() => { setShowForm(false); setEditingJob(null); loadJobs(); }}
        />
      )}

      {/* Application detail slide-over */}
      {selectedApp && (
        <AppDetailPanel
          app={selectedApp}
          onClose={() => setSelectedApp(null)}
          onStatusChange={updateAppStatus}
        />
      )}
    </div>
  );
}
