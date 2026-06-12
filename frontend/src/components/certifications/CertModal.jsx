import { X, Image } from 'lucide-react';
import { useEffect } from 'react';

/**
 * Full-screen lightbox for certificate details
 * @param {{ cert: object, isOpen: boolean, onClose: () => void }} props
 */
export default function CertModal({ cert, isOpen, onClose }) {
  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) {
      document.addEventListener('keydown', handleKey);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !cert) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={cert.name}
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative"
        onClick={(e) => e.stopPropagation()}
        style={{ animation: 'fadeUp 0.2s ease' }}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 z-10"
          aria-label="Close"
        >
          <X size={18} />
        </button>

        {/* Image */}
        <div className="bg-gray-50 rounded-t-xl p-6 flex items-center justify-center" style={{ minHeight: 240 }}>
          {cert.imageUrl ? (
            <img
              src={cert.imageUrl}
              alt={cert.name}
              className="max-h-56 object-contain"
            />
          ) : (
            <div className="flex flex-col items-center gap-3">
              <Image size={56} className="text-gray-300" />
              <p className="text-sm text-gray-400">Certificate Image Not Available</p>
            </div>
          )}
        </div>

        {/* Details */}
        <div className="p-6">
          <h2 className="text-xl font-bold text-[#0A1628] mb-1">{cert.name}</h2>
          <p className="text-sm text-[#C9A84C] font-semibold mb-5">{cert.issuingBody}</p>

          <dl className="grid grid-cols-2 gap-4 text-sm mb-5">
            {cert.certId && (
              <>
                <dt className="text-[#718096]">Certificate ID</dt>
                <dd className="font-semibold text-[#0A1628] font-mono text-xs">{cert.certId}</dd>
              </>
            )}
            {cert.issueDate && (
              <>
                <dt className="text-[#718096]">Issue Date</dt>
                <dd className="font-semibold text-[#0A1628]">{cert.issueDate}</dd>
              </>
            )}
            {cert.expiryDate && (
              <>
                <dt className="text-[#718096]">Valid Until</dt>
                <dd className="font-semibold text-[#0A1628]">{cert.expiryDate}</dd>
              </>
            )}
          </dl>

          {cert.description && (
            <p className="text-sm text-[#4A5568] leading-relaxed">{cert.description}</p>
          )}
        </div>
      </div>
    </div>
  );
}
