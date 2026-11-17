export interface DirectorySource {
  name: string;
  category: 'Rentals & Rooms' | 'Jobs & Careers' | 'Student Holiday & Stores' | 'SADC Regional';
  url: string;
}

export const LISTING_SOURCES: DirectorySource[] = [
  // User-listed Rental & Job sources (alphabetical + clear categorization)
  {
    name: 'Careerjet Namibia',
    category: 'Jobs & Careers',
    url: 'https://www.careerjet.co.na/',
  },
  {
    name: 'Careers24 Namibia',
    category: 'Jobs & Careers',
    url: 'https://www.careers24.com.na/',
  },
  {
    name: 'Epangelo Mining Careers',
    category: 'Jobs & Careers',
    url: 'https://www.epangelomining.na/',
  },
  {
    name: 'Expat.com — Rooms in Namibia',
    category: 'Rentals & Rooms',
    url: 'https://www.expat.com/en/housing/africa/namibia/',
  },
  {
    name: 'Facebook Marketplace Rentals',
    category: 'Rentals & Rooms',
    url: 'https://www.facebook.com/marketplace/windhoek/propertyrentals',
  },
  {
    name: 'Facebook Rental Groups',
    category: 'Rentals & Rooms',
    url: 'https://www.facebook.com/groups/search/groups/?q=Namibia%20Rentals',
  },
  {
    name: 'JobPortunities.net Namibia',
    category: 'Jobs & Careers',
    url: 'https://www.jobportunities.net/',
  },
  {
    name: 'Jobs in Namibia',
    category: 'Jobs & Careers',
    url: 'https://www.jobsnamibia.net/',
  },
  {
    name: 'Kalahari Deals — Flats & houses to rent',
    category: 'Rentals & Rooms',
    url: 'https://kalaharideals.com/namibia/flats-houses-to-rent/',
  },
  {
    name: 'Kalahari Deals — Rooms for rent',
    category: 'Rentals & Rooms',
    url: 'https://kalaharideals.com/namibia/rooms-for-rent/',
  },
  {
    name: 'Karas Regional Council Vacancies',
    category: 'Jobs & Careers',
    url: 'https://karasrc.gov.na/',
  },
  {
    name: 'LinkedIn',
    category: 'Jobs & Careers',
    url: 'https://www.linkedin.com/jobs/namibia-jobs/',
  },
  {
    name: 'Municipality of Otjiwarongo Vacancies',
    category: 'Jobs & Careers',
    url: 'https://otjimun.org.na/',
  },
  {
    name: 'MyProperty Namibia',
    category: 'Rentals & Rooms',
    url: 'https://www.myproperty.com.na/',
  },
  {
    name: 'Namibia Jobs',
    category: 'Jobs & Careers',
    url: 'https://www.namibiajobs.com/',
  },
  {
    name: 'Namijob',
    category: 'Jobs & Careers',
    url: 'https://www.namijob.com/',
  },
  {
    name: 'NamVacancies (Instagram)',
    category: 'Jobs & Careers',
    url: 'https://www.instagram.com/namvacancies/',
  },
  {
    name: 'Office of the Prime Minister Portal',
    category: 'Jobs & Careers',
    url: 'https://nieis.namibiaatwork.gov.na/',
  },
  {
    name: 'Osino Resources Careers',
    category: 'Jobs & Careers',
    url: 'https://osinoresources.com/',
  },
  {
    name: 'Profdir Namibia',
    category: 'Jobs & Careers',
    url: 'https://www.profdir.com/namibia/jobs',
  },
  {
    name: 'Property24 Namibia',
    category: 'Rentals & Rooms',
    url: 'https://www.property24.co.na/',
  },
  {
    name: 'Real Estate Namibia — Rentals',
    category: 'Rentals & Rooms',
    url: 'https://www.realestate.co.na/',
  },
  {
    name: 'Vacancies on Facebook',
    category: 'Jobs & Careers',
    url: 'https://www.facebook.com/groups/search/groups/?q=Vacancies%20in%20Namibia',
  },
  {
    name: 'Vacancy in Otjiwarongo (Facebook Group)',
    category: 'Jobs & Careers',
    url: 'https://www.facebook.com/groups/search/groups/?q=Vacancy%20in%20Otjiwarongo',
  },
  // Additional Student Holiday & SADC Regional Official Sources
  {
    name: 'Woermann Brock Careers',
    category: 'Student Holiday & Stores',
    url: 'https://www.yourwoermann.com/',
  },
  {
    name: 'Shoprite & Checkers Careers',
    category: 'Student Holiday & Stores',
    url: 'https://apply.shoprite.jobs/',
  },
  {
    name: 'O&L Careers (Pick n Pay)',
    category: 'Student Holiday & Stores',
    url: 'https://www.ol.na/',
  },
  {
    name: 'SADC Secretariat (sadc.int)',
    category: 'SADC Regional',
    url: 'https://www.sadc.int/opportunities/employment',
  },
  {
    name: 'AfDB & UNDP Southern Africa',
    category: 'SADC Regional',
    url: 'https://www.afdb.org/',
  },
];
