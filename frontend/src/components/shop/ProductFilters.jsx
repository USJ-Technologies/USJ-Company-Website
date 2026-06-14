import { useState, useEffect } from 'react';
import { Search, X, SlidersHorizontal } from 'lucide-react';
import { supabase } from '../../lib/supabase';

const STATIC_CATEGORIES = [
  'Surveillance & Security',
  'Networking Equipment',
  'Power Solutions',
  'Computer & Peripherals',
  'Communication Devices',
  'Defence Electronics',
];

/**
 * @param {{
 *   filters: object,
 *   onFilterChange: (key: string, value: any) => void,
 *   onClear: () => void,
 * }} props
 */
export default function ProductFilters({ filters, onFilterChange, onClear }) {
  const [categoriesList, setCategoriesList] = useState([]);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    supabase.from('categories').select('name').order('name')
      .then(({ data }) => {
        if (data?.length > 0) {
          setCategoriesList(data.map((c) => c.name));
        } else {
          setCategoriesList(STATIC_CATEGORIES);
        }
      })
      .catch(() => setCategoriesList(STATIC_CATEGORIES));
  }, []);

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Search */}
      <div>
        <label htmlFor="filter-search" className="block text-xs font-semibold text-[#0A1628] uppercase tracking-wide mb-2">
          Search
        </label>
        <div className="relative">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            id="filter-search"
            type="text"
            value={filters.search || ''}
            onChange={(e) => onFilterChange('search', e.target.value)}
            placeholder="Search products..."
            className="w-full pl-8 pr-3 py-2 text-sm border border-[#E2E8F0] rounded-[6px] focus:outline-none focus:ring-2 focus:ring-[#C9A84C]"
          />
        </div>
      </div>

      {/* Categories */}
      <div>
        <p className="text-xs font-semibold text-[#0A1628] uppercase tracking-wide mb-2">Category</p>
        <div className="space-y-1.5">
          {categoriesList.map((cat) => (
            <label key={cat} className="flex items-center gap-2 cursor-pointer text-sm text-[#4A5568] hover:text-[#0A1628]">
              <input
                type="checkbox"
                checked={(filters.categories || []).includes(cat)}
                onChange={(e) => {
                  const current = filters.categories || [];
                  onFilterChange(
                    'categories',
                    e.target.checked ? [...current, cat] : current.filter((c) => c !== cat)
                  );
                }}
                className="rounded border-[#E2E8F0] accent-[#C9A84C]"
              />
              {cat}
            </label>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <p className="text-xs font-semibold text-[#0A1628] uppercase tracking-wide mb-2">Price Range (₹)</p>
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="Min"
            value={filters.minPrice || ''}
            onChange={(e) => onFilterChange('minPrice', e.target.value)}
            className="w-full px-3 py-2 text-sm border border-[#E2E8F0] rounded-[6px] focus:outline-none focus:ring-2 focus:ring-[#C9A84C]"
            min={0}
          />
          <input
            type="number"
            placeholder="Max"
            value={filters.maxPrice || ''}
            onChange={(e) => onFilterChange('maxPrice', e.target.value)}
            className="w-full px-3 py-2 text-sm border border-[#E2E8F0] rounded-[6px] focus:outline-none focus:ring-2 focus:ring-[#C9A84C]"
            min={0}
          />
        </div>
      </div>

      {/* Toggles */}
      <div className="space-y-2">
        <label className="flex items-center justify-between cursor-pointer">
          <span className="text-sm text-[#4A5568]">In Stock Only</span>
          <input
            type="checkbox"
            checked={!!filters.inStock}
            onChange={(e) => onFilterChange('inStock', e.target.checked)}
            className="accent-[#C9A84C]"
          />
        </label>
        <label className="flex items-center justify-between cursor-pointer">
          <span className="text-sm text-[#4A5568]">B2B / Bulk Only</span>
          <input
            type="checkbox"
            checked={!!filters.isB2B}
            onChange={(e) => onFilterChange('isB2B', e.target.checked)}
            className="accent-[#C9A84C]"
          />
        </label>
      </div>

      {/* Clear */}
      <button
        onClick={onClear}
        className="w-full py-2 rounded-[6px] text-sm font-semibold text-[#4A5568] border border-[#E2E8F0] hover:border-[#0A1628] hover:text-[#0A1628] transition-colors"
      >
        Clear Filters
      </button>
    </div>
  );

  return (
    <>
      {/* Mobile toggle button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden flex items-center gap-2 px-4 py-2 rounded-[6px] border border-[#E2E8F0] text-sm font-medium text-[#0A1628] bg-white mb-4"
      >
        <SlidersHorizontal size={15} /> Filters
      </button>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-72 bg-white p-5 overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-[#0A1628]">Filters</h3>
              <button onClick={() => setMobileOpen(false)}>
                <X size={20} />
              </button>
            </div>
            <FilterContent />
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden lg:block w-56 shrink-0">
        <div className="bg-white border border-[#E2E8F0] rounded-[8px] p-5 sticky top-24">
          <h3 className="font-bold text-[#0A1628] mb-5 text-sm uppercase tracking-wide">Filters</h3>
          <FilterContent />
        </div>
      </div>
    </>
  );
}
