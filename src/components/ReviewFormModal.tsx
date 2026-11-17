import { Star, X } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { Booking, PropertyReview } from '../types/rental';
import { formatReadableDate } from '../utils/format';

interface ReviewFormModalProps {
  booking: Booking;
  onClose: () => void;
  onSubmitted: (result: { review: PropertyReview; booking: Booking }) => void;
}

const RATING_LABELS: Record<number, string> = {
  1: 'Poor',
  2: 'Fair',
  3: 'Good',
  4: 'Very good',
  5: 'Exceptional',
};

export function ReviewFormModal({
  booking,
  onClose,
  onSubmitted,
}: ReviewFormModalProps) {
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const displayedRating = hoverRating ?? rating;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (comment.trim().length < 10) {
      setError('Please share at least 10 characters of written feedback about your stay.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: booking.id,
          rating,
          title: title.trim(),
          comment: comment.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Could not submit your review.');
        return;
      }
      onSubmitted({ review: data.review, booking: data.booking });
      onClose();
    } catch {
      setError('Network error while submitting your review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Review ${booking.propertyTitle}`}
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
    >
      <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-white/15 bg-[#0F172A] shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 bg-[#111A2E] px-5 py-4">
          <div className="min-w-0">
            <p className="text-xs font-medium text-[#9FB1CF]">
              Verified Stay · {booking.confirmationCode}
            </p>
            <h2 className="font-display truncate text-base font-semibold text-[#EEF3FB]">
              Review {booking.propertyTitle}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close review modal"
            className="inline-flex size-8 items-center justify-center rounded-lg border border-white/10 bg-[#0B1120] text-[#C2CEE3] hover:text-white cursor-pointer shrink-0"
          >
            <X className="size-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="rounded-xl border border-white/10 bg-[#111A2E] px-3.5 py-2.5 text-xs text-[#9FB1CF]">
            Stay dates:{' '}
            <span className="font-mono-tabular text-[#EEF3FB]">
              {formatReadableDate(booking.checkIn)} – {formatReadableDate(booking.checkOut)}
            </span>{' '}
            · Guest: <span className="text-[#EEF3FB]">{booking.guestName}</span>
          </div>

          {error && (
            <div
              role="alert"
              className="rounded-xl border border-rose-500/40 bg-rose-950/40 px-3.5 py-2.5 text-xs text-rose-200"
            >
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[#C2CEE3]">Overall Star Rating</span>
              <span className="text-xs font-semibold text-amber-300">
                {displayedRating} / 5 · {RATING_LABELS[displayedRating]}
              </span>
            </div>
            <div
              role="radiogroup"
              aria-label="Star rating"
              className="flex items-center gap-2 rounded-xl border border-white/10 bg-[#0B1120] p-3"
            >
              {[1, 2, 3, 4, 5].map((star) => {
                const filled = star <= displayedRating;
                return (
                  <button
                    key={star}
                    type="button"
                    role="radio"
                    aria-checked={rating === star}
                    aria-label={`${star} star${star === 1 ? '' : 's'}`}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(null)}
                    onClick={() => setRating(star)}
                    className="rounded-lg p-1 transition-transform hover:scale-110 cursor-pointer focus-visible:outline-2 focus-visible:outline-blue-400"
                  >
                    <Star
                      className={`size-7 transition-colors ${
                        filled ? 'fill-amber-400 text-amber-400' : 'text-[#4B5D7C]'
                      }`}
                    />
                  </button>
                );
              })}
            </div>
          </div>

          <label className="block space-y-1">
            <span className="text-xs font-medium text-[#C2CEE3]">Review Headline (Optional)</span>
            <input
              type="text"
              maxLength={100}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Peaceful lagoon balcony and fast fiber Wi-Fi"
              className="w-full rounded-xl border border-white/10 bg-[#0B1120] px-3.5 py-2.5 text-sm text-[#EEF3FB] outline-none focus:border-blue-400"
            />
          </label>

          <label className="block space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[#C2CEE3]">Written Feedback</span>
              <span className="font-mono-tabular text-[11px] text-[#7C8FB0]">
                {comment.trim().length} chars
              </span>
            </div>
            <textarea
              required
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="How was cleanliness, check-in, Wi-Fi speed, parking, and the neighborhood?"
              className="w-full rounded-xl border border-white/10 bg-[#0B1120] px-3.5 py-2.5 text-sm text-[#EEF3FB] outline-none focus:border-blue-400"
            />
          </label>

          <div className="flex items-center justify-end gap-3 border-t border-white/10 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-white/15 px-4 py-2 text-sm font-semibold text-[#C2CEE3] hover:text-white cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-xl bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-60 cursor-pointer"
            >
              {submitting ? 'Publishing Review...' : 'Submit Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
