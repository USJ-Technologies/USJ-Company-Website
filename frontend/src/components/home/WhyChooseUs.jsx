import { TrendingUp, Users, Package, MapPin } from 'lucide-react';
import { APP_CONFIG } from '../../config/app';

export default function WhyChooseUs() {
  const { stats } = APP_CONFIG;

  const statItems = [
    { icon: TrendingUp, value: stats.projects, label: 'Projects Delivered', suffix: '' },
    { icon: Users, value: stats.clients, label: 'Government Clients', suffix: '' },
    { icon: Package, value: stats.products, label: 'Products', suffix: '' },
    { icon: MapPin, value: stats.states, label: 'States Served', suffix: '' },
  ];

  return (
    <section className="section-py" style={{ backgroundColor: '#0A1628' }}>
      <div className="container-max">
        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-14">
          {statItems.map(({ icon: Icon, value, label }) => (
            <div key={label} className="text-center">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3"
                style={{ backgroundColor: 'rgba(201,168,76,0.15)' }}
              >
                <Icon size={20} className="text-[#C9A84C]" />
              </div>
              <p className="text-3xl font-bold text-[#C9A84C] mb-1">{value}</p>
              <p className="text-sm text-[#A0AEC0]">{label}</p>
            </div>
          ))}
        </div>

        {/* Values paragraph */}
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#C9A84C] mb-3">
            Why Choose Us
          </p>
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-5">
            Technology with Trust & Compliance
          </h2>
          <p className="text-base text-[#A0AEC0] leading-relaxed mb-5">
            USJ Technologies is built on a foundation of integrity, compliance, and a genuine passion for India's growth. Every project we undertake is backed by rigorous quality standards, government-grade security, and an unwavering commitment to our clients.
          </p>
          <p className="text-sm text-[#718096] leading-relaxed">
            From GeM registration to Startup India certification, we walk every step of the regulatory journey with you — making procurement simple, transparent, and reliable.
          </p>
        </div>
      </div>
    </section>
  );
}
