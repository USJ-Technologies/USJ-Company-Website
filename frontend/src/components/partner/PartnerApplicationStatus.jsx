import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Clock, CheckCircle, XCircle, PauseCircle, Store } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import { ROUTES } from '../../config/app';

// A pending applicant keeps role 'customer' until an admin approves, so
// nothing in the normal signed-in UI would otherwise tell them their
// application exists. This is that signal.
const PRESENTATION = {
  pending: {
    icon: Clock,
    tone: 'bg-amber-50 border-amber-200',
    iconTone: 'text-amber-600',
    title: 'Partner application under review',
    body: "Our team reviews applications within 2–3 business days. We'll email you as soon as there's a decision — your partner dashboard unlocks then.",
  },
  approved: {
    icon: CheckCircle,
    tone: 'bg-green-50 border-green-200',
    iconTone: 'text-green-600',
    title: 'Partner application approved',
    body: 'Your storefront is live. Manage products and orders from your partner dashboard.',
  },
  rejected: {
    icon: XCircle,
    tone: 'bg-red-50 border-red-200',
    iconTone: 'text-red-600',
    title: 'Partner application not approved',
    body: 'Your application was reviewed and declined. See the reason below — you can address it and apply again.',
  },
  suspended: {
    icon: PauseCircle,
    tone: 'bg-orange-50 border-orange-200',
    iconTone: 'text-orange-600',
    title: 'Partner account suspended',
    body: 'Your storefront is not visible to customers. Contact USJ Technologies to resolve this.',
  },
  closed: {
    icon: XCircle,
    tone: 'bg-gray-50 border-gray-200',
    iconTone: 'text-gray-500',
    title: 'Partner account closed',
    body: 'This partner account has been closed.',
  },
};

export default function PartnerApplicationStatus() {
  const { profile } = useAuthStore();
  const partnerId = profile?.partner_id;
  const [partner, setPartner] = useState(null);

  useEffect(() => {
    if (!partnerId) return;

    let cancelled = false;
    supabase
      .from('usj_partners')
      .select('id, business_name, status, contact_info, created_at')
      .eq('id', partnerId)
      .maybeSingle()
      .then(({ data, error }) => {
        // users_read_own_usj_partner covers this row; a failure here is not
        // worth an error toast on a page that is otherwise fine.
        if (error) console.error('Failed to load partner application:', error);
        if (!cancelled) setPartner(data ?? null);
      });

    return () => {
      cancelled = true;
    };
  }, [partnerId]);

  if (!partnerId || !partner) return null;

  const view = PRESENTATION[partner.status];
  if (!view) return null;

  const Icon = view.icon;
  const reason =
    partner.contact_info?.rejection_reason || partner.contact_info?.review_notes || null;

  return (
    <div className={`rounded-xl border p-5 mb-6 ${view.tone}`}>
      <div className="flex items-start gap-3">
        <Icon size={20} className={`${view.iconTone} flex-shrink-0 mt-0.5`} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-[#0A1628]">{view.title}</p>
          <p className="text-xs text-[#4A5568] mt-1">{view.body}</p>

          <p className="text-xs text-[#718096] mt-2">
            <span className="font-semibold text-[#0A1628]">{partner.business_name}</span>
            {' · submitted '}
            {new Date(partner.created_at).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })}
          </p>

          {reason && partner.status === 'rejected' && (
            <p className="text-xs text-[#4A5568] mt-2 bg-white/60 border border-red-200 rounded-[6px] p-2">
              <span className="font-semibold">Reason: </span>
              {reason}
            </p>
          )}

          {partner.status === 'approved' && profile?.role === 'usj_partner' && (
            <Link
              to={ROUTES.PARTNER_DASHBOARD}
              className="inline-flex items-center gap-1.5 mt-3 px-3 py-1.5 bg-[#0A1628] text-white text-xs font-semibold rounded-[6px] hover:bg-[#1A2E4A] transition-colors"
            >
              <Store size={13} /> Go to partner dashboard
            </Link>
          )}

          {partner.status === 'rejected' && (
            <Link
              to={ROUTES.BECOME_SELLER}
              className="inline-flex items-center gap-1.5 mt-3 px-3 py-1.5 bg-[#0A1628] text-white text-xs font-semibold rounded-[6px] hover:bg-[#1A2E4A] transition-colors"
            >
              Apply again
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
