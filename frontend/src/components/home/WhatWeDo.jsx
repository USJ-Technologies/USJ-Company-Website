import { Link } from 'react-router-dom';
import { Shield, Cpu, FileText, ArrowRight } from 'lucide-react';
import SectionHeader from '../ui/SectionHeader';
import Card from '../ui/Card';
import { ROUTES } from '../../config/app';

const services = [
  {
    icon: Shield,
    title: 'Government & Defence Solutions',
    description:
      'End-to-end technology solutions for government and defence procurement — GeM registered, security-compliant, trusted by departments across India.',
    link: ROUTES.SERVICES,
  },
  {
    icon: Cpu,
    title: 'Technology Products & Electronics',
    description:
      'Quality electronics and tech products including surveillance systems, networking equipment, power solutions, and more — sourced and supplied with full compliance.',
    link: ROUTES.SHOP,
  },
  {
    icon: FileText,
    title: 'GeM Tender Projects',
    description:
      'Expert navigation of Government e-Marketplace with successful tender bids, procurement facilitation, and end-to-end compliance management.',
    link: ROUTES.PROJECTS,
  },
];

export default function WhatWeDo() {
  return (
    <section className="section-py bg-white">
      <div className="container-max">
        <SectionHeader
          label="WHAT WE DO"
          title="Comprehensive Technology Solutions"
          subtitle="From government procurement to digital ventures — USJ Technologies is your trusted technology partner."
          align="center"
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {services.map(({ icon: Icon, title, description, link }) => (
            <Card
              key={title}
              className="p-6 group"
              hover
            >
              {/* Icon circle */}
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors duration-200 group-hover:bg-[#C9A84C]"
                style={{ backgroundColor: '#0A1628' }}
              >
                <Icon size={22} className="text-white" />
              </div>

              <h3 className="text-base font-bold text-[#0A1628] mb-2">{title}</h3>
              <p className="text-sm text-[#4A5568] leading-relaxed mb-4">{description}</p>

              <Link
                to={link}
                className="inline-flex items-center gap-1 text-sm font-semibold text-[#C9A84C] hover:text-[#B8973B] transition-colors"
              >
                Learn More <ArrowRight size={14} />
              </Link>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
