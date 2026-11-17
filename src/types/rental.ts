export type SadcCountry =
  | 'Namibia'
  | 'South Africa'
  | 'Botswana'
  | 'Zambia'
  | 'Zimbabwe'
  | 'Angola'
  | 'Mozambique';

export type CurrencyCode = 'NAD' | 'ZAR' | 'BWP' | 'USD';

export type PropertyType =
  | 'Apartment'
  | 'Studio Flat'
  | 'House'
  | 'Villa'
  | 'Shared House'
  | 'Backyard Flat'
  | 'Private Room';

export type Amenity =
  | 'Wi-Fi'
  | 'Parking'
  | 'Pets allowed'
  | 'Ocean view'
  | 'Furnished'
  | 'Security'
  | 'Workspace'
  | 'Braai area'
  | 'Kitchen'
  | 'Prepaid electricity';

export interface BookedRange {
  bookingId: string;
  checkIn: string; // YYYY-MM-DD
  checkOut: string; // YYYY-MM-DD
}

export interface PropertyHost {
  name: string;
  role: string;
  responseTime: string;
  verified: boolean;
}

export interface PropertyReview {
  id: string;
  propertyId: string;
  bookingId: string;
  confirmationCode: string;
  guestName: string;
  rating: number; // 1..5
  title: string;
  comment: string;
  stayDates: string;
  createdAt: string;
}

export interface Property {
  id: string;
  title: string;
  neighborhood: string;
  city: string;
  region: string;
  country: SadcCountry;
  currency: CurrencyCode;
  address: string;
  lat: number;
  lng: number;
  propertyType: PropertyType;
  bedrooms: number;
  bathrooms: number;
  maxGuests: number;
  areaSqm: number;
  pricePerNight: number;
  monthlyRate: number;
  cleaningFee: number;
  amenities: Amenity[];
  image: string;
  description: string;
  highlights: string[];
  houseRules: string[];
  host: PropertyHost;
  bookedRanges: BookedRange[];
  sourceName?: string;
  sourceUrl?: string;
  depositAmount?: number;
  utilitiesNote?: string;
  contactPhone?: string;
  facebookGroupName?: string;
  postedDate?: string; // YYYY-MM-DD
  averageRating?: number;
  reviewCount?: number;
  reviews?: PropertyReview[];
  createdAt: string;
}

export interface SearchFilters {
  q: string;
  region: string;
  location: string;
  propertyType: string;
  minPrice: number;
  maxPrice: number;
  maxMonthly: number;
  postedSince: '' | 'yesterday';
  bedrooms: number; // 0 = any, 1 = 1+, 2 = 2+, etc.
  checkIn: string;
  checkOut: string;
  amenities: Amenity[];
  sortBy: 'featured' | 'rating' | 'price_asc' | 'price_desc' | 'monthly_asc';
}

export type PaymentMethodType = 'card' | 'eft';

export interface BookingEmailNotification {
  id: string;
  to: string;
  from: string;
  subject: string;
  sentAt: string;
  confirmationCode: string;
  bodyText: string;
  checkInInstructions: string;
}

export interface Booking {
  id: string;
  confirmationCode: string;
  propertyId: string;
  propertyTitle: string;
  propertyImage: string;
  propertyLocation: string;
  currency?: CurrencyCode;
  checkIn: string;
  checkOut: string;
  nights: number;
  guests: number;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  specialRequests?: string;
  pricePerNight: number;
  subtotal: number;
  cleaningFee: number;
  serviceFee: number;
  totalAmount: number;
  paymentMethod: PaymentMethodType;
  paymentSummary: string;
  transactionId: string;
  status: 'confirmed' | 'cancelled';
  reviewId?: string;
  createdAt: string;
  emailNotification: BookingEmailNotification;
}

export type JobSector =
  | 'Retail & Local Stores'
  | 'Hospitality & Tourism'
  | 'Maritime & Logistics'
  | 'Mining & Energy'
  | 'IT & Engineering'
  | 'Finance & Audit'
  | 'Healthcare'
  | 'Construction'
  | 'Agriculture & Climate';

export type EmploymentType =
  | 'Full-time'
  | 'Holiday Casual'
  | 'Contract'
  | 'Remote / Hybrid'
  | 'Internship';

export type EligibilityScope =
  | 'Namibia'
  | 'SADC & International (Namibians Eligible)';

export interface JobListing {
  id: string;
  title: string;
  company: string;
  country: SadcCountry;
  city: string;
  region: string;
  lat: number;
  lng: number;
  sector: JobSector;
  employmentType: EmploymentType;
  salaryMin: number;
  salaryMax: number;
  currency: CurrencyCode;
  salaryPeriod: 'month' | 'year';
  description: string;
  requirements: string[];
  benefits: string[];
  eligibilityScope: EligibilityScope;
  eligibilityNote: string;
  isStudentHoliday?: boolean;
  sourceName: string;
  sourceUrl?: string;
  applicationDeadline: string;
  postedAt: string;
  verified: boolean;
}

export interface JobFilters {
  q: string;
  country: string;
  city: string;
  sector: string;
  employmentType: string;
  minSalary: number;
  studentHolidayOnly: boolean;
  eligibility: '' | 'namibia' | 'sadc-international';
}

export interface JobApplication {
  id: string;
  referenceCode: string;
  jobId: string;
  jobTitle: string;
  company: string;
  jobLocation: string;
  applicantName: string;
  applicantEmail: string;
  applicantPhone: string;
  portfolioUrl?: string;
  cvFileName: string;
  cvId?: string;
  cvDocumentTitle?: string;
  coverNote: string;
  status: 'submitted';
  createdAt: string;
  emailConfirmationSubject: string;
  emailConfirmationBody: string;
}

export type CvTemplateId = 'classic-executive' | 'modern-coastal' | 'student-retail';
export type CvAccentColor = 'navy' | 'emerald' | 'slate' | 'amber';

export interface CvExperience {
  id: string;
  role: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  highlights: string[];
}

export interface CvEducation {
  id: string;
  qualification: string;
  institution: string;
  location: string;
  yearCompleted: string;
  details: string;
}

export interface CvReference {
  id: string;
  name: string;
  title: string;
  organization: string;
  contact: string;
}

export interface CvDocument {
  id: string;
  documentTitle: string;
  template: CvTemplateId;
  accentColor: CvAccentColor;
  fullName: string;
  headline: string;
  email: string;
  phone: string;
  location: string;
  citizenship: string;
  driversLicense: string;
  availability: string;
  linkedinOrPortfolio: string;
  summary: string;
  experiences: CvExperience[];
  education: CvEducation[];
  skills: string[];
  languages: string[];
  references: CvReference[];
  createdAt: string;
  updatedAt: string;
}

