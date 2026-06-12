import { Link } from 'react-router-dom';
import { Scale, Compass, Mountain, Lock, ExternalLink, Clock, ArrowRight } from 'lucide-react';
import SectionHeader from '../components/ui/SectionHeader';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { APP_CONFIG, ROUTES } from '../config/app';

const iconMap = { Scale, Compass, Mountain };

export default function VenturesPage() {
  const { ventures } = APP_CONFIG;

  return (
    <div>
      {/* Hero */}
      <section className="section-py" style={{ backgroundColor: '#0A1628' }}>
        <div className="container-max">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#C9A84C] mb-3">Our Portfolio</p>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-5 leading-tight">
            Our Ventures
            <span className="block text-[#C9A84C] text-3xl md:text-4xl mt-1">Building Beyond Technology</span>
          </h1>
          <p className="text-lg text-[#A0AEC0] max-w-xl leading-relaxed">
            USJ Technologies is building an ecosystem of impactful ventures that solve real problems across legal services, pilgrimage travel, and digital experiences.
          </p>
        </div>
      </section>

      {/* Ventures Grid */}
      <section className="section-py bg-white">
        <div className="container-max">
          <SectionHeader
            label="PORTFOLIO"
            title="What We're Building"
            subtitle="From legal tech to spiritual travel — each venture is purpose-driven and built with the same quality and commitment as our core technology business."
          />

          <div className="space-y-8">
            {ventures.map((venture, idx) => {
              const Icon = iconMap[venture.icon] || Compass;
              const isEven = idx % 2 === 0;

              if (!venture.isRevealed) {
                return (
                  <Card key={venture.id} className="p-8 flex flex-col items-center text-center" hover={false}>
                    <Lock size={32} className="text-gray-300 mb-3" />
                    <Badge type="private" className="mb-2">Stealth Mode</Badge>
                    <h2 className="text-xl font-bold text-[#0A1628] mb-2">Something Big is Coming</h2>
                    <p className="text-sm text-[#718096] max-w-md">
                      We're working on a new venture that will make a significant impact. Stay tuned for the big reveal.
                    </p>
                  </Card>
                );
              }

              return (
                <Card key={venture.id} className="overflow-hidden" hover={false}>
                  <div className={`grid grid-cols-1 lg:grid-cols-2 ${!isEven ? '' : ''}`}>
                    {/* Color panel */}
                    <div
                      className="flex flex-col items-center justify-center p-10"
                      style={{ backgroundColor: `${venture.color}15` }}
                    >
                      <div
                        className="w-20 h-20 rounded-2xl flex items-center justify-center mb-4"
                        style={{ backgroundColor: venture.color }}
                      >
                        <Icon size={36} className="text-white" />
                      </div>
                      <h2 className="text-xl font-bold text-[#0A1628] mb-1 text-center">{venture.name}</h2>
                      <p className="text-sm font-medium text-center" style={{ color: venture.color }}>{venture.tagline}</p>

                      <div className="flex items-center gap-2 mt-4">
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
                    </div>

                    {/* Details panel */}
                    <div className="p-8 flex flex-col justify-center">
                      <p className="text-[#4A5568] leading-relaxed mb-6">{venture.description}</p>

                      <div className="space-y-3 text-sm text-[#4A5568] mb-6">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-[#0A1628] w-24">Category:</span>
                          {venture.category}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-[#0A1628] w-24">Status:</span>
                          <span className={venture.status === 'live' ? 'text-green-700' : 'text-amber-700'}>
                            {venture.status === 'live' ? '🟢 Live & Active' : '🟡 Coming Soon'}
                          </span>
                        </div>
                        {venture.websiteUrl && (
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-[#0A1628] w-24">Website:</span>
                            <a
                              href={venture.websiteUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[#C9A84C] hover:underline"
                            >
                              {venture.websiteUrl}
                            </a>
                          </div>
                        )}
                      </div>

                      {venture.status === 'live' && venture.websiteUrl ? (
                        <a
                          href={venture.websiteUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[6px] text-sm font-semibold text-white bg-[#0A1628] hover:bg-[#1A2E4A] transition-colors self-start"
                        >
                          <ExternalLink size={15} /> Visit Platform
                        </a>
                      ) : (
                        <span className="inline-flex items-center gap-2 text-sm font-medium text-[#718096]">
                          <Clock size={15} /> Platform launching soon
                        </span>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Partnership CTA */}
      <section className="section-py" style={{ backgroundColor: '#F8F9FA' }}>
        <div className="container-max text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#C9A84C] mb-3">Partner With Us</p>
          <h2 className="text-2xl md:text-3xl font-bold text-[#0A1628] mb-4">
            Interested in Partnering or Investing?
          </h2>
          <p className="text-[#4A5568] max-w-xl mx-auto mb-6 leading-relaxed">
            We're always open to strategic partnerships, investments, and collaborations that align with our mission of building impactful ventures for India.
          </p>
          <Button as={Link} to={ROUTES.CONTACT} variant="primary" size="lg">
            Get in Touch <ArrowRight size={16} />
          </Button>
        </div>
      </section>
    </div>
  );
}
