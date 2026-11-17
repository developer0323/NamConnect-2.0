import { Briefcase, Building2, CalendarCheck2, Mail, Printer, Star, XCircle } from 'lucide-react';
import { useState } from 'react';
import { Booking, JobApplication, PropertyReview } from '../types/rental';
import { formatCurrency, formatReadableDate } from '../utils/format';

interface MyBookingsViewProps {
  bookings: Booking[];
  applications: JobApplication[];
  reviews: PropertyReview[];
  onCancelBooking: (bookingId: string) => Promise<void>;
  onOpenReview: (booking: Booking) => void;
  onBackToRentals: () => void;
  onBackToJobs: () => void;
}

export function MyBookingsView({
  bookings,
  applications,
  reviews,
  onCancelBooking,
  onOpenReview,
  onBackToRentals,
  onBackToJobs,
}: MyBookingsViewProps) {
  const [activeTab, setActiveTab] = useState<'bookings' | 'applications'>('bookings');
  const [expandedEmailId, setExpandedEmailId] = useState<string | null>(null);
  const [expandedAppEmailId, setExpandedAppEmailId] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  async function handleCancel(id: string) {
    setCancellingId(id);
    try {
      await onCancelBooking(id);
    } finally {
      setCancellingId(null);
    }
  }

  return (
    <section className="mx-auto max-w-5xl px-4 py-10 md:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <p className="text-xs font-semibold text-blue-400">
            Namibia &amp; SADC · Reservations, Receipts, Reviews &amp; Job Applications
          </p>
          <h1 className="font-display mt-1 text-2xl font-bold text-[#EEF3FB] md:text-3xl">
            My Activity
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onBackToRentals}
            className="rounded-lg border border-white/15 bg-[#111A2E] px-4 py-2 text-xs font-semibold text-[#EEF3FB] hover:bg-[#192540] cursor-pointer"
          >
            Browse Rentals
          </button>
          <button
            type="button"
            onClick={onBackToJobs}
            className="rounded-lg border border-white/15 bg-[#111A2E] px-4 py-2 text-xs font-semibold text-[#EEF3FB] hover:bg-[#192540] cursor-pointer"
          >
            Browse Jobs
          </button>
        </div>
      </div>

      {/* Sub-tab switcher */}
      <div className="mt-6 inline-grid grid-cols-2 gap-1 rounded-xl border border-white/10 bg-[#111A2E] p-1">
        <button
          type="button"
          onClick={() => setActiveTab('bookings')}
          className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition-colors cursor-pointer ${
            activeTab === 'bookings'
              ? 'bg-emerald-600 text-white'
              : 'text-[#9FB1CF] hover:text-white'
          }`}
        >
          <Building2 className="size-3.5" />
          Rental Bookings ({bookings.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('applications')}
          className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition-colors cursor-pointer ${
            activeTab === 'applications'
              ? 'bg-blue-600 text-white'
              : 'text-[#9FB1CF] hover:text-white'
          }`}
        >
          <Briefcase className="size-3.5" />
          Job Applications ({applications.length})
        </button>
      </div>

      {activeTab === 'bookings' ? (
        bookings.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-white/10 bg-[#111A2E] p-10 text-center">
            <CalendarCheck2 className="mx-auto size-10 text-[#66799B]" />
            <h2 className="font-display mt-3 text-lg font-semibold text-[#EEF3FB]">
              No bookings yet
            </h2>
            <p className="mx-auto mt-1.5 max-w-md text-sm text-[#9FB1CF]">
              Select any apartment, studio flat, house, or villa across Namibia and SADC to choose
              your dates and complete a reservation.
            </p>
            <button
              type="button"
              onClick={onBackToRentals}
              className="mt-5 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-500 cursor-pointer"
            >
              Explore Available Stays
            </button>
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            {bookings.map((booking) => {
              const isEmailOpen = expandedEmailId === booking.id;
              const isConfirmed = booking.status === 'confirmed';
              const submittedReview = reviews.find((r) => r.bookingId === booking.id);

              return (
                <article
                  key={booking.id}
                  className="overflow-hidden rounded-2xl border border-white/10 bg-[#111A2E]"
                >
                  <div className="grid gap-4 p-5 md:grid-cols-12 md:items-center">
                    <div className="md:col-span-3 aspect-[4/3] overflow-hidden rounded-xl bg-[#18243E]">
                      <img
                        src={booking.propertyImage}
                        alt={booking.propertyTitle}
                        referrerPolicy="no-referrer"
                        className="h-full w-full object-cover"
                      />
                    </div>

                    <div className="md:col-span-6 space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <span
                          className={`font-semibold ${
                            isConfirmed ? 'text-emerald-300' : 'text-rose-300'
                          }`}
                        >
                          {isConfirmed ? 'Confirmed' : 'Cancelled'}
                        </span>
                        <span className="text-[#66799B]" aria-hidden="true">
                          ·
                        </span>
                        <span className="font-mono-tabular text-[#C2CEE3]">
                          {booking.confirmationCode}
                        </span>
                        <span className="text-[#66799B]" aria-hidden="true">
                          ·
                        </span>
                        <span className="text-[#9FB1CF]">{booking.propertyLocation}</span>
                      </div>

                      <h3 className="font-display text-lg font-semibold text-[#EEF3FB]">
                        {booking.propertyTitle}
                      </h3>

                      <p className="font-mono-tabular text-xs text-[#C2CEE3]">
                        {formatReadableDate(booking.checkIn)} – {formatReadableDate(booking.checkOut)}{' '}
                        ({booking.nights} nights · {booking.guests} guests)
                      </p>

                      <p className="text-xs text-[#9FB1CF]">
                        Guest: {booking.guestName} · {booking.guestEmail} · Paid via{' '}
                        {booking.paymentSummary}
                      </p>

                      {submittedReview && (
                        <div className="mt-2 rounded-xl border border-amber-400/25 bg-[#0B1120]/70 p-3 space-y-1">
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-0.5">
                              {[1, 2, 3, 4, 5].map((i) => (
                                <Star
                                  key={i}
                                  className={`size-3.5 ${
                                    i <= submittedReview.rating
                                      ? 'fill-amber-400 text-amber-400'
                                      : 'text-[#4B5D7C]'
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-xs font-semibold text-[#EEF3FB]">
                              {submittedReview.title}
                            </span>
                          </div>
                          <p className="text-xs text-[#B4C3DC]">{submittedReview.comment}</p>
                        </div>
                      )}
                    </div>

                    <div className="md:col-span-3 flex flex-col items-start md:items-end justify-between gap-3">
                      <div className="md:text-right">
                        <p className="text-xs text-[#8EA2C4]">Total Paid</p>
                        <p className="font-mono-tabular text-xl font-bold text-[#EEF3FB]">
                          {formatCurrency(booking.totalAmount, booking.currency ?? 'NAD')}
                        </p>
                      </div>

                      <div className="flex flex-wrap md:justify-end gap-2">
                        {isConfirmed && !submittedReview && (
                          <button
                            type="button"
                            onClick={() => onOpenReview(booking)}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-500 cursor-pointer"
                          >
                            <Star className="size-3.5" />
                            Write a Review
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() =>
                            setExpandedEmailId(isEmailOpen ? null : booking.id)
                          }
                          className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-[#0B1120] px-3 py-1.5 text-xs font-semibold text-[#EEF3FB] hover:bg-[#16233F] cursor-pointer"
                        >
                          <Mail className="size-3.5 text-blue-400" />
                          {isEmailOpen ? 'Hide Email' : 'Email Receipt'}
                        </button>

                        {isConfirmed && (
                          <button
                            type="button"
                            disabled={cancellingId === booking.id}
                            onClick={() => handleCancel(booking.id)}
                            className="inline-flex items-center gap-1 rounded-lg border border-rose-500/30 px-3 py-1.5 text-xs font-semibold text-rose-300 hover:bg-rose-950/40 disabled:opacity-50 cursor-pointer"
                          >
                            <XCircle className="size-3.5" />
                            {cancellingId === booking.id ? 'Cancelling...' : 'Cancel'}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {isEmailOpen && (
                    <div className="border-t border-white/10 bg-[#0B1120]/80 p-5">
                      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-white/10 text-xs text-[#9FB1CF]">
                        <div>
                          <span className="font-semibold text-[#EEF3FB]">Subject:</span>{' '}
                          {booking.emailNotification.subject}
                        </div>
                        <button
                          type="button"
                          onClick={() => window.print()}
                          className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 cursor-pointer"
                        >
                          <Printer className="size-3.5" />
                          Print
                        </button>
                      </div>
                      <pre className="mt-3 whitespace-pre-wrap font-sans text-xs leading-relaxed text-[#C2CEE3]">
                        {booking.emailNotification.bodyText}
                      </pre>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )
      ) : applications.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-white/10 bg-[#111A2E] p-10 text-center">
          <Briefcase className="mx-auto size-10 text-[#66799B]" />
          <h2 className="font-display mt-3 text-lg font-semibold text-[#EEF3FB]">
            No job applications yet
          </h2>
          <p className="mx-auto mt-1.5 max-w-md text-sm text-[#9FB1CF]">
            Explore maritime, mining, engineering, finance, and remote vacancies across Namibia and
            the SADC region to submit an application.
          </p>
          <button
            type="button"
            onClick={onBackToJobs}
            className="mt-5 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-500 cursor-pointer"
          >
            Browse SADC Jobs
          </button>
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {applications.map((app) => {
            const isEmailOpen = expandedAppEmailId === app.id;
            return (
              <article
                key={app.id}
                className="overflow-hidden rounded-2xl border border-white/10 bg-[#111A2E]"
              >
                <div className="flex flex-wrap items-start justify-between gap-4 p-5">
                  <div className="space-y-1.5 min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="font-semibold text-blue-300">Submitted</span>
                      <span className="text-[#66799B]" aria-hidden="true">
                        ·
                      </span>
                      <span className="font-mono-tabular text-[#C2CEE3]">{app.referenceCode}</span>
                      <span className="text-[#66799B]" aria-hidden="true">
                        ·
                      </span>
                      <span className="text-[#9FB1CF]">{app.jobLocation}</span>
                    </div>

                    <h3 className="font-display text-lg font-semibold text-[#EEF3FB]">
                      {app.jobTitle}
                    </h3>

                    <p className="text-xs text-[#C2CEE3]">
                      {app.company} · CV: <span className="font-mono-tabular">{app.cvFileName}</span>
                    </p>

                    <p className="text-xs text-[#9FB1CF]">
                      Applicant: {app.applicantName} ({app.applicantEmail}) · Submitted{' '}
                      {formatReadableDate(app.createdAt.split('T')[0])}
                    </p>

                    <p className="mt-2 rounded-xl border border-white/10 bg-[#0B1120]/70 p-3 text-xs leading-relaxed text-[#B4C3DC]">
                      {app.coverNote}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setExpandedAppEmailId(isEmailOpen ? null : app.id)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-[#0B1120] px-3 py-1.5 text-xs font-semibold text-[#EEF3FB] hover:bg-[#16233F] shrink-0 cursor-pointer"
                  >
                    <Mail className="size-3.5 text-blue-400" />
                    {isEmailOpen ? 'Hide Receipt' : 'Confirmation Email'}
                  </button>
                </div>

                {isEmailOpen && (
                  <div className="border-t border-white/10 bg-[#0B1120]/80 p-5">
                    <p className="pb-3 border-b border-white/10 text-xs text-[#9FB1CF]">
                      <span className="font-semibold text-[#EEF3FB]">Subject:</span>{' '}
                      {app.emailConfirmationSubject}
                    </p>
                    <pre className="mt-3 whitespace-pre-wrap font-sans text-xs leading-relaxed text-[#C2CEE3]">
                      {app.emailConfirmationBody}
                    </pre>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
