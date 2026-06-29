import { useState } from 'react';
import { Image, Eye } from 'lucide-react';
import Card from '../ui/Card';
import CertModal from './CertModal';

/**
 * @param {{ cert: object }} props
 */
export default function CertCard({ cert }) {
  const [open, setOpen] = useState(false);
  const [imgError, setImgError] = useState(false);

  // Support both Supabase snake_case and legacy camelCase field names
  const imageUrl = cert.image_url ?? cert.imageUrl;
  const issuingBody = cert.issuing_body ?? cert.issuingBody;
  const issueDate = cert.issue_date ?? cert.issueDate;
  const certId = cert.cert_id ?? cert.certId;

  return (
    <>
      <Card className="overflow-hidden group" hover>
        {/* Thumbnail */}
        <div className="bg-gray-100 h-40 flex items-center justify-center relative overflow-hidden">
          {imageUrl && !imgError ? (
            <img
              src={imageUrl}
              alt={cert.name}
              loading="lazy"
              onError={() => setImgError(true)}
              className="w-full h-full object-contain p-4"
            />
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Image size={36} className="text-gray-300" />
              <span className="text-xs text-gray-400">Certificate Image</span>
            </div>
          )}
          <div className="absolute inset-0 bg-[#0A1628]/0 group-hover:bg-[#0A1628]/10 transition-colors" />
        </div>

        <div className="p-4">
          <h3 className="text-sm font-bold text-[#0A1628] mb-1 line-clamp-2">{cert.name}</h3>
          <p className="text-xs text-[#C9A84C] font-medium mb-1">{issuingBody}</p>
          {issueDate && (
            <p className="text-xs text-[#718096] mb-1">Issued: {issueDate}</p>
          )}
          {certId && (
            <p className="text-xs text-[#A0AEC0] mb-3 font-mono">{certId}</p>
          )}
          {cert.description && (
            <p className="text-xs text-[#4A5568] mb-3 line-clamp-2 leading-relaxed">{cert.description}</p>
          )}

          <button
            onClick={() => setOpen(true)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0A1628] hover:text-[#C9A84C] transition-colors"
          >
            <Eye size={13} /> View Certificate
          </button>
        </div>
      </Card>

      <CertModal cert={cert} isOpen={open} onClose={() => setOpen(false)} />
    </>
  );
}
