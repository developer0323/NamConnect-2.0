import { ExternalLink, PlusCircle, ShieldCheck } from 'lucide-react';
import { LISTING_SOURCES } from '../data/sources';

interface ListingSourcesSectionProps {
  onOpenPostModal: () => void;
  onFilterBySource: (sourceName: string, category: 'rentals' | 'jobs') => void;
}

export function ListingSourcesSection({
  onOpenPostModal,
  onFilterBySource,
}: ListingSourcesSectionProps) {
  return (
    <section className="border-t border-white/10 bg-[#0D1528]/80 py-10">
      <div className="mx-auto max-w-7xl px-4 md:px-6 space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-2xl">
            <h2 className="font-display text-lg font-semibold text-[#EEF3FB]">
              Where listings come from
            </h2>
            <p className="mt-1 text-xs leading-relaxed text-[#9FB1CF]">
              Every listing links back to its original post. Closed and expired listings are
              removed automatically.
            </p>
          </div>

          <button
            type="button"
            onClick={onOpenPostModal}
            className="inline-flex items-center gap-2 rounded-xl border border-emerald-400/35 bg-emerald-600/15 px-4 py-2.5 text-xs font-semibold text-emerald-200 transition-colors hover:bg-emerald-600/25 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <PlusCircle className="size-4 text-emerald-300" />
            Employers &amp; landlords: post free
          </button>
        </div>

        <div className="grid gap-2.5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {LISTING_SOURCES.map((src) => {
            const targetSection = src.category === 'Rentals & Rooms' ? 'rentals' : 'jobs';
            return (
              <div
                key={src.name}
                className="flex items-center justify-between gap-2 rounded-xl border border-white/10 bg-[#111A2E] px-3.5 py-2.5"
              >
                <button
                  type="button"
                  onClick={() => onFilterBySource(src.name.split('—')[0].trim(), targetSection)}
                  className="min-w-0 text-left text-xs font-medium text-[#EEF3FB] hover:text-blue-300 transition-colors truncate cursor-pointer"
                  title={`Filter listings from ${src.name}`}
                >
                  {src.name}
                </button>
                <a
                  href={src.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Visit ${src.name} original site`}
                  className="inline-flex size-6 items-center justify-center rounded-md text-[#8EA2C4] hover:bg-white/5 hover:text-white shrink-0"
                >
                  <ExternalLink className="size-3.5" />
                </a>
              </div>
            );
          })}
        </div>

        <p className="flex items-center gap-1.5 text-[11px] text-[#7C8FB0]">
          <ShieldCheck className="size-3.5 text-emerald-400 shrink-0" />
          Rooms are strictly filtered to Namibia; SADC regional jobs only include vacancies where
          Namibian citizens are eligible to apply.
        </p>
      </div>
    </section>
  );
}
