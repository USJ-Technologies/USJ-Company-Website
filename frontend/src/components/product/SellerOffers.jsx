import { Store, Check } from 'lucide-react';

const inr = (v) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(v);

// A listing with no partner_id is USJ's own catalogue entry, so there is no
// usj_partners row to take a business name from.
const isPlatform = (l) => l.partner_id == null;
const sellerName = (l) =>
  isPlatform(l) ? 'USJ Technologies' : l.usj_partners?.business_name ?? 'USJ Partner';

/**
 * Every seller offering this product, cheapest first, with the lowest price
 * marked. Selecting a row swaps the buy box on the product page — the price,
 * the MRP saving and what Add to Cart puts in the basket.
 *
 * Presentational only: the group fetch lives on ProductDetailPage because the
 * JSON-LD needs the same rows to emit an AggregateOffer.
 */
export default function SellerOffers({ offers, selectedId, onSelect }) {
  // One seller is just the normal product page — nothing to compare.
  if (!offers || offers.length < 2) return null;

  const priced = offers.filter((o) => o.unit_price != null);
  const lowest = priced.length > 0 ? Number(priced[0].unit_price) : null;

  return (
    <div className="mb-5 border border-[#E2E8F0] rounded-xl overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-2.5 bg-[#F8F9FA] border-b border-[#E2E8F0]">
        <Store size={14} className="text-[#C9A84C]" />
        <span className="text-xs font-bold text-[#0A1628]">
          Available from {offers.length} sellers
        </span>
        <span className="text-[11px] text-[#718096] ml-auto">Tap a seller to buy from them</span>
      </div>

      <ul className="divide-y divide-[#E2E8F0]">
        {offers.map((o) => {
          const selected = o.id === selectedId;
          const isLowest = lowest != null && Number(o.unit_price) === lowest;

          return (
            <li key={o.id}>
              <button
                type="button"
                onClick={() => onSelect(o)}
                aria-pressed={selected}
                className={`w-full text-left flex items-center gap-3 px-4 py-3 transition-colors ${
                  selected ? 'bg-[#FFFBEB]' : 'bg-white hover:bg-[#F8F9FA]'
                }`}
              >
                {/* Radio */}
                <span
                  aria-hidden="true"
                  className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                    selected ? 'border-[#C9A84C] bg-[#C9A84C]' : 'border-[#CBD5E0]'
                  }`}
                >
                  {selected && <Check size={10} className="text-white" strokeWidth={3} />}
                </span>

                <span className="flex-1 min-w-0">
                  <span className="flex items-center gap-1.5">
                    <span className="text-sm font-semibold text-[#0A1628] truncate">
                      {sellerName(o)}
                    </span>
                    {isPlatform(o) && (
                      <span className="text-[9px] font-bold text-[#8B6D1F] bg-[#FEF3C7] px-1 py-px rounded flex-shrink-0">
                        USJ
                      </span>
                    )}
                  </span>
                  {isLowest && o.unit_price != null && (
                    <span className="block text-[10px] font-bold text-emerald-700 mt-0.5">
                      Lowest price
                    </span>
                  )}
                </span>

                <span className="text-right flex-shrink-0">
                  {o.unit_price != null ? (
                    <>
                      <span className="block text-sm font-bold text-[#0A1628]">
                        {inr(o.unit_price)}
                      </span>
                      {o.mrp != null && Number(o.mrp) > Number(o.unit_price) && (
                        <span className="block text-[10px] text-[#94A3B8] line-through">
                          {inr(o.mrp)}
                        </span>
                      )}
                    </>
                  ) : (
                    <span className="block text-xs text-[#718096] italic">On request</span>
                  )}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
