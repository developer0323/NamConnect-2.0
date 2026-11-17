import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  CreditCard,
  Landmark,
  Lock,
  Mail,
  MapPin,
  Printer,
  ShieldCheck,
  Star,
  UserCheck,
  X,
} from 'lucide-react';
import { FormEvent, useMemo, useState } from 'react';
import { Booking, PaymentMethodType, Property } from '../types/rental';
import {
  addDaysIso,
  datesOverlap,
  diffNights,
  formatCurrency,
  formatReadableDate,
  todayIso,
} from '../utils/format';

interface PropertyBookingModalProps {
  property: Property;
  initialCheckIn?: string;
  initialCheckOut?: string;
  eligibleBookingToReview?: Booking | null;
  onClose: () => void;
  onBookingCreated: (booking: Booking) => void;
  onGoToBookings: () => void;
  onOpenReview?: (booking: Booking) => void;
}

type BookingStep = 'dates' | 'guest' | 'payment' | 'confirmed';

export function PropertyBookingModal({
  property,
  initialCheckIn,
  initialCheckOut,
  eligibleBookingToReview,
  onClose,
  onBookingCreated,
  onGoToBookings,
  onOpenReview,
}: PropertyBookingModalProps) {
  const today = todayIso();
  const defaultIn = initialCheckIn || addDaysIso(today, 1);
  const defaultOut =
    initialCheckOut && initialCheckOut > defaultIn ? initialCheckOut : addDaysIso(defaultIn, 3);

  const [step, setStep] = useState<BookingStep>('dates');
  const [checkIn, setCheckIn] = useState(defaultIn);
  const [checkOut, setCheckOut] = useState(defaultOut);
  const [guests, setGuests] = useState(Math.min(2, property.maxGuests));

  // Guest info
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('+264 ');
  const [specialRequests, setSpecialRequests] = useState('');

  // Payment info
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>('card');
  const [cardholderName, setCardholderName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [eftBank, setEftBank] = useState('FNB Namibia');

  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);

  const nights = useMemo(() => diffNights(checkIn, checkOut), [checkIn, checkOut]);

  const dateConflict = useMemo(() => {
    if (!checkIn || !checkOut || nights < 1) return null;
    return (
      property.bookedRanges.find((r) => datesOverlap(checkIn, checkOut, r.checkIn, r.checkOut)) ??
      null
    );
  }, [checkIn, checkOut, nights, property.bookedRanges]);

  const subtotal = nights * property.pricePerNight;
  const serviceFee = Math.round(subtotal * 0.08);
  const totalAmount = subtotal + property.cleaningFee + serviceFee;

  function formatCardInput(raw: string): string {
    const digits = raw.replace(/\D/g, '').slice(0, 16);
    return digits.replace(/(.{4})/g, '$1 ').trim();
  }

  function formatExpiryInput(raw: string): string {
    const digits = raw.replace(/\D/g, '').slice(0, 4);
    if (digits.length >= 3) {
      return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    }
    return digits;
  }

  function handleContinueToGuest() {
    setError(null);
    if (nights < 1) {
      setError('Check-out must be at least 1 night after check-in.');
      return;
    }
    if (dateConflict) {
      setError(
        `Dates overlap with an existing reservation (${dateConflict.checkIn} to ${dateConflict.checkOut}). Please select different dates.`
      );
      return;
    }
    setStep('guest');
  }

  function handleContinueToPayment(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (guestName.trim().length < 2) {
      setError('Please enter your full name.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guestEmail.trim())) {
      setError('Please enter a valid email address so we can send your confirmation.');
      return;
    }
    if (guestPhone.trim().length < 7) {
      setError('Please enter a valid contact phone number.');
      return;
    }
    if (!cardholderName) {
      setCardholderName(guestName.trim());
    }
    setStep('payment');
  }

  async function handleSubmitPayment(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (paymentMethod === 'card') {
      const digits = cardNumber.replace(/\s+/g, '');
      if (digits.length < 12) {
        setError('Please enter a valid 16-digit card number.');
        return;
      }
      if (!/^\d{2}\/\d{2}$/.test(cardExpiry)) {
        setError('Please enter card expiry in MM/YY format.');
        return;
      }
      if (cardCvc.trim().length < 3) {
        setError('Please enter the 3- or 4-digit security CVC.');
        return;
      }
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyId: property.id,
          checkIn,
          checkOut,
          guests,
          guestName: guestName.trim(),
          guestEmail: guestEmail.trim(),
          guestPhone: guestPhone.trim(),
          specialRequests: specialRequests.trim(),
          paymentMethod,
          cardNumber: cardNumber.replace(/\s+/g, ''),
          eftBank,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Payment could not be completed. Please review your details.');
        return;
      }

      setConfirmedBooking(data.booking);
      onBookingCreated(data.booking);
      setStep('confirmed');
    } catch {
      setError('Network error while confirming your booking. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Book ${property.title}`}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-3 sm:p-6 backdrop-blur-sm overflow-y-auto"
    >
      <div className="relative my-auto w-full max-w-5xl overflow-hidden rounded-2xl border border-white/15 bg-[#0F172A] shadow-2xl max-h-[92vh] flex flex-col">
        {/* Top Modal Header */}
        <div className="flex items-center justify-between gap-4 border-b border-white/10 bg-[#111A2E] px-5 py-4 shrink-0">
          <div className="min-w-0">
            <p className="text-xs font-medium text-[#9FB1CF] truncate">
              {property.propertyType} · {property.neighborhood}, {property.city}, {property.country}
            </p>
            <h2 className="font-display truncate text-lg font-semibold text-[#EEF3FB]">
              {property.title}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close property booking modal"
            className="inline-flex size-9 items-center justify-center rounded-lg border border-white/10 bg-[#0B1120] text-[#C2CEE3] transition-colors hover:text-white cursor-pointer shrink-0"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto p-5 md:p-6">
          {step === 'confirmed' && confirmedBooking ? (
            /* Confirmation Screen & Email Notification View */
            <div className="mx-auto max-w-3xl space-y-6">
              <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/25 p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <CheckCircle2 className="mt-0.5 size-7 text-emerald-400 shrink-0" />
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-emerald-300">
                        Payment Successful · Reservation Confirmed
                      </p>
                      <h3 className="font-display mt-1 text-2xl font-bold text-[#EEF3FB]">
                        Booking Reference: {confirmedBooking.confirmationCode}
                      </h3>
                      <p className="mt-1 text-sm text-[#C2CEE3]">
                        We have locked your dates for {confirmedBooking.propertyTitle} and sent a
                        confirmation email to{' '}
                        <span className="font-semibold text-white">
                          {confirmedBooking.guestEmail}
                        </span>
                        .
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-[#0B1120] px-3 py-2 text-xs font-semibold text-[#EEF3FB] hover:bg-[#16233F] cursor-pointer"
                  >
                    <Printer className="size-3.5" />
                    Print Receipt
                  </button>
                </div>

                <div className="mt-5 grid gap-4 border-t border-white/10 pt-5 sm:grid-cols-4">
                  <div>
                    <p className="text-xs text-[#8EA2C4]">Check-in</p>
                    <p className="font-mono-tabular mt-1 text-sm font-semibold text-[#EEF3FB]">
                      {formatReadableDate(confirmedBooking.checkIn)}
                    </p>
                    <p className="text-xs text-[#9FB1CF]">From 14:00</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#8EA2C4]">Check-out</p>
                    <p className="font-mono-tabular mt-1 text-sm font-semibold text-[#EEF3FB]">
                      {formatReadableDate(confirmedBooking.checkOut)}
                    </p>
                    <p className="text-xs text-[#9FB1CF]">By 10:00</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#8EA2C4]">Payment Method</p>
                    <p className="mt-1 text-sm font-semibold text-[#EEF3FB]">
                      {confirmedBooking.paymentSummary}
                    </p>
                    <p className="font-mono-tabular text-xs text-[#9FB1CF]">
                      {confirmedBooking.transactionId}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-[#8EA2C4]">Total Paid</p>
                    <p className="font-mono-tabular mt-1 text-lg font-bold text-emerald-300">
                      {formatCurrency(
                        confirmedBooking.totalAmount,
                        confirmedBooking.currency ?? property.currency
                      )}
                    </p>
                    <p className="text-xs text-[#9FB1CF]">
                      {confirmedBooking.nights} nights · {confirmedBooking.guests} guests
                    </p>
                  </div>
                </div>
              </div>

              {/* Dispatched Email Notification Card */}
              <div className="rounded-2xl border border-white/12 bg-[#111A2E] overflow-hidden">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 bg-[#16233F] px-5 py-3">
                  <div className="flex items-center gap-2">
                    <Mail className="size-4 text-blue-400" />
                    <span className="text-xs font-semibold text-[#EEF3FB]">
                      Email Notification Dispatched
                    </span>
                  </div>
                  <span className="font-mono-tabular text-xs text-[#9FB1CF]">
                    Sent {new Date(confirmedBooking.emailNotification.sentAt).toLocaleTimeString()}
                  </span>
                </div>

                <div className="p-5 space-y-3 text-sm">
                  <div className="grid gap-1 text-xs text-[#9FB1CF] border-b border-white/10 pb-3">
                    <div>
                      <span className="font-semibold text-[#C2CEE3]">From:</span>{' '}
                      {confirmedBooking.emailNotification.from}
                    </div>
                    <div>
                      <span className="font-semibold text-[#C2CEE3]">To:</span>{' '}
                      {confirmedBooking.emailNotification.to}
                    </div>
                    <div>
                      <span className="font-semibold text-[#C2CEE3]">Subject:</span>{' '}
                      <span className="text-[#EEF3FB]">
                        {confirmedBooking.emailNotification.subject}
                      </span>
                    </div>
                  </div>
                  <pre className="whitespace-pre-wrap font-sans text-xs leading-relaxed text-[#C2CEE3]">
                    {confirmedBooking.emailNotification.bodyText}
                  </pre>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-xl border border-white/15 px-4 py-2.5 text-sm font-semibold text-[#C2CEE3] hover:text-white cursor-pointer"
                >
                  Continue Browsing
                </button>
                {onOpenReview && !confirmedBooking.reviewId && (
                  <button
                    type="button"
                    onClick={() => onOpenReview(confirmedBooking)}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-amber-400/35 bg-amber-500/15 px-4 py-2.5 text-sm font-semibold text-amber-200 hover:bg-amber-500/25 cursor-pointer"
                  >
                    <Star className="size-4 fill-amber-400 text-amber-400" />
                    Rate &amp; Review Stay
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onGoToBookings();
                  }}
                  className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-500 cursor-pointer"
                >
                  View in My Bookings
                </button>
              </div>
            </div>
          ) : (
            /* Two-Column Property Details + Contiguous Booking & Payment Module */
            <div className="grid gap-6 lg:grid-cols-12 lg:items-start">
              {/* Left Column: Property Info */}
              <div className="lg:col-span-7 space-y-5">
                <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#18243E] aspect-[16/10]">
                  <img
                    src={property.image}
                    alt={property.title}
                    referrerPolicy="no-referrer"
                    className="h-full w-full object-cover"
                  />
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-[#9FB1CF]">
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="size-3.5 text-blue-400" />
                      {property.address}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>{property.areaSqm} m²</span>
                    <span aria-hidden="true">·</span>
                    <span>Up to {property.maxGuests} guests</span>
                    {property.sourceName && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span>
                          Source:{' '}
                          {property.sourceUrl ? (
                            <a
                              href={property.sourceUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-400 underline hover:text-blue-300"
                            >
                              {property.sourceName}
                            </a>
                          ) : (
                            property.sourceName
                          )}
                        </span>
                      </>
                    )}
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-[#C2CEE3]">
                    {property.description}
                  </p>
                </div>

                {/* Monthly Rental & Lease Details */}
                <div className="rounded-xl border border-white/10 bg-[#111A2E] p-4 grid gap-3 sm:grid-cols-2">
                  <div>
                    <p className="text-[11px] font-medium text-[#8EA2C4]">Monthly Rent</p>
                    <p className="font-mono-tabular mt-0.5 text-base font-semibold text-emerald-300">
                      {formatCurrency(property.monthlyRate, property.currency)} / month
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] font-medium text-[#8EA2C4]">Deposit Required</p>
                    <p className="font-mono-tabular mt-0.5 text-sm font-semibold text-[#EEF3FB]">
                      {property.depositAmount !== undefined
                        ? property.depositAmount === 0
                          ? 'No deposit'
                          : formatCurrency(property.depositAmount, property.currency)
                        : 'Confirm with landlord'}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] font-medium text-[#8EA2C4]">Water &amp; Electricity</p>
                    <p className="mt-0.5 text-xs text-[#C2CEE3]">
                      {property.utilitiesNote ||
                        (property.amenities.includes('Prepaid electricity')
                          ? 'Prepaid electricity · Confirm water terms'
                          : 'Confirm water & electricity terms with host')}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] font-medium text-[#8EA2C4]">
                      Contact &amp; Post Date
                    </p>
                    <p className="font-mono-tabular mt-0.5 text-xs text-[#EEF3FB]">
                      {property.contactPhone || 'Message via booking form'}
                      {property.postedDate ? ` · Posted ${property.postedDate}` : ''}
                    </p>
                  </div>
                  {property.facebookGroupName && (
                    <div className="sm:col-span-2 border-t border-white/10 pt-2 text-xs text-[#9FB1CF] flex flex-wrap items-center justify-between gap-2">
                      <span>Facebook Group: {property.facebookGroupName}</span>
                      {property.sourceUrl && (
                        <a
                          href={property.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 underline hover:text-blue-300"
                        >
                          View Original Facebook Post
                        </a>
                      )}
                    </div>
                  )}
                </div>

                {/* Highlights */}
                <div className="border-t border-white/10 pt-4">
                  <h3 className="font-display text-sm font-semibold text-[#EEF3FB]">
                    Property Highlights
                  </h3>
                  <ul className="mt-2.5 space-y-1.5 text-sm text-[#B4C3DC]">
                    {property.highlights.map((item) => (
                      <li key={item} className="flex items-start gap-2">
                        <span className="mt-1.5 size-1.5 rounded-full bg-emerald-400 shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Amenities Grid */}
                <div className="border-t border-white/10 pt-4">
                  <h3 className="font-display text-sm font-semibold text-[#EEF3FB]">
                    Included Amenities
                  </h3>
                  <div className="mt-2.5 grid grid-cols-2 gap-2 sm:grid-cols-3 text-xs text-[#C2CEE3]">
                    {property.amenities.map((am) => (
                      <div
                        key={am}
                        className="rounded-lg border border-white/10 bg-[#111A2E] px-3 py-2 font-medium"
                      >
                        {am}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Existing Booked Dates */}
                <div className="border-t border-white/10 pt-4">
                  <h3 className="font-display text-sm font-semibold text-[#EEF3FB]">
                    Availability Calendar Notes
                  </h3>
                  {property.bookedRanges.length === 0 ? (
                    <p className="mt-1.5 text-xs text-emerald-300">
                      Open availability — no conflicting reservations on this property.
                    </p>
                  ) : (
                    <div className="mt-2 space-y-1 text-xs text-[#9FB1CF]">
                      <p>Unavailable (already reserved) date windows:</p>
                      {property.bookedRanges.map((r) => (
                        <p key={r.bookingId} className="font-mono-tabular text-amber-300">
                          · {formatReadableDate(r.checkIn)} to {formatReadableDate(r.checkOut)}
                        </p>
                      ))}
                    </div>
                  )}
                </div>

                {/* Verified Host */}
                <div className="flex items-center justify-between gap-4 rounded-xl border border-white/10 bg-[#111A2E] p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-full bg-blue-600/20 text-blue-300">
                      <UserCheck className="size-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#EEF3FB]">
                        Hosted by {property.host.name}
                      </p>
                      <p className="text-xs text-[#9FB1CF]">
                        {property.host.role} · Responds {property.host.responseTime.toLowerCase()}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-emerald-300">Verified Host</span>
                </div>

                {/* Guest Reviews & Ratings */}
                <div className="border-t border-white/10 pt-5 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h3 className="font-display text-base font-semibold text-[#EEF3FB]">
                        Guest Reviews
                      </h3>
                      {(property.reviewCount ?? 0) > 0 ? (
                        <p className="mt-0.5 flex items-center gap-1.5 text-xs text-[#C2CEE3]">
                          <Star className="size-3.5 fill-amber-400 text-amber-400" />
                          <span className="font-mono-tabular font-semibold text-[#EEF3FB]">
                            {property.averageRating?.toFixed(1)}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span className="font-mono-tabular">
                            {property.reviewCount} verified{' '}
                            {property.reviewCount === 1 ? 'review' : 'reviews'}
                          </span>
                        </p>
                      ) : (
                        <p className="mt-0.5 text-xs text-[#9FB1CF]">
                          No reviews yet for this property.
                        </p>
                      )}
                    </div>

                    {eligibleBookingToReview && onOpenReview && (
                      <button
                        type="button"
                        onClick={() => onOpenReview(eligibleBookingToReview)}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-blue-500 cursor-pointer"
                      >
                        <Star className="size-3.5" />
                        Write a Review
                      </button>
                    )}
                  </div>

                  {eligibleBookingToReview && (
                    <p className="text-xs text-emerald-300">
                      Verified booking {eligibleBookingToReview.confirmationCode} is eligible for
                      your star rating and written feedback.
                    </p>
                  )}

                  {(property.reviews?.length ?? 0) > 0 && (
                    <div className="space-y-3">
                      <div className="rounded-xl border border-white/10 bg-[#111A2E] p-3.5 space-y-1.5">
                        {[5, 4, 3, 2, 1].map((stars) => {
                          const total = property.reviews?.length ?? 0;
                          const count =
                            property.reviews?.filter((r) => r.rating === stars).length ?? 0;
                          const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                          return (
                            <div key={stars} className="flex items-center gap-2.5 text-xs">
                              <span className="font-mono-tabular w-8 text-[#9FB1CF]">{stars} ★</span>
                              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#0B1120]">
                                <div
                                  className="h-full rounded-full bg-amber-400"
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                              <span className="font-mono-tabular w-6 text-right text-[#8EA2C4]">
                                {count}
                              </span>
                            </div>
                          );
                        })}
                      </div>

                      {property.reviews?.map((rev) => (
                        <article
                          key={rev.id}
                          className="rounded-xl border border-white/10 bg-[#111A2E] p-4 space-y-2"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div>
                              <p className="text-sm font-semibold text-[#EEF3FB]">
                                {rev.guestName}
                              </p>
                              <p className="text-xs text-[#8EA2C4]">
                                Verified stay · {rev.stayDates}
                              </p>
                            </div>
                            <div
                              className="flex items-center gap-0.5"
                              aria-label={`${rev.rating} out of 5 stars`}
                            >
                              {[1, 2, 3, 4, 5].map((i) => (
                                <Star
                                  key={i}
                                  className={`size-3.5 ${
                                    i <= rev.rating
                                      ? 'fill-amber-400 text-amber-400'
                                      : 'text-[#4B5D7C]'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                          {rev.title && (
                            <h4 className="font-display text-sm font-semibold text-[#EEF3FB]">
                              {rev.title}
                            </h4>
                          )}
                          <p className="text-xs leading-relaxed text-[#C2CEE3]">{rev.comment}</p>
                        </article>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Contiguous Sticky Booking & Payment Module */}
              <div className="lg:col-span-5 lg:sticky lg:top-4 rounded-2xl border border-white/15 bg-[#111A2E] p-5 space-y-4">
                {/* Price & Step Indicator */}
                <div className="flex items-baseline justify-between border-b border-white/10 pb-3.5">
                  <div>
                    <span className="font-mono-tabular text-2xl font-bold text-[#EEF3FB]">
                      {formatCurrency(property.pricePerNight, property.currency)}
                    </span>
                    <span className="text-xs text-[#9FB1CF]"> / night</span>
                  </div>
                  <span className="font-mono-tabular text-xs text-[#9FB1CF]">
                    {step === 'dates' && 'Step 1 of 3 · Dates'}
                    {step === 'guest' && 'Step 2 of 3 · Details'}
                    {step === 'payment' && 'Step 3 of 3 · Payment'}
                  </span>
                </div>

                {error && (
                  <div
                    role="alert"
                    className="rounded-xl border border-rose-500/40 bg-rose-950/40 px-3.5 py-2.5 text-xs text-rose-200"
                  >
                    {error}
                  </div>
                )}

                {step === 'dates' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-2.5">
                      <label className="flex flex-col gap-1 rounded-xl border border-white/10 bg-[#0B1120] p-3">
                        <span className="flex items-center gap-1 text-[11px] font-semibold text-[#8EA2C4]">
                          <Calendar className="size-3 text-blue-400" />
                          Check-in
                        </span>
                        <input
                          type="date"
                          min={today}
                          value={checkIn}
                          onChange={(e) => {
                            const val = e.target.value;
                            setCheckIn(val);
                            if (checkOut <= val) {
                              setCheckOut(addDaysIso(val, 2));
                            }
                            setError(null);
                          }}
                          className="bg-transparent text-sm font-medium text-[#EEF3FB] outline-none [color-scheme:dark]"
                        />
                      </label>

                      <label className="flex flex-col gap-1 rounded-xl border border-white/10 bg-[#0B1120] p-3">
                        <span className="flex items-center gap-1 text-[11px] font-semibold text-[#8EA2C4]">
                          <Calendar className="size-3 text-blue-400" />
                          Check-out
                        </span>
                        <input
                          type="date"
                          min={addDaysIso(checkIn || today, 1)}
                          value={checkOut}
                          onChange={(e) => {
                            setCheckOut(e.target.value);
                            setError(null);
                          }}
                          className="bg-transparent text-sm font-medium text-[#EEF3FB] outline-none [color-scheme:dark]"
                        />
                      </label>
                    </div>

                    <label className="flex items-center justify-between rounded-xl border border-white/10 bg-[#0B1120] px-3.5 py-2.5">
                      <span className="text-xs font-medium text-[#C2CEE3]">
                        Guests (max {property.maxGuests})
                      </span>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => setGuests((g) => Math.max(1, g - 1))}
                          className="size-7 rounded-md border border-white/15 bg-[#111A2E] text-sm font-bold text-[#EEF3FB] hover:bg-[#1B2A4A] cursor-pointer"
                        >
                          -
                        </button>
                        <span className="font-mono-tabular w-4 text-center text-sm font-semibold">
                          {guests}
                        </span>
                        <button
                          type="button"
                          onClick={() => setGuests((g) => Math.min(property.maxGuests, g + 1))}
                          className="size-7 rounded-md border border-white/15 bg-[#111A2E] text-sm font-bold text-[#EEF3FB] hover:bg-[#1B2A4A] cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                    </label>

                    {nights > 0 && (
                      <div
                        className={`rounded-xl border px-3.5 py-2.5 text-xs ${
                          dateConflict
                            ? 'border-amber-500/40 bg-amber-950/30 text-amber-200'
                            : 'border-emerald-500/30 bg-emerald-950/25 text-emerald-200'
                        }`}
                      >
                        {dateConflict
                          ? `Unavailable: overlaps reserved stay (${dateConflict.checkIn} to ${dateConflict.checkOut}).`
                          : `Available for your ${nights}-night stay (${formatReadableDate(checkIn)} – ${formatReadableDate(checkOut)}).`}
                      </div>
                    )}

                    {/* Price Breakdown */}
                    {nights > 0 && (
                      <div className="space-y-2 border-t border-white/10 pt-3 text-sm">
                        <div className="flex justify-between text-[#B4C3DC]">
                          <span>
                            {formatCurrency(property.pricePerNight, property.currency)} × {nights}{' '}
                            {nights === 1 ? 'night' : 'nights'}
                          </span>
                          <span className="font-mono-tabular">
                            {formatCurrency(subtotal, property.currency)}
                          </span>
                        </div>
                        <div className="flex justify-between text-[#B4C3DC]">
                          <span>Cleaning &amp; linen fee</span>
                          <span className="font-mono-tabular">
                            {formatCurrency(property.cleaningFee, property.currency)}
                          </span>
                        </div>
                        <div className="flex justify-between text-[#B4C3DC]">
                          <span>Platform service fee (8%)</span>
                          <span className="font-mono-tabular">
                            {formatCurrency(serviceFee, property.currency)}
                          </span>
                        </div>
                        <div className="flex justify-between border-t border-white/10 pt-2.5 font-semibold text-[#EEF3FB]">
                          <span>Total ({property.currency ?? 'NAD'})</span>
                          <span className="font-mono-tabular text-base text-emerald-300">
                            {formatCurrency(totalAmount, property.currency)}
                          </span>
                        </div>
                      </div>
                    )}

                    <button
                      type="button"
                      disabled={nights < 1 || Boolean(dateConflict)}
                      onClick={handleContinueToGuest}
                      className="w-full rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-45 cursor-pointer"
                    >
                      Reserve &amp; Enter Guest Details
                    </button>
                  </div>
                )}

                {step === 'guest' && (
                  <form onSubmit={handleContinueToPayment} className="space-y-3.5">
                    <button
                      type="button"
                      onClick={() => {
                        setError(null);
                        setStep('dates');
                      }}
                      className="inline-flex items-center gap-1 text-xs font-medium text-[#9FB1CF] hover:text-white cursor-pointer"
                    >
                      <ArrowLeft className="size-3.5" />
                      Change dates ({nights} nights · {formatCurrency(totalAmount, property.currency)})
                    </button>

                    <label className="block space-y-1">
                      <span className="text-xs font-medium text-[#C2CEE3]">Guest Full Name</span>
                      <input
                        type="text"
                        required
                        value={guestName}
                        onChange={(e) => setGuestName(e.target.value)}
                        placeholder="e.g. Selma Nangolo"
                        className="w-full rounded-xl border border-white/10 bg-[#0B1120] px-3.5 py-2.5 text-sm text-[#EEF3FB] outline-none focus:border-blue-400"
                      />
                    </label>

                    <label className="block space-y-1">
                      <span className="text-xs font-medium text-[#C2CEE3]">
                        Email Address (Confirmation sent here)
                      </span>
                      <input
                        type="email"
                        required
                        value={guestEmail}
                        onChange={(e) => setGuestEmail(e.target.value)}
                        placeholder="selma@example.na"
                        className="w-full rounded-xl border border-white/10 bg-[#0B1120] px-3.5 py-2.5 text-sm text-[#EEF3FB] outline-none focus:border-blue-400"
                      />
                    </label>

                    <label className="block space-y-1">
                      <span className="text-xs font-medium text-[#C2CEE3]">Phone Number</span>
                      <input
                        type="tel"
                        required
                        value={guestPhone}
                        onChange={(e) => setGuestPhone(e.target.value)}
                        placeholder="+264 81 123 4567"
                        className="w-full rounded-xl border border-white/10 bg-[#0B1120] px-3.5 py-2.5 text-sm text-[#EEF3FB] outline-none focus:border-blue-400"
                      />
                    </label>

                    <label className="block space-y-1">
                      <span className="text-xs font-medium text-[#C2CEE3]">
                        Arrival Notes / Special Requests (Optional)
                      </span>
                      <textarea
                        rows={2}
                        value={specialRequests}
                        onChange={(e) => setSpecialRequests(e.target.value)}
                        placeholder="Estimated arrival time, pet details, or airport shuttle info..."
                        className="w-full rounded-xl border border-white/10 bg-[#0B1120] px-3.5 py-2 text-sm text-[#EEF3FB] outline-none focus:border-blue-400"
                      />
                    </label>

                    <button
                      type="submit"
                      className="w-full rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-500 cursor-pointer"
                    >
                      Continue to Secure Payment
                    </button>
                  </form>
                )}

                {step === 'payment' && (
                  <form onSubmit={handleSubmitPayment} className="space-y-4">
                    <button
                      type="button"
                      onClick={() => {
                        setError(null);
                        setStep('guest');
                      }}
                      className="inline-flex items-center gap-1 text-xs font-medium text-[#9FB1CF] hover:text-white cursor-pointer"
                    >
                      <ArrowLeft className="size-3.5" />
                      Back to guest details
                    </button>

                    <div className="rounded-xl border border-white/10 bg-[#0B1120] p-3 text-xs space-y-1">
                      <div className="flex justify-between text-[#9FB1CF]">
                        <span>
                          {formatReadableDate(checkIn)} – {formatReadableDate(checkOut)} ({nights}{' '}
                          nights)
                        </span>
                        <span className="font-mono-tabular font-semibold text-[#EEF3FB]">
                          {formatCurrency(totalAmount, property.currency)}
                        </span>
                      </div>
                      <p className="text-[#8EA2C4]">
                        Confirmation email will be sent to {guestEmail}
                      </p>
                    </div>

                    {/* Payment Method Selector */}
                    <div className="grid grid-cols-2 gap-2 rounded-xl bg-[#0B1120] p-1 border border-white/10">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('card')}
                        className={`inline-flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition-colors cursor-pointer ${
                          paymentMethod === 'card'
                            ? 'bg-blue-600 text-white'
                            : 'text-[#9FB1CF] hover:text-white'
                        }`}
                      >
                        <CreditCard className="size-3.5" />
                        Card Payment
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('eft')}
                        className={`inline-flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition-colors cursor-pointer ${
                          paymentMethod === 'eft'
                            ? 'bg-blue-600 text-white'
                            : 'text-[#9FB1CF] hover:text-white'
                        }`}
                      >
                        <Landmark className="size-3.5" />
                        SADC Instant EFT
                      </button>
                    </div>

                    {paymentMethod === 'card' ? (
                      <div className="space-y-3">
                        <label className="block space-y-1">
                          <span className="text-xs font-medium text-[#C2CEE3]">
                            Cardholder Name
                          </span>
                          <input
                            type="text"
                            required
                            value={cardholderName}
                            onChange={(e) => setCardholderName(e.target.value)}
                            placeholder="Name on card"
                            className="w-full rounded-xl border border-white/10 bg-[#0B1120] px-3.5 py-2.5 text-sm text-[#EEF3FB] outline-none focus:border-blue-400"
                          />
                        </label>

                        <label className="block space-y-1">
                          <span className="text-xs font-medium text-[#C2CEE3]">Card Number</span>
                          <input
                            type="text"
                            inputMode="numeric"
                            required
                            value={cardNumber}
                            onChange={(e) => setCardNumber(formatCardInput(e.target.value))}
                            placeholder="4242 4242 4242 4242"
                            className="font-mono-tabular w-full rounded-xl border border-white/10 bg-[#0B1120] px-3.5 py-2.5 text-sm text-[#EEF3FB] outline-none focus:border-blue-400"
                          />
                        </label>

                        <div className="grid grid-cols-2 gap-3">
                          <label className="block space-y-1">
                            <span className="text-xs font-medium text-[#C2CEE3]">
                              Expiry (MM/YY)
                            </span>
                            <input
                              type="text"
                              inputMode="numeric"
                              required
                              value={cardExpiry}
                              onChange={(e) => setCardExpiry(formatExpiryInput(e.target.value))}
                              placeholder="09/28"
                              className="font-mono-tabular w-full rounded-xl border border-white/10 bg-[#0B1120] px-3.5 py-2.5 text-sm text-[#EEF3FB] outline-none focus:border-blue-400"
                            />
                          </label>
                          <label className="block space-y-1">
                            <span className="text-xs font-medium text-[#C2CEE3]">CVC</span>
                            <input
                              type="password"
                              inputMode="numeric"
                              maxLength={4}
                              required
                              value={cardCvc}
                              onChange={(e) =>
                                setCardCvc(e.target.value.replace(/\D/g, '').slice(0, 4))
                              }
                              placeholder="123"
                              className="font-mono-tabular w-full rounded-xl border border-white/10 bg-[#0B1120] px-3.5 py-2.5 text-sm text-[#EEF3FB] outline-none focus:border-blue-400"
                            />
                          </label>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <label className="block space-y-1">
                          <span className="text-xs font-medium text-[#C2CEE3]">
                            Select Namibian Bank
                          </span>
                          <select
                            value={eftBank}
                            onChange={(e) => setEftBank(e.target.value)}
                            className="w-full rounded-xl border border-white/10 bg-[#0B1120] px-3.5 py-2.5 text-sm text-[#EEF3FB] outline-none cursor-pointer"
                          >
                            <option value="FNB Namibia">FNB Namibia (PayToday / EFT)</option>
                            <option value="Bank Windhoek">Bank Windhoek</option>
                            <option value="Standard Bank Namibia">Standard Bank Namibia</option>
                            <option value="Nedbank Namibia">Nedbank Namibia</option>
                          </select>
                        </label>
                        <p className="rounded-xl border border-white/10 bg-[#0B1120] p-3 text-xs leading-relaxed text-[#9FB1CF]">
                          Instant EFT verifies settlement immediately and locks your dates upon
                          confirmation.
                        </p>
                      </div>
                    )}

                    <div className="flex items-center gap-2 text-[11px] text-[#8EA2C4]">
                      <Lock className="size-3.5 text-emerald-400 shrink-0" />
                      <span>256-bit encrypted checkout · Protected SADC rental guarantee</span>
                    </div>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-sm font-semibold text-white transition-colors hover:bg-emerald-500 disabled:opacity-60 cursor-pointer"
                    >
                      <ShieldCheck className="size-4" />
                      {submitting
                        ? 'Processing Payment...'
                        : `Pay ${formatCurrency(totalAmount, property.currency)} & Confirm Booking`}
                    </button>
                  </form>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
