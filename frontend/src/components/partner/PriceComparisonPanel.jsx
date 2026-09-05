import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  TrendingDown, Search, Check, X, Loader, Link2, Unlink, Info,
} from 'lucide-react';
import { buildMatchKey, getGroupListings, searchLinkCandidates } from '../../lib/queries';

const inr = (v) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(v);

const DEBOUNCE_MS = 400;

const pillBtn =
  'px-2.5 py-1 text-[11px] font-semibold rounded-[6px] transition-colors flex items-center gap-1';

// A listing with no partner_id belongs to USJ's own catalogue, so there is no
// usj_partners row to take a business name from.
const isPlatform = (l) => l.partner_id == null;
const sellerName = (l) =>
  isPlatform(l) ? 'USJ Technologies' : l.usj_partners?.business_name ?? 'USJ Partner';

/**
 * Shows every other seller's current price for the same product — other
 * approved partners and USJ's own catalogue — and nudges the partner toward
 * the lowest one.
 *
 * Listings are grouped by COALESCE(canonical_key, match_key) — see migration
 * 20260905000001. `match_key` is derived from brand + model, so an auto-match
 * is live by default; confirming only pins the link so it survives brand/model
 * edits, and rejecting sets canonical_key to the row's own id (a group of one).
 */
export default function PriceComparisonPanel({
  brandName,
  model,
  unitPrice,
  canonicalKey,
  ownProductId,
  partnerId,
  onUseLowestPrice,
  onCanonicalKeyChange,
  onComparisonChange,
}) {
  // Results are cached alongside the key they were fetched for, so a previous
  // group's rows are never rendered against a new key — and "loading" falls out
  // of the comparison instead of needing its own state.
  const [groupData, setGroupData] = useState({ key: null, rows: [] });

  const [showSearch, setShowSearch] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchData, setSearchData] = useState({ term: '', rows: [] });

  const autoKey = useMemo(() => buildMatchKey(brandName, model), [brandName, model]);

  // canonical_key === own id is the "not the same product" marker
  const isRejected = Boolean(canonicalKey) && canonicalKey === ownProductId;
  const isConfirmed = Boolean(canonicalKey) && canonicalKey !== ownProductId;
  const groupKey = isRejected ? null : canonicalKey || autoKey;

  const listings = useMemo(
    () => (groupData.key === groupKey ? groupData.rows : []),
    [groupData, groupKey]
  );
  const loading = Boolean(groupKey) && groupData.key !== groupKey;

  // ── Fetch the group ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!groupKey) return;

    let cancelled = false;

    const timer = setTimeout(async () => {
      const { data, error } = await getGroupListings({
        groupKey,
        excludePartnerId: partnerId,
      });
      if (cancelled) return;
      if (error) console.error('Price comparison failed:', error);
      setGroupData({ key: groupKey, rows: error ? [] : data ?? [] });
    }, DEBOUNCE_MS);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [groupKey, partnerId]);

  // ── Derived comparison ───────────────────────────────────────────────────
  const priced = useMemo(
    () => listings.filter((l) => l.unit_price != null).sort((a, b) => a.unit_price - b.unit_price),
    [listings]
  );
  const onRequest = useMemo(() => listings.filter((l) => l.unit_price == null), [listings]);

  const lowestListing = priced[0] ?? null;
  const lowest = lowestListing ? Number(lowestListing.unit_price) : null;
  const myPrice = unitPrice === '' || unitPrice == null ? null : Number(unitPrice);
  const isAboveLowest = lowest != null && myPrice != null && myPrice > lowest;

  // Report upward so the page can gate its save. Held in a ref so an inline
  // callback from the parent can't retrigger this effect.
  const reportRef = useRef(onComparisonChange);
  useEffect(() => {
    reportRef.current = onComparisonChange;
  }, [onComparisonChange]);

  useEffect(() => {
    reportRef.current?.({
      groupKey,
      count: listings.length,
      lowest,
      lowestPartnerName: lowestListing ? sellerName(lowestListing) : null,
    });
  }, [groupKey, listings.length, lowest, lowestListing]);

  // ── Manual link search ───────────────────────────────────────────────────
  const trimmedTerm = searchTerm.trim();
  const searchResults = searchData.term === trimmedTerm ? searchData.rows : [];
  const searching = showSearch && trimmedTerm.length >= 2 && searchData.term !== trimmedTerm;

  useEffect(() => {
    if (!showSearch || trimmedTerm.length < 2) return;

    let cancelled = false;

    const timer = setTimeout(async () => {
      const { data, error } = await searchLinkCandidates({
        term: trimmedTerm,
        excludePartnerId: partnerId,
      });
      if (cancelled) return;
      if (error) console.error('Link search failed:', error);
      setSearchData({ term: trimmedTerm, rows: error ? [] : data ?? [] });
    }, DEBOUNCE_MS);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [showSearch, trimmedTerm, partnerId]);

  const linkTo = useCallback(
    (listing) => {
      // Join whichever group the chosen listing already belongs to
      const key = listing.canonical_key || listing.match_key;
      if (!key) return;
      onCanonicalKeyChange(key);
      setShowSearch(false);
      setSearchTerm('');
      setSearchData({ term: '', rows: [] });
    },
    [onCanonicalKeyChange]
  );

  // ── Render helpers ───────────────────────────────────────────────────────

  const searchBlock = (
    <div className="mt-3">
      {!showSearch ? (
        <button
          type="button"
          onClick={() => setShowSearch(true)}
          className="text-[11px] font-semibold text-[#0A1628] hover:text-[#C9A84C] transition-colors flex items-center gap-1"
        >
          <Link2 size={12} /> Link to an existing listing
        </button>
      ) : (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="flex-1 relative">
              <Search
                size={13}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#718096]"
              />
              <input
                autoFocus
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search other sellers' listings by name or model…"
                className="w-full pl-8 pr-3 py-1.5 text-xs border border-[#E2E8F0] rounded-[6px] focus:outline-none focus:ring-2 focus:ring-[#C9A84C] bg-white"
              />
            </div>
            <button
              type="button"
              onClick={() => {
                setShowSearch(false);
                setSearchTerm('');
              }}
              className="p-1.5 text-[#718096] hover:text-[#0A1628] transition-colors"
              aria-label="Close search"
            >
              <X size={14} />
            </button>
          </div>

          {searching && (
            <p className="text-[11px] text-[#718096] flex items-center gap-1.5">
              <Loader size={11} className="animate-spin" /> Searching…
            </p>
          )}

          {!searching && trimmedTerm.length >= 2 && searchResults.length === 0 && (
            <p className="text-[11px] text-[#718096]">No matching listings from other sellers.</p>
          )}

          {searchResults.length > 0 && (
            <ul className="border border-[#E2E8F0] rounded-[6px] divide-y divide-[#E2E8F0] overflow-hidden">
              {searchResults.map((r) => (
                <li key={r.id} className="flex items-center gap-2 px-2.5 py-2 bg-white">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-[#0A1628] truncate">{r.name}</p>
                    <p className="text-[10px] text-[#718096] truncate">
                      {sellerName(r)}
                      {r.model ? ` · ${r.model}` : ''}
                      {r.unit_price != null ? ` · ${inr(r.unit_price)}` : ' · Price on request'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => linkTo(r)}
                    disabled={!r.canonical_key && !r.match_key}
                    className={`${pillBtn} bg-[#0A1628] text-white hover:bg-[#1A2E4A] disabled:opacity-40`}
                    title={
                      !r.canonical_key && !r.match_key
                        ? 'That listing has no model number, so it cannot be grouped'
                        : undefined
                    }
                  >
                    <Link2 size={11} /> Link
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );

  const wrapper = (children) => (
    <div className="mt-4 pt-4 border-t border-[#E2E8F0]">{children}</div>
  );

  // ── States ───────────────────────────────────────────────────────────────

  // Marked as a distinct product — no comparison, offer an undo.
  if (isRejected) {
    return wrapper(
      <div className="flex items-start gap-2">
        <Info size={14} className="text-[#718096] mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <p className="text-xs text-[#4A5568]">
            Marked as a different product from other sellers' listings — no price comparison is
            shown.
          </p>
          <button
            type="button"
            onClick={() => onCanonicalKeyChange('')}
            className="mt-1.5 text-[11px] font-semibold text-[#0A1628] hover:text-[#C9A84C] transition-colors flex items-center gap-1"
          >
            <Unlink size={12} /> Undo
          </button>
        </div>
      </div>
    );
  }

  // No group key at all — the product has no model number to match on.
  if (!groupKey) {
    return wrapper(
      <>
        <div className="flex items-start gap-2">
          <Info size={14} className="text-[#718096] mt-0.5 flex-shrink-0" />
          <p className="text-xs text-[#4A5568]">
            Add a <span className="font-semibold">model number</span> above to compare prices with
            other sellers offering the same product.
          </p>
        </div>
        {searchBlock}
      </>
    );
  }

  if (loading) {
    return wrapper(
      <p className="text-xs text-[#718096] flex items-center gap-1.5">
        <Loader size={12} className="animate-spin" /> Checking other sellers' prices…
      </p>
    );
  }

  if (listings.length === 0) {
    return wrapper(
      <>
        <p className="text-xs text-[#4A5568]">
          No other seller currently lists this product. You'll be the only seller.
        </p>
        {searchBlock}
      </>
    );
  }

  return wrapper(
    <>
      {/* Heading */}
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-1.5">
          <TrendingDown size={14} className="text-[#C9A84C]" />
          <span className="text-xs font-bold text-[#0A1628]">
            Also sold by {listings.length} other {listings.length === 1 ? 'seller' : 'sellers'}
          </span>
        </div>
        {isConfirmed && (
          <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded flex items-center gap-1">
            <Check size={10} /> Matched
          </span>
        )}
      </div>

      {/* Partner / price table */}
      <ul className="border border-[#E2E8F0] rounded-[6px] divide-y divide-[#E2E8F0] overflow-hidden">
        {[...priced, ...onRequest].map((l) => {
          const isLowest = lowestListing && l.id === lowestListing.id;
          return (
            <li
              key={l.id}
              className={`flex items-center gap-2 px-2.5 py-2 ${
                isLowest ? 'bg-[#FFFBEB]' : 'bg-white'
              }`}
            >
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-[#0A1628] truncate flex items-center gap-1.5">
                  {sellerName(l)}
                  {isPlatform(l) && (
                    <span className="text-[9px] font-bold text-[#8B6D1F] bg-[#FEF3C7] px-1 py-px rounded flex-shrink-0">
                      USJ
                    </span>
                  )}
                </p>
                <p className="text-[10px] text-[#718096] truncate">{l.name}</p>
              </div>

              {isLowest && (
                <span className="text-[10px] font-bold text-[#8B6D1F] bg-[#FEF3C7] px-1.5 py-0.5 rounded flex-shrink-0">
                  LOWEST
                </span>
              )}

              <div className="text-right flex-shrink-0">
                {l.unit_price != null ? (
                  <>
                    <p className="text-xs font-bold text-[#0A1628]">{inr(l.unit_price)}</p>
                    {l.mrp != null && Number(l.mrp) > Number(l.unit_price) && (
                      <p className="text-[10px] text-[#94A3B8] line-through">{inr(l.mrp)}</p>
                    )}
                  </>
                ) : (
                  <p className="text-[11px] text-[#718096] italic">On request</p>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      {/* Above-lowest nudge */}
      {isAboveLowest && (
        <div className="mt-2.5 flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-[6px] px-2.5 py-2">
          <TrendingDown size={14} className="text-amber-600 flex-shrink-0" />
          <p className="text-[11px] text-amber-900 flex-1">
            Your price is <span className="font-bold">{inr(myPrice - lowest)}</span> above the
            lowest ({inr(lowest)} by {sellerName(lowestListing)}). Listing at or below the lowest
            price wins more orders.
          </p>
          <button
            type="button"
            onClick={() => onUseLowestPrice(lowest)}
            className={`${pillBtn} bg-amber-600 text-white hover:bg-amber-700 flex-shrink-0`}
          >
            Use {inr(lowest)}
          </button>
        </div>
      )}

      {myPrice != null && lowest != null && !isAboveLowest && (
        <p className="mt-2.5 text-[11px] font-semibold text-emerald-700 flex items-center gap-1.5">
          <Check size={12} /> Your price matches or beats every other seller.
        </p>
      )}

      {myPrice == null && lowest != null && (
        <p className="mt-2.5 text-[11px] text-[#4A5568]">
          You haven't set a selling price. Other sellers list this from{' '}
          <span className="font-bold text-[#0A1628]">{inr(lowest)}</span>.
        </p>
      )}

      {/* Confirm / reject the match */}
      {!isConfirmed ? (
        <div className="mt-3 flex items-center gap-2 flex-wrap">
          <span className="text-[11px] text-[#718096]">Is this the same product?</span>
          <button
            type="button"
            onClick={() => onCanonicalKeyChange(groupKey)}
            className={`${pillBtn} bg-[#0A1628] text-white hover:bg-[#1A2E4A]`}
          >
            <Check size={11} /> Yes — same product
          </button>
          <button
            type="button"
            onClick={() => onCanonicalKeyChange(ownProductId)}
            className={`${pillBtn} border border-[#E2E8F0] text-[#4A5568] hover:bg-gray-50`}
          >
            <X size={11} /> No — different product
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => onCanonicalKeyChange(ownProductId)}
          className="mt-3 text-[11px] font-semibold text-[#718096] hover:text-red-600 transition-colors flex items-center gap-1"
        >
          <Unlink size={12} /> Unlink — this is a different product
        </button>
      )}
    </>
  );
}
