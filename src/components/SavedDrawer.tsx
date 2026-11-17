import { Bookmark, Trash2, X } from 'lucide-react';
import { Property } from '../types/rental';
import { formatCurrency } from '../utils/format';

interface SavedDrawerProps {
  isOpen: boolean;
  savedProperties: Property[];
  onClose: () => void;
  onRemoveSaved: (id: string) => void;
  onSelectProperty: (property: Property) => void;
}

export function SavedDrawer({
  isOpen,
  savedProperties,
  onClose,
  onRemoveSaved,
  onSelectProperty,
}: SavedDrawerProps) {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Saved properties"
      className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm"
    >
      <div className="flex h-full w-full max-w-md flex-col border-l border-white/15 bg-[#0F172A] shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 bg-[#111A2E] px-5 py-4">
          <div className="flex items-center gap-2">
            <Bookmark className="size-4 text-blue-400" />
            <h2 className="font-display text-base font-semibold text-[#EEF3FB]">
              Saved Properties ({savedProperties.length})
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close saved properties drawer"
            className="inline-flex size-8 items-center justify-center rounded-lg border border-white/10 bg-[#0B1120] text-[#C2CEE3] hover:text-white cursor-pointer"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {savedProperties.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-[#111A2E] p-8 text-center">
              <p className="text-sm font-semibold text-[#EEF3FB]">No saved properties yet</p>
              <p className="mt-1 text-xs text-[#9FB1CF]">
                Bookmark any apartment, studio flat, or villa to compare rates and availability
                here.
              </p>
            </div>
          ) : (
            savedProperties.map((prop) => (
              <div
                key={prop.id}
                className="flex gap-3 rounded-xl border border-white/10 bg-[#111A2E] p-3"
              >
                <img
                  src={prop.image}
                  alt={prop.title}
                  referrerPolicy="no-referrer"
                  className="size-20 rounded-lg object-cover shrink-0"
                />
                <div className="min-w-0 flex-1 flex flex-col justify-between">
                  <div>
                    <p className="text-[11px] text-[#9FB1CF] truncate">
                      {prop.city}, {prop.country} · {prop.bedrooms} Beds
                    </p>
                    <h3 className="font-display truncate text-sm font-semibold text-[#EEF3FB]">
                      {prop.title}
                    </h3>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-1">
                    <span className="font-mono-tabular text-xs font-semibold text-emerald-300">
                      {formatCurrency(prop.pricePerNight, prop.currency)}/night
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => onRemoveSaved(prop.id)}
                        aria-label={`Remove ${prop.title}`}
                        className="inline-flex size-7 items-center justify-center rounded-md border border-white/10 text-[#9FB1CF] hover:text-rose-300 cursor-pointer"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onSelectProperty(prop);
                        }}
                        className="rounded-md bg-blue-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-blue-500 cursor-pointer"
                      >
                        Book
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
