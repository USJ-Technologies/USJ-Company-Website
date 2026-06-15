import { Link } from 'react-router-dom';
import { MessageSquare, ArrowRight, Phone } from 'lucide-react';
import { APP_CONFIG, ROUTES } from '../../config/app';

export default function ContactCTABanner() {
  const phone = APP_CONFIG.company.phone;

  return (
    <section
      className="relative overflow-hidden"
      style={{ backgroundColor: '#0A1628' }}
    >
      {/* Subtle grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.04]"
        style={{
          backgroundImage: 'linear-gradient(#C9A84C 1px, transparent 1px), linear-gradient(90deg, #C9A84C 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />
      {/* Gold glow top-right */}
      <div
        className="absolute -top-32 -right-32 w-96 h-96 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(201,168,76,0.12) 0%, transparent 70%)' }}
      />

      <div className="container-max relative z-10 py-16 lg:py-20">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-10">

          {/* Left: Copy */}
          <div className="max-w-xl">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#C9A84C] mb-4">
              Work With Us
            </p>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white leading-tight mb-4">
              Have a Project or Procurement<br className="hidden sm:block" /> Requirement in Mind?
            </h2>
            <p className="text-sm text-[#64748B] leading-relaxed max-w-md">
              Whether you're a government department, defence establishment, or a business looking for quality tech — our team is ready to help with quotes, tenders, and end-to-end delivery.
            </p>
          </div>

          {/* Right: Actions */}
          <div className="flex flex-col gap-4 lg:items-end">
            <Link
              to={ROUTES.CONTACT}
              className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-xl text-sm font-bold text-[#0A1628] transition-all hover:-translate-y-0.5 whitespace-nowrap"
              style={{ backgroundColor: '#C9A84C', boxShadow: '0 4px 20px rgba(201,168,76,0.35)' }}
            >
              <MessageSquare size={16} /> Send an Inquiry
            </Link>

            <a
              href="https://gem.gov.in"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-xl text-sm font-bold text-white transition-all hover:bg-white/10 whitespace-nowrap"
              style={{ border: '1px solid rgba(255,255,255,0.15)' }}
            >
              Request Quotation via GeM <ArrowRight size={15} />
            </a>

            {phone && (
              <a
                href={`tel:${phone}`}
                className="inline-flex items-center gap-2 text-sm text-[#64748B] hover:text-[#C9A84C] transition-colors"
              >
                <Phone size={14} /> {phone}
              </a>
            )}
          </div>

        </div>
      </div>
    </section>
  );
}
