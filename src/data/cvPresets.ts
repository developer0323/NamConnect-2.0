import { CvAccentColor, CvDocument, CvTemplateId } from '../types/rental';

export interface CvStarterPreset {
  id: string;
  label: string;
  subtitle: string;
  create: () => CvDocument;
}

function nowIso(): string {
  return new Date().toISOString();
}

export const NAMIBIA_COMMON_SKILLS = [
  'Customer Service',
  'Point of Sale (POS)',
  'Cash Handling & Reconciliation',
  'Stock Taking & Merchandising',
  'Microsoft Excel',
  'Microsoft Word',
  'Safety & PPE Compliance',
  'Forklift / Warehouse Operations',
  'Financial Reporting (IFRS)',
  'Project Coordination',
  'Technical Maintenance',
  'Communication & Teamwork',
];

export const NAMIBIA_COMMON_LANGUAGES = [
  'English (Fluent)',
  'Oshiwambo (Fluent)',
  'Afrikaans (Conversational)',
  'Otjiherero (Fluent)',
  'Khoekhoegowab (Conversational)',
  'Rukwangali (Fluent)',
  'Silozi (Fluent)',
  'Portuguese (Basic)',
];

export const CV_TEMPLATES: { id: CvTemplateId; name: string; description: string }[] = [
  {
    id: 'student-retail',
    name: 'Student & Holiday Retail',
    description: 'Compact 1-page format highlighting holiday shift availability, store skills, and studies.',
  },
  {
    id: 'modern-coastal',
    name: 'Modern Two-Column',
    description: 'Clean sidebar for contact, citizenship, skills, and licence alongside work history.',
  },
  {
    id: 'classic-executive',
    name: 'Classic SADC Executive',
    description: 'Traditional single-column layout built for corporate, mining, and regional NGO panels.',
  },
];

export const CV_ACCENTS: { id: CvAccentColor; label: string; hex: string }[] = [
  { id: 'navy', label: 'Deep Navy', hex: '#1E3A8A' },
  { id: 'emerald', label: 'Coastal Green', hex: '#065F46' },
  { id: 'slate', label: 'Charcoal', hex: '#1E293B' },
  { id: 'amber', label: 'Warm Ochre', hex: '#92400E' },
];

export const CV_STARTER_PRESETS: CvStarterPreset[] = [
  {
    id: 'student-holiday',
    label: 'Student Holiday & Store Template',
    subtitle: 'Ideal for Woermann Brock, Shoprite, Pick n Pay, Clicks & holiday retail roles',
    create: () => ({
      id: `cv_${Date.now()}`,
      documentTitle: 'Student_Holiday_Retail_CV_2026',
      template: 'student-retail',
      accentColor: 'emerald',
      fullName: 'Selma Nangula Shikongo',
      headline: 'BCom Accounting Student | Holiday Cashier & Retail Assistant',
      email: 'selma.shikongo@example.na',
      phone: '+264 81 440 2189',
      location: 'Walvis Bay, Erongo Region, Namibia',
      citizenship: 'Namibian Citizen',
      driversLicense: 'Learner / Public Transport Ready',
      availability: 'Immediate — Full Holiday Break & Weekend Shifts',
      linkedinOrPortfolio: '',
      summary:
        'Dependable second-year University of Namibia student seeking holiday retail, cashier, or merchandising work in Walvis Bay or Windhoek. Known for accurate till reconciliation, friendly bilingual customer service, and punctual shift reliability during peak festive trading.',
      experiences: [
        {
          id: 'exp-1',
          role: 'Holiday Till Operator & Floor Assistant (Seasonal)',
          company: 'Coastal Fresh Mart',
          location: 'Walvis Bay, Namibia',
          startDate: 'Nov 2025',
          endDate: 'Jan 2026',
          current: false,
          highlights: [
            'Processed 120+ daily Point of Sale (POS) card, cash, and EFT transactions with zero till variances.',
            'Restocked dry goods, bakery displays, and cold-chain shelves ahead of morning store opening.',
            'Assisted customers in English, Oshiwambo, and Afrikaans while keeping checkout queues moving.',
          ],
        },
        {
          id: 'exp-2',
          role: 'Campus Tuckshop & Inventory Volunteer',
          company: 'UNAM Student SRC Committee',
          location: 'Windhoek, Namibia',
          startDate: 'Mar 2025',
          endDate: 'Oct 2025',
          current: false,
          highlights: [
            'Conducted weekly stock counts and recorded supplier deliveries using Microsoft Excel.',
          ],
        },
      ],
      education: [
        {
          id: 'edu-1',
          qualification: 'Bachelor of Accounting (In Progress — Year 2)',
          institution: 'University of Namibia (UNAM)',
          location: 'Windhoek, Namibia',
          yearCompleted: '2024 – Present',
          details: 'Relevant modules: Financial Accounting, Business Ethics, Computer Literacy.',
        },
        {
          id: 'edu-2',
          qualification: 'NSSCO / Grade 12 Certificate',
          institution: 'Kuisebmond Secondary School',
          location: 'Walvis Bay, Namibia',
          yearCompleted: '2023',
          details: 'Passed with 32 points including English, Mathematics, and Accounting.',
        },
      ],
      skills: [
        'Point of Sale (POS)',
        'Cash Handling & Reconciliation',
        'Customer Service',
        'Stock Taking & Merchandising',
        'Microsoft Excel',
        'Punctual & Shift Flexible',
      ],
      languages: ['English (Fluent)', 'Oshiwambo (Fluent)', 'Afrikaans (Conversational)'],
      references: [
        {
          id: 'ref-1',
          name: 'Mr. Petrus Nghidinwa',
          title: 'Store Supervisor',
          organization: 'Coastal Fresh Mart, Walvis Bay',
          contact: '+264 81 290 5510',
        },
      ],
      createdAt: nowIso(),
      updatedAt: nowIso(),
    }),
  },
  {
    id: 'mining-technical',
    label: 'Mining, Logistics & Trades Template',
    subtitle: 'Tailored for Epangelo, Osino, Namport, construction & technical vacancies',
    create: () => ({
      id: `cv_${Date.now()}`,
      documentTitle: 'Technical_Trades_Mining_CV_2026',
      template: 'modern-coastal',
      accentColor: 'navy',
      fullName: 'Johannes Tangeni Amupadhi',
      headline: 'Certified Diesel & Plant Maintenance Technician | Code C1',
      email: 'johannes.amupadhi@example.na',
      phone: '+264 81 735 9042',
      location: 'Swakopmund, Erongo Region, Namibia',
      citizenship: 'Namibian Citizen',
      driversLicense: 'Code C1 + Valid PDP',
      availability: '30 Days Notice (Shift & Camp Roster Ready)',
      linkedinOrPortfolio: '',
      summary:
        'Safety-focused Namibian trade-tested technician with 6 years maintaining heavy haul fleet, port cranes, and mine site dewatering pumps across Erongo and Otjozondjupa. Zero LTI safety record and proven preventive maintenance turnaround.',
      experiences: [
        {
          id: 'exp-1',
          role: 'Heavy Plant & Fleet Technician',
          company: 'Erongo Earthworks & Transport',
          location: 'Walvis Bay, Namibia',
          startDate: 'Feb 2022',
          endDate: 'Present',
          current: true,
          highlights: [
            'Executed scheduled 250-hour and 1,000-hour servicing on Caterpillar graders, excavators, and tipper trucks.',
            'Diagnosed hydraulic pressure faults and electrical harnesses, reducing unscheduled downtime by 22%.',
            'Led daily pre-task risk assessments (PTRA) and strict lockout-tagout compliance.',
          ],
        },
        {
          id: 'exp-2',
          role: 'Apprentice Millwright & Fitter',
          company: 'Karibib Industrial Workshop',
          location: 'Karibib, Namibia',
          startDate: 'Jan 2019',
          endDate: 'Jan 2022',
          current: false,
          highlights: [
            'Overhauled centrifugal slurry pumps, conveyor gearboxes, and welded structural steel frames.',
          ],
        },
      ],
      education: [
        {
          id: 'edu-1',
          qualification: 'National Vocational Certificate Level 4 — Diesel Mechanics',
          institution: 'Namibia Institute of Mining & Technology (NIMT)',
          location: 'Arandis, Namibia',
          yearCompleted: '2018',
          details: 'NTA Trade Test Certified; First Aid Level 2 & Working at Heights.',
        },
      ],
      skills: [
        'Heavy Diesel Diagnostics',
        'Hydraulic Systems',
        'Preventive Maintenance',
        'Lockout-Tagout & HSE',
        'ARC & MIG Welding',
        'Root-Cause Inspection',
      ],
      languages: ['English (Fluent)', 'Oshiwambo (Fluent)', 'Afrikaans (Fluent)'],
      references: [
        {
          id: 'ref-1',
          name: 'Eng. Hendrik van Wyk',
          title: 'Workshop Manager',
          organization: 'Erongo Earthworks & Transport',
          contact: '+264 64 209 418',
        },
      ],
      createdAt: nowIso(),
      updatedAt: nowIso(),
    }),
  },
  {
    id: 'sadc-professional',
    label: 'Corporate & SADC Regional Template',
    subtitle: 'Built for SADC Secretariat, UNDP, AfDB, public sector & corporate applications',
    create: () => ({
      id: `cv_${Date.now()}`,
      documentTitle: 'SADC_Regional_Professional_CV_2026',
      template: 'classic-executive',
      accentColor: 'slate',
      fullName: 'Ndapewa Helena Katjivena',
      headline: 'Public Finance & Regional Policy Specialist | MSc Economics',
      email: 'ndapewa.katjivena@example.na',
      phone: '+264 81 612 3380',
      location: 'Windhoek, Khomas Region, Namibia',
      citizenship: 'Namibian Citizen (SADC Passport Holder)',
      driversLicense: 'Code B (Clean Record)',
      availability: 'Available for Gaborone, Windhoek & SADC Regional Relocation',
      linkedinOrPortfolio: 'https://linkedin.com/in/example-profile',
      summary:
        'Namibian economist and donor-program finance specialist with 7+ years managing multi-currency budgets, IPSAS/IFRS audit readiness, and regional cross-border trade reporting across SADC member states.',
      experiences: [
        {
          id: 'exp-1',
          role: 'Senior Programme Finance & Grants Officer',
          company: 'Southern Africa Development Trust',
          location: 'Windhoek, Namibia',
          startDate: 'Apr 2022',
          endDate: 'Present',
          current: true,
          highlights: [
            'Managed annual grant portfolios totaling USD 4.2M across Namibia, Botswana, and Zambia with unqualified external audits.',
            'Prepared quarterly donor variance reports, treasury cashflow forecasts, and procurement compliance reviews.',
          ],
        },
        {
          id: 'exp-2',
          role: 'Budget & Economic Policy Analyst',
          company: 'Namibia Public Policy Institute',
          location: 'Windhoek, Namibia',
          startDate: 'Jan 2019',
          endDate: 'Mar 2022',
          current: false,
          highlights: [
            'Authored macroeconomic policy briefs on SACU revenue sharing and green hydrogen corridor investments.',
          ],
        },
      ],
      education: [
        {
          id: 'edu-1',
          qualification: 'Master of Science in Development Economics',
          institution: 'University of Cape Town (UCT)',
          location: 'Cape Town, South Africa',
          yearCompleted: '2018',
          details: 'Thesis on SADC Intra-Regional Value Chains and Customs Integration.',
        },
        {
          id: 'edu-2',
          qualification: 'Bachelor of Economics (Honours)',
          institution: 'Namibia University of Science & Technology (NUST)',
          location: 'Windhoek, Namibia',
          yearCompleted: '2016',
          details: 'Graduated Cum Laude.',
        },
      ],
      skills: [
        'Grant & Donor Financial Management',
        'IPSAS & IFRS Compliance',
        'SADC Policy Analysis',
        'Treasury & Cashflow Modeling',
        'Microsoft Excel (Advanced)',
        'Stakeholder & Ministry Liaison',
      ],
      languages: ['English (Fluent)', 'Otjiherero (Fluent)', 'Afrikaans (Conversational)'],
      references: [
        {
          id: 'ref-1',
          name: 'Dr. Martha Shikongo',
          title: 'Director of Programmes',
          organization: 'Southern Africa Development Trust',
          contact: 'm.shikongo@example.na',
        },
      ],
      createdAt: nowIso(),
      updatedAt: nowIso(),
    }),
  },
  {
    id: 'blank',
    label: 'Start from Blank CV',
    subtitle: 'Clean empty CV document ready for your own details',
    create: () => ({
      id: `cv_${Date.now()}`,
      documentTitle: 'My_CV_2026',
      template: 'modern-coastal',
      accentColor: 'navy',
      fullName: '',
      headline: '',
      email: '',
      phone: '+264 ',
      location: 'Walvis Bay, Namibia',
      citizenship: 'Namibian Citizen',
      driversLicense: '',
      availability: 'Immediate',
      linkedinOrPortfolio: '',
      summary: '',
      experiences: [
        {
          id: `exp_${Date.now()}`,
          role: '',
          company: '',
          location: '',
          startDate: '',
          endDate: '',
          current: false,
          highlights: [''],
        },
      ],
      education: [
        {
          id: `edu_${Date.now()}`,
          qualification: '',
          institution: '',
          location: '',
          yearCompleted: '',
          details: '',
        },
      ],
      skills: [],
      languages: ['English (Fluent)'],
      references: [
        {
          id: `ref_${Date.now()}`,
          name: '',
          title: '',
          organization: '',
          contact: '',
        },
      ],
      createdAt: nowIso(),
      updatedAt: nowIso(),
    }),
  },
];
