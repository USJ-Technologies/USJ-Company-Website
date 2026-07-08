import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Target, Eye, Zap, Shield, Star, Linkedin } from 'lucide-react';
import SEOHead from '../components/seo/SEOHead';
import SectionHeader from '../components/ui/SectionHeader';
import Card from '../components/ui/Card';
import { APP_CONFIG, ROUTES } from '../config/app';
import { supabase } from '../lib/supabase';
import { isSafeExternalUrl } from '../lib/url';

const values = [
  { icon: Zap, title: 'Innovation', description: 'We embrace emerging technologies to deliver modern, efficient solutions that keep our clients ahead of the curve.' },
  { icon: Shield, title: 'Trust', description: 'Every engagement is built on honesty, transparency, and a commitment to doing what we say we will do.' },
  { icon: Star, title: 'Quality', description: 'We maintain the highest standards in our products and services — no shortcuts, no compromises.' },
  { icon: Target, title: 'Nation-First', description: "Our work is anchored in contributing to India's growth through smart government procurement and technology deployment." },
];

const team = [
  { name: 'Ujjwal Singh Jeena', role: 'Founder & CEO', initials: 'USJ', bio: 'Visionary entrepreneur with expertise in government procurement, technology integration, and startup building.', image_url: '/Generated/about/team-headshot.webp' },
  { name: 'Technology Lead', role: 'CTO & Head of Products', initials: 'TL', bio: 'Engineering excellence with deep expertise in electronics, networking systems, and defence-grade technologies.', image_url: '/Generated/about/team-headshot.webp' },
  { name: 'Operations Lead', role: 'Head of Operations & GeM', initials: 'OL', bio: 'Specialist in government e-marketplace, tender management, and compliance frameworks across India.', image_url: '/Generated/about/team-headshot.webp' },
];

const milestones = [
  { year: '2023', title: 'Company Founded', description: 'USJ Technologies Pvt Ltd incorporated in Dehradun, Uttarakhand.' },
  { year: '2024 Q1', title: 'Startup India Recognition', description: 'Received DPIIT recognition under the Startup India initiative.' },
  { year: '2024 Q1', title: 'GeM Registration', description: 'Successfully registered as a seller on the Government e-Marketplace.' },
  { year: '2024 Q2', title: 'MSME / Udyam Registered', description: 'Registered under Ministry of MSME\'s Udyam portal.' },
  { year: '2024 Q3', title: 'First Government Projects', description: 'Delivered first set of government technology projects across Uttarakhand.' },
  { year: '2025', title: 'Venture Expansion', description: 'Launched Bail & Beyond Law Chambers and initiated Chalo Kumbh platform.' },
];

const stats = [
  { value: APP_CONFIG.stats.projects, label: 'Projects Delivered' },
  { value: APP_CONFIG.stats.clients, label: 'Government Clients' },
  { value: APP_CONFIG.stats.products, label: 'Products' },
  { value: APP_CONFIG.stats.states, label: 'States Served' },
];

export default function AboutPage() {
  const [teamMembers, setTeamMembers] = useState(team);

  useEffect(() => {
    supabase
      .from('team_members')
      .select('*')
      .eq('is_active', true)
      .order('display_order')
      .then(({ data }) => {
        if (data?.length > 0) setTeamMembers(data);
      });
  }, []);

  return (
    <>
      <SEOHead
        title="About Us"
        description="USJ Technologies (OPC) Pvt Ltd – founded by Ujjwal Singh Jeena in Dehradun. Leading IT company in Uttarakhand, GeM registered, Startup India certified. Government & defence electronics supplier, networking solutions, and B2B technology services across North India."
        keywords="USJ Technologies about, Ujjwal Singh Jeena, IT company founder Dehradun, technology startup Uttarakhand, GeM seller about, government electronics company Uttarakhand, Startup India Dehradun, defence technology company North India"
        canonical="/about"
        structuredData={{
          '@context': 'https://schema.org',
          '@type': 'AboutPage',
          'url': 'https://usjtechnologies.com/about',
          'name': 'About USJ Technologies – IT Company Dehradun',
          'description': 'USJ Technologies is a Dehradun-based IT company founded by Ujjwal Singh Jeena. GeM registered, Startup India certified electronics supplier serving government, defence, and commercial clients across India.',
          'mainEntity': { '@id': 'https://usjtechnologies.com/#organization' },
        }}
      />
      <div>
      {/* Hero */}
      <section className="section-py hero-pattern">
        <div className="container-max">
          <div className="max-w-2xl fade-up">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#C9A84C] mb-3">About Us</p>
            <h1 className="text-4xl md:text-5xl font-bold text-[#0A1628] mb-5 leading-tight">
              About USJ Technologies
            </h1>
            <p className="text-lg text-[#4A5568] leading-relaxed mb-6">
              We are a Dehradun-based technology company on a mission to bridge the gap between cutting-edge technology and India's government, defence, and commercial sectors.
            </p>
            <div className="flex gap-3">
              <Link
                to={ROUTES.CONTACT}
                className="px-5 py-2.5 rounded-[6px] text-sm font-semibold text-white bg-[#0A1628] hover:bg-[#1A2E4A] transition-colors"
              >
                Get in Touch
              </Link>
              <Link
                to={ROUTES.SERVICES}
                className="px-5 py-2.5 rounded-[6px] text-sm font-semibold text-[#0A1628] border border-[#0A1628] hover:bg-[#0A1628] hover:text-white transition-colors"
              >
                Our Services
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="section-py bg-white">
        <div className="container-max">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <SectionHeader
                label="OUR STORY"
                title="From Dehradun to Serving India"
                subtitle=""
              />
              <img
                src="/Generated/about/story-office-cul.webp"
                alt="USJ Technologies team working in the office"
                loading="lazy"
                className="w-full h-56 object-cover rounded-2xl mb-6"
                style={{ boxShadow: '0 16px 40px rgba(10,22,40,0.15)' }}
              />
              <div className="space-y-4 text-[#4A5568] text-sm leading-relaxed">
                <p>
                  USJ Technologies Pvt Ltd was founded with a clear vision: to make premium technology accessible to India's government institutions, defence establishments, and growing businesses. Born in the foothills of the Himalayas, our roots in Dehradun keep us grounded even as our reach extends across the nation.
                </p>
                <p>
                  We recognized early on that government procurement needed a trusted technology partner — one that understood compliance, GeM regulations, and the unique demands of public sector projects. That's exactly what we became.
                </p>
                <p>
                  Today, USJ Technologies is a GeM-registered seller, Startup India certified, and MSME-recognized company delivering technology solutions, electronics products, and digital services that genuinely make a difference.
                </p>
              </div>
            </div>
            {/* Mission/Vision */}
            <div className="space-y-4">
              <Card className="p-5" hover={false}>
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: '#EBF4FF' }}>
                    <Target size={17} className="text-[#0A1628]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#0A1628] mb-1">Our Mission</h3>
                    <p className="text-sm text-[#4A5568] leading-relaxed">
                      To deliver reliable, compliant, and impactful technology solutions that empower India's government and commercial sectors to perform at their best.
                    </p>
                  </div>
                </div>
              </Card>
              <Card className="p-5" hover={false}>
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: '#FFF3CD' }}>
                    <Eye size={17} className="text-[#C9A84C]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#0A1628] mb-1">Our Vision</h3>
                    <p className="text-sm text-[#4A5568] leading-relaxed">
                      To become India's most trusted technology partner for government and defence procurement — known for quality, integrity, and nation-first values.
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="section-py" style={{ backgroundColor: '#F8F9FA' }}>
        <div className="container-max">
          <SectionHeader label="OUR VALUES" title="What We Stand For" align="center" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {values.map(({ icon: Icon, title, description }) => (
              <Card key={title} className="p-5 text-center" hover>
                <div className="w-11 h-11 rounded-xl flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#0A1628' }}>
                  <Icon size={20} className="text-[#C9A84C]" />
                </div>
                <h3 className="font-bold text-[#0A1628] mb-2">{title}</h3>
                <p className="text-sm text-[#4A5568] leading-relaxed">{description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="section-py" style={{ backgroundColor: '#0A1628' }}>
        <div className="container-max">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {stats.map(({ value, label }) => (
              <div key={label}>
                <p className="text-3xl font-bold text-[#C9A84C]">{value}</p>
                <p className="text-sm text-[#A0AEC0] mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="section-py bg-white">
        <div className="container-max">
          <SectionHeader label="OUR TEAM" title="The People Behind USJ Technologies" align="center" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {teamMembers.map((member) => {
              const initials = (member.initials ?? member.name?.split(' ').map((n) => n[0]).join('').slice(0, 2) ?? 'TM').toUpperCase();
              return (
                <Card key={member.id ?? member.name} className="p-6 text-center" hover>
                  {member.image_url ? (
                    <img
                      src={member.image_url}
                      alt={member.name}
                      loading="lazy"
                      className="w-20 h-20 rounded-full object-cover mx-auto mb-4 border-2 border-[#E2E8F0]"
                    />
                  ) : (
                    <div
                      className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 text-xl font-bold"
                      style={{ backgroundColor: '#0A1628', color: '#C9A84C' }}
                    >
                      {initials}
                    </div>
                  )}
                  <h3 className="font-bold text-[#0A1628] mb-0.5">{member.name}</h3>
                  <p className="text-xs text-[#C9A84C] font-semibold mb-1 uppercase tracking-wide">{member.role}</p>
                  {member.department && (
                    <p className="text-xs text-[#718096] mb-3">{member.department}</p>
                  )}
                  {(member.bio ?? member.bio) && (
                    <p className="text-sm text-[#4A5568] leading-relaxed mb-3">{member.bio}</p>
                  )}
                  <div className="flex items-center justify-center gap-3">
                    {member.linkedin_url && isSafeExternalUrl(member.linkedin_url) && (
                      <a href={member.linkedin_url} target="_blank" rel="noopener noreferrer"
                        className="text-[#718096] hover:text-[#0A1628] transition-colors">
                        <Linkedin size={15} />
                      </a>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="section-py" style={{ backgroundColor: '#F8F9FA' }}>
        <div className="container-max">
          <SectionHeader label="OUR JOURNEY" title="Company Milestones" align="center" />
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-[#E2E8F0]" />
              <div className="space-y-6">
                {milestones.map((m, i) => (
                  <div key={i} className="flex gap-5 items-start relative">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-xs font-bold z-10"
                      style={{ backgroundColor: i % 2 === 0 ? '#0A1628' : '#C9A84C', color: i % 2 === 0 ? '#C9A84C' : '#0A1628' }}
                    >
                      {i + 1}
                    </div>
                    <div className="pt-1 pb-2">
                      <p className="text-xs font-semibold text-[#C9A84C] mb-0.5">{m.year}</p>
                      <h4 className="font-bold text-[#0A1628] mb-1">{m.title}</h4>
                      <p className="text-sm text-[#4A5568]">{m.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
    </>
  );
}
