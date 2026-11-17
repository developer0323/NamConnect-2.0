import { ChevronDown, ChevronUp, ExternalLink, Info, PlusCircle, Users } from 'lucide-react';
import { useState } from 'react';
import { NAMIBIA_FACEBOOK_RENTAL_GROUPS } from '../data/facebookGroups';

interface FacebookGroupsHubProps {
  onOpenImportModal: (defaultGroupName?: string) => void;
  onFilterPostedSinceYesterday: () => void;
  isYesterdayFilterActive: boolean;
}

export function FacebookGroupsHub({
  onOpenImportModal,
  onFilterPostedSinceYesterday,
  isYesterdayFilterActive,
}: FacebookGroupsHubProps) {
  const [expanded, setExpanded] = useState(true);

  return (
    <section
      aria-label="Namibian Facebook Rental Groups monthly room directory"
      className="rounded-2xl border border-white/10 bg-[#111A2E] p-4 md:p-5"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex size-9 items-center justify-center rounded-xl border border-white/10 bg-[#0B1120] text-blue-400 shrink-0">
            <Users className="size-4" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-display text-base font-semibold text-[#EEF3FB]">
                Facebook Groups — Monthly Rooms in Namibia
              </h2>
              <span className="font-mono-tabular text-xs font-medium text-emerald-300">
                · {NAMIBIA_FACEBOOK_RENTAL_GROUPS.length} Namibian groups
              </span>
            </div>
            <p className="mt-0.5 text-xs text-[#9FB1CF]">
              Open any Namibian Facebook rental group directly to browse new monthly room posts
              since yesterday (16 Nov 2026+), or paste a post to extract rent, deposit, utilities
              &amp; phone into the app.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={onFilterPostedSinceYesterday}
            aria-pressed={isYesterdayFilterActive}
            className={`rounded-lg px-3 py-2 text-xs font-semibold whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
              isYesterdayFilterActive
                ? 'bg-emerald-600 text-white'
                : 'border border-white/15 bg-[#0B1120] text-[#C2CEE3] hover:border-white/30 hover:text-white'
            }`}
          >
            {isYesterdayFilterActive ? 'Showing: Since Yesterday' : 'Filter: Posted Since Yesterday'}
          </button>

          <button
            type="button"
            onClick={() => onOpenImportModal()}
            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white whitespace-nowrap shrink-0 transition-colors hover:bg-blue-500 cursor-pointer"
          >
            <PlusCircle className="size-3.5" />
            Import FB Room Post
          </button>

          <button
            type="button"
            onClick={() => setExpanded((prev) => !prev)}
            aria-expanded={expanded}
            className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-[#0B1120] px-2.5 py-2 text-xs font-medium text-[#9FB1CF] hover:text-white whitespace-nowrap shrink-0 cursor-pointer"
          >
            {expanded ? 'Hide Groups' : 'Show Groups'}
            {expanded ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="mt-4 space-y-3 border-t border-white/10 pt-4">
          <div className="flex items-start gap-2 rounded-xl border border-blue-400/20 bg-[#0B1120] px-3.5 py-2.5 text-xs text-[#B4C3DC]">
            <Info className="mt-0.5 size-4 text-blue-400 shrink-0" />
            <span>
              <strong className="text-[#EEF3FB]">Live access note:</strong> Facebook Group feeds sit
              behind Meta&apos;s login wall and cannot be automatically scraped without an
              authenticated session. To keep every listing 100% real (zero fabricated posts), open
              a group below in Facebook, copy any new monthly room post starting from yesterday, and
              paste it via <strong className="text-[#EEF3FB]">Import FB Room Post</strong> to add
              all details immediately.
            </span>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {NAMIBIA_FACEBOOK_RENTAL_GROUPS.map((group) => (
              <div
                key={group.id}
                className="flex flex-col justify-between gap-2.5 rounded-xl border border-white/10 bg-[#0B1120] p-3.5"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 text-[11px] text-[#8EA2C4]">
                    <span>
                      {group.cityFocus} · {group.region}
                    </span>
                    <span className="font-mono-tabular font-semibold text-emerald-300">
                      {group.typicalMonthlyRange}
                    </span>
                  </div>
                  <h3 className="font-display mt-1 text-sm font-semibold text-[#EEF3FB]">
                    {group.name}
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-[#9FB1CF]">{group.focusNote}</p>
                </div>

                <div className="flex items-center justify-between gap-2 border-t border-white/10 pt-2.5">
                  <button
                    type="button"
                    onClick={() => onOpenImportModal(group.name)}
                    className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 whitespace-nowrap cursor-pointer"
                  >
                    Paste post from group
                  </button>
                  <a
                    href={group.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-blue-400 hover:text-blue-300 whitespace-nowrap"
                  >
                    Open Group
                    <ExternalLink className="size-3" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
