import { Bookmark, Building2, ExternalLink, Star } from 'lucide-react';
import { useState } from 'react';
import { Property } from '../types/rental';
import { formatCurrency } from '../utils/format';

interface PropertyCardProps {
  property: Property;
  isSaved: boolean;
  isHighlighted?: boolean;
  onToggleSave: (id: string) => void;
  onSelect: (property: Property) => void;
  onHover?: (id: string | null) => void;
}

export function PropertyCard({
  property,
  isSaved,
  isHighlighted = false,
  onToggleSave,
  onSelect,
  onHover,
}: PropertyCardProps) {
  const [imgError, setImgError] = useState(false);

  const bedroomLabel =
    property.bedrooms === 0
      ? 'Studio'
      : `${property.bedrooms} ${property.bedrooms === 1 ? 'Bed' : 'Beds'}`;
  const bathroomLabel = `${property.bathrooms} ${property.bathrooms === 1 ? 'Bath' : 'Baths'}`;
  const topAmenities = property.amenities.slice(0, 4).join(' · ');

  return (
    <article
      onMouseEnter={() => onHover?.(property.id)}
      onMouseLeave={() => onHover?.(null)}
      className={`group flex flex-col overflow-hidden rounded-2xl border bg-[#111A2E] transition-all duration-200 hover:-translate-y-0.5 ${
        isHighlighted
          ? 'border-blue-400 ring-1 ring-blue-400/50'
          : 'border-white/10 hover:border-white/25'
      }`}
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#18243E]">
        {!imgError ? (
          <img
            src={property.image}
            alt={`${property.title} in ${property.neighborhood}, ${property.city}`}
            referrerPolicy="no-referrer"
            onError={() => setImgError(true)}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03] cursor-pointer"
            onClick={() => onSelect(property)}
          />
        ) : (
          <div
            onClick={() => onSelect(property)}
            className="flex h-full w-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-[#16233F] to-[#0D1528] p-4 text-center cursor-pointer"
          >
            <Building2 className="size-8 text-blue-400/80" />
            <span className="font-display text-sm font-medium text-[#C2CEE3]">
              {property.title}
            </span>
          </div>
        )}

        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#0B1120]/85 via-[#0B1120]/30 to-transparent"
          aria-hidden="true"
        />

        <button
          type="button"
          aria-label={isSaved ? `Remove ${property.title} from saved` : `Save ${property.title}`}
          aria-pressed={isSaved}
          onClick={(e) => {
            e.stopPropagation();
            onToggleSave(property.id);
          }}
          className={`absolute top-3 right-3 inline-flex size-9 items-center justify-center rounded-lg border transition-colors cursor-pointer ${
            isSaved
              ? 'border-blue-400 bg-blue-600 text-white'
              : 'border-white/15 bg-[#0B1120]/75 text-[#EEF3FB] backdrop-blur-sm hover:bg-[#0B1120]'
          }`}
        >
          <Bookmark className={`size-4 ${isSaved ? 'fill-current' : ''}`} />
        </button>

        <div className="absolute bottom-3 left-3.5 right-3.5 flex items-baseline justify-between gap-2">
          <p className="font-mono-tabular text-base font-semibold text-white">
            {formatCurrency(property.pricePerNight, property.currency)}
            <span className="font-sans text-xs font-normal text-[#C2CEE3]"> / night</span>
          </p>
          <span className="font-mono-tabular text-xs text-[#C2CEE3]">
            {formatCurrency(property.monthlyRate, property.currency)}/mo
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col justify-between gap-3 p-4">
        <div>
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-medium text-[#8EA2C4] truncate">
              {property.propertyType} · {property.city}, {property.country} · {bedroomLabel} ·{' '}
              {bathroomLabel}
            </p>
            {(property.reviewCount ?? 0) > 0 && (
              <span className="font-mono-tabular inline-flex items-center gap-1 text-xs font-semibold text-amber-300 shrink-0">
                <Star className="size-3.5 fill-amber-400 text-amber-400" />
                {property.averageRating?.toFixed(1)}
                <span className="font-normal text-[#8EA2C4]">({property.reviewCount})</span>
              </span>
            )}
          </div>

          <h3 className="font-display mt-1.5 line-clamp-1 text-base font-semibold text-[#EEF3FB]">
            <button
              type="button"
              onClick={() => onSelect(property)}
              className="text-left hover:text-blue-300 transition-colors cursor-pointer"
            >
              {property.title}
            </button>
          </h3>

          <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-[#9FB1CF]">
            {property.description}
          </p>

          {(property.depositAmount !== undefined ||
            property.utilitiesNote ||
            property.contactPhone ||
            property.postedDate) && (
            <div className="mt-2.5 grid gap-1 rounded-xl border border-white/10 bg-[#0B1120] px-3 py-2 text-[11px] text-[#B4C3DC]">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-mono-tabular font-semibold text-emerald-300">
                  {formatCurrency(property.monthlyRate, property.currency)}/mo
                  {property.depositAmount !== undefined &&
                    ` · Dep ${formatCurrency(property.depositAmount, property.currency)}`}
                </span>
                {property.postedDate && (
                  <span className="font-mono-tabular text-[#8EA2C4]">
                    Posted {property.postedDate}
                  </span>
                )}
              </div>
              {property.utilitiesNote && (
                <p className="truncate text-[#9FB1CF]">{property.utilitiesNote}</p>
              )}
              {property.contactPhone && (
                <p className="font-mono-tabular text-[#C2CEE3]">
                  Contact: {property.contactPhone}
                </p>
              )}
            </div>
          )}
        </div>

        <div className="border-t border-white/10 pt-3 space-y-2">
          {(property.facebookGroupName || property.sourceName) && (
            <div className="flex items-center justify-between gap-2 text-[11px] text-[#7C8FB0]">
              <span className="truncate">
                Source: {property.facebookGroupName || property.sourceName}
              </span>
              {property.sourceUrl && (
                <a
                  href={property.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 whitespace-nowrap shrink-0"
                >
                  Original post
                  <ExternalLink className="size-3" />
                </a>
              )}
            </div>
          )}

          <div className="flex items-center justify-between gap-3">
            <span className="truncate text-xs text-[#9FB1CF]">{topAmenities}</span>
            <button
              type="button"
              onClick={() => onSelect(property)}
              className="rounded-lg bg-blue-600/90 px-3 py-1.5 text-xs font-semibold text-white whitespace-nowrap shrink-0 transition-colors hover:bg-blue-500 cursor-pointer"
            >
              View &amp; Book
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
