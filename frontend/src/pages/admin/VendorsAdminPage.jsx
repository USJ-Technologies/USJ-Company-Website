import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  Plus,
  Search,
  FileText,
  Eye,
  MoreVertical,
  Loader,
  Mail,
  Phone,
  Building2,
  Calendar,
} from 'lucide-react';
import toast from 'react-hot-toast';
import useAuthStore from '../../store/authStore';
import Skeleton from '../../components/ui/Skeleton';

const BADGE_COLOR = {
  pending: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  suspended: 'bg-red-100 text-red-800',
  rejected: 'bg-gray-100 text-gray-800',
};

export default function VendorsAdminPage() {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [reviewNotes, setReviewNotes] = useState('');
  const canManageVendors = useAuthStore((s) => s.hasRole('admin', 'manager'));

  useEffect(() => {
    if (canManageVendors) fetchVendors();
  }, [canManageVendors]);

  const fetchVendors = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('vendors')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setVendors(data ?? []);
    } catch (error) {
      console.error('Error fetching vendors:', error);
      toast.error('Failed to load vendors');
    } finally {
      setLoading(false);
    }
  };

  const filteredVendors = vendors.filter((v) => {
    const matchesSearch =
      v.business_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.gst_number?.includes(searchTerm);
    const matchesStatus = selectedStatus === 'all' || v.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const handleApproveVendor = async (vendor) => {
    if (!window.confirm(`Approve vendor "${vendor.business_name}"? This will grant them vendor access.`)) {
      return;
    }

    setActionLoading(true);
    try {
      // 1. Update vendor status to 'approved'
      const { error: vendorError } = await supabase
        .from('vendors')
        .update({ status: 'approved' })
        .eq('id', vendor.id);

      if (vendorError) throw vendorError;

      // 2. Update local state
      setVendors((prev) =>
        prev.map((v) => (v.id === vendor.id ? { ...v, status: 'approved' } : v))
      );

      setShowDetailModal(false);
      setSelectedVendor(null);
      toast.success(`Vendor "${vendor.business_name}" approved!`);
    } catch (error) {
      console.error('Error approving vendor:', error);
      toast.error('Failed to approve vendor');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectVendor = async (vendor, reason) => {
    if (!reason.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }

    if (
      !window.confirm(
        `Reject vendor "${vendor.business_name}"? They will be notified and can reapply.`
      )
    ) {
      return;
    }

    setActionLoading(true);
    try {
      // 1. Update vendor status to 'rejected'
      const { error: vendorError } = await supabase
        .from('vendors')
        .update({
          status: 'rejected',
          contact_info: {
            ...vendor.contact_info,
            rejection_reason: reason,
          },
        })
        .eq('id', vendor.id);

      if (vendorError) throw vendorError;

      // 2. Update local state
      setVendors((prev) =>
        prev.map((v) => (v.id === vendor.id ? { ...v, status: 'rejected' } : v))
      );

      setShowDetailModal(false);
      setSelectedVendor(null);
      setReviewNotes('');
      toast.success(`Vendor "${vendor.business_name}" rejected`);
    } catch (error) {
      console.error('Error rejecting vendor:', error);
      toast.error('Failed to reject vendor');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSuspendVendor = async (vendor) => {
    if (!window.confirm(`Suspend vendor "${vendor.business_name}"?`)) {
      return;
    }

    setActionLoading(true);
    try {
      const { error } = await supabase
        .from('vendors')
        .update({ status: 'suspended' })
        .eq('id', vendor.id);

      if (error) throw error;

      setVendors((prev) =>
        prev.map((v) => (v.id === vendor.id ? { ...v, status: 'suspended' } : v))
      );

      setShowDetailModal(false);
      setSelectedVendor(null);
      toast.success(`Vendor "${vendor.business_name}" suspended`);
    } catch (error) {
      console.error('Error suspending vendor:', error);
      toast.error('Failed to suspend vendor');
    } finally {
      setActionLoading(false);
    }
  };

  if (!canManageVendors) {
    return (
      <div className="bg-white rounded-xl border border-[#E2E8F0] p-8 text-center">
        <AlertCircle size={32} className="mx-auto text-gray-300 mb-3" />
        <p className="text-sm font-semibold text-[#0A1628]">Admins and Managers only</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0A1628]">Vendor Management</h1>
          <p className="text-sm text-[#718096] mt-0.5">Review and approve vendor applications</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] p-4 flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#718096]" />
          <input
            type="text"
            placeholder="Search by business name, slug, or GST..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-[#E2E8F0] rounded-[6px] focus:outline-none focus:ring-2 focus:ring-[#C9A84C]"
          />
        </div>

        {/* Status Filter */}
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="px-3 py-2 text-sm border border-[#E2E8F0] rounded-[6px] focus:outline-none focus:ring-2 focus:ring-[#C9A84C] bg-white"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending Review</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="suspended">Suspended</option>
        </select>
      </div>

      {/* Vendors List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      ) : filteredVendors.length === 0 ? (
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-12 text-center">
          <Building2 size={40} className="mx-auto text-gray-300 mb-3" />
          <p className="text-sm font-semibold text-[#0A1628]">No vendors found</p>
          <p className="text-xs text-[#718096] mt-1">
            {searchTerm ? 'Try adjusting your search' : 'Check back later for new applications'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredVendors.map((vendor) => (
            <div
              key={vendor.id}
              className="bg-white rounded-xl border border-[#E2E8F0] p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-sm font-bold text-[#0A1628]">{vendor.business_name}</h3>
                    <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${BADGE_COLOR[vendor.status]}`}>
                      {vendor.status.charAt(0).toUpperCase() + vendor.status.slice(1)}
                    </span>
                  </div>
                  <p className="text-xs text-[#718096] mb-3">
                    GST: {vendor.gst_number} • PAN: {vendor.pan_number}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-[#718096]">
                    <div className="flex items-center gap-1">
                      <Mail size={12} />
                      {vendor.contact_info?.email}
                    </div>
                    <div className="flex items-center gap-1">
                      <Phone size={12} />
                      {vendor.contact_info?.phone}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar size={12} />
                      {new Date(vendor.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setSelectedVendor(vendor);
                      setShowDetailModal(true);
                    }}
                    className="p-2 text-[#718096] hover:text-[#0A1628] hover:bg-[#F7FAFC] rounded-[6px] transition-colors"
                  >
                    <Eye size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedVendor && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-[#E2E8F0] p-6 flex items-center justify-between">
              <h2 className="text-lg font-bold text-[#0A1628]">{selectedVendor.business_name}</h2>
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  setSelectedVendor(null);
                  setReviewNotes('');
                }}
                className="text-[#718096] hover:text-[#0A1628]"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Business Information */}
              <div>
                <h3 className="text-sm font-bold text-[#0A1628] mb-3 uppercase tracking-wider">
                  Business Information
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-xs font-semibold text-[#718096]">Business Name</p>
                    <p className="text-[#0A1628]">{selectedVendor.business_name}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-[#718096]">Status</p>
                    <div className="mt-1">
                      <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${BADGE_COLOR[selectedVendor.status]}`}>
                        {selectedVendor.status.charAt(0).toUpperCase() + selectedVendor.status.slice(1)}
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-[#718096]">GST Number</p>
                    <p className="text-[#0A1628] font-mono">{selectedVendor.gst_number}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-[#718096]">PAN Number</p>
                    <p className="text-[#0A1628] font-mono">{selectedVendor.pan_number}</p>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div>
                <h3 className="text-sm font-bold text-[#0A1628] mb-3 uppercase tracking-wider">
                  Contact Information
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-xs font-semibold text-[#718096]">Contact Person</p>
                    <p className="text-[#0A1628]">{selectedVendor.contact_info?.contact_person}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-[#718096]">Phone</p>
                    <p className="text-[#0A1628]">{selectedVendor.contact_info?.phone}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs font-semibold text-[#718096]">Email</p>
                    <p className="text-[#0A1628]">{selectedVendor.contact_info?.email}</p>
                  </div>
                </div>
              </div>

              {/* Storefront Description */}
              <div>
                <h3 className="text-sm font-bold text-[#0A1628] mb-3 uppercase tracking-wider">
                  Storefront Description
                </h3>
                <p className="text-sm text-[#4A5568]">{selectedVendor.storefront_description}</p>
              </div>

              {/* KYC Documents */}
              <div>
                <h3 className="text-sm font-bold text-[#0A1628] mb-3 uppercase tracking-wider">
                  KYC Documents
                </h3>
                {selectedVendor.kyc_document_urls?.length > 0 ? (
                  <div className="space-y-2">
                    {selectedVendor.kyc_document_urls.map((url, i) => (
                      <a
                        key={i}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-[#0A56DB] hover:underline"
                      >
                        <FileText size={14} />
                        KYC Document {i + 1}
                      </a>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-[#718096]">No KYC documents uploaded</p>
                )}
              </div>

              {/* Review Notes (for approval/rejection) */}
              {selectedVendor.status === 'pending' && (
                <div>
                  <h3 className="text-sm font-bold text-[#0A1628] mb-3 uppercase tracking-wider">
                    Review Notes
                  </h3>
                  <textarea
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    placeholder="Add any notes or reasons for rejection..."
                    rows={4}
                    className="w-full px-3 py-2 text-sm border border-[#E2E8F0] rounded-[6px] focus:outline-none focus:ring-2 focus:ring-[#C9A84C]"
                  />
                </div>
              )}

              {/* Action Buttons */}
              {selectedVendor.status === 'pending' && (
                <div className="flex gap-3">
                  <button
                    onClick={() => handleApproveVendor(selectedVendor)}
                    disabled={actionLoading}
                    className="flex-1 px-4 py-2 bg-green-600 text-white text-sm font-semibold rounded-[6px] hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {actionLoading ? <Loader size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                    Approve
                  </button>
                  <button
                    onClick={() => handleRejectVendor(selectedVendor, reviewNotes)}
                    disabled={actionLoading || !reviewNotes.trim()}
                    className="flex-1 px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-[6px] hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {actionLoading ? <Loader size={16} className="animate-spin" /> : <XCircle size={16} />}
                    Reject
                  </button>
                </div>
              )}

              {selectedVendor.status === 'approved' && (
                <button
                  onClick={() => handleSuspendVendor(selectedVendor)}
                  disabled={actionLoading}
                  className="w-full px-4 py-2 bg-orange-600 text-white text-sm font-semibold rounded-[6px] hover:bg-orange-700 transition-colors disabled:opacity-50"
                >
                  {actionLoading ? <Loader size={16} className="animate-spin" /> : 'Suspend Vendor'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
