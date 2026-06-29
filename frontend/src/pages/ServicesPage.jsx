import { Link } from 'react-router-dom';
import { Shield, Cpu, FileText, CheckCircle, ArrowRight, ClipboardList, Settings, Truck, HeadphonesIcon } from 'lucide-react';
import SEOHead from '../components/seo/SEOHead';
import SectionHeader from '../components/ui/SectionHeader';
import Card from '../components/ui/Card';
import { ROUTES } from '../config/app';

const services = [
  {
    icon: Shield,
    id: 'govt-defence',
    title: 'Government & Defence Solutions',
    color: '#EBF4FF',
    iconBg: '#0A1628',
    image: '/Generated/services-page/govt-def-corridor.png',
    features: [
      'GeM-registered procurement services',
      'Defence electronics supply chain',
      'Surveillance & security systems',
      'Network infrastructure deployment',
      'IT equipment for government offices',
      'Compliance and documentation support',
    ],
    paragraphs: [
      'USJ Technologies is a trusted technology partner for government departments and defence establishments across India. With our GeM registration and Startup India certification, we provide seamless technology procurement.',
      'From CCTV surveillance systems to networking infrastructure, we supply, install, and maintain technology solutions that meet the rigorous standards required by government and defence clients.',
      'Our team handles all compliance documentation, ensuring smooth procurement processes and adherence to government e-marketplace guidelines.',
    ],
  },
  {
    icon: Cpu,
    id: 'tech-products',
    title: 'Technology Products & Electronics',
    color: '#E8D5F5',
    iconBg: '#4A235A',
    image: '/Generated/services-page/IT-infra-net.png',
    features: [
      'HD surveillance cameras & NVR systems',
      'Structured cabling & networking',
      'UPS & power backup solutions',
      'Desktop, laptop & peripheral supply',
      'Communication devices',
      'Smart building technologies',
    ],
    paragraphs: [
      'Our product catalog covers a comprehensive range of electronics and technology equipment, all sourced from reputed manufacturers and quality-verified before delivery.',
      'Whether you need a few computers for an office or a complete surveillance system for a campus, USJ Technologies ensures quality, competitive pricing, and after-sales support.',
      'All products come with manufacturer warranties and can be procured through GeM, direct purchase order, or our online shop.',
    ],
  },
  {
    icon: FileText,
    id: 'gem-tenders',
    title: 'GeM Tender Management',
    color: '#D4EDDA',
    iconBg: '#155724',
    image: '/Generated/services-page/tender-bt2.png',
    features: [
      'GeM seller registration assistance',
      'Tender identification & bid preparation',
      'Compliance documentation',
      'Order fulfilment & logistics',
      'After-sales service coordination',
      'GeM OEM registration support',
    ],
    paragraphs: [
      'Navigating the Government e-Marketplace can be complex. USJ Technologies simplifies the process — from seller registration to winning bids and fulfilling orders.',
      'Our team monitors relevant tenders, prepares competitive bids, and manages the entire order lifecycle, ensuring timely delivery and compliance at every step.',
      'We have a proven track record of successful GeM orders across multiple product categories, serving government clients in Uttarakhand and beyond.',
    ],
  },
];

const processSteps = [
  { icon: ClipboardList, step: '01', title: 'Requirement Analysis', description: 'We understand your specific technology needs, budget, and compliance requirements in detail.' },
  { icon: Settings, step: '02', title: 'Solution Design', description: 'Our experts design a tailored solution that meets your needs and complies with all relevant regulations.' },
  { icon: Truck, step: '03', title: 'Delivery & Implementation', description: 'We source, deliver, and implement the solution with minimal disruption to your operations.' },
  { icon: HeadphonesIcon, step: '04', title: 'Support & Maintenance', description: 'Ongoing support, maintenance, and warranty management to keep your systems running optimally.' },
];

export default function ServicesPage() {
  return (
    <>
      <SEOHead
        title="IT Services & Government Solutions"
        description="USJ Technologies offers Government & Defence IT solutions, GeM procurement services, network deployment, CCTV & surveillance systems, tender support, and IT consulting in Dehradun, Uttarakhand, and across India."
        keywords="IT services Dehradun, government IT solutions Uttarakhand, GeM procurement services, defence electronics services, network installation Dehradun, CCTV installation Uttarakhand, tender IT support, surveillance systems Dehradun, IT consulting North India, technology services Uttarakhand, security systems installation, IT infrastructure deployment"
        canonical="/services"
        structuredData={{
          '@context': 'https://schema.org',
          '@type': 'Service',
          'name': 'Government & Defence IT Solutions',
          'provider': { '@id': 'https://usjtechnologies.com/#organization' },
          'description': 'GeM procurement, network infrastructure, CCTV & security systems, defence electronics supply, and government IT services across Uttarakhand and India.',
          'areaServed': [
            { '@type': 'City', 'name': 'Dehradun' },
            { '@type': 'State', 'name': 'Uttarakhand' },
            { '@type': 'Country', 'name': 'India' },
          ],
          'serviceType': ['Government IT Procurement', 'GeM Services', 'Network Deployment', 'Surveillance Systems', 'Defence Electronics Supply'],
          'url': 'https://usjtechnologies.com/services',
        }}
      />
      <div>
      {/* Hero */}
      <section className="section-py hero-pattern">
        <div className="container-max max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#C9A84C] mb-3">What We Offer</p>
          <h1 className="text-4xl md:text-5xl font-bold text-[#0A1628] mb-5 leading-tight">
            Our Services
          </h1>
          <p className="text-lg text-[#4A5568] leading-relaxed">
            Comprehensive technology solutions for government, defence, and commercial clients — delivered with integrity and precision.
          </p>
        </div>
      </section>

      {/* Services */}
      {services.map((svc, idx) => {
        const Icon = svc.icon;
        const isEven = idx % 2 === 0;
        return (
          <section
            key={svc.id}
            id={svc.id}
            className="section-py"
            style={{ backgroundColor: isEven ? '#fff' : '#F8F9FA' }}
          >
            <div className="container-max">
              <div className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-start ${!isEven ? 'lg:grid-flow-dense' : ''}`}>
                <div className={!isEven ? 'lg:col-start-2' : ''}>
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
                    style={{ backgroundColor: svc.iconBg }}
                  >
                    <Icon size={22} className="text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-[#0A1628] mb-4">{svc.title}</h2>
                  <div className="space-y-3 text-sm text-[#4A5568] leading-relaxed mb-6">
                    {svc.paragraphs.map((p, i) => <p key={i}>{p}</p>)}
                  </div>
                  <Link
                    to={ROUTES.CONTACT}
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-[6px] text-sm font-semibold text-white bg-[#0A1628] hover:bg-[#1A2E4A] transition-colors"
                  >
                    Request a Quote <ArrowRight size={15} />
                  </Link>
                </div>

                <div className={!isEven ? 'lg:col-start-1 lg:row-start-1' : ''}>
                  <img
                    src={svc.image}
                    alt={svc.title}
                    loading="lazy"
                    className="w-full h-48 object-cover rounded-xl mb-4"
                    style={{ boxShadow: '0 12px 32px rgba(10,22,40,0.15)' }}
                  />
                  <Card className="p-6" hover={false} style={{ borderLeftColor: svc.iconBg, borderLeftWidth: 3 }}>
                    <h3 className="font-bold text-[#0A1628] text-sm mb-4 uppercase tracking-wide">Key Features</h3>
                    <ul className="space-y-2.5">
                      {svc.features.map((f) => (
                        <li key={f} className="flex items-start gap-2 text-sm text-[#4A5568]">
                          <CheckCircle size={15} className="mt-0.5 shrink-0 text-[#2D7D46]" />
                          {f}
                        </li>
                      ))}
                    </ul>
                  </Card>
                </div>
              </div>
            </div>
          </section>
        );
      })}

      {/* Process */}
      <section className="section-py" style={{ backgroundColor: '#0A1628' }}>
        <div className="container-max">
          <SectionHeader
            label="HOW WE WORK"
            title="Our Process"
            subtitle="A structured, transparent approach to every project."
            align="center"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {processSteps.map(({ icon: Icon, step, title, description }) => (
              <div key={step} className="text-center">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3"
                  style={{ backgroundColor: 'rgba(201,168,76,0.15)' }}
                >
                  <Icon size={20} className="text-[#C9A84C]" />
                </div>
                <p className="text-xs font-bold text-[#C9A84C] mb-2">{step}</p>
                <h3 className="font-bold text-white mb-2">{title}</h3>
                <p className="text-sm text-[#A0AEC0] leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
    </>
  );
}
