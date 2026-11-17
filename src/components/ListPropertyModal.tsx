import { Briefcase, Building2, Check, Sparkles, Users, X } from 'lucide-react';
import { FormEvent, useState } from 'react';
import {
  NAMIBIA_FACEBOOK_RENTAL_GROUPS,
  parseFacebookRoomPost,
} from '../data/facebookGroups';
import { EMPLOYMENT_TYPES, JOB_SECTORS } from '../data/seedJobs';
import { NAMIBIA_RENTAL_LOCATIONS, SADC_LOCATIONS } from '../data/seedProperties';
import {
  Amenity,
  EmploymentType,
  JobListing,
  JobSector,
  Property,
  PropertyType,
} from '../types/rental';
import { addDaysIso, todayIso } from '../utils/format';
import { FILTER_AMENITIES } from './FilterBar';

interface ListPropertyModalProps {
  defaultTab?: 'rental' | 'fb-import' | 'job';
  defaultFacebookGroup?: string;
  onClose: () => void;
  onPropertyCreated: (property: Property) => void;
  onJobCreated: (job: JobListing) => void;
}

const ALL_PROPERTY_TYPES: PropertyType[] = [
  'Private Room',
  'Backyard Flat',
  'Studio Flat',
  'Shared House',
  'Apartment',
  'House',
  'Villa',
];

export function ListPropertyModal({
  defaultTab = 'rental',
  defaultFacebookGroup,
  onClose,
  onPropertyCreated,
  onJobCreated,
}: ListPropertyModalProps) {
  const today = todayIso();
  const yesterday = addDaysIso(today, -1);

  const [tab, setTab] = useState<'rental' | 'fb-import' | 'job'>(defaultTab);

  // Facebook Group import helper state
  const [rawFbPost, setRawFbPost] = useState('');
  const [facebookGroupName, setFacebookGroupName] = useState(
    defaultFacebookGroup || NAMIBIA_FACEBOOK_RENTAL_GROUPS[0].name
  );
  const [sourceUrl, setSourceUrl] = useState('');
  const [postedDate, setPostedDate] = useState(yesterday);
  const [parsedNotice, setParsedNotice] = useState<string | null>(null);

  // Rental & Monthly Room fields
  const [title, setTitle] = useState('');
  const [locationKey, setLocationKey] = useState<string>('Windhoek');
  const [address, setAddress] = useState('');
  const [propertyType, setPropertyType] = useState<PropertyType>('Private Room');
  const [bedrooms, setBedrooms] = useState(1);
  const [bathrooms, setBathrooms] = useState(1);
  const [maxGuests, setMaxGuests] = useState(2);
  const [monthlyRate, setMonthlyRate] = useState(2800);
  const [depositAmount, setDepositAmount] = useState(1400);
  const [pricePerNight, setPricePerNight] = useState(0);
  const [utilitiesNote, setUtilitiesNote] = useState('Water included · Prepaid electricity');
  const [contactPhone, setContactPhone] = useState('+264 81 ');
  const [hostName, setHostName] = useState('');
  const [amenities, setAmenities] = useState<Amenity[]>(['Wi-Fi', 'Parking', 'Security']);
  const [description, setDescription] = useState('');

  // Job fields
  const [jobTitle, setJobTitle] = useState('');
  const [company, setCompany] = useState('');
  const [jobLocationKey, setJobLocationKey] = useState<string>(SADC_LOCATIONS[0]);
  const [sector, setSector] = useState<JobSector>('Retail & Local Stores');
  const [employmentType, setEmploymentType] = useState<EmploymentType>('Holiday Casual');
  const [isStudentHoliday, setIsStudentHoliday] = useState(true);
  const [salaryMin, setSalaryMin] = useState(3800);
  const [salaryMax, setSalaryMax] = useState(5200);
  const [jobDescription, setJobDescription] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function toggleAmenity(am: Amenity) {
    setAmenities((prev) => (prev.includes(am) ? prev.filter((x) => x !== am) : [...prev, am]));
  }

  function handleExtractFromFacebookPost() {
    setError(null);
    if (rawFbPost.trim().length < 15) {
      setError('Paste the full Facebook room post text (at least 15 characters) first.');
      return;
    }
    const parsed = parseFacebookRoomPost(rawFbPost);
    setTitle(parsed.title);
    setLocationKey(parsed.locationKey);
    setAddress(parsed.address);
    setPropertyType(parsed.propertyType);
    setBedrooms(parsed.bedrooms);
    setBathrooms(parsed.bathrooms);
    setMonthlyRate(parsed.monthlyRate);
    setDepositAmount(parsed.depositAmount);
    setPricePerNight(Math.max(150, Math.round(parsed.monthlyRate / 22)));
    setUtilitiesNote(parsed.utilitiesNote);
    if (parsed.contactPhone) setContactPhone(parsed.contactPhone);
    setAmenities(parsed.amenities);
    setDescription(parsed.description);
    setParsedNotice(
      `Extracted ${parsed.propertyType} in ${parsed.address} · N$${parsed.monthlyRate.toLocaleString()}/mo · Deposit N$${parsed.depositAmount.toLocaleString()}. Review below and publish.`
    );
  }

  async function handleSubmitRental(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const isFbImport = tab === 'fb-import';
    try {
      const res = await fetch('/api/properties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          locationKey,
          address,
          propertyType,
          bedrooms,
          bathrooms,
          maxGuests,
          monthlyRate,
          depositAmount,
          pricePerNight: pricePerNight > 0 ? pricePerNight : undefined,
          utilitiesNote,
          contactPhone,
          hostName,
          amenities,
          description,
          postedDate: isFbImport ? postedDate : today,
          facebookGroupName: isFbImport ? facebookGroupName : undefined,
          sourceName: isFbImport
            ? `Facebook Group — ${facebookGroupName}`
            : 'Direct Host Listing (Namibia)',
          sourceUrl: sourceUrl.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Could not publish property listing.');
        return;
      }
      onPropertyCreated(data.property);
      onClose();
    } catch {
      setError('Network error while publishing your property.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSubmitJob(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: jobTitle,
          company,
          locationKey: jobLocationKey,
          sector,
          employmentType,
          isStudentHoliday,
          salaryMin,
          salaryMax,
          description: jobDescription,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Could not publish job vacancy.');
        return;
      }
      onJobCreated(data.job);
      onClose();
    } catch {
      setError('Network error while publishing your job listing.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Post a rental, import Facebook room, or job listing"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm overflow-y-auto"
    >
      <div className="my-auto w-full max-w-2xl overflow-hidden rounded-2xl border border-white/15 bg-[#0F172A] shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 bg-[#111A2E] px-5 py-4">
          <div>
            <h2 className="font-display text-lg font-semibold text-[#EEF3FB]">
              Post or Import on OpportunityHub SADC
            </h2>
            <p className="text-xs text-[#9FB1CF]">
              Publish a monthly room in Namibia, import a Facebook Group post, or post a job
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close post listing dialog"
            className="inline-flex size-8 items-center justify-center rounded-lg border border-white/10 bg-[#0B1120] text-[#C2CEE3] hover:text-white cursor-pointer"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="border-b border-white/10 bg-[#111A2E]/60 px-5 py-2.5">
          <div className="inline-grid grid-cols-3 gap-1 rounded-xl bg-[#0B1120] p-1 border border-white/10">
            <button
              type="button"
              onClick={() => {
                setError(null);
                setTab('fb-import');
              }}
              className={`inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                tab === 'fb-import' ? 'bg-blue-600 text-white' : 'text-[#9FB1CF] hover:text-white'
              }`}
            >
              <Users className="size-3.5" />
              Import FB Room
            </button>
            <button
              type="button"
              onClick={() => {
                setError(null);
                setTab('rental');
              }}
              className={`inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                tab === 'rental' ? 'bg-emerald-600 text-white' : 'text-[#9FB1CF] hover:text-white'
              }`}
            >
              <Building2 className="size-3.5" />
              Rental / Room
            </button>
            <button
              type="button"
              onClick={() => {
                setError(null);
                setTab('job');
              }}
              className={`inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                tab === 'job' ? 'bg-blue-600 text-white' : 'text-[#9FB1CF] hover:text-white'
              }`}
            >
              <Briefcase className="size-3.5" />
              Job Vacancy
            </button>
          </div>
        </div>

        {tab === 'rental' || tab === 'fb-import' ? (
          <form
            onSubmit={handleSubmitRental}
            className="p-5 space-y-4 max-h-[75vh] overflow-y-auto"
          >
            {error && (
              <div className="rounded-xl border border-rose-500/40 bg-rose-950/40 px-3.5 py-2.5 text-xs text-rose-200">
                {error}
              </div>
            )}

            {tab === 'fb-import' && (
              <div className="space-y-3 rounded-xl border border-blue-400/25 bg-[#111A2E] p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-[#EEF3FB]">
                    Step 1 · Paste Facebook Group Monthly Room Post
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setPostedDate(yesterday)}
                      className={`rounded-md px-2.5 py-1 text-[11px] font-semibold cursor-pointer ${
                        postedDate === yesterday
                          ? 'bg-emerald-600 text-white'
                          : 'border border-white/15 bg-[#0B1120] text-[#9FB1CF]'
                      }`}
                    >
                      Yesterday ({yesterday})
                    </button>
                    <button
                      type="button"
                      onClick={() => setPostedDate(today)}
                      className={`rounded-md px-2.5 py-1 text-[11px] font-semibold cursor-pointer ${
                        postedDate === today
                          ? 'bg-emerald-600 text-white'
                          : 'border border-white/15 bg-[#0B1120] text-[#9FB1CF]'
                      }`}
                    >
                      Today ({today})
                    </button>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="block space-y-1">
                    <span className="text-xs font-medium text-[#C2CEE3]">Facebook Group</span>
                    <select
                      value={facebookGroupName}
                      onChange={(e) => setFacebookGroupName(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-[#0B1120] px-3 py-2 text-xs text-[#EEF3FB] outline-none cursor-pointer"
                    >
                      {NAMIBIA_FACEBOOK_RENTAL_GROUPS.map((g) => (
                        <option key={g.id} value={g.name}>
                          {g.name}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="block space-y-1">
                    <span className="text-xs font-medium text-[#C2CEE3]">
                      Original Facebook Post URL (Optional)
                    </span>
                    <input
                      type="url"
                      value={sourceUrl}
                      onChange={(e) => setSourceUrl(e.target.value)}
                      placeholder="https://www.facebook.com/groups/..."
                      className="w-full rounded-xl border border-white/10 bg-[#0B1120] px-3 py-2 text-xs text-[#EEF3FB] outline-none focus:border-blue-400"
                    />
                  </label>
                </div>

                <label className="block space-y-1">
                  <span className="text-xs font-medium text-[#C2CEE3]">
                    Raw Facebook Post Text (rent, deposit, suburb, utilities, contact phone)
                  </span>
                  <textarea
                    rows={3}
                    value={rawFbPost}
                    onChange={(e) => setRawFbPost(e.target.value)}
                    placeholder="e.g. Spacious outside room in Dorado Park, Windhoek. Rent N$2,800/month, deposit N$1,500. Water included, prepaid electricity, parking & Wi-Fi. Call 081 234 5678."
                    className="w-full rounded-xl border border-white/10 bg-[#0B1120] px-3.5 py-2.5 text-xs text-[#EEF3FB] outline-none focus:border-blue-400"
                  />
                </label>

                <div className="flex flex-wrap items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={handleExtractFromFacebookPost}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-blue-500 cursor-pointer"
                  >
                    <Sparkles className="size-3.5" />
                    Extract All Room Info
                  </button>
                  <label className="flex items-center gap-2 text-xs text-[#9FB1CF]">
                    <span>Posted date:</span>
                    <input
                      type="date"
                      value={postedDate}
                      max={today}
                      onChange={(e) => setPostedDate(e.target.value)}
                      className="rounded-lg border border-white/10 bg-[#0B1120] px-2 py-1 text-xs text-[#EEF3FB] [color-scheme:dark]"
                    />
                  </label>
                </div>

                {parsedNotice && (
                  <p className="text-xs font-medium text-emerald-300">{parsedNotice}</p>
                )}
              </div>
            )}

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="sm:col-span-2 block space-y-1">
                <span className="text-xs font-medium text-[#C2CEE3]">Room / Property Title</span>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Dorado Park Outside Room with En-suite & Parking"
                  className="w-full rounded-xl border border-white/10 bg-[#0B1120] px-3.5 py-2.5 text-sm text-[#EEF3FB] outline-none focus:border-blue-400"
                />
              </label>

              <label className="block space-y-1">
                <span className="text-xs font-medium text-[#C2CEE3]">Town / Area (Namibia Only)</span>
                <select
                  value={locationKey}
                  onChange={(e) => setLocationKey(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#0B1120] px-3.5 py-2.5 text-sm text-[#EEF3FB] outline-none cursor-pointer"
                >
                  {NAMIBIA_RENTAL_LOCATIONS.map((loc) => (
                    <option key={loc} value={loc}>
                      {loc}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block space-y-1">
                <span className="text-xs font-medium text-[#C2CEE3]">Room / Property Type</span>
                <select
                  value={propertyType}
                  onChange={(e) => setPropertyType(e.target.value as PropertyType)}
                  className="w-full rounded-xl border border-white/10 bg-[#0B1120] px-3.5 py-2.5 text-sm text-[#EEF3FB] outline-none cursor-pointer"
                >
                  {ALL_PROPERTY_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block space-y-1">
                <span className="text-xs font-medium text-[#C2CEE3]">Suburb / Street Address</span>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. Dorado Park, Windhoek"
                  className="w-full rounded-xl border border-white/10 bg-[#0B1120] px-3.5 py-2.5 text-sm text-[#EEF3FB] outline-none focus:border-blue-400"
                />
              </label>

              <label className="block space-y-1">
                <span className="text-xs font-medium text-[#C2CEE3]">Landlord / Poster Name</span>
                <input
                  type="text"
                  required
                  value={hostName}
                  onChange={(e) => setHostName(e.target.value)}
                  placeholder="Poster or landlord name"
                  className="w-full rounded-xl border border-white/10 bg-[#0B1120] px-3.5 py-2.5 text-sm text-[#EEF3FB] outline-none focus:border-blue-400"
                />
              </label>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <label className="block space-y-1">
                <span className="text-xs font-medium text-[#C2CEE3]">Monthly Rent (NAD)</span>
                <input
                  type="number"
                  min={500}
                  step={100}
                  required
                  value={monthlyRate}
                  onChange={(e) => setMonthlyRate(Number(e.target.value))}
                  className="font-mono-tabular w-full rounded-xl border border-white/10 bg-[#0B1120] px-3 py-2 text-sm text-[#EEF3FB] outline-none"
                />
              </label>
              <label className="block space-y-1">
                <span className="text-xs font-medium text-[#C2CEE3]">Deposit (NAD)</span>
                <input
                  type="number"
                  min={0}
                  step={100}
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(Number(e.target.value))}
                  className="font-mono-tabular w-full rounded-xl border border-white/10 bg-[#0B1120] px-3 py-2 text-sm text-[#EEF3FB] outline-none"
                />
              </label>
              <label className="block space-y-1">
                <span className="text-xs font-medium text-[#C2CEE3]">Bedrooms</span>
                <input
                  type="number"
                  min={0}
                  max={12}
                  value={bedrooms}
                  onChange={(e) => setBedrooms(Number(e.target.value))}
                  className="font-mono-tabular w-full rounded-xl border border-white/10 bg-[#0B1120] px-3 py-2 text-sm text-[#EEF3FB] outline-none"
                />
              </label>
              <label className="block space-y-1">
                <span className="text-xs font-medium text-[#C2CEE3]">Bathrooms</span>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={bathrooms}
                  onChange={(e) => setBathrooms(Number(e.target.value))}
                  className="font-mono-tabular w-full rounded-xl border border-white/10 bg-[#0B1120] px-3 py-2 text-sm text-[#EEF3FB] outline-none"
                />
              </label>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <label className="sm:col-span-2 block space-y-1">
                <span className="text-xs font-medium text-[#C2CEE3]">
                  Water &amp; Electricity Terms
                </span>
                <input
                  type="text"
                  value={utilitiesNote}
                  onChange={(e) => setUtilitiesNote(e.target.value)}
                  placeholder="e.g. Water included, prepaid electricity"
                  className="w-full rounded-xl border border-white/10 bg-[#0B1120] px-3.5 py-2 text-sm text-[#EEF3FB] outline-none"
                />
              </label>
              <label className="block space-y-1">
                <span className="text-xs font-medium text-[#C2CEE3]">Contact Phone</span>
                <input
                  type="tel"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder="+264 81 234 5678"
                  className="font-mono-tabular w-full rounded-xl border border-white/10 bg-[#0B1120] px-3.5 py-2 text-sm text-[#EEF3FB] outline-none"
                />
              </label>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-medium text-[#C2CEE3]">Amenities</span>
              <div className="flex flex-wrap gap-2">
                {FILTER_AMENITIES.map((am) => {
                  const active = amenities.includes(am);
                  return (
                    <button
                      key={am}
                      type="button"
                      onClick={() => toggleAmenity(am)}
                      className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
                        active
                          ? 'bg-emerald-600 text-white'
                          : 'border border-white/10 bg-[#0B1120] text-[#B4C3DC] hover:text-white'
                      }`}
                    >
                      {active && <Check className="size-3.5" />}
                      {am}
                    </button>
                  );
                })}
              </div>
            </div>

            <label className="block space-y-1">
              <span className="text-xs font-medium text-[#C2CEE3]">Full Room Details</span>
              <textarea
                required
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe monthly availability, viewing times, security, parking, and deposit rules..."
                className="w-full rounded-xl border border-white/10 bg-[#0B1120] px-3.5 py-2.5 text-sm text-[#EEF3FB] outline-none focus:border-blue-400"
              />
            </label>

            <div className="flex items-center justify-end gap-3 border-t border-white/10 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-white/15 px-4 py-2 text-sm font-semibold text-[#C2CEE3] hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="rounded-xl bg-emerald-600 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-60 cursor-pointer"
              >
                {submitting
                  ? 'Publishing...'
                  : tab === 'fb-import'
                    ? 'Publish Imported Room'
                    : 'Publish Monthly Rental'}
              </button>
            </div>
          </form>
        ) : (
          <form
            onSubmit={handleSubmitJob}
            className="p-5 space-y-4 max-h-[75vh] overflow-y-auto"
          >
            {error && (
              <div className="rounded-xl border border-rose-500/40 bg-rose-950/40 px-3.5 py-2.5 text-xs text-rose-200">
                {error}
              </div>
            )}

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="sm:col-span-2 block space-y-1">
                <span className="text-xs font-medium text-[#C2CEE3]">Job Title</span>
                <input
                  type="text"
                  required
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="e.g. Logistics Operations Coordinator"
                  className="w-full rounded-xl border border-white/10 bg-[#0B1120] px-3.5 py-2.5 text-sm text-[#EEF3FB] outline-none focus:border-blue-400"
                />
              </label>

              <label className="block space-y-1">
                <span className="text-xs font-medium text-[#C2CEE3]">Company / Organization</span>
                <input
                  type="text"
                  required
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="e.g. Trans-Kalahari Corridor Logistics"
                  className="w-full rounded-xl border border-white/10 bg-[#0B1120] px-3.5 py-2.5 text-sm text-[#EEF3FB] outline-none focus:border-blue-400"
                />
              </label>

              <label className="block space-y-1">
                <span className="text-xs font-medium text-[#C2CEE3]">City / Hub (SADC)</span>
                <select
                  value={jobLocationKey}
                  onChange={(e) => setJobLocationKey(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#0B1120] px-3.5 py-2.5 text-sm text-[#EEF3FB] outline-none cursor-pointer"
                >
                  {SADC_LOCATIONS.map((loc) => (
                    <option key={loc} value={loc}>
                      {loc}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block space-y-1">
                <span className="text-xs font-medium text-[#C2CEE3]">Sector</span>
                <select
                  value={sector}
                  onChange={(e) => setSector(e.target.value as JobSector)}
                  className="w-full rounded-xl border border-white/10 bg-[#0B1120] px-3.5 py-2.5 text-sm text-[#EEF3FB] outline-none cursor-pointer"
                >
                  {JOB_SECTORS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block space-y-1">
                <span className="text-xs font-medium text-[#C2CEE3]">Employment Type</span>
                <select
                  value={employmentType}
                  onChange={(e) => setEmploymentType(e.target.value as EmploymentType)}
                  className="w-full rounded-xl border border-white/10 bg-[#0B1120] px-3.5 py-2.5 text-sm text-[#EEF3FB] outline-none cursor-pointer"
                >
                  {EMPLOYMENT_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block space-y-1">
                <span className="text-xs font-medium text-[#C2CEE3]">Min Monthly Salary</span>
                <input
                  type="number"
                  min={100}
                  step={500}
                  value={salaryMin}
                  onChange={(e) => setSalaryMin(Number(e.target.value))}
                  className="font-mono-tabular w-full rounded-xl border border-white/10 bg-[#0B1120] px-3.5 py-2 text-sm text-[#EEF3FB] outline-none"
                />
              </label>

              <label className="block space-y-1">
                <span className="text-xs font-medium text-[#C2CEE3]">Max Monthly Salary</span>
                <input
                  type="number"
                  min={salaryMin}
                  step={500}
                  value={salaryMax}
                  onChange={(e) => setSalaryMax(Number(e.target.value))}
                  className="font-mono-tabular w-full rounded-xl border border-white/10 bg-[#0B1120] px-3.5 py-2 text-sm text-[#EEF3FB] outline-none"
                />
              </label>
            </div>

            <label className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-[#0B1120] px-3.5 py-2.5 text-xs text-[#C2CEE3] cursor-pointer">
              <input
                type="checkbox"
                checked={isStudentHoliday}
                onChange={(e) => setIsStudentHoliday(e.target.checked)}
                className="size-4 accent-amber-500"
              />
              <span>
                Student Holiday / Local Store Casual Role (eligible for Namibian students on break)
              </span>
            </label>

            <label className="block space-y-1">
              <span className="text-xs font-medium text-[#C2CEE3]">Role Description</span>
              <textarea
                required
                rows={4}
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Outline key responsibilities, qualifications, and regional benefits..."
                className="w-full rounded-xl border border-white/10 bg-[#0B1120] px-3.5 py-2.5 text-sm text-[#EEF3FB] outline-none focus:border-blue-400"
              />
            </label>

            <div className="flex items-center justify-end gap-3 border-t border-white/10 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-white/15 px-4 py-2 text-sm font-semibold text-[#C2CEE3] hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="rounded-xl bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-60 cursor-pointer"
              >
                {submitting ? 'Publishing...' : 'Publish Job'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
