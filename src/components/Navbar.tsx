export type NavSection = 'rentals' | 'jobs' | 'cv-maker' | 'map' | 'bookings';

interface NavbarProps {
  activeSection: NavSection;
  bookingsCount: number;
  onNavigate: (section: NavSection) => void;
  onOpenPostModal: () => void;
}

export function Navbar({
  activeSection,
  bookingsCount,
  onNavigate,
  onOpenPostModal,
}: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0B1120]/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-8 px-4 py-3.5 md:px-6">
        <button
          type="button"
          onClick={() => onNavigate('rentals')}
          className="font-display text-lg font-bold tracking-tight text-[#EEF3FB] whitespace-nowrap shrink-0 transition-opacity hover:opacity-85 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-400"
        >
          OpportunityHub SADC
        </button>

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <button
            type="button"
            onClick={() => onNavigate('rentals')}
            className={`whitespace-nowrap shrink-0 pb-0.5 transition-colors cursor-pointer ${
              activeSection === 'rentals'
                ? 'text-[#EEF3FB] border-b border-emerald-400'
                : 'text-[#9FB1CF] hover:text-[#EEF3FB]'
            }`}
          >
            Rentals
          </button>
          <button
            type="button"
            onClick={() => onNavigate('jobs')}
            className={`whitespace-nowrap shrink-0 pb-0.5 transition-colors cursor-pointer ${
              activeSection === 'jobs'
                ? 'text-[#EEF3FB] border-b border-blue-400'
                : 'text-[#9FB1CF] hover:text-[#EEF3FB]'
            }`}
          >
            Jobs
          </button>
          <button
            type="button"
            onClick={() => onNavigate('cv-maker')}
            className={`whitespace-nowrap shrink-0 pb-0.5 transition-colors cursor-pointer ${
              activeSection === 'cv-maker'
                ? 'text-[#EEF3FB] border-b border-emerald-400'
                : 'text-[#9FB1CF] hover:text-[#EEF3FB]'
            }`}
          >
            CV Maker
          </button>
          <button
            type="button"
            onClick={() => onNavigate('map')}
            className={`whitespace-nowrap shrink-0 pb-0.5 transition-colors cursor-pointer ${
              activeSection === 'map'
                ? 'text-[#EEF3FB] border-b border-blue-400'
                : 'text-[#9FB1CF] hover:text-[#EEF3FB]'
            }`}
          >
            Map
          </button>
          <button
            type="button"
            onClick={() => onNavigate('bookings')}
            className={`whitespace-nowrap shrink-0 pb-0.5 transition-colors cursor-pointer ${
              activeSection === 'bookings'
                ? 'text-[#EEF3FB] border-b border-blue-400'
                : 'text-[#9FB1CF] hover:text-[#EEF3FB]'
            }`}
          >
            Bookings ({bookingsCount})
          </button>
        </nav>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onOpenPostModal}
            className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white whitespace-nowrap shrink-0 transition-colors hover:bg-blue-500 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400"
          >
            Post Listing
          </button>
        </div>
      </div>
    </header>
  );
}
