import { AlertCircle } from 'lucide-react';

export default function PDFImportPage() {
  return (
    <div className="max-w-xl mx-auto py-16 text-center">
      <AlertCircle size={48} className="mx-auto text-amber-400 mb-4" />
      <h2 className="text-xl font-bold text-[#0A1628] mb-2">PDF Import Not Available</h2>
      <p className="text-sm text-[#718096]">
        PDF catalog import requires a backend processing service. Products can be added directly
        via the Products admin panel or by running the seed script.
      </p>
    </div>
  );
}
