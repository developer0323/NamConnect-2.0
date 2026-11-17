import { Amenity, PropertyType } from '../types/rental';
import { NAMIBIA_RENTAL_LOCATIONS } from './seedProperties';

export interface FacebookRentalGroup {
  id: string;
  name: string;
  cityFocus: string;
  region: string;
  typicalMonthlyRange: string;
  url: string;
  focusNote: string;
}

export const NAMIBIA_FACEBOOK_RENTAL_GROUPS: FacebookRentalGroup[] = [
  {
    id: 'fb-whk-rooms',
    name: 'Windhoek Flats, Houses, Rooms To Rent / Buy',
    cityFocus: 'Windhoek',
    region: 'Khomas',
    typicalMonthlyRange: 'N$1,500 – N$6,500/mo',
    url: 'https://www.facebook.com/groups/search/groups/?q=Windhoek%20Flats%20Houses%20Rooms%20To%20Rent',
    focusNote: 'Single rooms, outside rooms, backyard flats & student rooms near UNAM/NUST',
  },
  {
    id: 'fb-whk-accom',
    name: 'Windhoek Accommodation & Rooms to Rent',
    cityFocus: 'Windhoek',
    region: 'Khomas',
    typicalMonthlyRange: 'N$1,800 – N$5,800/mo',
    url: 'https://www.facebook.com/groups/search/groups/?q=Windhoek%20Accommodation%20to%20Rent',
    focusNote: 'Khomasdal, Dorado Park, Windhoek West, Pionierspark, Katutura & Eros',
  },
  {
    id: 'fb-wb-rentals',
    name: 'Walvis Bay Houses, Flats & Rooms to Rent',
    cityFocus: 'Walvis Bay',
    region: 'Erongo',
    typicalMonthlyRange: 'N$1,600 – N$5,500/mo',
    url: 'https://www.facebook.com/groups/search/groups/?q=Walvis%20Bay%20Rooms%20to%20Rent',
    focusNote: 'Lagoon, Meersig, Narraville, Kuisebmond & Langstrand monthly rooms',
  },
  {
    id: 'fb-swakop-rentals',
    name: 'Swakopmund Accommodation & Rooms to Rent',
    cityFocus: 'Swakopmund',
    region: 'Erongo',
    typicalMonthlyRange: 'N$2,000 – N$6,000/mo',
    url: 'https://www.facebook.com/groups/search/groups/?q=Swakopmund%20Rooms%20to%20Rent',
    focusNote: 'Central, Tamariskia, Mondesa, Vineta & Kramersdorf monthly lets',
  },
  {
    id: 'fb-north-rentals',
    name: 'Ongwediva & Oshakati Houses and Rooms to Rent',
    cityFocus: 'Ongwediva / Oshakati',
    region: 'Oshana',
    typicalMonthlyRange: 'N$1,200 – N$4,200/mo',
    url: 'https://www.facebook.com/groups/search/groups/?q=Ongwediva%20Oshakati%20Rooms%20to%20Rent',
    focusNote: 'Oshakati CBD, Ongwediva Ext 11/15 & UNAM Engineering campus rooms',
  },
  {
    id: 'fb-otji-rentals',
    name: 'Otjiwarongo Accommodation & Vacancy Group',
    cityFocus: 'Otjiwarongo',
    region: 'Otjozondjupa',
    typicalMonthlyRange: 'N$1,400 – N$4,500/mo',
    url: 'https://www.facebook.com/groups/search/groups/?q=Otjiwarongo%20Accommodation%20to%20Rent',
    focusNote: 'Orwetoveni, Central & B1 corridor backyard rooms and bachelor flats',
  },
  {
    id: 'fb-rundu-katima',
    name: 'Rundu & Katima Mulilo Rooms to Rent',
    cityFocus: 'Rundu / Katima Mulilo',
    region: 'Kavango East & Zambezi',
    typicalMonthlyRange: 'N$1,100 – N$3,800/mo',
    url: 'https://www.facebook.com/groups/search/groups/?q=Rundu%20Katima%20Mulilo%20Rooms%20to%20Rent',
    focusNote: 'Tutungeni, Kaisosi, Sauyemwa & Katima Mulilo monthly rooms',
  },
  {
    id: 'fb-south-rentals',
    name: 'Keetmanshoop & Lüderitz Rentals Namibia',
    cityFocus: 'Keetmanshoop / Lüderitz',
    region: '//Kharas',
    typicalMonthlyRange: 'N$1,500 – N$4,800/mo',
    url: 'https://www.facebook.com/groups/search/groups/?q=Keetmanshoop%20Luderitz%20Rentals',
    focusNote: 'Westdene, Tseiblaagte, Lüderitz Harbour & Aus corridor rooms',
  },
  {
    id: 'fb-marketplace-na',
    name: 'Facebook Marketplace — Namibia Property Rentals',
    cityFocus: 'All Namibia',
    region: 'Nationwide',
    typicalMonthlyRange: 'N$1,200 – N$12,000/mo',
    url: 'https://www.facebook.com/marketplace/windhoek/propertyrentals',
    focusNote: 'Direct landlord room & flat listings across Windhoek & all 14 regions',
  },
];

export interface ParsedFacebookRoomPost {
  title: string;
  locationKey: string;
  address: string;
  propertyType: PropertyType;
  bedrooms: number;
  bathrooms: number;
  monthlyRate: number;
  depositAmount: number;
  utilitiesNote: string;
  contactPhone: string;
  hostName: string;
  amenities: Amenity[];
  description: string;
}

const SUBURB_TO_LOCATION_KEY: Array<{ pattern: RegExp; locationKey: string; suburbLabel: string }> = [
  { pattern: /\b(lagoon)\b/i, locationKey: 'Walvis Bay — Lagoon', suburbLabel: 'Lagoon, Walvis Bay' },
  { pattern: /\b(meersig)\b/i, locationKey: 'Walvis Bay — Meersig', suburbLabel: 'Meersig, Walvis Bay' },
  { pattern: /\b(langstrand|long\s*beach)\b/i, locationKey: 'Walvis Bay — Langstrand', suburbLabel: 'Langstrand, Walvis Bay' },
  { pattern: /\b(narraville)\b/i, locationKey: 'Walvis Bay — Narraville', suburbLabel: 'Narraville, Walvis Bay' },
  { pattern: /\b(kuisebmond|walvis\s*bay|walvis)\b/i, locationKey: 'Walvis Bay — Central', suburbLabel: 'Walvis Bay' },
  { pattern: /\b(swakopmund|swakop|mondesa|tamariskia|vineta|kramersdorf)\b/i, locationKey: 'Swakopmund', suburbLabel: 'Swakopmund' },
  {
    pattern: /\b(windhoek|khomasdal|katutura|dorado\s*park|pionierspark|pioneers\s*park|klein\s*windhoek|eros|academia|cimbebasia|okuryangava|otjomuise|goreangab|hochland\s*park|suiderhof|olympia|kleine\s*kuppe|wanaheda|greenwell)\b/i,
    locationKey: 'Windhoek',
    suburbLabel: 'Windhoek',
  },
  { pattern: /\b(oshakati)\b/i, locationKey: 'Oshakati', suburbLabel: 'Oshakati' },
  { pattern: /\b(ongwediva)\b/i, locationKey: 'Ongwediva', suburbLabel: 'Ongwediva' },
  { pattern: /\b(rundu|tutungeni|sauyemwa|kaisosi)\b/i, locationKey: 'Rundu', suburbLabel: 'Rundu' },
  { pattern: /\b(katima|katima\s*mulilo|zambezi)\b/i, locationKey: 'Katima Mulilo', suburbLabel: 'Katima Mulilo' },
  { pattern: /\b(otjiwarongo|orwetoveni)\b/i, locationKey: 'Otjiwarongo', suburbLabel: 'Otjiwarongo' },
  { pattern: /\b(tsumeb|nomtsoub)\b/i, locationKey: 'Tsumeb', suburbLabel: 'Tsumeb' },
  { pattern: /\b(luderitz|lüderitz)\b/i, locationKey: 'Lüderitz', suburbLabel: 'Lüderitz' },
  { pattern: /\b(keetmanshoop|keetmans|westdene|tseiblaagte)\b/i, locationKey: 'Keetmanshoop', suburbLabel: 'Keetmanshoop' },
  { pattern: /\b(gobabis|epako)\b/i, locationKey: 'Gobabis', suburbLabel: 'Gobabis' },
];

export function parseFacebookRoomPost(rawText: string): ParsedFacebookRoomPost {
  const clean = rawText.trim();
  const lines = clean
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  // Location & suburb matching
  let locationKey: string = NAMIBIA_RENTAL_LOCATIONS[6]; // Windhoek default if unspecified, else first match
  let matchedSuburb = '';
  for (const entry of SUBURB_TO_LOCATION_KEY) {
    const match = clean.match(entry.pattern);
    if (match) {
      locationKey = entry.locationKey;
      matchedSuburb = match[1];
      break;
    }
  }
  if (!matchedSuburb) {
    locationKey = 'Windhoek';
  }

  // Monthly Rent extraction (e.g., N$2,500, NAD 3500, 2800pm, N$ 4 200 per month)
  let monthlyRate = 2800;
  const rentPatterns = [
    /(?:rent|monthly|price|rate)?\s*(?:n\$|nad|r)\s*([0-9][0-9\s,.]{2,7})\s*(?:\/?\s*m(?:onth|o)?|p\/m|pm|per\s*month)?/i,
    /([0-9][0-9\s,.]{2,7})\s*(?:n\$|nad)?\s*(?:\/?\s*m(?:onth|o)|p\/m|pm|per\s*month)/i,
  ];
  for (const pat of rentPatterns) {
    const m = clean.match(pat);
    if (m?.[1]) {
      const parsed = Number(m[1].replace(/[\s,]/g, '').replace(/\..*$/, ''));
      if (parsed >= 500 && parsed <= 45000) {
        monthlyRate = parsed;
        break;
      }
    }
  }

  // Deposit extraction
  let depositAmount = 0;
  if (/no\s*deposit|deposit\s*:\s*none|0\s*deposit/i.test(clean)) {
    depositAmount = 0;
  } else if (/deposit\s*(?:=|same\s*as\s*rent|equal\s*to\s*rent|required)/i.test(clean)) {
    depositAmount = monthlyRate;
  } else {
    const depMatch = clean.match(/(?:deposit|dep)\s*(?:of|:|is)?\s*(?:n\$|nad|r)?\s*([0-9][0-9\s,.]{2,7})/i);
    if (depMatch?.[1]) {
      const parsedDep = Number(depMatch[1].replace(/[\s,]/g, '').replace(/\..*$/, ''));
      if (parsedDep >= 200 && parsedDep <= 45000) {
        depositAmount = parsedDep;
      }
    } else {
      depositAmount = Math.round(monthlyRate * 0.5);
    }
  }

  // Phone number extraction (Namibian +264 / 081 / 085 / 061 / 064)
  const phoneMatch = clean.match(/(?:\+264|0)(?:\s|-)?(?:81|85|84|61|64|65|66|67|63|62)(?:[\s-]?\d){6,8}/);
  const contactPhone = phoneMatch ? phoneMatch[0].replace(/\s+/g, ' ').trim() : '';

  // Room / Property Type detection
  let propertyType: PropertyType = 'Private Room';
  if (/backyard\s*flat|outside\s*room|granny\s*flat|cottage/i.test(clean)) {
    propertyType = 'Backyard Flat';
  } else if (/bachelor|studio/i.test(clean)) {
    propertyType = 'Studio Flat';
  } else if (/share(?:d|ing)?\s*(?:house|flat|room|accommodation)/i.test(clean)) {
    propertyType = 'Shared House';
  } else if (/2\s*bed|two\s*bed|apartment|flat\b/i.test(clean)) {
    propertyType = 'Apartment';
  } else if (/\bhouse\b/i.test(clean)) {
    propertyType = 'House';
  }

  // Bedrooms
  let bedrooms = 1;
  const bedMatch = clean.match(/\b([1-6])\s*(?:bed(?:room)?s?|br)\b/i);
  if (bedMatch?.[1]) {
    bedrooms = Number(bedMatch[1]);
  } else if (propertyType === 'Studio Flat') {
    bedrooms = 0;
  }

  // Utilities
  const utilParts: string[] = [];
  if (/water\s*(?:&|and)?\s*elec(?:tricity)?\s*incl/i.test(clean) || /w\s*&\s*e\s*incl/i.test(clean)) {
    utilParts.push('Water & electricity included');
  } else {
    if (/water\s*incl/i.test(clean)) utilParts.push('Water included');
    if (/prepaid|pre-paid/i.test(clean)) utilParts.push('Prepaid electricity');
    else if (/elec(?:tricity)?\s*excl/i.test(clean)) utilParts.push('Electricity excluded');
  }
  if (/wi-?fi|wifi|fiber|fibre/i.test(clean)) utilParts.push('Wi-Fi available');
  const utilitiesNote = utilParts.join(' · ') || 'Confirm water & prepaid electricity with landlord';

  // Amenities
  const amenities: Amenity[] = [];
  if (/wi-?fi|wifi|fiber|fibre/i.test(clean)) amenities.push('Wi-Fi');
  if (/park(?:ing)?|garage|carport|shade\s*net/i.test(clean)) amenities.push('Parking');
  if (/pet|dog|cat/i.test(clean) && !/no\s*pet/i.test(clean)) amenities.push('Pets allowed');
  if (/furnished/i.test(clean) && !/unfurnished/i.test(clean)) amenities.push('Furnished');
  if (/secur|alarm|gate|electric\s*fence|guard/i.test(clean)) amenities.push('Security');
  if (/kitchen|kitchenette|built-?in\s*cupboard|bic/i.test(clean)) amenities.push('Kitchen');
  if (/prepaid|pre-paid/i.test(clean)) amenities.push('Prepaid electricity');
  if (/braai/i.test(clean)) amenities.push('Braai area');
  if (amenities.length === 0) {
    amenities.push('Security', 'Kitchen');
  }

  // Suggested Title
  const firstSentence = (lines[0] ?? '').split(/(?<=[.!?])\s+/)[0]?.trim() ?? '';
  const firstLine = firstSentence.slice(0, 76).replace(/[.,;:\s]+$/, '');
  const cityDisplay = locationKey.includes('—') ? locationKey.split('—')[0].trim() : locationKey;
  const suburbDisplay = matchedSuburb
    ? matchedSuburb.replace(/\b\w/g, (c) => c.toUpperCase())
    : cityDisplay;
  const title =
    firstLine.length >= 10 && !/^(hi|hello|good\s*(morning|day|afternoon))/i.test(firstLine)
      ? firstLine
      : `${suburbDisplay} ${propertyType} — Monthly Rental`;

  const address = matchedSuburb
    ? `${suburbDisplay}, ${cityDisplay}, Namibia`
    : `${cityDisplay}, Namibia`;

  return {
    title,
    locationKey,
    address,
    propertyType,
    bedrooms,
    bathrooms: 1,
    monthlyRate,
    depositAmount,
    utilitiesNote,
    contactPhone,
    hostName: '',
    amenities,
    description: clean.length >= 15 ? clean : `${title}. Monthly rental in ${address}.`,
  };
}
