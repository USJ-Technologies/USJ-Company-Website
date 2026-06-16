import { Link } from 'react-router-dom';
import { ShieldCheck, Award, CheckCircle, Users, ArrowRight, MapPin, ChevronRight } from 'lucide-react';
import { APP_CONFIG, ROUTES } from '../../config/app';

const credentials = [
  { icon: ShieldCheck, label: 'GeM Registered', sub: 'Govt. e-Marketplace Seller' },
  { icon: Award, label: 'Startup India', sub: 'DPIIT Recognised' },
  { icon: CheckCircle, label: 'MSME / Udyam', sub: 'Ministry of MSME' },
  { icon: MapPin, label: 'Dehradun, UK', sub: 'Serving Pan-India' },
];

const clients = ['Government Depts', 'Defence & Paramilitary', 'Police & CRPF', 'ONGC · BHEL', 'District Offices', 'Universities'];

export default function HeroSection() {
  const { company, stats } = APP_CONFIG;

  return (
    <section className="hero-pattern relative overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 80% 60% at 60% 0%, rgba(201,168,76,0.06) 0%, transparent 70%)' }}
      />

      <div className="container-max relative z-10 flex flex-col lg:flex-row items-center gap-10 lg:gap-16 py-14 sm:py-18 lg:py-24 lg:min-h-[calc(100vh-64px)]">

        {/* ── Left: Copy ── */}
        <div className="flex-1 max-w-xl w-full fade-up">

          {/* Credential pill */}
          <div className="inline-flex items-center gap-2 mb-6 pl-1 pr-3 py-1 rounded-full text-xs font-semibold"
            style={{ backgroundColor: '#F0F7FF', border: '1px solid #C7DFF7', color: '#1A3A5C' }}>
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-white text-[10px] font-bold"
              style={{ backgroundColor: '#0A1628' }}>
              <ShieldCheck size={10} /> Verified
            </span>
            GeM Registered · Startup India · MSME Udyam
          </div>

          {/* Headline */}
          <h1 className="text-[2.2rem] sm:text-[2.8rem] lg:text-[3.2rem] font-black text-[#0A1628] leading-[1.1] tracking-tight mb-5">
            {company.tagline.split(' ').map((word, i) =>
              ['Future', 'Technology'].includes(word) ? (
                <span key={i} className="relative">
                  <span className="relative z-10 text-[#C9A84C]">{word}</span>{' '}
                </span>
              ) : (
                <span key={i}>{word} </span>
              )
            )}
          </h1>

          <p className="text-sm sm:text-base text-[#4A5568] leading-relaxed mb-6 max-w-md">
            Dehradun's trusted technology company — supplying electronics, networking, and surveillance solutions to Government, Defence, and commercial sectors across India.
          </p>

          {/* Serving */}
          <div className="flex items-center gap-2 mb-7 overflow-hidden">
            <span className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest whitespace-nowrap">Serving</span>
            <div className="flex gap-2 overflow-x-auto no-scrollbar">
              {clients.map(c => (
                <span key={c} className="whitespace-nowrap text-[11px] font-semibold px-2.5 py-1 rounded-full text-[#475569] flex-shrink-0"
                  style={{ backgroundColor: '#F1F5F9', border: '1px solid #E2E8F0' }}>
                  {c}
                </span>
              ))}
            </div>
          </div>

          {/* CTAs */}
          <div className="flex flex-wrap gap-3 mb-8">
            <Link
              to={ROUTES.SHOP}
              className="inline-flex items-center gap-2 px-6 py-3 text-sm font-bold text-white rounded-lg transition-all hover:-translate-y-px"
              style={{ backgroundColor: '#0A1628', boxShadow: '0 4px 14px rgba(10,22,40,0.3)' }}
            >
              Browse Products <ChevronRight size={15} />
            </Link>
            <Link
              to={ROUTES.CONTACT}
              className="inline-flex items-center gap-2 px-6 py-3 text-sm font-bold text-[#0A1628] rounded-lg border-2 border-[#0A1628] hover:bg-[#0A1628] hover:text-white transition-all"
            >
              Request a Quote
            </Link>
          </div>

          {/* Stats */}
          <div className="flex gap-7 pt-5 border-t border-[#E8EEF6]">
            {[
              { value: stats.projects, label: 'Projects' },
              { value: stats.clients, label: 'Govt. Clients' },
              { value: stats.products, label: 'Products' },
            ].map(({ value, label }) => (
              <div key={label}>
                <p className="text-xl font-black text-[#0A1628] tracking-tight">{value}</p>
                <p className="text-[11px] text-[#94A3B8] mt-0.5 font-medium">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Right: Credentials panel ── */}
        {/* Mobile */}
        <div className="lg:hidden w-full">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {credentials.map(({ icon: Icon, label, sub }) => (
              <div key={label} className="flex flex-col items-center text-center p-4 rounded-xl bg-white"
                style={{ border: '1px solid #E8EEF6', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-2"
                  style={{ backgroundColor: '#EBF4FF' }}>
                  <Icon size={15} className="text-[#0A1628]" />
                </div>
                <p className="text-xs font-bold text-[#0A1628] leading-tight">{label}</p>
                <p className="text-[10px] text-[#94A3B8] mt-0.5 leading-tight">{sub}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Desktop */}
        <div className="hidden lg:flex flex-1 items-center justify-center w-full">
          <div className="w-full" style={{ maxWidth: 420 }}>

            {/* Main credential card */}
            <div className="rounded-2xl p-6 mb-3"
              style={{ backgroundColor: '#0A1628', boxShadow: '0 20px 60px rgba(10,22,40,0.4)' }}>
              <div className="flex items-center gap-3 mb-5 pb-5 border-b border-white/10">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm text-[#0A1628]"
                  style={{ backgroundColor: '#C9A84C' }}>
                  USJ
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-white">USJ Technologies</p>
                  <p className="text-xs text-[#64748B]">(OPC) Pvt Ltd · Dehradun, Uttarakhand</p>
                </div>
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold text-emerald-400"
                  style={{ backgroundColor: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.2)' }}>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Active
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                {credentials.map(({ icon: Icon, label, sub }) => (
                  <div key={label} className="rounded-xl p-3 flex items-start gap-2.5"
                    style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)' }}>
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                      style={{ backgroundColor: 'rgba(201,168,76,0.15)' }}>
                      <Icon size={13} className="text-[#C9A84C]" />
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-white leading-tight">{label}</p>
                      <p className="text-[10px] text-[#64748B] leading-tight mt-0.5">{sub}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick-access tiles */}
            <div className="grid grid-cols-3 gap-2.5 mb-2.5">
              {[
                { value: stats.products, label: 'Products', to: ROUTES.SHOP },
                { value: stats.projects, label: 'Projects Done', to: ROUTES.PROJECTS },
                { value: stats.clients, label: 'Govt. Clients', to: ROUTES.CERTIFICATIONS },
              ].map(({ value, label, to }) => (
                <Link key={label} to={to}
                  className="bg-white rounded-xl p-4 text-center group transition-all hover:-translate-y-0.5"
                  style={{ border: '1px solid #E8EEF6', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                  <p className="text-xl font-black text-[#C9A84C]">{value}</p>
                  <p className="text-[10px] text-[#94A3B8] mt-0.5 font-medium">{label}</p>
                </Link>
              ))}
            </div>

            {/* GeM trust line */}
            <div className="rounded-xl px-4 py-3 flex items-center gap-3"
              style={{ backgroundColor: '#F0F7FF', border: '1px solid #C7DFF7' }}>
              <Users size={15} className="text-[#1A3A5C] shrink-0" />
              <p className="text-xs text-[#1A3A5C] leading-snug">
                <span className="font-bold">Trusted by Government & Defence</span> — registered seller on GeM marketplace
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* Bottom fade to white */}
      <div className="absolute bottom-0 left-0 right-0 h-16 pointer-events-none"
        style={{ background: 'linear-gradient(to bottom, transparent, white)' }} />
    </section>
  );
}
