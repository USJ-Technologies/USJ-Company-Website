import { useState, useEffect, useMemo } from 'react';
import {
  MapPin, Zap, Users, Heart, Laptop, TrendingUp,
  Briefcase, Clock, ChevronRight, X, Upload, CheckCircle,
  ArrowRight, Star,
} from 'lucide-react';
import SEOHead from '../components/seo/SEOHead';
import SectionHeader from '../components/ui/SectionHeader';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { APP_CONFIG } from '../config/app';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

// ── Constants ─────────────────────────────────────────────────
const TYPE_LABEL = {
  full_time: 'Full-time', part_time: 'Part-time',
  internship: 'Internship', contract: 'Contract', remote: 'Remote',
};
const EXP_LABEL = {
  entry: 'Entry Level', mid: 'Mid Level', senior: 'Senior Level', lead: 'Lead / Manager',
};

const EMPLOYMENT_TYPE_MAP = {
  full_time: 'FULL_TIME',
  part_time: 'PART_TIME',
  internship: 'INTERN',
  contract: 'CONTRACTOR',
  remote: 'TELECOMMUTE',
};

const SITE_URL = import.meta.env.VITE_SITE_URL || 'https://usjtechnologies.com';

const TYPE_COLOR = {
  full_time:  { bg: '#EBF4FF', text: '#1A3A5C' },
  part_time:  { bg: '#F0FFF4', text: '#22543D' },
  internship: { bg: '#FFFFF0', text: '#744210' },
  contract:   { bg: '#FFF5F5', text: '#742A2A' },
  remote:     { bg: '#FAF5FF', text: '#44337A' },
};

const cultureValues = [
  { icon: Zap,        title: 'Innovation First',  description: 'We encourage bold ideas and give you the space to experiment, learn, and build.' },
  { icon: Users,      title: 'Team Over Ego',     description: 'Collaboration is at the heart of everything we do. We win together.' },
  { icon: Heart,      title: 'Purpose-Driven',    description: "Every role at USJ contributes to India's technology progress — your work matters." },
  { icon: TrendingUp, title: 'Growth Mindset',    description: 'We invest in our people. Learning, mentorship, and career growth are non-negotiable.' },
];

const perks = [
  { icon: Laptop,      label: 'Modern Equipment',        sub: 'Best-in-class tools to do your best work' },
  { icon: MapPin,      label: 'Central Dehradun Office', sub: 'Easy commute, great location' },
  { icon: TrendingUp,  label: 'Fast Career Growth',      sub: 'Startup speed, real ownership' },
  { icon: Users,       label: 'Small Team Culture',      sub: 'Your voice is heard from day one' },
];

const emptyForm = {
  name: '', email: '', phone: '', linkedin_url: '', cover_note: '',
};

// ── Validation helpers ────────────────────────────────────────
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Strip all non-digit chars and require exactly 10 digits (Indian mobile)
const digitsOnly = (s) => s.replace(/\D/g, '');
const MAX_FILE_BYTES = 5 * 1024 * 1024; // 5 MB

function validateApplyForm(form, resumeFile) {
  const e = {};

  // Name: required, at least 2 chars
  if (!form.name.trim() || form.name.trim().length < 2)
    e.name = 'Please enter your full name (at least 2 characters)';

  // Email: required, valid format
  if (!form.email.trim()) e.email = 'Email address is required';
  else if (!EMAIL_RE.test(form.email.trim())) e.email = 'Please enter a valid email address';

  // Phone: optional, but if filled must be exactly 10 digits
  if (form.phone.trim()) {
    const d = digitsOnly(form.phone.trim());
    if (d.length !== 10) e.phone = 'Phone number must be exactly 10 digits';
  }

  // LinkedIn: optional, must start with http if provided
  if (form.linkedin_url.trim() && !form.linkedin_url.trim().startsWith('http'))
    e.linkedin_url = 'LinkedIn URL must start with https://';

  // Resume: optional, but if provided must be PDF only, max 5 MB
  if (resumeFile) {
    const ext = '.' + resumeFile.name.split('.').pop().toLowerCase();
    if (ext !== '.pdf') e.resume = 'Only PDF files are accepted (DOC/DOCX not supported)';
    else if (resumeFile.size > MAX_FILE_BYTES)
      e.resume = `File too large — max 5 MB (yours is ${(resumeFile.size / 1024 / 1024).toFixed(1)} MB)`;
  }

  return e;
}

// ── Job Detail + Apply Drawer ────────────────────────────────
function JobDrawer({ job, onClose }) {
  const [stage, setStage] = useState('detail'); // 'detail' | 'apply' | 'success'
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [resumeFile, setResumeFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const typeStyle = TYPE_COLOR[job.type] ?? { bg: '#EBF4FF', text: '#1A3A5C' };

  const setField = (key, value) => {
    setForm((f) => ({ ...f, [key]: value }));
    // Re-validate on change if field already touched
    setTouched((t) => ({ ...t, [key]: true }));
    setErrors((prev) => {
      const updated = validateApplyForm({ ...form, [key]: value }, resumeFile);
      return { ...prev, [key]: updated[key] };
    });
  };

  const handleBlur = (key) => {
    setTouched((t) => ({ ...t, [key]: true }));
    setErrors((prev) => ({ ...prev, ...validateApplyForm(form, resumeFile) }));
  };

  const handleResumeChange = (file) => {
    setResumeFile(file);
    if (file) {
      const ext = '.' + file.name.split('.').pop().toLowerCase();
      let err;
      if (!ALLOWED_EXTS.includes(ext)) err = 'Only PDF, DOC, or DOCX files are accepted';
      else if (file.size > MAX_FILE_BYTES) err = `File too large — max 5 MB (your file is ${(file.size / 1024 / 1024).toFixed(1)} MB)`;
      setErrors((e) => ({ ...e, resume: err }));
    } else {
      setErrors((e) => ({ ...e, resume: undefined }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validateApplyForm(form, resumeFile);
    setErrors(errs);
    setTouched({ name: true, email: true, phone: true, linkedin_url: true, resume: true });
    if (Object.keys(errs).length > 0) {
      toast.error('Please fix the errors below before submitting');
      return;
    }

    setSubmitting(true);
    let resumeUrl = null;

    if (resumeFile) {
      const ext = resumeFile.name.split('.').pop();
      const path = `${job.id}/${crypto.randomUUID()}.${ext}`;
      setUploadProgress(30);
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('resumes')
        .upload(path, resumeFile, { cacheControl: '3600', upsert: false });

      if (uploadError) {
        toast.error('Resume upload failed. Submitting without it.');
      } else {
        setUploadProgress(70);
        const { data: { publicUrl } } = supabase.storage.from('resumes').getPublicUrl(uploadData.path);
        resumeUrl = publicUrl;
      }
    }

    setUploadProgress(90);

    const { error } = await supabase.from('job_applications').insert({
      job_id: job.id,
      job_title: job.title,
      name: form.name.trim(),
      email: form.email.trim().toLowerCase(),
      phone: form.phone.trim() ? digitsOnly(form.phone.trim()) : null,
      linkedin_url: form.linkedin_url.trim() || null,
      resume_url: resumeUrl,
      cover_note: form.cover_note.trim() || null,
      status: 'new',
    });

    setUploadProgress(100);
    setSubmitting(false);

    if (error) {
      toast.error('Submission failed. Please try again.');
    } else {
      setStage('success');
    }
  };

  const inputCls = (key) => `w-full px-3 py-2.5 text-sm border rounded-[6px] focus:outline-none focus:ring-2 focus:ring-[#C9A84C] bg-white ${errors[key] && touched[key] ? 'border-red-400 bg-red-50' : 'border-[#E2E8F0]'}`;
  const errMsg = (key) => errors[key] && touched[key] && (
    <p className="text-xs text-red-500 mt-1">{errors[key]}</p>
  );
  const labelCls = 'block text-xs font-semibold text-[#0A1628] mb-1';

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white h-full w-full max-w-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#E2E8F0] bg-white sticky top-0 z-10">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              {job.is_featured && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold mb-1.5"
                  style={{ backgroundColor: '#FEF3C7', color: '#92400E' }}>
                  <Star size={9} /> Featured Role
                </span>
              )}
              <h2 className="text-xl font-bold text-[#0A1628] leading-tight">{job.title}</h2>
              <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-[#718096]">
                <span className="flex items-center gap-1"><Briefcase size={11} /> {job.department}</span>
                <span className="flex items-center gap-1"><MapPin size={11} /> {job.location}</span>
                <span className="flex items-center gap-1"><Clock size={11} /> {TYPE_LABEL[job.type] ?? job.type}</span>
                {job.experience && <span className="text-[#C9A84C] font-medium">{EXP_LABEL[job.experience] ?? job.experience}</span>}
              </div>
              {(job.salary_min || job.salary_max) && (
                <p className="mt-1.5 text-xs font-semibold text-green-700">
                  ₹{job.salary_min?.toLocaleString('en-IN') ?? '?'}
                  {job.salary_max ? ` – ₹${job.salary_max.toLocaleString('en-IN')}` : '+'}
                  /month
                </p>
              )}
            </div>
            <button onClick={onClose} className="p-2 rounded-md hover:bg-gray-100 shrink-0">
              <X size={20} className="text-[#718096]" />
            </button>
          </div>

          {/* Stage toggle */}
          {stage !== 'success' && (
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => setStage('detail')}
                className={`flex-1 py-2 text-sm font-semibold rounded-[6px] transition-colors ${stage === 'detail' ? 'bg-[#0A1628] text-white' : 'bg-[#F8F9FA] text-[#4A5568] hover:bg-gray-100'}`}
              >
                Job Details
              </button>
              <button
                onClick={() => setStage('apply')}
                className={`flex-1 py-2 text-sm font-semibold rounded-[6px] transition-colors ${stage === 'apply' ? 'bg-[#C9A84C] text-white' : 'bg-[#F8F9FA] text-[#4A5568] hover:bg-gray-100'}`}
              >
                Apply Now
              </button>
            </div>
          )}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {/* ── Success ── */}
          {stage === 'success' && (
            <div className="flex flex-col items-center justify-center h-full text-center py-16">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-5">
                <CheckCircle size={32} className="text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-[#0A1628] mb-2">Application Submitted!</h3>
              <p className="text-sm text-[#4A5568] max-w-xs leading-relaxed mb-6">
                Thank you for your interest in <span className="font-semibold">{job.title}</span>.
                We'll review your application and reach out if there's a match.
              </p>
              <button
                onClick={onClose}
                className="px-6 py-2.5 bg-[#0A1628] text-white text-sm font-semibold rounded-[6px] hover:bg-[#1A2E4A] transition-colors"
              >
                Close
              </button>
            </div>
          )}

          {/* ── Job Detail ── */}
          {stage === 'detail' && (
            <div className="space-y-6 pb-4">
              {job.description && (
                <div>
                  <h3 className="text-sm font-bold text-[#0A1628] mb-2">About the Role</h3>
                  <p className="text-sm text-[#4A5568] leading-relaxed whitespace-pre-wrap">{job.description}</p>
                </div>
              )}
              {job.responsibilities?.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold text-[#0A1628] mb-2">What You'll Do</h3>
                  <ul className="space-y-2">
                    {job.responsibilities.map((r, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-[#4A5568]">
                        <ChevronRight size={14} className="text-[#C9A84C] mt-0.5 shrink-0" />
                        {r}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {job.requirements?.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold text-[#0A1628] mb-2">What We're Looking For</h3>
                  <ul className="space-y-2">
                    {job.requirements.map((r, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-[#4A5568]">
                        <ChevronRight size={14} className="text-[#C9A84C] mt-0.5 shrink-0" />
                        {r}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {job.deadline && (
                <p className="text-xs text-orange-600 font-medium">
                  ⏳ Application deadline: {new Date(job.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              )}
              <Button variant="primary" size="md" className="w-full" onClick={() => setStage('apply')}>
                Apply for This Role <ArrowRight size={15} />
              </Button>
            </div>
          )}

          {/* ── Apply Form ── */}
          {stage === 'apply' && (
            <form onSubmit={handleSubmit} noValidate className="space-y-4 pb-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 sm:col-span-1">
                  <label className={labelCls}>Full Name *</label>
                  <input type="text" value={form.name}
                    onChange={(e) => setField('name', e.target.value)}
                    onBlur={() => handleBlur('name')}
                    placeholder="Your full name"
                    className={inputCls('name')} />
                  {errMsg('name')}
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className={labelCls}>Email Address *</label>
                  <input type="email" value={form.email}
                    onChange={(e) => setField('email', e.target.value)}
                    onBlur={() => handleBlur('email')}
                    placeholder="you@example.com"
                    className={inputCls('email')} />
                  {errMsg('email')}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Phone Number</label>
                  <input type="tel" value={form.phone}
                    onChange={(e) => setField('phone', e.target.value)}
                    onBlur={() => handleBlur('phone')}
                    placeholder="+91 XXXXX XXXXX"
                    className={inputCls('phone')} />
                  {errMsg('phone')}
                </div>
                <div>
                  <label className={labelCls}>LinkedIn Profile</label>
                  <input type="text" value={form.linkedin_url}
                    onChange={(e) => setField('linkedin_url', e.target.value)}
                    onBlur={() => handleBlur('linkedin_url')}
                    placeholder="https://linkedin.com/in/..."
                    className={inputCls('linkedin_url')} />
                  {errMsg('linkedin_url')}
                </div>
              </div>

              {/* Resume upload */}
              <div>
                <label className={labelCls}>Resume / CV</label>
                <label className={`flex flex-col items-center justify-center w-full h-28 border-2 border-dashed rounded-[6px] cursor-pointer transition-colors ${errors.resume ? 'border-red-400 bg-red-50' : 'border-[#E2E8F0] hover:border-[#C9A84C] hover:bg-[#FFFFF0]'}`}>
                  <input
                    type="file"
                    accept=".pdf,application/pdf"
                    className="hidden"
                    onChange={(e) => handleResumeChange(e.target.files?.[0] ?? null)}
                  />
                  {resumeFile && !errors.resume ? (
                    <div className="text-center">
                      <CheckCircle size={20} className="mx-auto text-green-500 mb-1" />
                      <p className="text-sm font-medium text-[#0A1628]">{resumeFile.name}</p>
                      <p className="text-xs text-[#718096]">{(resumeFile.size / 1024).toFixed(0)} KB · PDF</p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <Upload size={20} className={`mx-auto mb-1 ${errors.resume ? 'text-red-400' : 'text-[#718096]'}`} />
                      <p className={`text-sm font-medium ${errors.resume ? 'text-red-500' : 'text-[#0A1628]'}`}>
                        {resumeFile ? resumeFile.name : 'Upload Resume'}
                      </p>
                      <p className="text-xs text-[#718096]">PDF only — max 5 MB</p>
                    </div>
                  )}
                </label>
                {errors.resume && (
                  <p className="text-xs text-red-500 mt-1">{errors.resume}</p>
                )}
              </div>

              {/* Cover note */}
              <div>
                <label className={labelCls}>Cover Note</label>
                <textarea
                  rows={5}
                  value={form.cover_note}
                  onChange={(e) => setField('cover_note', e.target.value)}
                  placeholder="Tell us why you'd be a great fit for this role..."
                  className={`${inputCls('cover_note')} resize-none`}
                />
              </div>

              {/* Progress bar */}
              {submitting && uploadProgress > 0 && uploadProgress < 100 && (
                <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#C9A84C] rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 text-sm font-semibold rounded-[6px] text-white bg-[#0A1628] hover:bg-[#1A2E4A] disabled:opacity-60 transition-colors"
              >
                {submitting ? 'Submitting...' : 'Submit Application'}
              </button>
              <p className="text-xs text-[#718096] text-center">
                By submitting, you agree that USJ Technologies may store your information for hiring purposes.
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Job Card ──────────────────────────────────────────────────
function JobCard({ job, onApply }) {
  const typeStyle = TYPE_COLOR[job.type] ?? { bg: '#EBF4FF', text: '#1A3A5C' };

  return (
    <div
      className="bg-white rounded-[8px] border border-[#E2E8F0] p-5 hover:border-[#C9A84C] hover:shadow-sm transition-all cursor-pointer"
      onClick={() => onApply(job)}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            {job.is_featured && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1"
                style={{ backgroundColor: '#FEF3C7', color: '#92400E' }}>
                <Star size={9} /> Featured
              </span>
            )}
            <span
              className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold"
              style={{ backgroundColor: typeStyle.bg, color: typeStyle.text }}
            >
              {TYPE_LABEL[job.type] ?? job.type}
            </span>
          </div>

          <h3 className="font-bold text-[#0A1628] text-[15px] leading-snug mb-2">{job.title}</h3>

          <div className="flex flex-wrap items-center gap-3 text-xs text-[#718096]">
            <span className="flex items-center gap-1"><Briefcase size={10} /> {job.department}</span>
            <span className="flex items-center gap-1"><MapPin size={10} /> {job.location}</span>
            {job.experience && <span className="text-[#4A5568]">{EXP_LABEL[job.experience] ?? job.experience}</span>}
            {job.deadline && (
              <span className="text-orange-500 font-medium">
                Deadline: {new Date(job.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
              </span>
            )}
          </div>

          {job.description && (
            <p className="text-sm text-[#4A5568] mt-2.5 line-clamp-2 leading-relaxed">{job.description}</p>
          )}

          {(job.salary_min || job.salary_max) && (
            <p className="mt-2 text-xs font-semibold text-green-700">
              ₹{job.salary_min?.toLocaleString('en-IN') ?? '?'}
              {job.salary_max ? ` – ₹${job.salary_max.toLocaleString('en-IN')}` : '+'}
              /month
            </p>
          )}
        </div>

        <button
          className="shrink-0 flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-[6px] border border-[#0A1628] text-[#0A1628] hover:bg-[#0A1628] hover:text-white transition-colors"
          onClick={(e) => { e.stopPropagation(); onApply(job); }}
        >
          Apply <ArrowRight size={12} />
        </button>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────
export default function CareersPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState(null);
  const [filterDept, setFilterDept] = useState('All');
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    supabase
      .from('job_postings')
      .select('*')
      .eq('is_active', true)
      .order('is_featured', { ascending: false })
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (error) toast.error('Failed to load jobs');
        else setJobs(data ?? []);
        setLoading(false);
      });
  }, []);

  // Unique departments from loaded jobs
  const departments = ['All', ...Array.from(new Set(jobs.map((j) => j.department))).sort()];

  const filtered = jobs.filter((j) => {
    const deptMatch = filterDept === 'All' || j.department === filterDept;
    const typeMatch = filterType === 'all' || j.type === filterType;
    return deptMatch && typeMatch;
  });

  const activeCount = jobs.length;

  const careersStructuredData = useMemo(() => {
    if (!jobs.length) return undefined;

    return {
      '@context': 'https://schema.org',
      '@graph': jobs.map((job) => ({
        '@type': 'JobPosting',
        'title': job.title,
        'description': job.description,
        ...(job.created_at ? { 'datePosted': job.created_at.split('T')[0] } : {}),
        'hiringOrganization': {
          '@type': 'Organization',
          'name': 'USJ Technologies (OPC) Pvt Ltd',
          'sameAs': SITE_URL,
          'logo': `${SITE_URL}/favicon.svg`,
        },
        'jobLocation': {
          '@type': 'Place',
          'address': {
            '@type': 'PostalAddress',
            'addressLocality': job.location || 'Dehradun',
            'addressRegion': 'Uttarakhand',
            'addressCountry': 'IN',
          },
        },
        'employmentType': EMPLOYMENT_TYPE_MAP[job.type] ?? 'FULL_TIME',
        ...(job.salary_min || job.salary_max
          ? {
              'baseSalary': {
                '@type': 'MonetaryAmount',
                'currency': 'INR',
                'value': {
                  '@type': 'QuantitativeValue',
                  ...(job.salary_min ? { 'minValue': job.salary_min } : {}),
                  ...(job.salary_max ? { 'maxValue': job.salary_max } : {}),
                  'unitText': 'MONTH',
                },
              },
            }
          : {}),
        'url': `${SITE_URL}/careers`,
        'directApply': true,
      })),
    };
  }, [jobs]);

  return (
    <>
      <SEOHead
        title="Careers – Join Our Team in Dehradun"
        description={`Join USJ Technologies in Dehradun, Uttarakhand. ${activeCount > 0 ? `${activeCount} open position${activeCount !== 1 ? 's' : ''} across technology, sales, and operations.` : 'Explore opportunities at a Startup India certified IT company.'} Work with us to build government and defence technology solutions.`}
        keywords="jobs in Dehradun, IT jobs Uttarakhand, technology jobs Dehradun, career IT company Uttarakhand, hiring Dehradun startup, USJ Technologies careers, government technology jobs North India, software engineer Dehradun, sales executive Dehradun"
        canonical="/careers"
        structuredData={careersStructuredData}
      />

      <div>
        {/* Hero */}
        <section className="section-py" style={{ backgroundColor: '#0A1628' }}>
          <div className="container-max">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#C9A84C] mb-3">
              {activeCount > 0 ? `${activeCount} Open Position${activeCount !== 1 ? 's' : ''}` : "We're Hiring"}
            </p>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-5">Build India's Future<br />With Us</h1>
            <p className="text-lg text-[#A0AEC0] max-w-xl leading-relaxed">
              Join a fast-growing technology company delivering digital solutions to government, defence,
              and commercial clients across India — from Dehradun.
            </p>
          </div>
        </section>

        {/* Culture Values */}
        <section className="section-py bg-white">
          <div className="container-max">
            <SectionHeader
              label="WHY USJ"
              title="Life at USJ Technologies"
              subtitle="A place where your work matters, your ideas are heard, and your growth is our priority."
            />
            <img
              src="/Generated/careers/cul.png"
              alt="USJ Technologies team collaborating in the office"
              loading="lazy"
              className="w-full h-64 object-cover rounded-2xl mb-10"
              style={{ boxShadow: '0 16px 40px rgba(10,22,40,0.15)' }}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {cultureValues.map(({ icon: Icon, title, description }) => (
                <Card key={title} className="p-5" hover>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ backgroundColor: '#EBF4FF' }}>
                    <Icon size={18} className="text-[#0A1628]" />
                  </div>
                  <h3 className="font-bold text-[#0A1628] mb-1.5 text-sm">{title}</h3>
                  <p className="text-sm text-[#4A5568] leading-relaxed">{description}</p>
                </Card>
              ))}
            </div>

            {/* Perks */}
            <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-4">
              {perks.map(({ icon: Icon, label, sub }) => (
                <div key={label} className="flex items-start gap-3 p-4 bg-[#F8F9FA] rounded-[8px]">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: '#C9A84C20' }}>
                    <Icon size={16} className="text-[#C9A84C]" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#0A1628]">{label}</p>
                    <p className="text-xs text-[#718096] mt-0.5">{sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Open Positions */}
        <section className="section-py" style={{ backgroundColor: '#F8F9FA' }}>
          <div className="container-max">
            <SectionHeader
              label="OPEN POSITIONS"
              title="Current Openings"
              subtitle="Find a role that matches your skills and ambition."
            />

            {/* Filters */}
            {!loading && jobs.length > 0 && (
              <div className="mb-6 flex flex-wrap gap-3 items-center">
                {/* Department pills */}
                <div className="flex flex-wrap gap-2">
                  {departments.map((d) => (
                    <button
                      key={d}
                      onClick={() => setFilterDept(d)}
                      className="px-3 py-1.5 text-xs font-semibold rounded-full border transition-colors"
                      style={{
                        borderColor: filterDept === d ? '#0A1628' : '#E2E8F0',
                        backgroundColor: filterDept === d ? '#0A1628' : 'transparent',
                        color: filterDept === d ? '#ffffff' : '#4A5568',
                      }}
                    >
                      {d}
                    </button>
                  ))}
                </div>

                {/* Type filter */}
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="ml-auto text-sm border border-[#E2E8F0] rounded-[6px] px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#C9A84C] bg-white"
                >
                  <option value="all">All Types</option>
                  {Object.entries(TYPE_LABEL).map(([val, label]) => (
                    <option key={val} value={val}>{label}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Job list */}
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-32 rounded-[8px] bg-white border border-[#E2E8F0] animate-pulse" />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-[8px] border border-[#E2E8F0]">
                <Briefcase size={40} className="mx-auto text-gray-300 mb-3" />
                {jobs.length === 0 ? (
                  <>
                    <h3 className="font-semibold text-[#0A1628] mb-1">No openings right now</h3>
                    <p className="text-sm text-[#718096]">
                      We don't have active roles at the moment, but we're always looking for great people.
                    </p>
                  </>
                ) : (
                  <>
                    <h3 className="font-semibold text-[#0A1628] mb-1">No roles match your filters</h3>
                    <button onClick={() => { setFilterDept('All'); setFilterType('all'); }}
                      className="mt-2 text-sm text-[#C9A84C] hover:underline">
                      Clear filters
                    </button>
                  </>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {filtered.map((job) => (
                  <JobCard key={job.id} job={job} onApply={setSelectedJob} />
                ))}
              </div>
            )}

            {/* Speculative application */}
            <div className="mt-8 text-center">
              <p className="text-sm text-[#718096]">
                Don't see a role that fits?{' '}
                <a
                  href={`mailto:${APP_CONFIG.company.email}?subject=Speculative Application – USJ Technologies`}
                  className="text-[#C9A84C] font-semibold hover:underline"
                >
                  Send us your resume anyway
                </a>{' '}
                — we're always interested in talented people.
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* Job detail + apply drawer */}
      {selectedJob && (
        <JobDrawer job={selectedJob} onClose={() => setSelectedJob(null)} />
      )}
    </>
  );
}
