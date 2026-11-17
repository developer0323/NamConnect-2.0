import { Briefcase, GraduationCap, RotateCcw, Search } from 'lucide-react';
import { EMPLOYMENT_TYPES, JOB_SECTORS } from '../data/seedJobs';
import { SADC_COUNTRIES } from '../data/seedProperties';
import { JobFilters } from '../types/rental';

interface JobsFilterBarProps {
  filters: JobFilters;
  resultCount: number;
  viewMode: 'split' | 'grid' | 'map';
  onChange: (partial: Partial<JobFilters>) => void;
  onReset: () => void;
  onViewModeChange: (mode: 'split' | 'grid' | 'map') => void;
}

export function JobsFilterBar({
  filters,
  resultCount,
  viewMode,
  onChange,
  onReset,
  onViewModeChange,
}: JobsFilterBarProps) {
  const hasActive = Boolean(
    filters.q ||
      filters.country ||
      filters.city ||
      filters.sector ||
      filters.employmentType ||
      filters.minSalary > 0 ||
      filters.studentHolidayOnly ||
      filters.eligibility
  );

  return (
    <div className="rounded-2xl border border-white/10 bg-[#111A2E] p-4 md:p-5">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div className="flex items-center gap-2.5">
          <Briefcase className="size-4 text-blue-400" />
          <h2 className="font-display text-base font-semibold text-[#EEF3FB]">
            Jobs in Namibia &amp; SADC (Namibians Eligible)
          </h2>
          <span className="font-mono-tabular text-xs text-[#9FB1CF]">
            · {resultCount} active open {resultCount === 1 ? 'vacancy' : 'vacancies'} (expired
            deadlines filtered)
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {hasActive && (
            <button
              type="button"
              onClick={onReset}
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-xs font-medium text-[#C2CEE3] transition-colors hover:border-white/20 hover:text-white whitespace-nowrap shrink-0 cursor-pointer"
            >
              <RotateCcw className="size-3.5" />
              Reset Filters
            </button>
          )}

          <div
            role="group"
            aria-label="Job layout view"
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
                    ? 'bg-blue-600 text-white'
                    : 'text-[#9FB1CF] hover:text-[#EEF3FB]'
                }`}
              >
                {mode.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Primary Controls */}
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
        <label className="lg:col-span-2 flex flex-col gap-1">
          <span className="text-xs font-medium text-[#9FB1CF]">Keyword, Store, Company, or Town</span>
          <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-[#0B1120] px-3 py-2">
            <Search className="size-4 text-[#7C8FB0] shrink-0" />
            <input
              type="text"
              value={filters.q}
              onChange={(e) => onChange({ q: e.target.value })}
              placeholder="Checkers, Woermann, SADC, Port, Rundu..."
              className="w-full bg-transparent text-sm text-[#EEF3FB] placeholder:text-[#66799B] outline-none"
            />
          </div>
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-[#9FB1CF]">Country</span>
          <select
            value={filters.country}
            onChange={(e) => onChange({ country: e.target.value })}
            className="h-[38px] rounded-xl border border-white/10 bg-[#0B1120] px-3 text-sm text-[#EEF3FB] outline-none cursor-pointer"
          >
            <option value="">Namibia &amp; SADC</option>
            {SADC_COUNTRIES.map((country) => (
              <option key={country} value={country}>
                {country}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-[#9FB1CF]">Sector</span>
          <select
            value={filters.sector}
            onChange={(e) => onChange({ sector: e.target.value })}
            className="h-[38px] rounded-xl border border-white/10 bg-[#0B1120] px-3 text-sm text-[#EEF3FB] outline-none cursor-pointer"
          >
            <option value="">All Sectors</option>
            {JOB_SECTORS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-[#9FB1CF]">Work Type</span>
          <select
            value={filters.employmentType}
            onChange={(e) => onChange({ employmentType: e.target.value })}
            className="h-[38px] rounded-xl border border-white/10 bg-[#0B1120] px-3 text-sm text-[#EEF3FB] outline-none cursor-pointer"
          >
            <option value="">All Types</option>
            {EMPLOYMENT_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-[#9FB1CF]">Min Monthly Pay</span>
          <select
            value={filters.minSalary}
            onChange={(e) => onChange({ minSalary: Number(e.target.value) })}
            className="h-[38px] rounded-xl border border-white/10 bg-[#0B1120] px-3 text-sm text-[#EEF3FB] outline-none cursor-pointer"
          >
            <option value={0}>Any salary</option>
            <option value={3000}>3,000+ (Student / Store)</option>
            <option value={15000}>15,000+ (NAD/ZAR/BWP)</option>
            <option value={30000}>30,000+ (NAD/ZAR/BWP)</option>
            <option value={45000}>45,000+ (Senior)</option>
          </select>
        </label>
      </div>

      {/* Student Holiday & Eligibility Filter Strip */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            aria-pressed={filters.studentHolidayOnly}
            onClick={() => onChange({ studentHolidayOnly: !filters.studentHolidayOnly })}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
              filters.studentHolidayOnly
                ? 'bg-amber-500 text-slate-950'
                : 'border border-amber-400/30 bg-[#0B1120] text-amber-200 hover:bg-amber-500/15'
            }`}
          >
            <GraduationCap className="size-3.5" />
            Student Holiday &amp; Local Store Jobs Only
          </button>

          <button
            type="button"
            aria-pressed={filters.sector === 'Retail & Local Stores'}
            onClick={() =>
              onChange({
                sector: filters.sector === 'Retail & Local Stores' ? '' : 'Retail & Local Stores',
              })
            }
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
              filters.sector === 'Retail & Local Stores'
                ? 'bg-blue-600 text-white'
                : 'border border-white/10 bg-[#0B1120] text-[#B4C3DC] hover:text-white'
            }`}
          >
            Local Stores (Checkers, Woermann, Pick n Pay, SPAR, PEP)
          </button>
        </div>

        <label className="flex items-center gap-2">
          <span className="text-xs font-medium text-[#9FB1CF]">Eligibility:</span>
          <select
            value={filters.eligibility}
            onChange={(e) =>
              onChange({
                eligibility: e.target.value as JobFilters['eligibility'],
              })
            }
            className="h-[34px] rounded-lg border border-white/10 bg-[#0B1120] px-3 text-xs font-medium text-[#EEF3FB] outline-none cursor-pointer"
          >
            <option value="">All Namibian-Eligible Roles</option>
            <option value="namibia">Inside Namibia</option>
            <option value="sadc-international">SADC &amp; International (Namibians Eligible)</option>
          </select>
        </label>
      </div>
    </div>
  );
}
