import { BedDouble, Briefcase, Building2, Calendar, FileText, Globe2, GraduationCap, MapPin, Search } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { JOB_SECTORS } from '../data/seedJobs';
import { NAMIBIA_RENTAL_LOCATIONS, SADC_COUNTRIES } from '../data/seedProperties';
import { JobFilters, SearchFilters } from '../types/rental';
import { todayIso } from '../utils/format';

interface HeroSearchProps {
  mode: 'rentals' | 'jobs';
  rentalFilters: SearchFilters;
  jobFilters: JobFilters;
  rentalCount: number;
  jobCount: number;
  onModeChange: (mode: 'rentals' | 'jobs') => void;
  onOpenCvMaker: () => void;
  onApplyRentalSearch: (partial: Partial<SearchFilters>) => void;
  onApplyJobSearch: (partial: Partial<JobFilters>) => void;
}

export function HeroSearch({
  mode,
  rentalFilters,
  jobFilters,
  rentalCount,
  jobCount,
  onModeChange,
  onOpenCvMaker,
  onApplyRentalSearch,
  onApplyJobSearch,
}: HeroSearchProps) {
  const [locationInput, setLocationInput] = useState(rentalFilters.location);
  const [checkIn, setCheckIn] = useState(rentalFilters.checkIn);
  const [checkOut, setCheckOut] = useState(rentalFilters.checkOut);
  const [bedrooms, setBedrooms] = useState(rentalFilters.bedrooms);

  const [jobKeyword, setJobKeyword] = useState(jobFilters.q);
  const [jobCountry, setJobCountry] = useState(jobFilters.country);
  const [jobSector, setJobSector] = useState(jobFilters.sector);

  const today = todayIso();

  function handleRentalSubmit(e: FormEvent) {
    e.preventDefault();
    onApplyRentalSearch({
      location: locationInput,
      checkIn,
      checkOut: checkOut && checkIn && checkOut <= checkIn ? '' : checkOut,
      bedrooms,
    });
    document.getElementById('listings-explorer')?.scrollIntoView({ behavior: 'smooth' });
  }

  function handleJobSubmit(e: FormEvent) {
    e.preventDefault();
    onApplyJobSearch({
      q: jobKeyword,
      country: jobCountry,
      sector: jobSector,
    });
    document.getElementById('listings-explorer')?.scrollIntoView({ behavior: 'smooth' });
  }

  function handleQuickStudentHoliday() {
    onModeChange('jobs');
    onApplyJobSearch({
      country: 'Namibia',
      studentHolidayOnly: true,
    });
    setTimeout(() => {
      document.getElementById('listings-explorer')?.scrollIntoView({ behavior: 'smooth' });
    }, 60);
  }

  return (
    <section className="relative isolate overflow-hidden border-b border-white/10">
      <img
        src="/src/assets/images/hero_walvis_namibia_1794939592267.jpg"
        alt="Walvis Bay Atlantic port promenade and Namibia skyline at twilight"
        referrerPolicy="no-referrer"
        className="absolute inset-0 -z-20 h-full w-full object-cover object-center opacity-55"
      />
      <div
        className="absolute inset-0 -z-10 bg-gradient-to-b from-[#0B1120]/75 via-[#0B1120]/70 to-[#0B1120]"
        aria-hidden="true"
      />

      <div className="mx-auto max-w-7xl px-4 pt-12 pb-14 md:px-6 md:pt-16 md:pb-20">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold tracking-wide text-emerald-300">
            {rentalCount} Rooms &amp; Rentals in Namibia · {jobCount} Namibian &amp; SADC Eligible Jobs
          </p>
          <h1 className="font-display mt-3 text-[clamp(2.25rem,4.2vw,3.75rem)] leading-[1.06] font-bold tracking-tight text-[#EEF3FB] [text-wrap:balance]">
            Namibian rooms, student holiday stores &amp; SADC careers.
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-[#C2CEE3] md:text-lg">
            Find verified rooms and rentals strictly within Namibia — plus student holiday and local
            store jobs across Namibia and regional SADC roles where Namibians qualify to apply.
          </p>
        </div>

        {/* Mode Switcher + Quick Student Holiday Shortcut */}
        <div className="mt-7 flex flex-wrap items-center gap-3">
          <div className="inline-flex items-center gap-1 rounded-xl border border-white/12 bg-[#111A2E]/90 p-1 backdrop-blur-md">
            <button
              type="button"
              onClick={() => onModeChange('rentals')}
              className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                mode === 'rentals'
                  ? 'bg-emerald-600 text-white'
                  : 'text-[#C2CEE3] hover:text-white'
              }`}
            >
              <Building2 className="size-3.5" />
              Namibia Rooms &amp; Rentals
            </button>
            <button
              type="button"
              onClick={() => onModeChange('jobs')}
              className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                mode === 'jobs'
                  ? 'bg-blue-600 text-white'
                  : 'text-[#C2CEE3] hover:text-white'
              }`}
            >
              <Briefcase className="size-3.5" />
              Namibia &amp; SADC Jobs
            </button>
          </div>

          <button
            type="button"
            onClick={handleQuickStudentHoliday}
            className="inline-flex items-center gap-1.5 rounded-xl border border-amber-400/35 bg-amber-500/15 px-3.5 py-2.5 text-xs font-semibold text-amber-200 backdrop-blur-md transition-colors hover:bg-amber-500/25 whitespace-nowrap cursor-pointer"
          >
            <GraduationCap className="size-3.5 text-amber-300" />
            Student Holiday &amp; Store Jobs (Namibia)
          </button>

          <button
            type="button"
            onClick={onOpenCvMaker}
            className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-400/35 bg-emerald-500/15 px-3.5 py-2.5 text-xs font-semibold text-emerald-200 backdrop-blur-md transition-colors hover:bg-emerald-500/25 whitespace-nowrap cursor-pointer"
          >
            <FileText className="size-3.5 text-emerald-300" />
            Build Your CV
          </button>
        </div>

        {mode === 'rentals' ? (
          <form
            onSubmit={handleRentalSubmit}
            className="mt-3 rounded-2xl border border-white/12 bg-[#111A2E]/90 p-3 shadow-2xl backdrop-blur-md"
          >
            <div className="grid gap-2.5 md:grid-cols-12">
              <label className="md:col-span-4 flex flex-col justify-center rounded-xl border border-white/10 bg-[#0B1120]/75 px-3.5 py-2.5">
                <span className="flex items-center gap-1.5 text-[11px] font-semibold text-[#8EA2C4]">
                  <MapPin className="size-3.5 text-emerald-400" />
                  Namibian Town or Suburb
                </span>
                <select
                  value={locationInput}
                  onChange={(e) => setLocationInput(e.target.value)}
                  className="mt-1 w-full bg-transparent text-sm font-medium text-[#EEF3FB] outline-none cursor-pointer"
                >
                  <option value="" className="bg-[#111A2E]">
                    All of Namibia
                  </option>
                  {NAMIBIA_RENTAL_LOCATIONS.map((loc) => (
                    <option key={loc} value={loc} className="bg-[#111A2E]">
                      {loc}
                    </option>
                  ))}
                </select>
              </label>

              <label className="md:col-span-2 flex flex-col justify-center rounded-xl border border-white/10 bg-[#0B1120]/75 px-3.5 py-2.5">
                <span className="flex items-center gap-1.5 text-[11px] font-semibold text-[#8EA2C4]">
                  <Calendar className="size-3.5 text-emerald-400" />
                  Check-in
                </span>
                <input
                  type="date"
                  min={today}
                  value={checkIn}
                  onChange={(e) => {
                    const nextIn = e.target.value;
                    setCheckIn(nextIn);
                    if (checkOut && nextIn >= checkOut) setCheckOut('');
                  }}
                  className="mt-1 w-full bg-transparent text-sm font-medium text-[#EEF3FB] outline-none [color-scheme:dark]"
                />
              </label>

              <label className="md:col-span-2 flex flex-col justify-center rounded-xl border border-white/10 bg-[#0B1120]/75 px-3.5 py-2.5">
                <span className="flex items-center gap-1.5 text-[11px] font-semibold text-[#8EA2C4]">
                  <Calendar className="size-3.5 text-emerald-400" />
                  Check-out
                </span>
                <input
                  type="date"
                  min={checkIn || today}
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                  className="mt-1 w-full bg-transparent text-sm font-medium text-[#EEF3FB] outline-none [color-scheme:dark]"
                />
              </label>

              <label className="md:col-span-2 flex flex-col justify-center rounded-xl border border-white/10 bg-[#0B1120]/75 px-3.5 py-2.5">
                <span className="flex items-center gap-1.5 text-[11px] font-semibold text-[#8EA2C4]">
                  <BedDouble className="size-3.5 text-emerald-400" />
                  Bedrooms
                </span>
                <select
                  value={bedrooms}
                  onChange={(e) => setBedrooms(Number(e.target.value))}
                  className="mt-1 w-full bg-transparent text-sm font-medium text-[#EEF3FB] outline-none cursor-pointer"
                >
                  <option value={0} className="bg-[#111A2E]">
                    Any bedrooms
                  </option>
                  <option value={1} className="bg-[#111A2E]">
                    1+ bedrooms
                  </option>
                  <option value={2} className="bg-[#111A2E]">
                    2+ bedrooms
                  </option>
                  <option value={3} className="bg-[#111A2E]">
                    3+ bedrooms
                  </option>
                  <option value={4} className="bg-[#111A2E]">
                    4+ bedrooms
                  </option>
                </select>
              </label>

              <div className="md:col-span-2 flex">
                <button
                  type="submit"
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white whitespace-nowrap transition-colors hover:bg-emerald-500 cursor-pointer"
                >
                  <Search className="size-4 shrink-0" />
                  Search Rooms
                </button>
              </div>
            </div>
          </form>
        ) : (
          <form
            onSubmit={handleJobSubmit}
            className="mt-3 rounded-2xl border border-white/12 bg-[#111A2E]/90 p-3 shadow-2xl backdrop-blur-md"
          >
            <div className="grid gap-2.5 md:grid-cols-12">
              <label className="md:col-span-5 flex flex-col justify-center rounded-xl border border-white/10 bg-[#0B1120]/75 px-3.5 py-2.5">
                <span className="flex items-center gap-1.5 text-[11px] font-semibold text-[#8EA2C4]">
                  <Search className="size-3.5 text-blue-400" />
                  Job Title, Store, or Skill
                </span>
                <input
                  type="text"
                  value={jobKeyword}
                  onChange={(e) => setJobKeyword(e.target.value)}
                  placeholder="e.g. Cashier, Woermann Brock, SADC, Engineer..."
                  className="mt-1 w-full bg-transparent text-sm font-medium text-[#EEF3FB] placeholder:text-[#66799B] outline-none"
                />
              </label>

              <label className="md:col-span-3 flex flex-col justify-center rounded-xl border border-white/10 bg-[#0B1120]/75 px-3.5 py-2.5">
                <span className="flex items-center gap-1.5 text-[11px] font-semibold text-[#8EA2C4]">
                  <Globe2 className="size-3.5 text-blue-400" />
                  Namibia &amp; SADC Country
                </span>
                <select
                  value={jobCountry}
                  onChange={(e) => setJobCountry(e.target.value)}
                  className="mt-1 w-full bg-transparent text-sm font-medium text-[#EEF3FB] outline-none cursor-pointer"
                >
                  <option value="" className="bg-[#111A2E]">
                    Namibia + SADC (Namibians Eligible)
                  </option>
                  {SADC_COUNTRIES.map((c) => (
                    <option key={c} value={c} className="bg-[#111A2E]">
                      {c}
                    </option>
                  ))}
                </select>
              </label>

              <label className="md:col-span-2 flex flex-col justify-center rounded-xl border border-white/10 bg-[#0B1120]/75 px-3.5 py-2.5">
                <span className="flex items-center gap-1.5 text-[11px] font-semibold text-[#8EA2C4]">
                  <Briefcase className="size-3.5 text-blue-400" />
                  Sector
                </span>
                <select
                  value={jobSector}
                  onChange={(e) => setJobSector(e.target.value)}
                  className="mt-1 w-full bg-transparent text-sm font-medium text-[#EEF3FB] outline-none cursor-pointer"
                >
                  <option value="" className="bg-[#111A2E]">
                    All Sectors
                  </option>
                  {JOB_SECTORS.map((s) => (
                    <option key={s} value={s} className="bg-[#111A2E]">
                      {s}
                    </option>
                  ))}
                </select>
              </label>

              <div className="md:col-span-2 flex">
                <button
                  type="submit"
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white whitespace-nowrap transition-colors hover:bg-blue-500 cursor-pointer"
                >
                  <Search className="size-4 shrink-0" />
                  Search Jobs
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}
