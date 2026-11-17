import 'dotenv/config';
import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { CITY_COORDINATES, SEED_PROPERTIES } from './src/data/seedProperties.js';
import { SEED_JOBS } from './src/data/seedJobs.js';
import { SEED_BOOKINGS, SEED_REVIEWS } from './src/data/seedReviews.js';
import type {
  Amenity,
  Booking,
  BookingEmailNotification,
  CurrencyCode,
  CvDocument,
  JobApplication,
  JobListing,
  PaymentMethodType,
  Property,
  PropertyReview,
} from './src/types/rental.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.resolve(__dirname, 'data');
const STORE_PATH = path.join(DATA_DIR, 'store.json');

interface StoreData {
  properties: Property[];
  bookings: Booking[];
  reviews: PropertyReview[];
  jobs: JobListing[];
  applications: JobApplication[];
  cvs: CvDocument[];
}

function formatMoneyServer(amount: number, currency: CurrencyCode = 'NAD'): string {
  const rounded = Math.round(amount).toLocaleString('en-US');
  if (currency === 'ZAR') return `R${rounded}`;
  if (currency === 'BWP') return `P${rounded}`;
  if (currency === 'USD') return `US$${rounded}`;
  return `N$${rounded}`;
}

function namibiaTodayIso(): string {
  // Namibia Standard Time (CAT / WAT+2 = UTC+2)
  return new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString().split('T')[0];
}

function loadStore(): StoreData {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  const today = namibiaTodayIso();
  const activeSeedJobs = SEED_JOBS.filter(
    (sj) => Boolean(sj.applicationDeadline) && sj.applicationDeadline >= today
  );

  if (!fs.existsSync(STORE_PATH)) {
    const initial: StoreData = {
      properties: SEED_PROPERTIES,
      bookings: SEED_BOOKINGS,
      reviews: SEED_REVIEWS,
      jobs: activeSeedJobs,
      applications: [],
      cvs: [],
    };
    fs.writeFileSync(STORE_PATH, JSON.stringify(initial, null, 2), 'utf-8');
    return initial;
  }
  try {
    const raw = fs.readFileSync(STORE_PATH, 'utf-8');
    const parsed = JSON.parse(raw) as Partial<StoreData>;
    let mutated = false;

    let properties =
      Array.isArray(parsed.properties) && parsed.properties.length > 0
        ? parsed.properties
        : SEED_PROPERTIES;

    const today = new Date().toISOString().split('T')[0];

    // Enforce Namibia-only rentals, drop stale legacy seed records, prune expired bookedRanges, & sync updated source links
    const seedPropMap = new Map(SEED_PROPERTIES.map((sp) => [sp.id, sp]));
    const validProps = properties.filter(
      (p) => (!p.country || p.country === 'Namibia') && (seedPropMap.has(p.id) || p.id.startsWith('prop_'))
    );
    if (validProps.length !== properties.length) {
      mutated = true;
    }
    const mergedProps = validProps.map((p) => {
      const seedMatch = seedPropMap.get(p.id);
      const activeRanges = (p.bookedRanges ?? []).filter((r) => r.checkOut >= today);
      if (activeRanges.length !== (p.bookedRanges ?? []).length) {
        mutated = true;
      }
      if (seedMatch && (p.sourceName !== seedMatch.sourceName || p.sourceUrl !== seedMatch.sourceUrl)) {
        mutated = true;
        return {
          ...seedMatch,
          bookedRanges: activeRanges,
        };
      }
      return {
        ...p,
        bookedRanges: activeRanges,
        country: 'Namibia' as const,
        currency: 'NAD' as const,
        sourceName: p.sourceName || 'Direct Landlord Listing (Namibia)',
      };
    });
    const existingPropIds = new Set(mergedProps.map((p) => p.id));
    const missingSeedProps = SEED_PROPERTIES.filter((sp) => !existingPropIds.has(sp.id));
    if (missingSeedProps.length > 0) {
      properties = [...mergedProps, ...missingSeedProps];
      mutated = true;
    } else {
      properties = mergedProps;
    }

    const bookings = Array.isArray(parsed.bookings) ? parsed.bookings : SEED_BOOKINGS;
    let reviews = parsed.reviews;
    if (!Array.isArray(reviews)) {
      reviews = SEED_REVIEWS;
      mutated = true;
    }

    // Automatically remove expired/closed jobs & sync verified active jobs
    const existingJobs = Array.isArray(parsed.jobs) ? parsed.jobs : [];
    const activeCustomJobs = existingJobs.filter(
      (j) =>
        j.id.startsWith('job_') &&
        !j.id.startsWith('job-') &&
        Boolean(j.applicationDeadline) &&
        j.applicationDeadline >= today
    );
    const syncedJobs = [...activeCustomJobs, ...activeSeedJobs];
    const existingJobKey = existingJobs
      .map((j) => `${j.id}:${j.applicationDeadline}:${j.sourceUrl ?? ''}`)
      .join('|');
    const syncedJobKey = syncedJobs
      .map((j) => `${j.id}:${j.applicationDeadline}:${j.sourceUrl ?? ''}`)
      .join('|');
    if (existingJobKey !== syncedJobKey) {
      mutated = true;
    }
    const jobs = syncedJobs;

    let applications = parsed.applications;
    if (!Array.isArray(applications)) {
      applications = [];
      mutated = true;
    }

    let cvs = parsed.cvs;
    if (!Array.isArray(cvs)) {
      cvs = [];
      mutated = true;
    }

    const finalBookings =
      bookings.length === 0 && !Array.isArray(parsed.reviews) ? SEED_BOOKINGS : bookings;

    const store: StoreData = {
      properties,
      bookings: finalBookings,
      reviews,
      jobs,
      applications,
      cvs,
    };
    if (mutated) {
      saveStore(store);
    }
    return store;
  } catch {
    return {
      properties: SEED_PROPERTIES,
      bookings: SEED_BOOKINGS,
      reviews: SEED_REVIEWS,
      jobs: activeSeedJobs,
      applications: [],
      cvs: [],
    };
  }
}

function enrichProperty(prop: Property, allReviews: PropertyReview[]): Property {
  const propReviews = allReviews
    .filter((r) => r.propertyId === prop.id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const reviewCount = propReviews.length;
  const averageRating =
    reviewCount > 0
      ? Number((propReviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount).toFixed(1))
      : 0;
  return {
    ...prop,
    averageRating,
    reviewCount,
    reviews: propReviews,
  };
}

function saveStore(store: StoreData): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  fs.writeFileSync(STORE_PATH, JSON.stringify(store, null, 2), 'utf-8');
}

function datesOverlap(startA: string, endA: string, startB: string, endB: string): boolean {
  // Half-open intervals [checkIn, checkOut) so check-out day matches next check-in day
  return startA < endB && endA > startB;
}

function diffNights(checkIn: string, checkOut: string): number {
  const start = new Date(`${checkIn}T00:00:00Z`).getTime();
  const end = new Date(`${checkOut}T00:00:00Z`).getTime();
  if (Number.isNaN(start) || Number.isNaN(end) || end <= start) return 0;
  return Math.round((end - start) / (1000 * 60 * 60 * 24));
}

function formatNad(amount: number): string {
  return `N$${Math.round(amount).toLocaleString('en-US')}`;
}

function buildEmailNotification(params: {
  bookingId: string;
  confirmationCode: string;
  guestName: string;
  guestEmail: string;
  property: Property;
  checkIn: string;
  checkOut: string;
  nights: number;
  guests: number;
  totalAmount: number;
  paymentSummary: string;
  transactionId: string;
}): BookingEmailNotification {
  const sentAt = new Date().toISOString();
  const checkInInstructions = `Self check-in from 14:00 at ${params.property.address}. Host ${params.property.host.name} (${params.property.host.responseTime}) will share the digital gate & lockbox PIN 24 hours prior to arrival.`;
  const bodyText = [
    `Dear ${params.guestName},`,
    ``,
    `Your reservation at ${params.property.title} is confirmed.`,
    ``,
    `Confirmation Code: ${params.confirmationCode}`,
    `Property: ${params.property.title}`,
    `Location: ${params.property.address}`,
    `Check-in: ${params.checkIn} (from 14:00)`,
    `Check-out: ${params.checkOut} (by 10:00)`,
    `Stay Duration: ${params.nights} night${params.nights === 1 ? '' : 's'} · ${params.guests} guest${params.guests === 1 ? '' : 's'}`,
    `Total Paid: ${formatMoneyServer(params.totalAmount, params.property.currency ?? 'NAD')} (${params.paymentSummary})`,
    `Transaction Reference: ${params.transactionId}`,
    ``,
    `Check-in Instructions:`,
    checkInInstructions,
    ``,
    `Thank you for booking with Walvis Bay Rental.`,
  ].join('\n');

  return {
    id: `eml_${Date.now()}`,
    to: params.guestEmail,
    from: 'bookings@walvisbayrental.na',
    subject: `Booking Confirmed (${params.confirmationCode}) — ${params.property.title}`,
    sentAt,
    confirmationCode: params.confirmationCode,
    bodyText,
    checkInInstructions,
  };
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '1mb' }));

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true, service: 'walvis-bay-rental' });
  });

  app.get('/api/map/config', (_req, res) => {
    const rawKey = (
      process.env.VITE_GOOGLE_MAPS_API_KEY ||
      process.env.GOOGLE_MAPS_API_KEY ||
      process.env.MAPS_API_KEY ||
      ''
    ).trim();
    const apiKey = rawKey && rawKey !== 'MY_GOOGLE_MAPS_API_KEY' ? rawKey : '';
    res.json({
      provider: 'google',
      configured: Boolean(apiKey),
      apiKey,
    });
  });

  app.get('/api/properties', (req, res) => {
    const store = loadStore();
    const q = typeof req.query.q === 'string' ? req.query.q.trim().toLowerCase() : '';
    const region = typeof req.query.region === 'string' ? req.query.region.trim() : '';
    const location = typeof req.query.location === 'string' ? req.query.location.trim() : '';
    const propertyType = typeof req.query.propertyType === 'string' ? req.query.propertyType.trim() : '';
    const minPrice = Number(req.query.minPrice) || 0;
    const maxPrice = Number(req.query.maxPrice) || Number.MAX_SAFE_INTEGER;
    const maxMonthly = Number(req.query.maxMonthly) || 0;
    const postedSince = typeof req.query.postedSince === 'string' ? req.query.postedSince.trim() : '';
    const bedrooms = Number(req.query.bedrooms) || 0;
    const checkIn = typeof req.query.checkIn === 'string' ? req.query.checkIn.trim() : '';
    const checkOut = typeof req.query.checkOut === 'string' ? req.query.checkOut.trim() : '';
    const amenitiesRaw = typeof req.query.amenities === 'string' ? req.query.amenities : '';
    const requiredAmenities = amenitiesRaw
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean) as Amenity[];

    const namibiaToday = namibiaTodayIso();
    const yesterdayDate = new Date(`${namibiaToday}T00:00:00Z`);
    yesterdayDate.setUTCDate(yesterdayDate.getUTCDate() - 1);
    const namibiaYesterday = yesterdayDate.toISOString().split('T')[0];

    const filtered = store.properties.filter((prop) => {
      if (prop.country !== 'Namibia') {
        return false;
      }

      if (q) {
        const haystack = `${prop.title} ${prop.neighborhood} ${prop.city} ${prop.region} ${prop.propertyType} ${prop.description} ${prop.sourceName ?? ''} ${prop.facebookGroupName ?? ''} ${prop.utilitiesNote ?? ''}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }

      if (region && prop.region.toLowerCase() !== region.toLowerCase()) {
        return false;
      }

      if (location) {
        if (location.includes('—')) {
          const [locCity, locSuburb] = location.split('—').map((s) => s.trim().toLowerCase());
          if (prop.city.toLowerCase() !== locCity || prop.neighborhood.toLowerCase() !== locSuburb) {
            return false;
          }
        } else {
          const locLower = location.toLowerCase();
          if (
            prop.city.toLowerCase() !== locLower &&
            prop.neighborhood.toLowerCase() !== locLower
          ) {
            return false;
          }
        }
      }

      if (propertyType && prop.propertyType !== propertyType) {
        return false;
      }

      if (prop.pricePerNight < minPrice || prop.pricePerNight > maxPrice) {
        return false;
      }

      if (maxMonthly > 0 && prop.monthlyRate > maxMonthly) {
        return false;
      }

      if (postedSince === 'yesterday') {
        if (!prop.postedDate || prop.postedDate < namibiaYesterday) {
          return false;
        }
      }

      if (bedrooms > 0 && prop.bedrooms < bedrooms) {
        return false;
      }

      if (requiredAmenities.length > 0) {
        const hasAll = requiredAmenities.every((am) => prop.amenities.includes(am));
        if (!hasAll) return false;
      }

      if (checkIn && checkOut && checkIn < checkOut) {
        const hasOverlap = prop.bookedRanges.some((range) =>
          datesOverlap(checkIn, checkOut, range.checkIn, range.checkOut)
        );
        if (hasOverlap) return false;
      }

      return true;
    });

    const sortBy = typeof req.query.sortBy === 'string' ? req.query.sortBy : 'featured';

    const enriched = filtered.map((prop) => enrichProperty(prop, store.reviews));
    if (sortBy === 'rating') {
      enriched.sort((a, b) => (b.averageRating ?? 0) - (a.averageRating ?? 0) || (b.reviewCount ?? 0) - (a.reviewCount ?? 0));
    } else if (sortBy === 'price_asc') {
      enriched.sort((a, b) => a.pricePerNight - b.pricePerNight);
    } else if (sortBy === 'price_desc') {
      enriched.sort((a, b) => b.pricePerNight - a.pricePerNight);
    } else if (sortBy === 'monthly_asc') {
      enriched.sort((a, b) => a.monthlyRate - b.monthlyRate);
    }

    res.json({ properties: enriched });
  });

  app.get('/api/properties/:id', (req, res) => {
    const store = loadStore();
    const prop = store.properties.find((p) => p.id === req.params.id);
    if (!prop) {
      res.status(404).json({ error: 'Property not found' });
      return;
    }
    res.json({ property: enrichProperty(prop, store.reviews) });
  });

  app.post('/api/properties', (req, res) => {
    const body = req.body ?? {};
    const title = typeof body.title === 'string' ? body.title.trim() : '';
    const locationKey = typeof body.locationKey === 'string' ? body.locationKey.trim() : 'Walvis Bay — Central';
    const address = typeof body.address === 'string' ? body.address.trim() : '';
    const propertyType = typeof body.propertyType === 'string' ? body.propertyType : 'Apartment';
    const bedrooms = Math.max(0, Math.min(12, Number(body.bedrooms) || 1));
    const bathrooms = Math.max(1, Math.min(10, Number(body.bathrooms) || 1));
    const maxGuests = Math.max(1, Math.min(16, Number(body.maxGuests) || 2));
    const rawMonthly = Number(body.monthlyRate) || 0;
    const rawNightly = Number(body.pricePerNight) || 0;
    const pricePerNight =
      rawNightly > 0
        ? Math.max(150, rawNightly)
        : rawMonthly > 0
          ? Math.max(150, Math.round(rawMonthly / 22))
          : 950;
    const monthlyRate = rawMonthly > 0 ? Math.max(500, rawMonthly) : Math.round(pricePerNight * 14);
    const depositAmount =
      body.depositAmount !== undefined && body.depositAmount !== ''
        ? Math.max(0, Number(body.depositAmount) || 0)
        : undefined;
    const utilitiesNote =
      typeof body.utilitiesNote === 'string' && body.utilitiesNote.trim()
        ? body.utilitiesNote.trim()
        : undefined;
    const contactPhone =
      typeof body.contactPhone === 'string' && body.contactPhone.trim()
        ? body.contactPhone.trim()
        : undefined;
    const facebookGroupName =
      typeof body.facebookGroupName === 'string' && body.facebookGroupName.trim()
        ? body.facebookGroupName.trim()
        : undefined;
    const rawPostedDate =
      typeof body.postedDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(body.postedDate.trim())
        ? body.postedDate.trim()
        : namibiaTodayIso();
    const sourceName =
      typeof body.sourceName === 'string' && body.sourceName.trim()
        ? body.sourceName.trim()
        : facebookGroupName
          ? `Facebook Group — ${facebookGroupName}`
          : 'Direct Host Listing (Namibia)';
    const sourceUrl =
      typeof body.sourceUrl === 'string' && /^https?:\/\//i.test(body.sourceUrl.trim())
        ? body.sourceUrl.trim()
        : undefined;
    const amenities: Amenity[] = Array.isArray(body.amenities)
      ? (body.amenities as Amenity[])
      : ['Wi-Fi', 'Parking'];
    const description = typeof body.description === 'string' ? body.description.trim() : '';
    const hostName = typeof body.hostName === 'string' && body.hostName.trim() ? body.hostName.trim() : 'Local Property Host';

    if (!title || title.length < 4) {
      res.status(400).json({ error: 'Please provide a descriptive property title.' });
      return;
    }
    if (!description || description.length < 15) {
      res.status(400).json({ error: 'Please include a short property description (at least 15 characters).' });
      return;
    }

    const coordInfo = CITY_COORDINATES[locationKey] ?? CITY_COORDINATES['Walvis Bay — Central'];
    if (coordInfo.country !== 'Namibia') {
      res.status(400).json({ error: 'Rental rooms and properties must be located within Namibia.' });
      return;
    }

    const neighborhood = locationKey.includes('—')
      ? locationKey.split('—')[1].trim()
      : coordInfo.city;

    // Slight deterministic offset so multiple new listings don't overlap identically on map
    const jitter = ((Date.now() % 100) - 50) * 0.00018;
    const defaultImages = [
      '/src/assets/images/room_walvis_lagoon_1794939592979.jpg',
      '/src/assets/images/room_meersig_flat_1794939593577.jpg',
      '/src/assets/images/room_swakop_ocean_1794939593427.jpg',
      '/src/assets/images/room_windhoek_klein_1794939593406.jpg',
    ];
    const image = defaultImages[Math.floor(Math.random() * defaultImages.length)];

    const newProperty: Property = {
      id: `prop_${Date.now()}`,
      title,
      neighborhood,
      city: coordInfo.city,
      region: coordInfo.region,
      country: 'Namibia',
      currency: 'NAD',
      address: address || `${neighborhood}, ${coordInfo.city}, Namibia`,
      lat: Number((coordInfo.lat + jitter).toFixed(5)),
      lng: Number((coordInfo.lng - jitter).toFixed(5)),
      propertyType: propertyType as Property['propertyType'],
      bedrooms,
      bathrooms,
      maxGuests,
      areaSqm: 45 + bedrooms * 32,
      pricePerNight,
      monthlyRate,
      cleaningFee: Math.round(pricePerNight * 0.2),
      amenities,
      image,
      description,
      highlights: [
        `Monthly rent ${formatNad(monthlyRate)}/mo${depositAmount !== undefined ? ` · Deposit ${formatNad(depositAmount)}` : ''}`,
        utilitiesNote || (amenities.includes('Wi-Fi') ? 'High-speed Wi-Fi included' : 'Self-catering accommodation'),
        `Located in ${neighborhood}, ${coordInfo.city}, Namibia`,
      ],
      houseRules: ['Check-in from 14:00, check-out by 10:00', 'No smoking indoors'],
      host: {
        name: hostName,
        role: facebookGroupName ? 'Facebook Group Poster' : 'Verified Owner',
        responseTime: 'Within 1 hour',
        verified: true,
      },
      sourceName,
      sourceUrl,
      depositAmount,
      utilitiesNote,
      contactPhone,
      facebookGroupName,
      postedDate: rawPostedDate,
      bookedRanges: [],
      createdAt: new Date().toISOString(),
    };

    const store = loadStore();
    store.properties.unshift(newProperty);
    saveStore(store);

    res.status(201).json({ property: newProperty });
  });

  app.get('/api/bookings', (_req, res) => {
    const store = loadStore();
    res.json({ bookings: store.bookings });
  });

  app.post('/api/bookings', (req, res) => {
    const body = req.body ?? {};
    const propertyId = typeof body.propertyId === 'string' ? body.propertyId : '';
    const checkIn = typeof body.checkIn === 'string' ? body.checkIn.trim() : '';
    const checkOut = typeof body.checkOut === 'string' ? body.checkOut.trim() : '';
    const guests = Math.max(1, Number(body.guests) || 1);
    const guestName = typeof body.guestName === 'string' ? body.guestName.trim() : '';
    const guestEmail = typeof body.guestEmail === 'string' ? body.guestEmail.trim() : '';
    const guestPhone = typeof body.guestPhone === 'string' ? body.guestPhone.trim() : '';
    const specialRequests = typeof body.specialRequests === 'string' ? body.specialRequests.trim() : '';
    const paymentMethod = (body.paymentMethod === 'eft' ? 'eft' : 'card') as PaymentMethodType;
    const cardNumber = typeof body.cardNumber === 'string' ? body.cardNumber.replace(/\s+/g, '') : '';
    const eftBank = typeof body.eftBank === 'string' ? body.eftBank.trim() : 'FNB Namibia';

    const store = loadStore();
    const property = store.properties.find((p) => p.id === propertyId);
    if (!property) {
      res.status(404).json({ error: 'Selected property was not found.' });
      return;
    }

    const nights = diffNights(checkIn, checkOut);
    if (nights < 1) {
      res.status(400).json({ error: 'Check-out date must be at least 1 night after check-in.' });
      return;
    }

    if (guests > property.maxGuests) {
      res.status(400).json({ error: `This property accommodates up to ${property.maxGuests} guests.` });
      return;
    }

    const hasConflict = property.bookedRanges.some((range) =>
      datesOverlap(checkIn, checkOut, range.checkIn, range.checkOut)
    );
    if (hasConflict) {
      res.status(409).json({
        error: 'Those dates overlap with an existing confirmed reservation. Please pick available dates.',
      });
      return;
    }

    if (!guestName || guestName.length < 2) {
      res.status(400).json({ error: 'Please enter the guest full name.' });
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guestEmail)) {
      res.status(400).json({ error: 'Please enter a valid email address for booking confirmation.' });
      return;
    }
    if (!guestPhone || guestPhone.length < 6) {
      res.status(400).json({ error: 'Please enter a valid contact phone number.' });
      return;
    }

    let paymentSummary = '';
    if (paymentMethod === 'card') {
      if (cardNumber.length < 12) {
        res.status(400).json({ error: 'Please enter a valid payment card number.' });
        return;
      }
      const last4 = cardNumber.slice(-4);
      const brand = cardNumber.startsWith('5') ? 'Mastercard' : 'Visa';
      paymentSummary = `${brand} •••• ${last4}`;
    } else {
      paymentSummary = `${eftBank} Instant EFT`;
    }

    const subtotal = nights * property.pricePerNight;
    const cleaningFee = property.cleaningFee;
    const serviceFee = Math.round(subtotal * 0.08);
    const totalAmount = subtotal + cleaningFee + serviceFee;

    const bookingId = `bkg_${Date.now()}`;
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const confirmationCode = `WBR-2026-${randomSuffix}`;
    const transactionId = `TXN-${Date.now().toString(36).toUpperCase()}`;

    const emailNotification = buildEmailNotification({
      bookingId,
      confirmationCode,
      guestName,
      guestEmail,
      property,
      checkIn,
      checkOut,
      nights,
      guests,
      totalAmount,
      paymentSummary,
      transactionId,
    });

    const booking: Booking = {
      id: bookingId,
      confirmationCode,
      propertyId: property.id,
      propertyTitle: property.title,
      propertyImage: property.image,
      propertyLocation: `${property.neighborhood}, ${property.city}, ${property.country}`,
      currency: property.currency ?? 'NAD',
      checkIn,
      checkOut,
      nights,
      guests,
      guestName,
      guestEmail,
      guestPhone,
      specialRequests: specialRequests || undefined,
      pricePerNight: property.pricePerNight,
      subtotal,
      cleaningFee,
      serviceFee,
      totalAmount,
      paymentMethod,
      paymentSummary,
      transactionId,
      status: 'confirmed',
      createdAt: new Date().toISOString(),
      emailNotification,
    };

    property.bookedRanges.push({
      bookingId,
      checkIn,
      checkOut,
    });
    store.bookings.unshift(booking);
    saveStore(store);

    console.log(`[Email Notification Dispatched] To: ${guestEmail} | Subject: ${emailNotification.subject}`);

    res.status(201).json({ booking });
  });

  app.patch('/api/bookings/:id/cancel', (req, res) => {
    const store = loadStore();
    const booking = store.bookings.find((b) => b.id === req.params.id);
    if (!booking) {
      res.status(404).json({ error: 'Booking not found' });
      return;
    }
    booking.status = 'cancelled';
    const prop = store.properties.find((p) => p.id === booking.propertyId);
    if (prop) {
      prop.bookedRanges = prop.bookedRanges.filter((r) => r.bookingId !== booking.id);
    }
    saveStore(store);
    res.json({ booking });
  });

  app.get('/api/reviews', (req, res) => {
    const store = loadStore();
    const propertyId = typeof req.query.propertyId === 'string' ? req.query.propertyId : '';
    const list = propertyId
      ? store.reviews.filter((r) => r.propertyId === propertyId)
      : store.reviews;
    const sorted = [...list].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    res.json({ reviews: sorted });
  });

  app.post('/api/reviews', (req, res) => {
    const body = req.body ?? {};
    const bookingId = typeof body.bookingId === 'string' ? body.bookingId.trim() : '';
    const rating = Math.round(Number(body.rating));
    const title = typeof body.title === 'string' ? body.title.trim().slice(0, 100) : '';
    const comment = typeof body.comment === 'string' ? body.comment.trim() : '';

    const store = loadStore();
    const booking = store.bookings.find((b) => b.id === bookingId);
    if (!booking) {
      res.status(404).json({ error: 'Booking record not found. Only booked properties can be reviewed.' });
      return;
    }
    if (booking.status !== 'confirmed') {
      res.status(400).json({ error: 'Cancelled bookings cannot be reviewed.' });
      return;
    }
    if (booking.reviewId || store.reviews.some((r) => r.bookingId === bookingId)) {
      res.status(409).json({ error: 'You have already submitted a review for this booking.' });
      return;
    }
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      res.status(400).json({ error: 'Please select a star rating between 1 and 5.' });
      return;
    }
    if (comment.length < 10) {
      res.status(400).json({ error: 'Please write at least 10 characters of feedback about your stay.' });
      return;
    }

    const fmtStay = (iso: string) => {
      const d = new Date(`${iso}T00:00:00Z`);
      return Number.isNaN(d.getTime())
        ? iso
        : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
    };

    const review: PropertyReview = {
      id: `rev_${Date.now()}`,
      propertyId: booking.propertyId,
      bookingId: booking.id,
      confirmationCode: booking.confirmationCode,
      guestName: booking.guestName,
      rating,
      title: title || `${rating}-star stay at ${booking.propertyTitle}`,
      comment,
      stayDates: `${fmtStay(booking.checkIn)} – ${fmtStay(booking.checkOut)}`,
      createdAt: new Date().toISOString(),
    };

    store.reviews.unshift(review);
    booking.reviewId = review.id;
    saveStore(store);

    const prop = store.properties.find((p) => p.id === booking.propertyId);
    const enriched = prop ? enrichProperty(prop, store.reviews) : null;

    res.status(201).json({
      review,
      booking,
      averageRating: enriched?.averageRating ?? rating,
      reviewCount: enriched?.reviewCount ?? 1,
    });
  });

  app.get('/api/jobs', (req, res) => {
    const store = loadStore();
    const q = typeof req.query.q === 'string' ? req.query.q.trim().toLowerCase() : '';
    const country = typeof req.query.country === 'string' ? req.query.country.trim() : '';
    const city = typeof req.query.city === 'string' ? req.query.city.trim() : '';
    const sector = typeof req.query.sector === 'string' ? req.query.sector.trim() : '';
    const employmentType =
      typeof req.query.employmentType === 'string' ? req.query.employmentType.trim() : '';
    const minSalary = Number(req.query.minSalary) || 0;
    const studentHolidayOnly = req.query.studentHolidayOnly === 'true';
    const eligibility = typeof req.query.eligibility === 'string' ? req.query.eligibility.trim() : '';

    const today = namibiaTodayIso();

    const filtered = store.jobs.filter((job) => {
      if (!job.applicationDeadline || job.applicationDeadline < today) return false;
      if (q) {
        const haystack = `${job.title} ${job.company} ${job.city} ${job.country} ${job.sector} ${job.description} ${job.eligibilityNote} ${job.sourceName}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      if (country && job.country.toLowerCase() !== country.toLowerCase()) return false;
      if (city && job.city.toLowerCase() !== city.toLowerCase()) return false;
      if (sector && job.sector !== sector) return false;
      if (employmentType && job.employmentType !== employmentType) return false;
      if (minSalary > 0 && job.salaryMax < minSalary) return false;
      if (studentHolidayOnly && !job.isStudentHoliday && job.employmentType !== 'Holiday Casual') {
        return false;
      }
      if (eligibility === 'namibia' && job.country !== 'Namibia') return false;
      if (
        eligibility === 'sadc-international' &&
        job.eligibilityScope !== 'SADC & International (Namibians Eligible)'
      ) {
        return false;
      }
      return true;
    });

    res.json({ jobs: filtered });
  });

  app.post('/api/jobs', (req, res) => {
    const body = req.body ?? {};
    const title = typeof body.title === 'string' ? body.title.trim() : '';
    const company = typeof body.company === 'string' ? body.company.trim() : '';
    const locationKey = typeof body.locationKey === 'string' ? body.locationKey.trim() : 'Walvis Bay — Central';
    const sector = typeof body.sector === 'string' ? body.sector : 'Retail & Local Stores';
    const employmentType = typeof body.employmentType === 'string' ? body.employmentType : 'Full-time';
    const salaryMin = Math.max(100, Number(body.salaryMin) || 4000);
    const salaryMax = Math.max(salaryMin, Number(body.salaryMax) || salaryMin + 2000);
    const description = typeof body.description === 'string' ? body.description.trim() : '';
    const isStudentHoliday = Boolean(body.isStudentHoliday) || employmentType === 'Holiday Casual';
    const today = namibiaTodayIso();
    const rawDeadline =
      typeof body.applicationDeadline === 'string' ? body.applicationDeadline.trim() : '';
    const applicationDeadline =
      /^\d{4}-\d{2}-\d{2}$/.test(rawDeadline)
        ? rawDeadline
        : new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0];

    if (!title || title.length < 4 || !company) {
      res.status(400).json({ error: 'Please provide both a job title and company name.' });
      return;
    }
    if (!description || description.length < 15) {
      res.status(400).json({ error: 'Please include a short role description (at least 15 characters).' });
      return;
    }
    if (applicationDeadline < today) {
      res.status(400).json({ error: 'Closing deadline cannot be in the past.' });
      return;
    }

    const coordInfo = CITY_COORDINATES[locationKey] ?? CITY_COORDINATES['Walvis Bay — Central'];
    const jitter = ((Date.now() % 100) - 50) * 0.0002;
    const isSadcRegional = coordInfo.country !== 'Namibia';

    const newJob: JobListing = {
      id: `job_${Date.now()}`,
      title,
      company,
      country: coordInfo.country,
      city: coordInfo.city,
      region: coordInfo.region,
      lat: Number((coordInfo.lat + jitter).toFixed(5)),
      lng: Number((coordInfo.lng - jitter).toFixed(5)),
      sector: sector as JobListing['sector'],
      employmentType: employmentType as JobListing['employmentType'],
      salaryMin,
      salaryMax,
      currency: coordInfo.currency,
      salaryPeriod: 'month',
      description,
      requirements: [
        isStudentHoliday
          ? 'Open to Namibian university/TVET/Grade 12 students on holiday break'
          : 'Relevant qualification or proven industry experience',
        isSadcRegional
          ? 'Open to Namibian & SADC citizens (work authorization / regional quota supported)'
          : `Able to work in ${coordInfo.city}, Namibia`,
      ],
      benefits: [
        `Competitive ${coordInfo.currency} monthly compensation (${formatMoneyServer(salaryMin, coordInfo.currency)} – ${formatMoneyServer(salaryMax, coordInfo.currency)})`,
        'Verified OpportunityHub employer',
      ],
      eligibilityScope: isSadcRegional
        ? 'SADC & International (Namibians Eligible)'
        : 'Namibia',
      eligibilityNote: isSadcRegional
        ? 'SADC & International — Namibian Citizens Eligible'
        : isStudentHoliday
          ? 'Open to Namibian students on holiday & local residents'
          : 'Open to Namibian residents & eligible SADC applicants',
      isStudentHoliday,
      sourceName: 'Direct Employer Post',
      applicationDeadline,
      postedAt: new Date().toISOString(),
      verified: true,
    };

    const store = loadStore();
    store.jobs.unshift(newJob);
    saveStore(store);

    res.status(201).json({ job: newJob });
  });

  app.get('/api/applications', (_req, res) => {
    const store = loadStore();
    res.json({ applications: store.applications });
  });

  app.post('/api/applications', (req, res) => {
    const body = req.body ?? {};
    const jobId = typeof body.jobId === 'string' ? body.jobId : '';
    const applicantName = typeof body.applicantName === 'string' ? body.applicantName.trim() : '';
    const applicantEmail = typeof body.applicantEmail === 'string' ? body.applicantEmail.trim() : '';
    const applicantPhone = typeof body.applicantPhone === 'string' ? body.applicantPhone.trim() : '';
    const portfolioUrl = typeof body.portfolioUrl === 'string' ? body.portfolioUrl.trim() : '';
    const cvFileName = typeof body.cvFileName === 'string' && body.cvFileName.trim() ? body.cvFileName.trim() : 'Candidate_CV.pdf';
    const cvId = typeof body.cvId === 'string' && body.cvId.trim() ? body.cvId.trim() : undefined;
    const cvDocumentTitle =
      typeof body.cvDocumentTitle === 'string' && body.cvDocumentTitle.trim()
        ? body.cvDocumentTitle.trim()
        : undefined;
    const coverNote = typeof body.coverNote === 'string' ? body.coverNote.trim() : '';

    const store = loadStore();
    const today = namibiaTodayIso();
    const job = store.jobs.find((j) => j.id === jobId);
    if (!job) {
      res.status(404).json({ error: 'Selected job vacancy was not found.' });
      return;
    }
    if (!job.applicationDeadline || job.applicationDeadline < today) {
      res.status(410).json({ error: 'This job vacancy has passed its closing deadline and is closed.' });
      return;
    }
    if (applicantName.length < 2) {
      res.status(400).json({ error: 'Please enter your full name.' });
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(applicantEmail)) {
      res.status(400).json({ error: 'Please enter a valid email address.' });
      return;
    }
    if (applicantPhone.length < 6) {
      res.status(400).json({ error: 'Please enter a valid phone number.' });
      return;
    }
    if (coverNote.length < 15) {
      res.status(400).json({ error: 'Please write a short cover note (at least 15 characters).' });
      return;
    }

    const referenceCode = `APP-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const emailConfirmationSubject = `Application Received (${referenceCode}) — ${job.title} at ${job.company}`;
    const emailConfirmationBody = [
      `Dear ${applicantName},`,
      ``,
      `Your application for ${job.title} at ${job.company} (${job.city}, ${job.country}) has been submitted.`,
      ``,
      `Reference Code: ${referenceCode}`,
      `Role: ${job.title}`,
      `Employer: ${job.company}`,
      `Submitted CV: ${cvFileName}${cvDocumentTitle ? ` (Built in CV Maker: ${cvDocumentTitle})` : ''}`,
      ``,
      `The hiring team reviews applications directly and will reach out to ${applicantEmail} or ${applicantPhone}.`,
    ].join('\n');

    const application: JobApplication = {
      id: `app_${Date.now()}`,
      referenceCode,
      jobId: job.id,
      jobTitle: job.title,
      company: job.company,
      jobLocation: `${job.city}, ${job.country}`,
      applicantName,
      applicantEmail,
      applicantPhone,
      portfolioUrl: portfolioUrl || undefined,
      cvFileName,
      cvId,
      cvDocumentTitle,
      coverNote,
      status: 'submitted',
      createdAt: new Date().toISOString(),
      emailConfirmationSubject,
      emailConfirmationBody,
    };

    store.applications.unshift(application);
    saveStore(store);

    res.status(201).json({ application });
  });

  app.get('/api/cvs', (_req, res) => {
    const store = loadStore();
    const sorted = [...store.cvs].sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
    res.json({ cvs: sorted });
  });

  app.post('/api/cvs', (req, res) => {
    const body = (req.body ?? {}) as Partial<CvDocument>;
    const fullName = typeof body.fullName === 'string' ? body.fullName.trim() : '';
    const documentTitle =
      typeof body.documentTitle === 'string' && body.documentTitle.trim()
        ? body.documentTitle.trim()
        : fullName
          ? `${fullName.replace(/\s+/g, '_')}_CV`
          : 'Untitled_CV';

    if (!fullName || fullName.length < 2) {
      res.status(400).json({ error: 'Please enter your full name before saving your CV.' });
      return;
    }

    const now = new Date().toISOString();
    const doc: CvDocument = {
      id: typeof body.id === 'string' && body.id.trim() ? body.id.trim() : `cv_${Date.now()}`,
      documentTitle,
      template: body.template || 'modern-coastal',
      accentColor: body.accentColor || 'navy',
      fullName,
      headline: typeof body.headline === 'string' ? body.headline.trim() : '',
      email: typeof body.email === 'string' ? body.email.trim() : '',
      phone: typeof body.phone === 'string' ? body.phone.trim() : '',
      location: typeof body.location === 'string' ? body.location.trim() : '',
      citizenship: typeof body.citizenship === 'string' ? body.citizenship.trim() : '',
      driversLicense: typeof body.driversLicense === 'string' ? body.driversLicense.trim() : '',
      availability: typeof body.availability === 'string' ? body.availability.trim() : '',
      linkedinOrPortfolio:
        typeof body.linkedinOrPortfolio === 'string' ? body.linkedinOrPortfolio.trim() : '',
      summary: typeof body.summary === 'string' ? body.summary.trim() : '',
      experiences: Array.isArray(body.experiences) ? body.experiences : [],
      education: Array.isArray(body.education) ? body.education : [],
      skills: Array.isArray(body.skills) ? body.skills : [],
      languages: Array.isArray(body.languages) ? body.languages : [],
      references: Array.isArray(body.references) ? body.references : [],
      createdAt: typeof body.createdAt === 'string' && body.createdAt ? body.createdAt : now,
      updatedAt: now,
    };

    const store = loadStore();
    const existingIndex = store.cvs.findIndex((c) => c.id === doc.id);
    if (existingIndex >= 0) {
      store.cvs[existingIndex] = { ...doc, createdAt: store.cvs[existingIndex].createdAt };
    } else {
      store.cvs.unshift(doc);
    }
    saveStore(store);

    res.status(201).json({ cv: doc });
  });

  app.put('/api/cvs/:id', (req, res) => {
    const body = (req.body ?? {}) as Partial<CvDocument>;
    const fullName = typeof body.fullName === 'string' ? body.fullName.trim() : '';
    if (!fullName || fullName.length < 2) {
      res.status(400).json({ error: 'Please enter your full name before saving your CV.' });
      return;
    }

    const store = loadStore();
    const index = store.cvs.findIndex((c) => c.id === req.params.id);
    const now = new Date().toISOString();
    const existingCreated = index >= 0 ? store.cvs[index].createdAt : now;

    const updated: CvDocument = {
      id: req.params.id,
      documentTitle:
        typeof body.documentTitle === 'string' && body.documentTitle.trim()
          ? body.documentTitle.trim()
          : `${fullName.replace(/\s+/g, '_')}_CV`,
      template: body.template || 'modern-coastal',
      accentColor: body.accentColor || 'navy',
      fullName,
      headline: typeof body.headline === 'string' ? body.headline.trim() : '',
      email: typeof body.email === 'string' ? body.email.trim() : '',
      phone: typeof body.phone === 'string' ? body.phone.trim() : '',
      location: typeof body.location === 'string' ? body.location.trim() : '',
      citizenship: typeof body.citizenship === 'string' ? body.citizenship.trim() : '',
      driversLicense: typeof body.driversLicense === 'string' ? body.driversLicense.trim() : '',
      availability: typeof body.availability === 'string' ? body.availability.trim() : '',
      linkedinOrPortfolio:
        typeof body.linkedinOrPortfolio === 'string' ? body.linkedinOrPortfolio.trim() : '',
      summary: typeof body.summary === 'string' ? body.summary.trim() : '',
      experiences: Array.isArray(body.experiences) ? body.experiences : [],
      education: Array.isArray(body.education) ? body.education : [],
      skills: Array.isArray(body.skills) ? body.skills : [],
      languages: Array.isArray(body.languages) ? body.languages : [],
      references: Array.isArray(body.references) ? body.references : [],
      createdAt: existingCreated,
      updatedAt: now,
    };

    if (index >= 0) {
      store.cvs[index] = updated;
    } else {
      store.cvs.unshift(updated);
    }
    saveStore(store);

    res.json({ cv: updated });
  });

  app.delete('/api/cvs/:id', (req, res) => {
    const store = loadStore();
    const before = store.cvs.length;
    store.cvs = store.cvs.filter((c) => c.id !== req.params.id);
    if (store.cvs.length !== before) {
      saveStore(store);
    }
    res.json({ deleted: true, id: req.params.id });
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  const PORT = Number(process.env.PORT) || 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Walvis Bay Rental server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
