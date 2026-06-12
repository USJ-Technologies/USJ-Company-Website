import { Link } from 'react-router-dom';
import { MapPin, Mail, Phone, Linkedin, Twitter, Instagram, ExternalLink, ShieldCheck, Award } from 'lucide-react';
import { APP_CONFIG, ROUTES } from '../../config/app';

const quickLinks = [
  { label: 'Home', to: ROUTES.HOME },
  { label: 'About Us', to: ROUTES.ABOUT },
  { label: 'Services', to: ROUTES.SERVICES },
  { label: 'Ventures', to: ROUTES.VENTURES },
  { label: 'Shop', to: ROUTES.SHOP },
  { label: 'Certifications', to: ROUTES.CERTIFICATIONS },
  { label: 'Projects', to: ROUTES.PROJECTS },
  { label: 'Contact', to: ROUTES.CONTACT },
  { label: 'Careers', to: ROUTES.CAREERS },
];

const legal = [
  { label: 'Privacy Policy', to: '#' },
  { label: 'Terms of Service', to: '#' },
  { label: 'Refund Policy', to: '#' },
];

export default function Footer() {
  const { company, ventures } = APP_CONFIG;

  return (
    <footer style={{ backgroundColor: '#0A1628', color: '#CBD5E0' }}>
      {/* Main grid */}
      <div className="container-max py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Column 1: About */}
          <div>
            <div className="mb-4">
              <span className="text-xl font-bold text-white">USJ</span>
              <span className="text-xl font-bold text-[#C9A84C]"> Technologies</span>
              <div className="text-xs text-[#A0AEC0] mt-0.5">Pvt Ltd</div>
            </div>
            <p className="text-sm leading-relaxed text-[#A0AEC0] mb-5">
              {company.tagline}. Delivering cutting-edge technology solutions for Government, Defence, and commercial sectors across India.
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <MapPin size={15} className="mt-0.5 shrink-0 text-[#C9A84C]" />
                <span className="text-[#A0AEC0]">{company.address}</span>
              </div>
              <a href={`mailto:${company.email}`} className="flex items-center gap-2 hover:text-white transition-colors">
                <Mail size={15} className="shrink-0 text-[#C9A84C]" />
                <span>{company.email}</span>
              </a>
              <a href={`tel:${company.phone}`} className="flex items-center gap-2 hover:text-white transition-colors">
                <Phone size={15} className="shrink-0 text-[#C9A84C]" />
                <span>{company.phone}</span>
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-5">
              Quick Links
            </h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-sm text-[#A0AEC0] hover:text-[#C9A84C] transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Our Ventures */}
          <div>
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-5">
              Our Ventures
            </h3>
            <ul className="space-y-3">
              {ventures.map((v) => (
                <li key={v.id}>
                  {v.isRevealed && v.websiteUrl ? (
                    <a
                      href={v.websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-sm text-[#A0AEC0] hover:text-[#C9A84C] transition-colors"
                    >
                      {v.name}
                      <ExternalLink size={11} />
                    </a>
                  ) : (
                    <span className="text-sm text-[#718096]">
                      {v.isRevealed ? v.name : '● Something Big Coming'}
                    </span>
                  )}
                  <div className="text-xs text-[#4A5568] mt-0.5">{v.category}</div>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Legal */}
          <div>
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-5">
              Legal
            </h3>
            <ul className="space-y-2 mb-6">
              {legal.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="text-sm text-[#A0AEC0] hover:text-[#C9A84C] transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Working Hours */}
            <div className="text-sm text-[#A0AEC0] space-y-1">
              <p className="text-white font-medium text-xs uppercase tracking-wide mb-2">Office Hours</p>
              <p>Mon–Fri: 9:00 AM – 6:00 PM</p>
              <p>Sat: 10:00 AM – 2:00 PM</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t" style={{ borderColor: '#1A2E4A' }}>
        <div className="container-max py-5 flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Badges */}
          <div className="flex items-center gap-4 flex-wrap justify-center md:justify-start">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold" style={{ backgroundColor: '#1A2E4A', color: '#C9A84C' }}>
              <ShieldCheck size={14} />
              GeM Registered Seller
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold" style={{ backgroundColor: '#1A2E4A', color: '#C9A84C' }}>
              <Award size={14} />
              Startup India Certified
            </div>
          </div>

          {/* Social */}
          <div className="flex items-center gap-3">
            {company.social.linkedin && (
              <a href={company.social.linkedin} target="_blank" rel="noopener noreferrer"
                className="p-2 rounded-md hover:bg-[#1A2E4A] text-[#718096] hover:text-[#C9A84C] transition-colors"
                aria-label="LinkedIn">
                <Linkedin size={16} />
              </a>
            )}
            {company.social.twitter && (
              <a href={company.social.twitter} target="_blank" rel="noopener noreferrer"
                className="p-2 rounded-md hover:bg-[#1A2E4A] text-[#718096] hover:text-[#C9A84C] transition-colors"
                aria-label="Twitter">
                <Twitter size={16} />
              </a>
            )}
            {company.social.instagram && (
              <a href={company.social.instagram} target="_blank" rel="noopener noreferrer"
                className="p-2 rounded-md hover:bg-[#1A2E4A] text-[#718096] hover:text-[#C9A84C] transition-colors"
                aria-label="Instagram">
                <Instagram size={16} />
              </a>
            )}
          </div>

          {/* Copyright */}
          <p className="text-xs text-[#4A5568] text-center">
            © {new Date().getFullYear()} {company.name}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
