import { TrendingUp, Users, Package, MapPin, ShieldCheck, Award, FileText, Truck, Star, MessageSquare, BadgeCheck, Globe } from 'lucide-react';
import { APP_CONFIG } from '../../config/app';

const trustSignals = [
  { icon: BadgeCheck, label: 'GeM Registered Seller', sub: 'Verified on Govt. e-Marketplace' },
  { icon: Award, label: 'Startup India Recognised', sub: 'DPIIT certified company' },
  { icon: ShieldCheck, label: 'MSME / Udyam Certified', sub: 'Ministry of MSME registered' },
  { icon: Package, label: 'Genuine OEM Products', sub: 'Authorised distributor only' },
  { icon: Truck, label: 'Pan-India B2B Delivery', sub: 'Fast shipping with tracking' },
  { icon: FileText, label: 'GST Tax Invoice', sub: 'Full compliance for govt. orders' },
  { icon: Star, label: 'Bulk Order Pricing', sub: 'Special rates for large volumes' },
  { icon: MessageSquare, label: 'Dedicated Support', sub: 'Pre & post-sales assistance' },
  { icon: Globe, label: 'GeM Tender Support', sub: 'Bid facilitation & compliance' },
];

export default function WhyChooseUs() {
  const { stats } = APP_CONFIG;

  const statItems = [
    { icon: TrendingUp, value: stats.projects, label: 'Projects Delivered' },
    { icon: Users, value: stats.clients, label: 'Government Clients' },
    { icon: Package, value: stats.products, label: 'Products' },
    { icon: MapPin, value: stats.states, label: 'States Served' },
  ];

  return (
    <section className="section-py" style={{ backgroundColor: '#060F1E' }}>
      <div className="container-max">

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-px mb-14"
          style={{ backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 16, overflow: 'hidden' }}>
          {statItems.map(({ icon: Icon, value, label }) => (
            <div key={label} className="flex flex-col items-center text-center py-8 px-4" style={{ backgroundColor: '#060F1E' }}>
              <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-3"
                style={{ backgroundColor: 'rgba(201,168,76,0.12)' }}>
                <Icon size={17} className="text-[#C9A84C]" />
              </div>
              <p className="text-3xl font-black text-white mb-0.5 tracking-tight">{value}</p>
              <p className="text-xs text-[#64748B]">{label}</p>
            </div>
          ))}
        </div>

        {/* Headline */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8 mb-10">
          <div className="max-w-2xl">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#C9A84C] mb-3">Why Choose Us</p>
            <h2 className="text-2xl md:text-3xl font-bold text-white leading-tight">
              Technology with Trust,<br className="hidden sm:block" /> Compliance & Reliability
            </h2>
          </div>
          <img
            src="/Generated/home-page/why-choose-us.webp"
            alt="Carefully packing a networking product for delivery"
            loading="lazy"
            className="hidden md:block w-64 h-40 rounded-2xl object-cover flex-shrink-0"
            style={{ boxShadow: '0 16px 40px rgba(0,0,0,0.4)' }}
          />
        </div>

        {/* Trust signals grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {trustSignals.map(({ icon: Icon, label, sub }) => (
            <div
              key={label}
              className="flex items-center gap-4 px-5 py-4 rounded-xl transition-colors duration-150"
              style={{
                backgroundColor: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.07)',
              }}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(201,168,76,0.07)'; e.currentTarget.style.borderColor = 'rgba(201,168,76,0.25)'; }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.04)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'; }}
            >
              <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: 'rgba(201,168,76,0.12)' }}>
                <Icon size={17} className="text-[#C9A84C]" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white leading-tight">{label}</p>
                <p className="text-xs text-[#64748B] mt-0.5">{sub}</p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
