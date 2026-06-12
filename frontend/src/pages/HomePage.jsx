import HeroSection from '../components/home/HeroSection';
import WhatWeDo from '../components/home/WhatWeDo';
import FeaturedProducts from '../components/home/FeaturedProducts';
import VenturesStrip from '../components/home/VenturesStrip';
import ProjectsShowcase from '../components/home/ProjectsShowcase';
import WhyChooseUs from '../components/home/WhyChooseUs';
import CertStrip from '../components/home/CertStrip';
import ContactCTABanner from '../components/home/ContactCTABanner';

export default function HomePage() {
  return (
    <>
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
