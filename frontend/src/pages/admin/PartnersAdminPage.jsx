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
import { businessTypeLabel, fetchPartnerCategoryLinks } from '../../lib/partnerCatalog';

const BADGE_COLOR = {
  pending: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  suspended: 'bg-red-100 text-red-800',
  rejected: 'bg-gray-100 text-gray-800',
  // Set by close_partner_for_account_deletion when a user deletes their account
  closed: 'bg-gray-100 text-gray-500',
};

export default function PartnersAdminPage() {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [reviewNotes, setReviewNotes] = useState('');
  const [partnerCategories, setPartnerCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const canManagePartners = useAuthStore((s) => s.hasRole('admin', 'manager'));

  useEffect(() => {
    if (canManagePartners) fetchPartners();
  }, [canManagePartners]);

  // Registered segments live in a join table, so they're fetched when a
  // partner is opened rather than with the list. Driven from the click
  // handler rather than an effect: the modal is the only thing that needs
  // them, and it keeps the fetch out of the render cycle.
  const openPartner = async (partner) => {
    setSelectedPartner(partner);
    setShowDetailModal(true);
    setPartnerCategories([]);
    setCategoriesLoading(true);
    try {
      setPartnerCategories(await fetchPartnerCategoryLinks(partner.id));
    } finally {
      setCategoriesLoading(false);
    }
  };

  const closeDetail = () => {
    setShowDetailModal(false);
    setSelectedPartner(null);
    setPartnerCategories([]);
    setReviewNotes('');
  };

  const fetchPartners = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('usj_partners')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPartners(data ?? []);
    } catch (error) {
      console.error('Error fetching USJ Partners:', error);
      toast.error('Failed to load USJ Partners');
    } finally {
      setLoading(false);
    }
  };

  const filteredPartners = partners.filter((v) => {
    const matchesSearch =
      v.business_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.gst_number?.includes(searchTerm);
    const matchesStatus = selectedStatus === 'all' || v.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  // Status changes go through set_partner_status (migration 20260906000001)
  // rather than a direct table UPDATE: approving also has to promote the
  // applicant's profile to role 'usj_partner', and only admins can write
  // another user's profile row under RLS. The RPC does both writes in one
  // transaction and authorises on is_manager_or_above().
  const reviewPartner = async ({ partner, status, notes = null, confirmMessage, successMessage }) => {
    if (confirmMessage && !window.confirm(confirmMessage)) return;

    setActionLoading(true);
    try {
      const { data, error } = await supabase.rpc('set_partner_status', {
        p_partner_id: partner.id,
        p_status: status,
        p_notes: notes,
      });

      if (error) throw error;

      setPartners((prev) =>
        prev.map((v) => (v.id === partner.id ? { ...v, ...(data?.partner ?? { status }) } : v))
      );

      setShowDetailModal(false);
      setSelectedPartner(null);
      setReviewNotes('');
      toast.success(successMessage);

      // The partner row moved but no linked account did — the applicant can
      // never sign in, so say so instead of reporting a clean success.
      if (status === 'approved' && data?.profiles_updated === 0) {
        toast(
          `No user account is linked to "${partner.business_name}", so nothing was promoted. ` +
            `Check that their profile's partner_id is set.`,
          { icon: '⚠️', duration: 8000 }
        );
      }
    } catch (error) {
      console.error(`Error setting USJ Partner status to ${status}:`, error);
      // Postgres splits an error across message/details/hint, and PostgREST
      // passes all three through. A bare `message` often names the problem
      // without naming the statement that raised it, so show the lot.
      const detail = [error.details, error.hint].filter(Boolean).join(' — ');
      toast.error(
        [error.message || `Failed to set status to ${status}`, detail].filter(Boolean).join(' — '),
        { duration: 8000 }
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleApprovePartner = (partner) =>
    reviewPartner({
      partner,
      status: 'approved',
      notes: reviewNotes,
      confirmMessage: `Approve USJ Partner "${partner.business_name}"? This will grant them USJ Partner access.`,
      successMessage: `USJ Partner "${partner.business_name}" approved!`,
    });

  const handleRejectPartner = (partner, reason) => {
    if (!reason.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }
    return reviewPartner({
      partner,
      status: 'rejected',
      notes: reason,
      confirmMessage: `Reject USJ Partner "${partner.business_name}"? They will be notified and can reapply.`,
      successMessage: `USJ Partner "${partner.business_name}" rejected`,
    });
  };

  const handleSuspendPartner = (partner) =>
    reviewPartner({
      partner,
      status: 'suspended',
      notes: reviewNotes,
      confirmMessage: `Suspend USJ Partner "${partner.business_name}"? They will lose dashboard access immediately.`,
      successMessage: `USJ Partner "${partner.business_name}" suspended`,
    });

  if (!canManagePartners) {
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
          <h1 className="text-2xl font-bold text-[#0A1628]">USJ Partner Management</h1>
          <p className="text-sm text-[#718096] mt-0.5">Review and approve USJ Partner applications</p>
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

      {/* USJ Partners List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      ) : filteredPartners.length === 0 ? (
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-12 text-center">
          <Building2 size={40} className="mx-auto text-gray-300 mb-3" />
          <p className="text-sm font-semibold text-[#0A1628]">No partners found</p>
          <p className="text-xs text-[#718096] mt-1">
            {searchTerm ? 'Try adjusting your search' : 'Check back later for new applications'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredPartners.map((partner) => (
            <div
              key={partner.id}
              className="bg-white rounded-xl border border-[#E2E8F0] p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-sm font-bold text-[#0A1628]">{partner.business_name}</h3>
                    <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${BADGE_COLOR[partner.status]}`}>
                      {partner.status.charAt(0).toUpperCase() + partner.status.slice(1)}
                    </span>
                  </div>
                  <p className="text-xs text-[#718096] mb-3">
                    GST: {partner.gst_number} • PAN: {partner.pan_number}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-[#718096]">
                    <div className="flex items-center gap-1">
                      <Mail size={12} />
                      {partner.contact_info?.email}
                    </div>
                    <div className="flex items-center gap-1">
                      <Phone size={12} />
                      {partner.contact_info?.phone}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar size={12} />
                      {new Date(partner.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => openPartner(partner)}
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
      {showDetailModal && selectedPartner && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-[#E2E8F0] p-6 flex items-center justify-between">
              <h2 className="text-lg font-bold text-[#0A1628]">{selectedPartner.business_name}</h2>
              <button onClick={closeDetail} className="text-[#718096] hover:text-[#0A1628]">
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
                    <p className="text-[#0A1628]">{selectedPartner.business_name}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-[#718096]">Status</p>
                    <div className="mt-1">
                      <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${BADGE_COLOR[selectedPartner.status]}`}>
                        {selectedPartner.status.charAt(0).toUpperCase() + selectedPartner.status.slice(1)}
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-[#718096]">GST Number</p>
                    <p className="text-[#0A1628] font-mono">{selectedPartner.gst_number}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-[#718096]">PAN Number</p>
                    <p className="text-[#0A1628] font-mono">{selectedPartner.pan_number}</p>
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
                    <p className="text-[#0A1628]">{selectedPartner.contact_info?.contact_person}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-[#718096]">Phone</p>
                    <p className="text-[#0A1628]">{selectedPartner.contact_info?.phone}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs font-semibold text-[#718096]">Email</p>
                    <p className="text-[#0A1628]">{selectedPartner.contact_info?.email}</p>
                  </div>
                </div>
              </div>

              {/* What They Sell */}
              <div>
                <h3 className="text-sm font-bold text-[#0A1628] mb-3 uppercase tracking-wider">
                  What They Sell
                </h3>

                {/* Applications submitted before this section existed have
                    none of these fields — say so rather than render blanks. */}
                {!selectedPartner.business_type &&
                partnerCategories.length === 0 &&
                !categoriesLoading ? (
                  <p className="text-xs text-[#718096]">
                    This application predates catalog details.
                  </p>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-xs font-semibold text-[#718096]">Business Type</p>
                        <p className="text-[#0A1628]">
                          {businessTypeLabel(selectedPartner.business_type) ?? '—'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-[#718096]">Scale</p>
                        <p className="text-[#0A1628]">
                          {selectedPartner.sku_count != null
                            ? `${selectedPartner.sku_count.toLocaleString('en-IN')} SKUs`
                            : '—'}
                          {selectedPartner.monthly_capacity != null &&
                            ` · ${selectedPartner.monthly_capacity.toLocaleString('en-IN')} units/mo`}
                        </p>
                      </div>
                    </div>

                    <div>
                      <p className="text-xs font-semibold text-[#718096] mb-1.5">Categories</p>
                      {categoriesLoading ? (
                        <p className="text-xs text-[#718096]">Loading…</p>
                      ) : partnerCategories.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {partnerCategories.map((c) => (
                            <span
                              key={c.id}
                              className="px-2 py-0.5 text-xs font-semibold bg-[#F7FAFC] border border-[#E2E8F0] rounded-full text-[#0A1628]"
                            >
                              {c.name}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-[#718096]">None registered</p>
                      )}
                    </div>

                    <div>
                      <p className="text-xs font-semibold text-[#718096] mb-1.5">Brands Carried</p>
                      {selectedPartner.brands_carried?.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {selectedPartner.brands_carried.map((b, i) => (
                            <span
                              key={`${b}-${i}`}
                              className="px-2 py-0.5 text-xs font-semibold bg-[#FDFBF5] border border-[#C9A84C]/40 rounded-full text-[#0A1628]"
                            >
                              {b}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-[#718096]">None listed</p>
                      )}
                    </div>

                    <div>
                      <p className="text-xs font-semibold text-[#718096] mb-1.5">
                        Authorization Documents
                      </p>
                      {selectedPartner.authorization_doc_urls?.length > 0 ? (
                        <div className="space-y-2">
                          {selectedPartner.authorization_doc_urls.map((url, i) => (
                            <a
                              key={i}
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 text-sm text-[#0A56DB] hover:underline"
                            >
                              <FileText size={14} />
                              Authorization Document {i + 1}
                            </a>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-[#718096]">None uploaded</p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Storefront Description */}
              <div>
                <h3 className="text-sm font-bold text-[#0A1628] mb-3 uppercase tracking-wider">
                  Storefront Description
                </h3>
                <p className="text-sm text-[#4A5568]">{selectedPartner.storefront_description}</p>
              </div>

              {/* KYC Documents */}
              <div>
                <h3 className="text-sm font-bold text-[#0A1628] mb-3 uppercase tracking-wider">
                  KYC Documents
                </h3>
                {selectedPartner.kyc_document_urls?.length > 0 ? (
                  <div className="space-y-2">
                    {selectedPartner.kyc_document_urls.map((url, i) => (
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
              {selectedPartner.status === 'pending' && (
                <div>
                  <h3 className="text-sm font-bold text-[#0A1628] mb-3 uppercase tracking-wider">
                    Review Notes{' '}
                    <span className="normal-case tracking-normal font-medium text-[#718096]">
                      — required to reject
                    </span>
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
              {selectedPartner.status === 'pending' && (
                <div className="flex gap-3">
                  <button
                    onClick={() => handleApprovePartner(selectedPartner)}
                    disabled={actionLoading}
                    className="flex-1 px-4 py-2 bg-green-600 text-white text-sm font-semibold rounded-[6px] hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {actionLoading ? <Loader size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                    Approve
                  </button>
                  <button
                    onClick={() => handleRejectPartner(selectedPartner, reviewNotes)}
                    disabled={actionLoading}
                    className="flex-1 px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-[6px] hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {actionLoading ? <Loader size={16} className="animate-spin" /> : <XCircle size={16} />}
                    Reject
                  </button>
                </div>
              )}

              {selectedPartner.status === 'approved' && (
                <button
                  onClick={() => handleSuspendPartner(selectedPartner)}
                  disabled={actionLoading}
                  className="w-full px-4 py-2 bg-orange-600 text-white text-sm font-semibold rounded-[6px] hover:bg-orange-700 transition-colors disabled:opacity-50"
                >
                  {actionLoading ? <Loader size={16} className="animate-spin" /> : 'Suspend USJ Partner'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
