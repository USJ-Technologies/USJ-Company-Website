import { useState, useEffect } from 'react';
import { Lock } from 'lucide-react';
import SectionHeader from '../components/ui/SectionHeader';
import CertCard from '../components/certifications/CertCard';
import { SkeletonCard } from '../components/ui/Skeleton';
import api from '../services/api';

const staticCerts = [
  {
    _id: 'c1',
    name: 'Startup India Recognition',
    issuingBody: 'DPIIT, Government of India',
    issueDate: 'January 2024',
    certId: 'DIPP12345',
    description: 'Officially recognized startup under the Startup India initiative by the Department for Promotion of Industry and Internal Trade (DPIIT).',
    imageUrl: null,
  },
  {
    _id: 'c2',
    name: 'GeM Seller Registration',
    issuingBody: 'Government e-Marketplace (GeM)',
    issueDate: 'March 2024',
    certId: 'GEM/SELLER/XXXXXXX',
    description: 'Registered seller on India\'s Government e-Marketplace (GeM), authorized to supply products and services to central and state government buyers.',
    imageUrl: null,
  },
  {
    _id: 'c3',
    name: 'MSME / Udyam Registration',
    issuingBody: 'Ministry of Micro, Small & Medium Enterprises',
    issueDate: 'February 2024',
    certId: 'UDYAM-UK-XX-XXXXXXX',
    description: 'Registered as a Micro, Small & Medium Enterprise under the Udyam Registration Portal, Ministry of MSME, Government of India.',
    imageUrl: null,
  },
  {
    _id: 'c4',
    name: 'ISO 9001:2015 Compliant',
    issuingBody: 'ISO Certification Body (Pending)',
    issueDate: 'TBD',
    certId: 'ISO-XXXX',
    description: 'Quality Management System certification in progress. USJ Technologies follows ISO 9001:2015 standards in its internal processes.',
    imageUrl: null,
  },
];

export default function CertificationsPage() {
  const [certs, setCerts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api.get('/certifications')
      .then(({ data }) => {
        const list = data.data?.certifications || (Array.isArray(data.certifications) ? data.certifications : (Array.isArray(data) ? data : []));
        setCerts(list.length > 0 ? list : staticCerts);
        setIsLoading(false);
      })
      .catch(() => {
        setCerts(staticCerts);
        setIsLoading(false);
      });
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="section-py" style={{ backgroundColor: '#0A1628' }}>
        <div className="container-max">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#C9A84C] mb-3">
            Trust & Compliance
          </p>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-5">
            Our Certifications & Recognitions
          </h1>
          <p className="text-lg text-[#A0AEC0] max-w-xl leading-relaxed">
            USJ Technologies is recognized by leading government and industry bodies for quality, compliance, and innovation.
          </p>
        </div>
      </section>

      {/* Certs Grid */}
      <section className="section-py bg-white">
        <div className="container-max">
          <SectionHeader
            label="VERIFIED CREDENTIALS"
            title="Our Certifications"
            subtitle="We hold multiple government and industry certifications that validate our commitment to quality and compliance."
          />

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1,2,3,4,5].map((i) => <SkeletonCard key={i} />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {certs.map((cert) => (
                <CertCard key={cert._id} cert={cert} />
              ))}
              {/* Locked card */}
              <div className="bg-white border-2 border-dashed border-[#E2E8F0] rounded-[8px] p-6 flex flex-col items-center justify-center text-center min-h-[200px]">
                <Lock size={28} className="text-gray-300 mb-3" />
                <p className="text-sm font-semibold text-[#4A5568] mb-1">More Certifications Coming</p>
                <p className="text-xs text-[#A0AEC0]">We're continuously working towards additional industry recognitions.</p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Why it matters */}
      <section className="section-py" style={{ backgroundColor: '#F8F9FA' }}>
        <div className="container-max max-w-3xl text-center">
          <SectionHeader
            label="WHY IT MATTERS"
            title="Compliance You Can Trust"
            subtitle="Our certifications aren't just badges — they represent our genuine commitment to operating with transparency, quality, and regulatory compliance in every engagement."
            align="center"
          />
        </div>
      </section>
    </div>
  );
}
