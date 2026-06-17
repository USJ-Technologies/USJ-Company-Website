import { useState } from 'react';
import { MapPin, Mail, Phone, Linkedin, Twitter, Instagram, Clock, CheckCircle, Send } from 'lucide-react';
import SEOHead from '../components/seo/SEOHead';
import SectionHeader from '../components/ui/SectionHeader';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { APP_CONFIG } from '../config/app';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

const inquiryTypes = ['General Inquiry', 'Request Quote', 'Partnership', 'GeM Order', 'Other'];

const initialForm = {
  fullName: '',
  email: '',
  phone: '',
  organization: '',
  type: 'General Inquiry',
  subject: '',
  message: '',
};

export default function ContactPage() {
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const { company } = APP_CONFIG;

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const id = crypto.randomUUID();
    const reference_number = `USJ-${Date.now().toString(36).toUpperCase()}`;
    const { error } = await supabase.from('quote_requests').insert({
      id,
      reference_number,
      status: 'new',
      name: form.fullName,
      email: form.email,
      phone: form.phone || null,
      organization: form.organization || null,
      message: `[${form.type}] ${form.subject ? form.subject + ': ' : ''}${form.message}`,
    });
    setSubmitting(false);
    if (error) {
      toast.error('Failed to send message. Please email us directly.');
    } else {
      setSuccess(true);
      setForm(initialForm);
    }
  };

  return (
    <>
      <SEOHead
        title="Contact Us – Get a Quote or Partner With Us"
        description="Contact USJ Technologies in Dehradun for product quotes, GeM orders, tender inquiries, partnership proposals, or IT consultations. Call +91-7500502563 or email techteam@usjtechnologies.com."
        keywords="contact IT company Dehradun, get quote electronics Uttarakhand, tender inquiry Dehradun, GeM order contact, partner with USJ Technologies, business inquiry Uttarakhand, IT consultation Dehradun, quote request networking products"
        canonical="/contact"
        structuredData={{
          '@context': 'https://schema.org',
          '@type': 'ContactPage',
          'url': 'https://usjtechnologies.com/contact',
          'name': 'Contact USJ Technologies',
          'description': 'Contact USJ Technologies for quotes, GeM orders, tenders, and partnerships.',
          'mainEntity': { '@id': 'https://usjtechnologies.com/#organization' },
        }}
      />
      <div>
      {/* Hero */}
      <section className="section-py hero-pattern">
        <div className="container-max">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#C9A84C] mb-3">Contact</p>
          <h1 className="text-4xl md:text-5xl font-bold text-[#0A1628] mb-5">Get in Touch</h1>
          <p className="text-lg text-[#4A5568] max-w-xl leading-relaxed">
            Have a project in mind, need a quotation, or want to explore partnership opportunities? We'd love to hear from you.
          </p>
        </div>
      </section>

      {/* Main content */}
      <section className="section-py bg-white">
        <div className="container-max">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
            {/* Left: Contact Info */}
            <div className="lg:col-span-2 space-y-5">
              <Card className="p-5" hover={false}>
                <h3 className="font-bold text-[#0A1628] mb-4 text-sm uppercase tracking-wide">Contact Details</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-3">
                    <MapPin size={16} className="mt-0.5 shrink-0 text-[#C9A84C]" />
                    <div>
                      <p className="font-medium text-[#0A1628]">Office Address</p>
                      <p className="text-[#4A5568]">{company.address}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Mail size={16} className="mt-0.5 shrink-0 text-[#C9A84C]" />
                    <div>
                      <p className="font-medium text-[#0A1628]">Email</p>
                      <a href={`mailto:${company.email}`} className="text-[#4A5568] hover:text-[#C9A84C]">
                        {company.email}
                      </a>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Phone size={16} className="mt-0.5 shrink-0 text-[#C9A84C]" />
                    <div>
                      <p className="font-medium text-[#0A1628]">Phone</p>
                      <a href={`tel:${company.phone}`} className="text-[#4A5568] hover:text-[#C9A84C]">
                        {company.phone}
                      </a>
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="p-5" hover={false}>
                <h3 className="font-bold text-[#0A1628] mb-4 text-sm uppercase tracking-wide flex items-center gap-2">
                  <Clock size={14} /> Working Hours
                </h3>
                <div className="space-y-1.5 text-sm text-[#4A5568]">
                  <p>Monday – Friday: <span className="font-medium text-[#0A1628]">9:00 AM – 6:00 PM</span></p>
                  <p>Saturday: <span className="font-medium text-[#0A1628]">10:00 AM – 2:00 PM</span></p>
                  <p>Sunday: <span className="text-[#718096]">Closed</span></p>
                  <p className="mt-2 text-xs text-[#718096]">Typical response time: <span className="font-medium">Within 24 hours</span></p>
                </div>
              </Card>

              {/* Map placeholder */}
              <Card className="overflow-hidden" hover={false}>
                <div className="bg-gray-100 h-40 flex flex-col items-center justify-center gap-2">
                  <MapPin size={28} className="text-[#C9A84C]" />
                  <p className="text-sm font-medium text-[#0A1628]">Dehradun, Uttarakhand</p>
                  <p className="text-xs text-[#718096]">{company.address}</p>
                </div>
              </Card>

              {/* Social */}
              <div>
                <p className="text-xs font-semibold text-[#0A1628] uppercase tracking-wide mb-3">Follow Us</p>
                <div className="flex gap-2">
                  {company.social.linkedin && (
                    <a href={company.social.linkedin} target="_blank" rel="noopener noreferrer"
                      className="p-2.5 rounded-md border border-[#E2E8F0] text-[#4A5568] hover:text-[#0A1628] hover:border-[#0A1628] transition-colors"
                      aria-label="LinkedIn">
                      <Linkedin size={16} />
                    </a>
                  )}
                  {company.social.twitter && (
                    <a href={company.social.twitter} target="_blank" rel="noopener noreferrer"
                      className="p-2.5 rounded-md border border-[#E2E8F0] text-[#4A5568] hover:text-[#0A1628] hover:border-[#0A1628] transition-colors"
                      aria-label="Twitter">
                      <Twitter size={16} />
                    </a>
                  )}
                  {company.social.instagram && (
                    <a href={company.social.instagram} target="_blank" rel="noopener noreferrer"
                      className="p-2.5 rounded-md border border-[#E2E8F0] text-[#4A5568] hover:text-[#0A1628] hover:border-[#0A1628] transition-colors"
                      aria-label="Instagram">
                      <Instagram size={16} />
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Right: Contact Form */}
            <div className="lg:col-span-3">
              <Card className="p-6" hover={false}>
                {success ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                      <CheckCircle size={28} className="text-green-600" />
                    </div>
                    <h3 className="text-xl font-bold text-[#0A1628] mb-2">Message Sent!</h3>
                    <p className="text-[#4A5568] mb-5">Thank you for reaching out. We'll get back to you within 24 hours.</p>
                    <Button variant="primary" onClick={() => setSuccess(false)}>Send Another Message</Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <h2 className="text-lg font-bold text-[#0A1628] mb-5">Send Us a Message</h2>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="contact-name" className="block text-xs font-semibold text-[#0A1628] mb-1">Full Name *</label>
                        <input id="contact-name" name="fullName" type="text" required value={form.fullName}
                          onChange={handleChange}
                          className="w-full px-3 py-2 text-sm border border-[#E2E8F0] rounded-[6px] focus:outline-none focus:ring-2 focus:ring-[#C9A84C]" />
                      </div>
                      <div>
                        <label htmlFor="contact-email" className="block text-xs font-semibold text-[#0A1628] mb-1">Email *</label>
                        <input id="contact-email" name="email" type="email" required value={form.email}
                          onChange={handleChange}
                          className="w-full px-3 py-2 text-sm border border-[#E2E8F0] rounded-[6px] focus:outline-none focus:ring-2 focus:ring-[#C9A84C]" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="contact-phone" className="block text-xs font-semibold text-[#0A1628] mb-1">Phone</label>
                        <input id="contact-phone" name="phone" type="tel" value={form.phone}
                          onChange={handleChange}
                          className="w-full px-3 py-2 text-sm border border-[#E2E8F0] rounded-[6px] focus:outline-none focus:ring-2 focus:ring-[#C9A84C]" />
                      </div>
                      <div>
                        <label htmlFor="contact-org" className="block text-xs font-semibold text-[#0A1628] mb-1">Organization</label>
                        <input id="contact-org" name="organization" type="text" value={form.organization}
                          onChange={handleChange}
                          className="w-full px-3 py-2 text-sm border border-[#E2E8F0] rounded-[6px] focus:outline-none focus:ring-2 focus:ring-[#C9A84C]" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="contact-type" className="block text-xs font-semibold text-[#0A1628] mb-1">Inquiry Type</label>
                        <select id="contact-type" name="type" value={form.type} onChange={handleChange}
                          className="w-full px-3 py-2 text-sm border border-[#E2E8F0] rounded-[6px] focus:outline-none focus:ring-2 focus:ring-[#C9A84C] bg-white">
                          {inquiryTypes.map((t) => <option key={t}>{t}</option>)}
                        </select>
                      </div>
                      <div>
                        <label htmlFor="contact-subject" className="block text-xs font-semibold text-[#0A1628] mb-1">Subject *</label>
                        <input id="contact-subject" name="subject" type="text" required value={form.subject}
                          onChange={handleChange}
                          className="w-full px-3 py-2 text-sm border border-[#E2E8F0] rounded-[6px] focus:outline-none focus:ring-2 focus:ring-[#C9A84C]" />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="contact-message" className="block text-xs font-semibold text-[#0A1628] mb-1">Message *</label>
                      <textarea id="contact-message" name="message" rows={5} required value={form.message}
                        onChange={handleChange}
                        placeholder="Tell us about your requirement, project, or inquiry..."
                        className="w-full px-3 py-2 text-sm border border-[#E2E8F0] rounded-[6px] focus:outline-none focus:ring-2 focus:ring-[#C9A84C] resize-none" />
                    </div>

                    <Button
                      type="submit"
                      variant="primary"
                      size="lg"
                      isLoading={submitting}
                      leftIcon={<Send size={16} />}
                      className="w-full"
                    >
                      Send Message
                    </Button>
                  </form>
                )}
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
    </>
  );
}
