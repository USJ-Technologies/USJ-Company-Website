import React from 'react';
import Button from '../../components/ui/Button';
import { Award, Plus } from 'lucide-react';

const CertificationsAdminPage = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-[#0A1628]">Manage Certifications</h1>
        <Button variant="primary" leftIcon={<Plus size={18} />}>
          Add Certification
        </Button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
        <Award size={64} className="mx-auto text-gray-300 mb-6" />
        <h2 className="text-2xl font-bold text-[#0A1628] mb-2">Certifications Management</h2>
        <p className="text-gray-500 max-w-md mx-auto mb-8">
          Upload and manage ISO certifications, startup recognitions, and other awards here.
        </p>
        <Button variant="outline-white" className="border-gray-300 text-[#0A1628] hover:bg-gray-50">
          Upload New Document
        </Button>
      </div>
    </div>
  );
};

export default CertificationsAdminPage;
