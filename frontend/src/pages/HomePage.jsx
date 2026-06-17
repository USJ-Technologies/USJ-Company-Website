import SEOHead from '../components/seo/SEOHead';
import HeroSection from '../components/home/HeroSection';
import WhatWeDo from '../components/home/WhatWeDo';
import FeaturedProducts from '../components/home/FeaturedProducts';
import VenturesStrip from '../components/home/VenturesStrip';
import ProjectsShowcase from '../components/home/ProjectsShowcase';
import WhyChooseUs from '../components/home/WhyChooseUs';
import CertStrip from '../components/home/CertStrip';
import ContactCTABanner from '../components/home/ContactCTABanner';

const homeStructuredData = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  '@id': 'https://usjtechnologies.com/#webpage',
  'url': 'https://usjtechnologies.com/',
  'name': 'USJ Technologies – IT Company Dehradun | GeM Electronics Supplier Uttarakhand',
  'description': 'USJ Technologies is a Dehradun-based IT company and GeM registered electronics supplier. We supply ENTER, TENDA, and ZOOOK products across India and provide government & defence technology solutions.',
  'isPartOf': { '@id': 'https://usjtechnologies.com/#website' },
  'about': { '@id': 'https://usjtechnologies.com/#organization' },
  'speakable': {
    '@type': 'SpeakableSpecification',
    'cssSelector': ['h1', 'h2'],
  },
  'breadcrumb': {
    '@type': 'BreadcrumbList',
    'itemListElement': [{ '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': 'https://usjtechnologies.com/' }],
  },
};

export default function HomePage() {
  return (
    <>
      <SEOHead
        titleFull="USJ Technologies (OPC) Pvt Ltd | IT Company Dehradun | GeM Electronics Supplier Uttarakhand"
        description="USJ Technologies – Leading IT company in Dehradun, Uttarakhand. GeM registered electronics supplier, ENTER & TENDA networking products, CCTV & security systems, government & defence technology solutions. B2B supply, tender support, pan-India delivery."
        keywords="IT company Dehradun, technology company Uttarakhand, electronics supplier Dehradun, GeM registered seller Uttarakhand, networking products Dehradun, ENTER switch Dehradun, TENDA router Uttarakhand, ZOOOK speaker India, government IT procurement, defence electronics supplier, tender IT equipment, B2B electronics North India, security camera Dehradun, CCTV supplier Uttarakhand, Startup India certified, USJ Technologies Dehradun, Ujjwal Singh Jeena"
        canonical="/"
        structuredData={homeStructuredData}
      />
      <HeroSection />
      <WhatWeDo />
      <FeaturedProducts />
      <VenturesStrip />
      <ProjectsShowcase />
      <WhyChooseUs />
      <CertStrip />
      <ContactCTABanner />
    </>
  );
}
