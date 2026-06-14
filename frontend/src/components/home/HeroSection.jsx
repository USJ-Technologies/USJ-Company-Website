import { Link } from 'react-router-dom';
import { ShieldCheck, Award, CheckCircle, Users, ArrowRight, MapPin } from 'lucide-react';
import { APP_CONFIG, ROUTES } from '../../config/app';
import Button from '../ui/Button';

const sectors = [
  { label: 'Government Depts', color: '#EBF4FF', text: '#1A3A5C' },
  { label: 'Defence & Paramilitary', color: '#FFF3CD', text: '#7A4E00' },
  { label: 'Commercial & MSME', color: '#D4EDDA', text: '#1A5C2A' },
];

const credentials = [
  { icon: ShieldCheck, label: 'GeM Registered', sub: 'Govt. e-Marketplace Seller' },
  { icon: Award, label: 'Startup India', sub: 'DPIIT Recognised' },
  { icon: CheckCircle, label: 'MSME / Udyam', sub: 'Ministry of MSME' },
  { icon: MapPin, label: 'Dehradun, UA', sub: 'Serving Pan-India' },
];

export default function HeroSection() {
  const { company, stats } = APP_CONFIG;

  return (
    <section className="hero-pattern relative overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'linear-gradient(135deg, rgba(10,22,40,0.03) 0%, transparent 60%)' }}
      />

      <div className="container-max relative z-10 flex flex-col lg:flex-row items-center gap-8 lg:gap-12 py-12 sm:py-16 lg:py-24 lg:min-h-[calc(100vh-64px)]">

        {/* ── Left: Copy ── */}
        <div className="flex-1 max-w-xl w-full fade-up">
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-5"
            style={{ backgroundColor: '#EBF4FF', color: '#1A3A5C', border: '1px solid #BFDBFE' }}
          >
            <ShieldCheck size={13} />
            GeM Registered · Startup India Certified · MSME
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[52px] font-bold text-[#0A1628] leading-tight mb-4">
            {company.tagline.split(' ').map((word, i) =>
              ['Future', 'Technology'].includes(word) ? (
                <span key={i} className="text-[#C9A84C]">{word} </span>
              ) : (
                <span key={i}>{word} </span>
              )
            )}
          </h1>

          <p className="text-sm sm:text-base md:text-lg text-[#4A5568] leading-relaxed mb-5">
            USJ Technologies is a GeM-registered, Startup India certified technology company based in Dehradun — delivering electronics, networking, surveillance, and IT solutions to Government, Defence, and commercial sectors across India.
          </p>

          {/* Sectors */}
          <div className="flex flex-wrap gap-2 mb-6">
            {sectors.map(s => (
              <span
                key={s.label}
                className="px-3 py-1 rounded-full text-xs font-semibold"
                style={{ backgroundColor: s.color, color: s.text }}
              >
                {s.label}
              </span>
            ))}
          </div>

          <div className="flex flex-wrap gap-3 mb-8">
            <Button as={Link} to={ROUTES.SHOP} variant="primary" size="lg">
              Browse Products
            </Button>
            <Button as={Link} to={ROUTES.CONTACT} variant="secondary" size="lg">
              Request a Quote <ArrowRight size={15} className="ml-1" />
            </Button>
          </div>

          {/* Stats row */}
          <div className="flex gap-6 pt-4 border-t border-[#E2E8F0]">
            {[
              { value: stats.projects, label: 'Projects' },
              { value: stats.clients, label: 'Govt. Clients' },
              { value: stats.products, label: 'Products' },
            ].map(({ value, label }) => (
              <div key={label}>
                <p className="text-xl sm:text-2xl font-bold text-[#0A1628]">{value}</p>
                <p className="text-xs text-[#718096] mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Right: Credentials panel (desktop only, tablet+ shows compact strip) ── */}
        {/* Mobile: compact trust strip */}
        <div className="lg:hidden w-full">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {credentials.map(({ icon: Icon, label, sub }) => (
              <div
                key={label}
                className="flex flex-col items-center text-center p-3 rounded-xl border border-[#E2E8F0] bg-white shadow-sm"
              >
                <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-2" style={{ backgroundColor: '#EBF4FF' }}>
                  <Icon size={14} className="text-[#0A1628]" />
                </div>
                <p className="text-xs font-bold text-[#0A1628] leading-tight">{label}</p>
                <p className="text-[10px] text-[#718096] mt-0.5 leading-tight">{sub}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Desktop: full credential panel */}
        <div className="hidden lg:flex flex-1 items-center justify-center w-full">
          <div className="w-full" style={{ maxWidth: 420 }}>

            {/* Main credential card */}
            <div className="rounded-2xl p-6 mb-4 shadow-xl" style={{ backgroundColor: '#0A1628' }}>
              <div className="flex items-center gap-3 mb-5">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm"
                  style={{ backgroundColor: '#C9A84C', color: '#0A1628' }}
                >
                  USJ
                </div>
                <div>
                  <p className="text-sm font-bold text-white">USJ Technologies</p>
                  <p className="text-xs text-[#A0AEC0]">(OPC) Pvt Ltd · Dehradun</p>
                </div>
                <div className="ml-auto">
                  <span className="px-2 py-1 rounded text-[10px] font-bold bg-green-900/50 text-green-400">
                    ● Active
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {credentials.map(({ icon: Icon, label, sub }) => (
                  <div
                    key={label}
                    className="rounded-xl p-3 flex items-start gap-2.5"
                    style={{ backgroundColor: '#1A2E4A' }}
                  >
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                      style={{ backgroundColor: 'rgba(201,168,76,0.15)' }}
                    >
                      <Icon size={13} className="text-[#C9A84C]" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white leading-tight">{label}</p>
                      <p className="text-[10px] text-[#718096] leading-tight mt-0.5">{sub}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick-access tiles */}
            <div className="grid grid-cols-3 gap-3">
              <Link
                to={ROUTES.SHOP}
                className="bg-white rounded-xl p-4 text-center border border-[#E2E8F0] hover:border-[#0A1628] hover:shadow-md transition-all group"
              >
                <p className="text-xl font-bold text-[#C9A84C] group-hover:scale-110 transition-transform inline-block">{stats.products}</p>
                <p className="text-[10px] text-[#718096] mt-0.5 font-medium">Products</p>
              </Link>
              <Link
                to={ROUTES.PROJECTS}
                className="bg-white rounded-xl p-4 text-center border border-[#E2E8F0] hover:border-[#0A1628] hover:shadow-md transition-all group"
              >
                <p className="text-xl font-bold text-[#C9A84C] group-hover:scale-110 transition-transform inline-block">{stats.projects}</p>
                <p className="text-[10px] text-[#718096] mt-0.5 font-medium">Projects Done</p>
              </Link>
              <Link
                to={ROUTES.CERTIFICATIONS}
                className="bg-white rounded-xl p-4 text-center border border-[#E2E8F0] hover:border-[#0A1628] hover:shadow-md transition-all group"
              >
                <p className="text-xl font-bold text-[#C9A84C] group-hover:scale-110 transition-transform inline-block">{stats.clients}</p>
                <p className="text-[10px] text-[#718096] mt-0.5 font-medium">Govt. Clients</p>
              </Link>
            </div>

            {/* GeM badge */}
            <div
              className="mt-3 rounded-xl px-4 py-3 flex items-center gap-3"
              style={{ backgroundColor: '#EBF4FF', border: '1px solid #BFDBFE' }}
            >
              <Users size={16} className="text-[#1A3A5C] shrink-0" />
              <p className="text-xs text-[#1A3A5C]">
                <span className="font-bold">Trusted by Government & Defence</span> — registered seller on GeM marketplace
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* Bottom wave */}
      <div className="absolute bottom-0 left-0 right-0 h-12 pointer-events-none">
        <svg viewBox="0 0 1440 48" fill="none" preserveAspectRatio="none" style={{ width: '100%', height: '100%' }}>
          <path d="M0 48L1440 48L1440 24C1080 0 360 48 0 24V48Z" fill="white" />
        </svg>
      </div>
    </section>
  );
}
