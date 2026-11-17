import { Bookmark, Check, RotateCcw, Search, SlidersHorizontal } from 'lucide-react';
import { NAMIBIA_REGIONS, NAMIBIA_RENTAL_LOCATIONS } from '../data/seedProperties';
import { Amenity, SearchFilters } from '../types/rental';
import { formatNad, todayIso } from '../utils/format';

export const FILTER_AMENITIES: Amenity[] = [
  'Wi-Fi',
  'Parking',
  'Pets allowed',
  'Ocean view',
  'Furnished',
  'Security',
  'Workspace',
  'Braai area',
];

const PROPERTY_TYPES = [
  'Apartment',
  'Studio Flat',
  'Private Room',
  'House',
  'Villa',
  'Shared House',
  'Backyard Flat',
];

interface FilterBarProps {
  filters: SearchFilters;
  resultCount: number;
  savedCount: number;
  viewMode: 'split' | 'grid' | 'map';
  onChange: (partial: Partial<SearchFilters>) => void;
  onReset: () => void;
  onOpenSaved: () => void;
  onViewModeChange: (mode: 'split' | 'grid' | 'map') => void;
}

export function FilterBar({
  filters,
  resultCount,
  savedCount,
  viewMode,
  onChange,
  onReset,
  onOpenSaved,
  onViewModeChange,
}: FilterBarProps) {
  const today = todayIso();

  const hasActiveFilters = Boolean(
    filters.q ||
      filters.region ||
      filters.location ||
      filters.propertyType ||
      filters.minPrice > 0 ||
      filters.maxPrice < 5000 ||
      filters.maxMonthly > 0 ||
      filters.postedSince !== '' ||
      filters.bedrooms > 0 ||
      filters.checkIn ||
      filters.checkOut ||
      filters.amenities.length > 0 ||
      filters.sortBy !== 'featured'
  );

  function toggleAmenity(amenity: Amenity) {
    const exists = filters.amenities.includes(amenity);
    const next = exists
      ? filters.amenities.filter((a) => a !== amenity)
      : [...filters.amenities, amenity];
    onChange({ amenities: next });
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-[#111A2E] p-4 md:p-5">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div className="flex items-center gap-2.5">
          <SlidersHorizontal className="size-4 text-emerald-400" />
          <h2 className="font-display text-base font-semibold text-[#EEF3FB]">
            Rooms &amp; Rentals in Namibia
          </h2>
          <span className="font-mono-tabular text-xs text-[#9FB1CF]">
            · {resultCount} {resultCount === 1 ? 'listing' : 'listings'} in Namibia
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={onOpenSaved}
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-[#0B1120] px-3 py-1.5 text-xs font-medium text-[#C2CEE3] transition-colors hover:border-white/25 hover:text-white whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Bookmark className="size-3.5 text-emerald-400" />
            Saved ({savedCount})
          </button>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={onReset}
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-xs font-medium text-[#C2CEE3] transition-colors hover:border-white/20 hover:text-white whitespace-nowrap shrink-0 cursor-pointer"
            >
              <RotateCcw className="size-3.5" />
              Reset Filters
            </button>
          )}

          <select
            aria-label="Sort properties"
            value={filters.sortBy}
            onChange={(e) =>
              onChange({
                sortBy: e.target.value as SearchFilters['sortBy'],
              })
            }
            className="h-[34px] rounded-lg border border-white/10 bg-[#0B1120] px-2.5 text-xs font-medium text-[#EEF3FB] outline-none cursor-pointer"
          >
            <option value="featured">Sort: Featured</option>
            <option value="monthly_asc">Monthly Rent: Low to High</option>
            <option value="rating">Sort: Top Rated</option>
            <option value="price_asc">Nightly Price: Low to High</option>
            <option value="price_desc">Nightly Price: High to Low</option>
          </select>

          <div
            role="group"
            aria-label="Layout view"
            className="flex items-center gap-1 rounded-lg bg-[#0B1120] p-1 border border-white/10"
          >
            {(
              [
                { id: 'split', label: 'Grid + Map' },
                { id: 'grid', label: 'Grid' },
                { id: 'map', label: 'Map' },
              ] as const
            ).map((mode) => (
              <button
                key={mode.id}
                type="button"
                onClick={() => onViewModeChange(mode.id)}
                className={`rounded-md px-3 py-1.5 text-xs font-semibold whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                  viewMode === mode.id
                    ? 'bg-emerald-600 text-white'
                    : 'text-[#9FB1CF] hover:text-[#EEF3FB]'
                }`}
              >
                {mode.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Primary Filter Controls */}
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-[#9FB1CF]">Keyword or Suburb</span>
          <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-[#0B1120] px-3 py-2">
            <Search className="size-4 text-[#7C8FB0] shrink-0" />
            <input
              type="text"
              value={filters.q}
              onChange={(e) => onChange({ q: e.target.value })}
              placeholder="Lagoon, UNAM, Rundu, fiber..."
              className="w-full bg-transparent text-sm text-[#EEF3FB] placeholder:text-[#66799B] outline-none"
            />
          </div>
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-[#9FB1CF]">Region (Namibia)</span>
          <select
            value={filters.region}
            onChange={(e) => onChange({ region: e.target.value })}
            className="h-[38px] rounded-xl border border-white/10 bg-[#0B1120] px-3 text-sm text-[#EEF3FB] outline-none cursor-pointer"
          >
            <option value="">All Regions</option>
            {NAMIBIA_REGIONS.map((region) => (
              <option key={region} value={region}>
                {region}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-[#9FB1CF]">Town / Area</span>
          <select
            value={filters.location}
            onChange={(e) => onChange({ location: e.target.value })}
            className="h-[38px] rounded-xl border border-white/10 bg-[#0B1120] px-3 text-sm text-[#EEF3FB] outline-none cursor-pointer"
          >
            <option value="">All Namibian Towns</option>
            {NAMIBIA_RENTAL_LOCATIONS.map((loc) => (
              <option key={loc} value={loc}>
                {loc}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-[#9FB1CF]">Room / Property Type</span>
          <select
            value={filters.propertyType}
            onChange={(e) => onChange({ propertyType: e.target.value })}
            className="h-[38px] rounded-xl border border-white/10 bg-[#0B1120] px-3 text-sm text-[#EEF3FB] outline-none cursor-pointer"
          >
            <option value="">All Types</option>
            {PROPERTY_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-[#9FB1CF]">Available From</span>
          <input
            type="date"
            min={today}
            value={filters.checkIn}
            onChange={(e) => {
              const nextIn = e.target.value;
              onChange({
                checkIn: nextIn,
                checkOut: filters.checkOut && nextIn >= filters.checkOut ? '' : filters.checkOut,
              });
            }}
            className="h-[38px] rounded-xl border border-white/10 bg-[#0B1120] px-3 text-sm text-[#EEF3FB] outline-none [color-scheme:dark]"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-[#9FB1CF]">Available Until</span>
          <input
            type="date"
            min={filters.checkIn || today}
            value={filters.checkOut}
            onChange={(e) => onChange({ checkOut: e.target.value })}
            className="h-[38px] rounded-xl border border-white/10 bg-[#0B1120] px-3 text-sm text-[#EEF3FB] outline-none [color-scheme:dark]"
          />
        </label>
      </div>

      {/* Price Range & Bedrooms Row */}
      <div className="mt-4 grid gap-4 border-t border-white/10 pt-4 md:grid-cols-12 md:items-center">
        <div className="md:col-span-5 flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-[#9FB1CF]">Price Range (Per Night, NAD)</span>
            <span className="font-mono-tabular font-semibold text-[#EEF3FB]">
              {formatNad(filters.minPrice)} – {filters.maxPrice >= 5000 ? 'N$5,000+' : formatNad(filters.maxPrice)}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="number"
              min={0}
              max={filters.maxPrice}
              step={100}
              aria-label="Minimum nightly price"
              value={filters.minPrice}
              onChange={(e) =>
                onChange({ minPrice: Math.max(0, Math.min(Number(e.target.value) || 0, filters.maxPrice)) })
              }
              className="font-mono-tabular w-24 rounded-lg border border-white/10 bg-[#0B1120] px-2.5 py-1.5 text-xs text-[#EEF3FB] outline-none"
            />
            <input
              type="range"
              min={400}
              max={5000}
              step={100}
              aria-label="Maximum nightly price"
              value={filters.maxPrice}
              onChange={(e) => onChange({ maxPrice: Number(e.target.value) })}
              className="flex-1 accent-emerald-500 cursor-pointer"
            />
            <span className="font-mono-tabular w-20 text-right text-xs text-[#9FB1CF]">
              Max {formatNad(filters.maxPrice)}
            </span>
          </div>
        </div>

        <div className="md:col-span-4 flex flex-col gap-1.5">
          <span className="text-xs font-medium text-[#9FB1CF]">Bedrooms</span>
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { value: 0, label: 'Any' },
              { value: 1, label: '1+ Bed' },
              { value: 2, label: '2+ Beds' },
              { value: 3, label: '3+ Beds' },
              { value: 4, label: '4+ Beds' },
            ].map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => onChange({ bedrooms: opt.value })}
                className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                  filters.bedrooms === opt.value
                    ? 'bg-emerald-600 text-white'
                    : 'border border-white/10 bg-[#0B1120] text-[#9FB1CF] hover:text-[#EEF3FB]'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="md:col-span-3 flex flex-col gap-1.5">
          <span className="text-xs font-medium text-[#9FB1CF]">Monthly Budget &amp; Freshness</span>
          <div className="flex items-center gap-2">
            <select
              aria-label="Maximum monthly rent"
              value={filters.maxMonthly}
              onChange={(e) => onChange({ maxMonthly: Number(e.target.value) })}
              className="h-[34px] flex-1 rounded-lg border border-white/10 bg-[#0B1120] px-2.5 text-xs font-medium text-[#EEF3FB] outline-none cursor-pointer"
            >
              <option value={0}>Monthly: Any</option>
              <option value={2500}>Up to N$2,500/mo</option>
              <option value={4500}>Up to N$4,500/mo</option>
              <option value={7500}>Up to N$7,500/mo</option>
              <option value={12000}>Up to N$12,000/mo</option>
            </select>
            <button
              type="button"
              onClick={() =>
                onChange({ postedSince: filters.postedSince === 'yesterday' ? '' : 'yesterday' })
              }
              aria-pressed={filters.postedSince === 'yesterday'}
              className={`h-[34px] rounded-lg px-2.5 text-xs font-semibold whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                filters.postedSince === 'yesterday'
                  ? 'bg-emerald-600 text-white'
                  : 'border border-white/10 bg-[#0B1120] text-[#9FB1CF] hover:text-[#EEF3FB]'
              }`}
            >
              New (Yesterday+)
            </button>
          </div>
        </div>
      </div>

      {/* Amenities Interactive Filter Toggles */}
      <div className="mt-4 border-t border-white/10 pt-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-1 text-xs font-medium text-[#9FB1CF]">Amenities:</span>
          {FILTER_AMENITIES.map((amenity) => {
            const active = filters.amenities.includes(amenity);
            return (
              <button
                key={amenity}
                type="button"
                aria-pressed={active}
                onClick={() => toggleAmenity(amenity)}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                  active
                    ? 'bg-emerald-600 text-white'
                    : 'border border-white/10 bg-[#0B1120] text-[#B4C3DC] hover:border-white/25 hover:text-white'
                }`}
              >
                {active && <Check className="size-3.5 shrink-0" />}
                {amenity}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
