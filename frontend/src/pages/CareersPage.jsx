import { useState } from 'react';
import { MapPin, Zap, Users, Heart, Laptop, TrendingUp, Send, Briefcase, X } from 'lucide-react';
import SectionHeader from '../components/ui/SectionHeader';
import Card from '../components/ui/Card';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';
import { APP_CONFIG, ROUTES } from '../config/app';

const cultureValues = [
  { icon: Zap, title: 'Innovation First', description: 'We encourage bold ideas and give you the space to experiment, learn, and build.' },
  { icon: Users, title: 'Team Over Ego', description: 'Collaboration is at the heart of everything we do. We win together.' },
  { icon: Heart, title: 'Purpose-Driven', description: 'Every role at USJ contributes to India\'s technology progress — your work matters.' },
  { icon: TrendingUp, title: 'Growth Mindset', description: 'We invest in our people. Learning, mentorship, and career growth are non-negotiable.' },
];

const openings = [
  {
    id: 'swe-1',
    title: 'Software Engineer (React / Node.js)',
    department: 'Technology',
    location: 'Dehradun',
    type: 'Full-time',
    description: 'Build and maintain our digital platforms, e-commerce systems, and internal tools. Strong React.js and Node.js skills required.',
  },
  {
    id: 'sales-1',
    title: 'Sales Executive — Government Accounts',
    department: 'Sales',
    location: 'Dehradun',
    type: 'Full-time',
    description: 'Drive government and institutional sales. Experience with GeM marketplace and government procurement preferred.',
  },
  {
    id: 'ops-1',
    title: 'Operations & Logistics Executive',
    department: 'Operations',
    location: 'Dehradun',
    type: 'Full-time',
    description: 'Manage product procurement, inventory, and delivery logistics for government and commercial orders.',
  },
  {
    id: 'intern-1',
    title: 'Business Development Intern',
    department: 'Business Development',
    location: 'Dehradun',
    type: 'Internship (6 months)',
    description: 'Support the BD team in identifying opportunities, preparing proposals, and managing client relationships.',
  },
];

export default function CareersPage() {
  const [selectedJob, setSelectedJob] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', linkedin: '', coverNote: '' });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleApply = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 1200));
    setSubmitting(false);
    setSuccess(true);
  };

  return (
    <div>
      {/* Hero */}
      <section className="section-py" style={{ backgroundColor: '#0A1628' }}>
        <div className="container-max">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#C9A84C] mb-3">We're Hiring</p>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-5">Join Our Team</h1>
          <p className="text-lg text-[#A0AEC0] max-w-xl leading-relaxed">
            Be part of a fast-growing technology company building India's future. We're looking for passionate, driven individuals.
          </p>
        </div>
      </section>

      {/* Culture */}
      <section className="section-py bg-white">
        <div className="container-max">
          <SectionHeader
            label="WHY USJ"
            title="Life at USJ Technologies"
            subtitle="A place where your work matters, your ideas are heard, and your growth is our priority."
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
        </div>
      </section>

      {/* Openings */}
      <section className="section-py" style={{ backgroundColor: '#F8F9FA' }}>
        <div className="container-max">
          <SectionHeader
            label="OPEN POSITIONS"
            title="Current Openings"
            subtitle="We have exciting roles across technology, sales, and operations."
          />
          <div className="space-y-4">
            {openings.map((job) => (
              <Card key={job.id} className="p-5" hover>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-bold text-[#0A1628] mb-1">{job.title}</h3>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-[#718096] mb-2">
                      <span className="flex items-center gap-1"><Briefcase size={11} /> {job.department}</span>
                      <span className="flex items-center gap-1"><MapPin size={11} /> {job.location}</span>
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ backgroundColor: '#EBF4FF', color: '#1A3A5C' }}>{job.type}</span>
                    </div>
                    <p className="text-sm text-[#4A5568]">{job.description}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="primary"
                    className="shrink-0"
                    onClick={() => { setSelectedJob(job); setSuccess(false); setFormData({ name:'', email:'', phone:'', linkedin:'', coverNote:'' }); }}
                  >
                    Apply Now
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          <p className="text-sm text-[#718096] mt-6 text-center">
            Don't see a role that fits? Send your resume to{' '}
            <a href={`mailto:${APP_CONFIG.company.email}`} className="text-[#C9A84C] hover:underline">
              {APP_CONFIG.company.email}
            </a>
          </p>
        </div>
      </section>

      {/* Application Modal */}
      <Modal
        isOpen={!!selectedJob}
        onClose={() => setSelectedJob(null)}
        title={`Apply — ${selectedJob?.title}`}
        size="md"
      >
        {success ? (
          <div className="text-center py-8">
            <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <Send size={24} className="text-green-600" />
            </div>
            <h3 className="font-bold text-[#0A1628] mb-2">Application Submitted!</h3>
            <p className="text-sm text-[#4A5568]">Thank you for your interest. We'll review your application and get back to you soon.</p>
          </div>
        ) : (
          <form onSubmit={handleApply} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="apply-name" className="block text-xs font-semibold text-[#0A1628] mb-1">Full Name *</label>
                <input id="apply-name" type="text" required value={formData.name}
                  onChange={(e) => setFormData((f) => ({ ...f, name: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-[#E2E8F0] rounded-[6px] focus:outline-none focus:ring-2 focus:ring-[#C9A84C]" />
              </div>
              <div>
                <label htmlFor="apply-email" className="block text-xs font-semibold text-[#0A1628] mb-1">Email *</label>
                <input id="apply-email" type="email" required value={formData.email}
                  onChange={(e) => setFormData((f) => ({ ...f, email: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-[#E2E8F0] rounded-[6px] focus:outline-none focus:ring-2 focus:ring-[#C9A84C]" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="apply-phone" className="block text-xs font-semibold text-[#0A1628] mb-1">Phone</label>
                <input id="apply-phone" type="tel" value={formData.phone}
                  onChange={(e) => setFormData((f) => ({ ...f, phone: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-[#E2E8F0] rounded-[6px] focus:outline-none focus:ring-2 focus:ring-[#C9A84C]" />
              </div>
              <div>
                <label htmlFor="apply-linkedin" className="block text-xs font-semibold text-[#0A1628] mb-1">LinkedIn URL</label>
                <input id="apply-linkedin" type="url" value={formData.linkedin}
                  onChange={(e) => setFormData((f) => ({ ...f, linkedin: e.target.value }))}
                  placeholder="https://linkedin.com/in/..."
                  className="w-full px-3 py-2 text-sm border border-[#E2E8F0] rounded-[6px] focus:outline-none focus:ring-2 focus:ring-[#C9A84C]" />
              </div>
            </div>
            <div>
              <label htmlFor="apply-position" className="block text-xs font-semibold text-[#0A1628] mb-1">Position</label>
              <input id="apply-position" type="text" value={selectedJob?.title} readOnly
                className="w-full px-3 py-2 text-sm border border-[#E2E8F0] rounded-[6px] bg-[#F8F9FA] text-[#718096]" />
            </div>
            <div>
              <label htmlFor="apply-resume" className="block text-xs font-semibold text-[#0A1628] mb-1">Resume</label>
              <input id="apply-resume" type="file" accept=".pdf,.doc,.docx"
                className="w-full text-sm text-[#4A5568] file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-[#0A1628] file:text-white" />
            </div>
            <div>
              <label htmlFor="apply-cover" className="block text-xs font-semibold text-[#0A1628] mb-1">Cover Note</label>
              <textarea id="apply-cover" rows={4} value={formData.coverNote}
                onChange={(e) => setFormData((f) => ({ ...f, coverNote: e.target.value }))}
                placeholder="Tell us why you'd be a great fit..."
                className="w-full px-3 py-2 text-sm border border-[#E2E8F0] rounded-[6px] focus:outline-none focus:ring-2 focus:ring-[#C9A84C] resize-none" />
            </div>
            <Button type="submit" variant="primary" size="md" isLoading={submitting} className="w-full">
              Submit Application
            </Button>
          </form>
        )}
      </Modal>
    </div>
  );
}
