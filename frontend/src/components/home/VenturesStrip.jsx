import { Scale, Compass, Mountain, Lock, ExternalLink, Clock } from 'lucide-react';
import SectionHeader from '../ui/SectionHeader';
import Badge from '../ui/Badge';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { APP_CONFIG } from '../../config/app';

const iconMap = { Scale, Compass, Mountain };

export default function VenturesStrip() {
  const { ventures } = APP_CONFIG;

  return (
    <section className="section-py bg-white">
      <div className="container-max">
        <SectionHeader
          label="OUR VENTURES"
          title="Building Beyond Technology"
          subtitle="USJ Technologies is more than a tech company — we're building an ecosystem of impactful ventures across legal, travel, and digital services."
          align="center"
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {ventures.map((venture) => {
            const Icon = iconMap[venture.icon] || Compass;

            if (!venture.isRevealed) {
              return (
                <Card key={venture.id} className="p-8 flex flex-col items-center text-center" hover>
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
                    style={{ backgroundColor: '#F8F9FA', border: '2px dashed #E2E8F0' }}
                  >
                    <Lock size={22} className="text-[#A0AEC0]" style={{ animation: 'fadeUp 2s ease infinite alternate' }} />
                  </div>
                  <Badge type="private" className="mb-3">Stealth Mode</Badge>
                  <h3 className="text-base font-bold text-[#0A1628] mb-2">Something Big is Coming</h3>
                  <p className="text-sm text-[#718096]">Stay Tuned — We're working on something extraordinary.</p>
                </Card>
              );
            }

            return (
              <Card key={venture.id} className="overflow-hidden flex flex-col" hover>
                {venture.image && (
                  <img src={venture.image} alt={venture.name} loading="lazy" className="w-full h-36 object-cover" />
                )}
                <div className="p-6 flex flex-col flex-1">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                  style={{ backgroundColor: `${venture.color}15` }}
                >
                  <Icon size={22} style={{ color: venture.color }} />
                </div>

                <div className="flex items-center gap-2 mb-3">
                  <Badge
                    type={venture.category === 'Legal Services' ? 'legal' : 'travel'}
                  >
                    {venture.category}
                  </Badge>
                  {venture.status === 'live' ? (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-50 px-2 py-0.5 rounded">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500" /> Live
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                      <Clock size={10} /> Coming Soon
                    </span>
                  )}
                </div>

                <h3 className="text-base font-bold text-[#0A1628] mb-1">{venture.name}</h3>
                <p className="text-xs font-medium text-[#C9A84C] mb-3">{venture.tagline}</p>
                <p className="text-sm text-[#4A5568] leading-relaxed flex-1 mb-5">{venture.description}</p>

                {venture.status === 'live' && venture.websiteUrl ? (
                  <a
                    href={venture.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#0A1628] hover:text-[#C9A84C] transition-colors"
                  >
                    Visit Platform <ExternalLink size={13} />
                  </a>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-sm font-medium text-[#718096]">
                    <Clock size={13} /> Coming Soon
                  </span>
                )}
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
