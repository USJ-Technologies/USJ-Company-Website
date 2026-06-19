import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { APP_CONFIG, ROUTES } from '../../config/app';

const services = [
  {
    number: '01',
    title: 'Government & Defence Procurement',
    description:
      'End-to-end technology supply for government departments, defence establishments, and paramilitary forces — GeM registered, security-compliant, and trusted across Uttarakhand and beyond.',
    link: ROUTES.SERVICES,
    tag: 'GeM · B2B',
    image: '/Generated/home-page/what-we-do-b.png',
  },
  {
    number: '02',
    title: 'Electronics & Networking Products',
    description:
      'Surveillance systems, networking gear, power solutions, and IT peripherals from leading brands — sourced from authorised distributors with GST invoice and full after-sales support.',
    link: ROUTES.SHOP,
    tag: '700+ Products',
    image: '/Generated/home-page/what-we-do-a.png',
  },
  {
    number: '03',
    title: 'GeM Tender & Project Execution',
    description:
      'Expert navigation of the Government e-Marketplace with successful tender bids, procurement facilitation, end-to-end installation, and compliance management for institutional buyers.',
    link: ROUTES.PROJECTS,
    tag: '50+ Projects',
    image: '/Generated/home-page/what-we-do-c.png',
  },
];

export default function WhatWeDo() {
  const { stats } = APP_CONFIG;

  return (
    <section className="section-py bg-white">
      <div className="container-max">
        <div className="grid grid-cols-1 lg:grid-cols-[5fr_7fr] gap-12 lg:gap-20 items-start">

          {/* Left — sticky intro */}
          <div className="lg:sticky lg:top-24">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#C9A84C] mb-4">
              What We Do
            </p>
            <h2 className="text-3xl lg:text-[2.4rem] font-bold text-[#0A1628] leading-tight mb-5">
              Technology Solutions<br />Built for India
            </h2>
            <p className="text-[#4A5568] leading-relaxed text-sm mb-8 max-w-sm">
              USJ Technologies is Dehradun's trusted B2B technology partner — serving government, defence, and commercial buyers with quality products and expert procurement support.
            </p>

            <div className="grid grid-cols-2 gap-3">
              {[
                { value: stats.projects, label: 'Projects Delivered' },
                { value: stats.products, label: 'Products in Catalog' },
                { value: stats.clients, label: 'Govt. Clients', span: false },
                { value: stats.states, label: 'States Served' },
              ].map(({ value, label }) => (
                <div
                  key={label}
                  className="p-4 rounded-xl"
                  style={{ backgroundColor: '#F4F7FB', border: '1px solid #E8EEF6' }}
                >
                  <p className="text-2xl font-bold text-[#0A1628]">{value}</p>
                  <p className="text-xs text-[#718096] mt-0.5">{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right — service rows */}
          <div className="divide-y divide-[#EEF2F8]">
            {services.map(({ number, title, description, link, tag, image }) => (
              <div key={number} className="py-8 group cursor-default">
                <div className="flex gap-5 items-start">
                  <span
                    className="text-[2.2rem] font-black leading-none mt-0.5 flex-shrink-0 select-none transition-colors duration-200"
                    style={{ color: '#E8EEF6', letterSpacing: '-0.02em' }}
                    onMouseEnter={e => { e.target.style.color = '#C9A84C'; }}
                    onMouseLeave={e => { e.target.style.color = '#E8EEF6'; }}
                  >
                    {number}
                  </span>
                  <img
                    src={image}
                    alt={title}
                    className="hidden sm:block w-24 h-24 rounded-xl object-cover flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-[1.05rem] font-bold text-[#0A1628] group-hover:text-[#C9A84C] transition-colors duration-200">
                        {title}
                      </h3>
                      <span className="hidden sm:inline text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#F4F7FB] text-[#718096] border border-[#E8EEF6] flex-shrink-0">
                        {tag}
                      </span>
                    </div>
                    <p className="text-sm text-[#64748B] leading-relaxed mb-4">{description}</p>
                    <Link
                      to={link}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0A1628] hover:text-[#C9A84C] transition-colors uppercase tracking-wide"
                    >
                      Learn More <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}
