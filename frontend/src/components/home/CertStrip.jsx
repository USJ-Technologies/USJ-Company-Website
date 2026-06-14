import { useState, useEffect } from 'react';
import { Image } from 'lucide-react';
import Modal from '../ui/Modal';
import { Skeleton } from '../ui/Skeleton';
import { getCertifications } from '../../lib/queries';

const staticCerts = [
  { _id: 'c1', name: 'Startup India Recognition', issuingBody: 'DPIIT, Govt of India', certId: 'DIPP12345', year: '2024' },
  { _id: 'c2', name: 'GeM Seller Registration', issuingBody: 'Govt e-Marketplace', certId: 'GEM/SELLER/XXX', year: '2024' },
  { _id: 'c3', name: 'MSME / Udyam Registration', issuingBody: 'Ministry of MSME', certId: 'UDYAM-UK-XXX', year: '2024' },
  { _id: 'c4', name: 'ISO 9001:2015 Compliant', issuingBody: 'ISO Certification Body', certId: 'ISO-XXXX', year: 'TBD' },
];

export default function CertStrip() {
  const [certs, setCerts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    let cancelled = false;
    getCertifications().then(({ data }) => {
      if (!cancelled) {
        setCerts(data?.length ? data : staticCerts);
        setIsLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, []);

  return (
    <section className="section-py bg-white">
      <div className="container-max">
        <p className="text-center text-xs font-semibold uppercase tracking-widest text-[#C9A84C] mb-2">
          Trusted & Certified
        </p>
        <h2 className="text-center text-xl font-bold text-[#0A1628] mb-8">
          Our Certifications & Recognitions
        </h2>

        {isLoading ? (
          <div className="flex gap-4 justify-center flex-wrap">
            {[1,2,3,4].map((i) => <Skeleton key={i} width={160} height={120} />)}
          </div>
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-2 justify-start md:justify-center flex-nowrap">
            {certs.map((cert) => (
              <button
                key={cert.id ?? cert._id}
                onClick={() => setSelected(cert)}
                className="flex-shrink-0 flex flex-col items-center gap-2 p-4 rounded-xl border border-[#E2E8F0] bg-[#F8F9FA] hover:border-[#C9A84C] hover:bg-white transition-all group"
                style={{ width: 160 }}
              >
                {cert.image_url ?? cert.imageUrl ? (
                  <img src={cert.image_url ?? cert.imageUrl} alt={cert.name} className="w-full h-24 object-contain rounded" />
                ) : (
                  <div className="w-full h-24 bg-gray-200 rounded flex items-center justify-center">
                    <Image size={28} className="text-gray-400" />
                  </div>
                )}
                <p className="text-xs font-semibold text-[#0A1628] text-center line-clamp-2 group-hover:text-[#C9A84C] transition-colors">
                  {cert.name}
                </p>
              </button>
            ))}
          </div>
        )}
      </div>

      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title={selected?.name} size="md">
        {selected && (
          <div>
            {(selected.image_url ?? selected.imageUrl) ? (
              <img src={selected.image_url ?? selected.imageUrl} alt={selected.name} className="w-full h-48 object-contain rounded-lg mb-4 bg-gray-100" />
            ) : (
              <div className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                <Image size={40} className="text-gray-300" />
              </div>
            )}
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="font-medium text-[#4A5568]">Issuing Body</dt>
                <dd className="text-[#0A1628] font-semibold">{selected.issuing_body ?? selected.issuingBody}</dd>
              </div>
              {(selected.cert_id ?? selected.certId) && (
                <div className="flex justify-between">
                  <dt className="font-medium text-[#4A5568]">Certificate ID</dt>
                  <dd className="text-[#0A1628] font-semibold">{selected.cert_id ?? selected.certId}</dd>
                </div>
              )}
              {(selected.issue_date ?? selected.issueDate ?? selected.year) && (
                <div className="flex justify-between">
                  <dt className="font-medium text-[#4A5568]">Issue Date</dt>
                  <dd className="text-[#0A1628] font-semibold">{selected.issue_date ?? selected.issueDate ?? selected.year}</dd>
                </div>
              )}
              {selected.description && (
                <div>
                  <dt className="font-medium text-[#4A5568] mb-1">About</dt>
                  <dd className="text-[#4A5568] leading-relaxed">{selected.description}</dd>
                </div>
              )}
            </dl>
          </div>
        )}
      </Modal>
    </section>
  );
}
