import { Link } from 'react-router-dom';
import { ShieldCheck, Award, CheckCircle, Users } from 'lucide-react';
import { APP_CONFIG, ROUTES } from '../../config/app';
import Button from '../ui/Button';

const trustBadges = [
  { icon: ShieldCheck, label: 'GeM Registered' },
  { icon: Award, label: 'Startup India Certified' },
  { icon: CheckCircle, label: 'ISO Compliant' },
  { icon: Users, label: 'Govt. & Defence Projects' },
];

export default function HeroSection() {
  const { company } = APP_CONFIG;

  return (
    <section className="hero-pattern relative overflow-hidden" style={{ minHeight: 'calc(100vh - 64px)' }}>
      {/* Overlay gradient */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(135deg, rgba(10,22,40,0.03) 0%, transparent 60%)',
        }}
      />

      <div className="container-max relative z-10 flex flex-col lg:flex-row items-center gap-12 py-16 lg:py-24 min-h-[calc(100vh-64px)]">
        {/* Text side */}
        <div className="flex-1 max-w-xl fade-up">
          {/* Top badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-6"
            style={{ backgroundColor: '#EBF4FF', color: '#1A3A5C', border: '1px solid #BFDBFE' }}>
            <ShieldCheck size={13} />
            GeM Registered · Startup India Certified
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-[52px] font-bold text-[#0A1628] leading-tight mb-5">
            {company.tagline.split(' ').map((word, i) =>
              ['Future', 'Technology'].includes(word) ? (
                <span key={i} className="text-[#C9A84C]">{word} </span>
              ) : (
                <span key={i}>{word} </span>
              )
            )}
          </h1>

          <p className="text-base md:text-lg text-[#4A5568] leading-relaxed mb-8">
            USJ Technologies delivers cutting-edge technology solutions for Government, Defence, and commercial sectors —
            GeM registered and Startup India certified. Based in Dehradun, serving India.
          </p>

          <div className="flex flex-wrap gap-3 mb-10">
            <Button as={Link} to={ROUTES.PROJECTS} variant="primary" size="lg">
              Explore Our Work
            </Button>
            <Button as={Link} to={ROUTES.SHOP} variant="secondary" size="lg">
              Shop Products
            </Button>
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap gap-4">
            {trustBadges.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2 text-sm text-[#4A5568]">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: '#EBF4FF' }}
                >
                  <Icon size={14} className="text-[#0A1628]" />
                </div>
                <span className="font-medium">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Abstract art side */}
        <div className="flex-1 flex items-center justify-center w-full max-w-md lg:max-w-none">
          <div className="relative w-full" style={{ maxWidth: 420, aspectRatio: '1/1' }}>
            {/* Outer ring */}
            <div
              className="absolute inset-0 rounded-3xl border-2"
              style={{ borderColor: '#E2E8F0', transform: 'rotate(6deg)' }}
            />
            {/* Middle box */}
            <div
              className="absolute inset-6 rounded-2xl"
              style={{ backgroundColor: '#0A1628', transform: 'rotate(3deg)' }}
            />
            {/* Inner content */}
            <div
              className="absolute inset-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: '#1A2E4A' }}
            >
              <div className="text-center px-6">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                  style={{ backgroundColor: '#C9A84C' }}
                >
                  <span className="text-2xl font-bold text-[#0A1628]">USJ</span>
                </div>
                <p className="text-white font-bold text-lg leading-tight">Building India's</p>
                <p className="text-[#C9A84C] font-bold text-lg">Future</p>
                <div className="mt-4 flex justify-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#C9A84C]" />
                  <span className="w-2 h-2 rounded-full bg-white/40" />
                  <span className="w-2 h-2 rounded-full bg-white/40" />
                </div>
              </div>
            </div>
            {/* Floating badges */}
            <div
              className="absolute -top-3 -right-3 px-3 py-1.5 rounded-lg text-xs font-bold shadow-lg"
              style={{ backgroundColor: '#C9A84C', color: '#0A1628' }}
            >
              GeM ✓
            </div>
            <div
              className="absolute -bottom-3 -left-3 px-3 py-1.5 rounded-lg text-xs font-bold shadow-lg"
              style={{ backgroundColor: '#0A1628', color: '#C9A84C', border: '1px solid #1A2E4A' }}
            >
              Since 2023
            </div>
          </div>
        </div>
      </div>

      {/* Bottom wave divider */}
      <div className="absolute bottom-0 left-0 right-0 h-12 pointer-events-none">
        <svg viewBox="0 0 1440 48" fill="none" preserveAspectRatio="none" style={{ width: '100%', height: '100%' }}>
          <path d="M0 48L1440 48L1440 24C1080 0 360 48 0 24V48Z" fill="white" />
        </svg>
      </div>
    </section>
  );
}
