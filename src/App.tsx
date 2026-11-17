import { LoaderCircle, MapPin, SearchX } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { FilterBar } from './components/FilterBar';
import { FacebookGroupsHub } from './components/FacebookGroupsHub';
import { CvMakerView } from './components/CvMakerView';
import { HeroSearch } from './components/HeroSearch';
import { JobApplicationModal } from './components/JobApplicationModal';
import { JobCard } from './components/JobCard';
import { JobsFilterBar } from './components/JobsFilterBar';
import { ListPropertyModal } from './components/ListPropertyModal';
import { ListingSourcesSection } from './components/ListingSourcesSection';
import { MyBookingsView } from './components/MyBookingsView';
import { NamibiaMap } from './components/NamibiaMap';
import { Navbar, NavSection } from './components/Navbar';
import { PropertyBookingModal } from './components/PropertyBookingModal';
import { PropertyCard } from './components/PropertyCard';
import { ReviewFormModal } from './components/ReviewFormModal';
import { SavedDrawer } from './components/SavedDrawer';
import {
  Booking,
  CvDocument,
  JobApplication,
  JobFilters,
  JobListing,
  Property,
  PropertyReview,
  SearchFilters,
} from './types/rental';

const DEFAULT_RENTAL_FILTERS: SearchFilters = {
  q: '',
  region: '',
  location: '',
  propertyType: '',
  minPrice: 0,
  maxPrice: 5000,
  maxMonthly: 0,
  postedSince: '',
  bedrooms: 0,
  checkIn: '',
  checkOut: '',
  amenities: [],
  sortBy: 'featured',
};

const DEFAULT_JOB_FILTERS: JobFilters = {
  q: '',
  country: '',
  city: '',
  sector: '',
  employmentType: '',
  minSalary: 0,
  studentHolidayOnly: false,
  eligibility: '',
};

const SAVED_STORAGE_KEY = 'wbr_saved_property_ids_v1';

export default function App() {
  const [activeSection, setActiveSection] = useState<NavSection>('rentals');
  const [rentalViewMode, setRentalViewMode] = useState<'split' | 'grid' | 'map'>('split');
  const [jobViewMode, setJobViewMode] = useState<'split' | 'grid' | 'map'>('split');
  const [mapFilter, setMapFilter] = useState<'all' | 'rentals' | 'jobs'>('all');

  const [rentalFilters, setRentalFilters] = useState<SearchFilters>(DEFAULT_RENTAL_FILTERS);
  const [jobFilters, setJobFilters] = useState<JobFilters>(DEFAULT_JOB_FILTERS);

  const [allProperties, setAllProperties] = useState<Property[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [allJobs, setAllJobs] = useState<JobListing[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<JobListing[]>([]);

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [reviews, setReviews] = useState<PropertyReview[]>([]);
  const [savedCvs, setSavedCvs] = useState<CvDocument[]>([]);

  const [rentalsLoading, setRentalsLoading] = useState(true);
  const [jobsLoading, setJobsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [reviewTargetBooking, setReviewTargetBooking] = useState<Booking | null>(null);
  const [isSavedOpen, setIsSavedOpen] = useState(false);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [postModalDefaultTab, setPostModalDefaultTab] = useState<'rental' | 'fb-import' | 'job'>('rental');
  const [postModalDefaultGroup, setPostModalDefaultGroup] = useState<string | undefined>(undefined);
  const [gmpQuotaExceeded, setGmpQuotaExceeded] = useState(false);

  useEffect(() => {
    const handleQuotaExceeded = () => setGmpQuotaExceeded(true);
    window.addEventListener('gmp-quota-exceeded', handleQuotaExceeded);
    return () => window.removeEventListener('gmp-quota-exceeded', handleQuotaExceeded);
  }, []);

  const [savedIds, setSavedIds] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem(SAVED_STORAGE_KEY);
      return raw ? (JSON.parse(raw) as string[]) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(SAVED_STORAGE_KEY, JSON.stringify(savedIds));
    } catch {
      // Ignore storage errors in restricted iframes
    }
  }, [savedIds]);

  const fetchFilteredProperties = useCallback(async (activeFilters: SearchFilters) => {
    setRentalsLoading(true);
    setFetchError(null);
    try {
      const params = new URLSearchParams();
      if (activeFilters.q.trim()) params.set('q', activeFilters.q.trim());
      if (activeFilters.region) params.set('region', activeFilters.region);
      if (activeFilters.location) params.set('location', activeFilters.location);
      if (activeFilters.propertyType) params.set('propertyType', activeFilters.propertyType);
      if (activeFilters.minPrice > 0) params.set('minPrice', String(activeFilters.minPrice));
      if (activeFilters.maxPrice < 5000) params.set('maxPrice', String(activeFilters.maxPrice));
      if (activeFilters.maxMonthly > 0) params.set('maxMonthly', String(activeFilters.maxMonthly));
      if (activeFilters.postedSince) params.set('postedSince', activeFilters.postedSince);
      if (activeFilters.bedrooms > 0) params.set('bedrooms', String(activeFilters.bedrooms));
      if (activeFilters.checkIn) params.set('checkIn', activeFilters.checkIn);
      if (activeFilters.checkOut) params.set('checkOut', activeFilters.checkOut);
      if (activeFilters.amenities.length > 0) {
        params.set('amenities', activeFilters.amenities.join(','));
      }
      if (activeFilters.sortBy !== 'featured') {
        params.set('sortBy', activeFilters.sortBy);
      }

      const res = await fetch(`/api/properties?${params.toString()}`);
      if (!res.ok) throw new Error('Unable to load properties');
      const data = (await res.json()) as { properties: Property[] };
      setFilteredProperties(data.properties);
    } catch {
      setFetchError('Could not load rental properties. Please refresh to retry.');
    } finally {
      setRentalsLoading(false);
    }
  }, []);

  const fetchFilteredJobs = useCallback(async (activeFilters: JobFilters) => {
    setJobsLoading(true);
    try {
      const params = new URLSearchParams();
      if (activeFilters.q.trim()) params.set('q', activeFilters.q.trim());
      if (activeFilters.country) params.set('country', activeFilters.country);
      if (activeFilters.city) params.set('city', activeFilters.city);
      if (activeFilters.sector) params.set('sector', activeFilters.sector);
      if (activeFilters.employmentType) params.set('employmentType', activeFilters.employmentType);
      if (activeFilters.minSalary > 0) params.set('minSalary', String(activeFilters.minSalary));
      if (activeFilters.studentHolidayOnly) params.set('studentHolidayOnly', 'true');
      if (activeFilters.eligibility) params.set('eligibility', activeFilters.eligibility);

      const res = await fetch(`/api/jobs?${params.toString()}`);
      if (!res.ok) throw new Error('Unable to load jobs');
      const data = (await res.json()) as { jobs: JobListing[] };
      const today = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString().split('T')[0];
      setFilteredJobs(data.jobs.filter((j) => Boolean(j.applicationDeadline) && j.applicationDeadline >= today));
    } catch {
      // Keep previous jobs if transient error
    } finally {
      setJobsLoading(false);
    }
  }, []);

  const fetchInitialData = useCallback(async () => {
    try {
      const [propsRes, jobsRes, bookingsRes, appsRes, reviewsRes, cvsRes] = await Promise.all([
        fetch('/api/properties'),
        fetch('/api/jobs'),
        fetch('/api/bookings'),
        fetch('/api/applications'),
        fetch('/api/reviews'),
        fetch('/api/cvs'),
      ]);
      if (propsRes.ok) {
        const pData = (await propsRes.json()) as { properties: Property[] };
        setAllProperties(pData.properties);
        setFilteredProperties(pData.properties);
      }
      if (jobsRes.ok) {
        const jData = (await jobsRes.json()) as { jobs: JobListing[] };
        const today = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString().split('T')[0];
        const activeJobs = jData.jobs.filter(
          (j) => Boolean(j.applicationDeadline) && j.applicationDeadline >= today
        );
        setAllJobs(activeJobs);
        setFilteredJobs(activeJobs);
      }
      if (bookingsRes.ok) {
        const bData = (await bookingsRes.json()) as { bookings: Booking[] };
        setBookings(bData.bookings);
      }
      if (appsRes.ok) {
        const aData = (await appsRes.json()) as { applications: JobApplication[] };
        setApplications(aData.applications);
      }
      if (reviewsRes.ok) {
        const rData = (await reviewsRes.json()) as { reviews: PropertyReview[] };
        setReviews(rData.reviews);
      }
      if (cvsRes.ok) {
        const cData = (await cvsRes.json()) as { cvs: CvDocument[] };
        setSavedCvs(cData.cvs);
      }
    } catch {
      setFetchError('Could not connect to OpportunityHub SADC service.');
    } finally {
      setRentalsLoading(false);
      setJobsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchFilteredProperties(rentalFilters);
    }, 140);
    return () => clearTimeout(timer);
  }, [rentalFilters, fetchFilteredProperties]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchFilteredJobs(jobFilters);
    }, 140);
    return () => clearTimeout(timer);
  }, [jobFilters, fetchFilteredJobs]);

  function handleRentalFilterChange(partial: Partial<SearchFilters>) {
    setRentalFilters((prev) => ({ ...prev, ...partial }));
  }

  function handleJobFilterChange(partial: Partial<JobFilters>) {
    setJobFilters((prev) => ({ ...prev, ...partial }));
  }

  function handleResetRentalFilters() {
    setRentalFilters(DEFAULT_RENTAL_FILTERS);
  }

  function handleResetJobFilters() {
    setJobFilters(DEFAULT_JOB_FILTERS);
  }

  function handleToggleSave(id: string) {
    setSavedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  function refreshPropertiesLists() {
    fetchFilteredProperties(rentalFilters);
    fetch('/api/properties')
      .then((r) => r.json())
      .then((d: { properties: Property[] }) => {
        if (Array.isArray(d.properties)) setAllProperties(d.properties);
      })
      .catch(() => {});
  }

  function handleBookingCreated(booking: Booking) {
    setBookings((prev) => [booking, ...prev]);
    refreshPropertiesLists();
  }

  async function handleCancelBooking(bookingId: string) {
    const res = await fetch(`/api/bookings/${bookingId}/cancel`, { method: 'PATCH' });
    if (res.ok) {
      const data = (await res.json()) as { booking: Booking };
      setBookings((prev) => prev.map((b) => (b.id === bookingId ? data.booking : b)));
      refreshPropertiesLists();
    }
  }

  function handleReviewSubmitted(result: { review: PropertyReview; booking: Booking }) {
    setReviews((prev) => [result.review, ...prev]);
    setBookings((prev) =>
      prev.map((b) => (b.id === result.booking.id ? result.booking : b))
    );
    refreshPropertiesLists();
  }

  function handlePropertyCreated(property: Property) {
    setAllProperties((prev) => [property, ...prev]);
    fetchFilteredProperties(rentalFilters);
    setActiveSection('rentals');
  }

  function handleJobCreated(job: JobListing) {
    setAllJobs((prev) => [job, ...prev]);
    fetchFilteredJobs(jobFilters);
    setActiveSection('jobs');
  }

  function handleApplicationSubmitted(application: JobApplication) {
    setApplications((prev) => [application, ...prev]);
  }

  async function handleSaveCv(cv: CvDocument): Promise<CvDocument> {
    const res = await fetch('/api/cvs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cv),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Could not save CV.');
    }
    const saved = data.cv as CvDocument;
    setSavedCvs((prev) => [saved, ...prev.filter((c) => c.id !== saved.id)]);
    return saved;
  }

  async function handleDeleteCv(id: string): Promise<void> {
    await fetch(`/api/cvs/${encodeURIComponent(id)}`, { method: 'DELETE' });
    setSavedCvs((prev) => prev.filter((c) => c.id !== id));
  }

  const selectedProperty = useMemo(() => {
    if (!selectedPropertyId) return null;
    return (
      filteredProperties.find((p) => p.id === selectedPropertyId) ??
      allProperties.find((p) => p.id === selectedPropertyId) ??
      null
    );
  }, [selectedPropertyId, filteredProperties, allProperties]);

  const selectedJob = useMemo(() => {
    if (!selectedJobId) return null;
    return (
      filteredJobs.find((j) => j.id === selectedJobId) ??
      allJobs.find((j) => j.id === selectedJobId) ??
      null
    );
  }, [selectedJobId, filteredJobs, allJobs]);

  const eligibleBookingToReview = useMemo(() => {
    if (!selectedProperty) return null;
    return (
      bookings.find(
        (b) =>
          b.propertyId === selectedProperty.id &&
          b.status === 'confirmed' &&
          !b.reviewId &&
          !reviews.some((r) => r.bookingId === b.id)
      ) ?? null
    );
  }, [selectedProperty, bookings, reviews]);

  const savedProperties = useMemo(
    () => allProperties.filter((p) => savedIds.includes(p.id)),
    [allProperties, savedIds]
  );

  const activeBookingsCount = useMemo(
    () => bookings.filter((b) => b.status === 'confirmed').length + applications.length,
    [bookings, applications]
  );

  return (
    <div className="min-h-screen flex flex-col bg-[#0B1120] text-[#EEF3FB]">
      {gmpQuotaExceeded && (
        <div className="bg-amber-50 border-b border-amber-200 text-amber-900 px-4 py-2.5 text-xs md:text-sm text-center sticky top-0 z-50 shadow-sm">
          <span>
            Google Maps Platform quota reached. If you are the app owner, visit{' '}
            <a
              href="https://developers.google.com/maps/ai/ai-studio?utm_campaign=gmp_mcp_codeassist_v1_aistudio#quota_exceeded_errors"
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-semibold text-amber-950 hover:text-amber-800"
            >
              maps developer site
            </a>{' '}
            for instructions to update your account.
          </span>
        </div>
      )}
      <Navbar
        activeSection={activeSection}
        bookingsCount={activeBookingsCount}
        onNavigate={(section) => {
          setActiveSection(section);
          if (section === 'rentals' && rentalViewMode === 'map') {
            setRentalViewMode('split');
          }
          if (section === 'jobs' && jobViewMode === 'map') {
            setJobViewMode('split');
          }
        }}
        onOpenPostModal={() => {
          setPostModalDefaultTab(activeSection === 'jobs' ? 'job' : 'rental');
          setPostModalDefaultGroup(undefined);
          setIsPostModalOpen(true);
        }}
      />

      {/* Mobile quick navigation bar */}
      <div className="flex md:hidden items-center justify-around border-b border-white/10 bg-[#111A2E] px-2 py-2 text-xs font-semibold">
        <button
          type="button"
          onClick={() => setActiveSection('rentals')}
          className={activeSection === 'rentals' ? 'text-emerald-400' : 'text-[#9FB1CF]'}
        >
          Rentals
        </button>
        <button
          type="button"
          onClick={() => setActiveSection('jobs')}
          className={activeSection === 'jobs' ? 'text-blue-400' : 'text-[#9FB1CF]'}
        >
          Jobs
        </button>
        <button
          type="button"
          onClick={() => setActiveSection('cv-maker')}
          className={activeSection === 'cv-maker' ? 'text-emerald-400' : 'text-[#9FB1CF]'}
        >
          CV Maker
        </button>
        <button
          type="button"
          onClick={() => setActiveSection('map')}
          className={activeSection === 'map' ? 'text-blue-400' : 'text-[#9FB1CF]'}
        >
          Map
        </button>
        <button
          type="button"
          onClick={() => setActiveSection('bookings')}
          className={activeSection === 'bookings' ? 'text-blue-400' : 'text-[#9FB1CF]'}
        >
          Activity ({activeBookingsCount})
        </button>
      </div>

      <main className="flex-1">
        {activeSection === 'cv-maker' ? (
          <CvMakerView
            savedCvs={savedCvs}
            onSaveCv={handleSaveCv}
            onDeleteCv={handleDeleteCv}
            onApplyToJobs={() => setActiveSection('jobs')}
          />
        ) : activeSection === 'bookings' ? (
          <MyBookingsView
            bookings={bookings}
            applications={applications}
            reviews={reviews}
            onCancelBooking={handleCancelBooking}
            onOpenReview={(booking) => setReviewTargetBooking(booking)}
            onBackToRentals={() => setActiveSection('rentals')}
            onBackToJobs={() => setActiveSection('jobs')}
          />
        ) : activeSection === 'map' ? (
          <section className="mx-auto max-w-7xl px-4 py-8 md:px-6 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/10 bg-[#111A2E] p-4">
              <div className="flex items-center gap-2.5">
                <MapPin className="size-4 text-emerald-400" />
                <div>
                  <h1 className="font-display text-base font-semibold text-[#EEF3FB]">
                    Namibia Rooms &amp; SADC Eligible Jobs Map
                  </h1>
                  <p className="text-xs text-[#9FB1CF]">
                    {filteredProperties.length} Namibian rentals and {filteredJobs.length}{' '}
                    Namibian-eligible job vacancies
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-1.5 rounded-lg border border-white/10 bg-[#0B1120] p-1">
                {(
                  [
                    { id: 'all', label: 'All Pins' },
                    { id: 'rentals', label: 'Namibia Rentals' },
                    { id: 'jobs', label: 'Jobs Only' },
                  ] as const
                ).map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setMapFilter(opt.id)}
                    className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
                      mapFilter === opt.id
                        ? 'bg-blue-600 text-white'
                        : 'text-[#9FB1CF] hover:text-white'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <NamibiaMap
              mode={mapFilter}
              properties={filteredProperties}
              jobs={filteredJobs}
              highlightedId={highlightedId}
              onSelectProperty={(p) => setSelectedPropertyId(p.id)}
              onSelectJob={(j) => setSelectedJobId(j.id)}
              className="h-[640px]"
            />
          </section>
        ) : (
          <>
            <HeroSearch
              mode={activeSection === 'jobs' ? 'jobs' : 'rentals'}
              rentalFilters={rentalFilters}
              jobFilters={jobFilters}
              rentalCount={allProperties.length || 18}
              jobCount={allJobs.length || 23}
              onModeChange={(nextMode) => setActiveSection(nextMode)}
              onOpenCvMaker={() => setActiveSection('cv-maker')}
              onApplyRentalSearch={handleRentalFilterChange}
              onApplyJobSearch={handleJobFilterChange}
            />

            <section
              id="listings-explorer"
              className="mx-auto max-w-7xl px-4 py-8 md:px-6 md:py-10 space-y-6"
            >
              {activeSection === 'rentals' ? (
                <>
                  <FacebookGroupsHub
                    isYesterdayFilterActive={rentalFilters.postedSince === 'yesterday'}
                    onFilterPostedSinceYesterday={() =>
                      handleRentalFilterChange({
                        postedSince: rentalFilters.postedSince === 'yesterday' ? '' : 'yesterday',
                      })
                    }
                    onOpenImportModal={(groupName) => {
                      setPostModalDefaultTab('fb-import');
                      setPostModalDefaultGroup(groupName);
                      setIsPostModalOpen(true);
                    }}
                  />

                  <FilterBar
                    filters={rentalFilters}
                    resultCount={filteredProperties.length}
                    savedCount={savedProperties.length}
                    viewMode={rentalViewMode}
                    onChange={handleRentalFilterChange}
                    onReset={handleResetRentalFilters}
                    onOpenSaved={() => setIsSavedOpen(true)}
                    onViewModeChange={(mode) => {
                      setRentalViewMode(mode);
                      if (mode === 'map') {
                        setMapFilter('rentals');
                        setActiveSection('map');
                      }
                    }}
                  />

                  {fetchError ? (
                    <div className="rounded-2xl border border-rose-500/30 bg-rose-950/30 p-6 text-center text-sm text-rose-200">
                      {fetchError}
                    </div>
                  ) : rentalsLoading && filteredProperties.length === 0 ? (
                    <div className="flex items-center justify-center py-20">
                      <LoaderCircle className="size-7 animate-spin text-emerald-400" />
                    </div>
                  ) : filteredProperties.length === 0 ? (
                    <div className="rounded-2xl border border-white/10 bg-[#111A2E] p-12 text-center">
                      <SearchX className="mx-auto size-10 text-[#7C8FB0]" />
                      <h3 className="font-display mt-3 text-lg font-semibold text-[#EEF3FB]">
                        {rentalFilters.postedSince === 'yesterday'
                          ? 'No real Facebook Group rooms imported since yesterday yet'
                          : 'No Namibian rooms match those filters'}
                      </h3>
                      <p className="mx-auto mt-1.5 max-w-md text-sm text-[#9FB1CF]">
                        {rentalFilters.postedSince === 'yesterday'
                          ? 'We never fabricate Facebook Group posts. Open a Namibian Facebook rental group above, copy any real room posted since yesterday, and paste it via Import FB Room Post.'
                          : 'Try choosing another Namibian region or town, expanding your monthly or nightly budget, or clearing an amenity filter.'}
                      </p>
                      <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
                        {rentalFilters.postedSince === 'yesterday' && (
                          <button
                            type="button"
                            onClick={() => {
                              setPostModalDefaultTab('fb-import');
                              setPostModalDefaultGroup(undefined);
                              setIsPostModalOpen(true);
                            }}
                            className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-500 cursor-pointer"
                          >
                            Import FB Room Post
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={handleResetRentalFilters}
                          className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-500 cursor-pointer"
                        >
                          Clear All Filters
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      className={
                        rentalViewMode === 'split'
                          ? 'grid gap-6 lg:grid-cols-12 lg:items-start'
                          : 'block'
                      }
                    >
                      {rentalViewMode !== 'map' && (
                        <div
                          className={
                            rentalViewMode === 'split'
                              ? 'lg:col-span-7 grid gap-5 sm:grid-cols-2'
                              : 'grid gap-6 sm:grid-cols-2 lg:grid-cols-3'
                          }
                        >
                          {filteredProperties.map((property) => (
                            <PropertyCard
                              key={property.id}
                              property={property}
                              isSaved={savedIds.includes(property.id)}
                              isHighlighted={highlightedId === property.id}
                              onToggleSave={handleToggleSave}
                              onSelect={(p) => setSelectedPropertyId(p.id)}
                              onHover={setHighlightedId}
                            />
                          ))}
                        </div>
                      )}

                      {rentalViewMode !== 'grid' && (
                        <div
                          className={
                            rentalViewMode === 'split'
                              ? 'lg:col-span-5 lg:sticky lg:top-[4.75rem]'
                              : 'w-full'
                          }
                        >
                          <NamibiaMap
                            mode="rentals"
                            properties={filteredProperties}
                            highlightedId={highlightedId}
                            onSelectProperty={(p) => setSelectedPropertyId(p.id)}
                            className="h-[480px] lg:h-[620px]"
                          />
                        </div>
                      )}
                    </div>
                  )}
                </>
              ) : (
                <>
                  <JobsFilterBar
                    filters={jobFilters}
                    resultCount={filteredJobs.length}
                    viewMode={jobViewMode}
                    onChange={handleJobFilterChange}
                    onReset={handleResetJobFilters}
                    onViewModeChange={(mode) => {
                      setJobViewMode(mode);
                      if (mode === 'map') {
                        setMapFilter('jobs');
                        setActiveSection('map');
                      }
                    }}
                  />

                  {jobsLoading && filteredJobs.length === 0 ? (
                    <div className="flex items-center justify-center py-20">
                      <LoaderCircle className="size-7 animate-spin text-blue-400" />
                    </div>
                  ) : filteredJobs.length === 0 ? (
                    <div className="rounded-2xl border border-white/10 bg-[#111A2E] p-12 text-center">
                      <SearchX className="mx-auto size-10 text-[#7C8FB0]" />
                      <h3 className="font-display mt-3 text-lg font-semibold text-[#EEF3FB]">
                        No job vacancies match those filters
                      </h3>
                      <p className="mx-auto mt-1.5 max-w-md text-sm text-[#9FB1CF]">
                        Try toggling off the Student Holiday filter or clearing sector/country
                        constraints to view all Namibia and SADC roles open to Namibians.
                      </p>
                      <button
                        type="button"
                        onClick={handleResetJobFilters}
                        className="mt-5 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-500 cursor-pointer"
                      >
                        Reset Job Filters
                      </button>
                    </div>
                  ) : (
                    <div
                      className={
                        jobViewMode === 'split'
                          ? 'grid gap-6 lg:grid-cols-12 lg:items-start'
                          : 'block'
                      }
                    >
                      {jobViewMode !== 'map' && (
                        <div
                          className={
                            jobViewMode === 'split'
                              ? 'lg:col-span-7 grid gap-5 sm:grid-cols-2'
                              : 'grid gap-6 sm:grid-cols-2 lg:grid-cols-3'
                          }
                        >
                          {filteredJobs.map((job) => (
                            <JobCard
                              key={job.id}
                              job={job}
                              isHighlighted={highlightedId === job.id}
                              onSelect={(j) => setSelectedJobId(j.id)}
                              onHover={setHighlightedId}
                            />
                          ))}
                        </div>
                      )}

                      {jobViewMode !== 'grid' && (
                        <div
                          className={
                            jobViewMode === 'split'
                              ? 'lg:col-span-5 lg:sticky lg:top-[4.75rem]'
                              : 'w-full'
                          }
                        >
                          <NamibiaMap
                            mode="jobs"
                            properties={[]}
                            jobs={filteredJobs}
                            highlightedId={highlightedId}
                            onSelectProperty={(p) => setSelectedPropertyId(p.id)}
                            onSelectJob={(j) => setSelectedJobId(j.id)}
                            className="h-[480px] lg:h-[620px]"
                          />
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </section>
          </>
        )}
      </main>

      <ListingSourcesSection
        onOpenPostModal={() => {
          setPostModalDefaultTab('rental');
          setPostModalDefaultGroup(undefined);
          setIsPostModalOpen(true);
        }}
        onFilterBySource={(sourceQuery, category) => {
          setActiveSection(category);
          if (category === 'rentals') {
            handleRentalFilterChange({ q: sourceQuery });
          } else {
            handleJobFilterChange({ q: sourceQuery });
          }
          setTimeout(() => {
            document.getElementById('listings-explorer')?.scrollIntoView({ behavior: 'smooth' });
          }, 80);
        }}
      />

      <footer className="border-t border-white/10 bg-[#080D1A] py-8">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 text-xs text-[#7C8FB0] md:px-6">
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-display font-semibold text-[#C2CEE3]">
              OpportunityHub SADC
            </span>
            <span aria-hidden="true">·</span>
            <span>
              Rooms in Namibia (Walvis Bay, Swakopmund, Windhoek, North &amp; South) · Student
              Holiday, Local Store &amp; SADC Namibian-Eligible Jobs
            </span>
          </div>
          <div className="flex items-center gap-5">
            <button
              type="button"
              onClick={() => setActiveSection('rentals')}
              className="hover:text-[#EEF3FB] cursor-pointer"
            >
              Namibia Rooms
            </button>
            <button
              type="button"
              onClick={() => setActiveSection('jobs')}
              className="hover:text-[#EEF3FB] cursor-pointer"
            >
              Jobs
            </button>
            <button
              type="button"
              onClick={() => setActiveSection('cv-maker')}
              className="hover:text-[#EEF3FB] cursor-pointer"
            >
              CV Maker
            </button>
            <button
              type="button"
              onClick={() => setActiveSection('bookings')}
              className="hover:text-[#EEF3FB] cursor-pointer"
            >
              Bookings &amp; Applications
            </button>
            <button
              type="button"
              onClick={() => {
                setPostModalDefaultTab('rental');
                setPostModalDefaultGroup(undefined);
                setIsPostModalOpen(true);
              }}
              className="hover:text-[#EEF3FB] cursor-pointer"
            >
              Post Listing
            </button>
          </div>
        </div>
      </footer>

      {selectedProperty && (
        <PropertyBookingModal
          property={selectedProperty}
          initialCheckIn={rentalFilters.checkIn}
          initialCheckOut={rentalFilters.checkOut}
          eligibleBookingToReview={eligibleBookingToReview}
          onClose={() => setSelectedPropertyId(null)}
          onBookingCreated={handleBookingCreated}
          onGoToBookings={() => setActiveSection('bookings')}
          onOpenReview={(booking) => setReviewTargetBooking(booking)}
        />
      )}

      {selectedJob && (
        <JobApplicationModal
          job={selectedJob}
          savedCvs={savedCvs}
          onClose={() => setSelectedJobId(null)}
          onOpenCvMaker={() => setActiveSection('cv-maker')}
          onSubmitted={handleApplicationSubmitted}
        />
      )}

      {reviewTargetBooking && (
        <ReviewFormModal
          booking={reviewTargetBooking}
          onClose={() => setReviewTargetBooking(null)}
          onSubmitted={handleReviewSubmitted}
        />
      )}

      <SavedDrawer
        isOpen={isSavedOpen}
        savedProperties={savedProperties}
        onClose={() => setIsSavedOpen(false)}
        onRemoveSaved={handleToggleSave}
        onSelectProperty={(p) => setSelectedPropertyId(p.id)}
      />

      {isPostModalOpen && (
        <ListPropertyModal
          defaultTab={postModalDefaultTab}
          defaultFacebookGroup={postModalDefaultGroup}
          onClose={() => setIsPostModalOpen(false)}
          onPropertyCreated={handlePropertyCreated}
          onJobCreated={handleJobCreated}
        />
      )}
    </div>
  );
}
