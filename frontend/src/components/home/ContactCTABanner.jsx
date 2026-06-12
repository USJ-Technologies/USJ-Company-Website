import { Link } from 'react-router-dom';
import { MessageSquare, ExternalLink } from 'lucide-react';
import Button from '../ui/Button';
import { ROUTES } from '../../config/app';

export default function ContactCTABanner() {
  return (
    <section
      className="relative overflow-hidden py-16"
      style={{ backgroundColor: '#0A1628' }}
    >
      {/* Geometric pattern overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-10"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, #C9A84C 1px, transparent 0)',
          backgroundSize: '32px 32px',
        }}
      />
      {/* Accent blobs */}
      <div
        className="absolute -top-20 -right-20 w-80 h-80 rounded-full opacity-5"
        style={{ backgroundColor: '#C9A84C' }}
      />

      <div className="container-max relative z-10 text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-[#C9A84C] mb-3">
          Work With Us
        </p>
        <h2 className="text-2xl md:text-4xl font-bold text-white mb-4">
          Have a Project in Mind? Let's Talk.
        </h2>
        <p className="text-base text-[#A0AEC0] max-w-xl mx-auto mb-8">
          Whether you're a government department, defence establishment, or a business looking for quality tech procurement — we're here to help.
        </p>

        <div className="flex flex-wrap justify-center gap-4">
          <Button
            as={Link}
            to={ROUTES.CONTACT}
            variant="accent"
            size="lg"
            leftIcon={<MessageSquare size={17} />}
          >
            Send an Inquiry
          </Button>
          <a
            href="https://gem.gov.in"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-[6px] text-base font-semibold text-white border border-white/30 hover:bg-white/10 transition-colors"
          >
            <ExternalLink size={17} /> Request Quotation via GeM
          </a>
        </div>
      </div>
    </section>
  );
}
