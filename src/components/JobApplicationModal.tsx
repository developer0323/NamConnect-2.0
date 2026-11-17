import {
  Briefcase,
  Building,
  Calendar,
  CheckCircle2,
  FileText,
  Mail,
  MapPin,
  ShieldCheck,
  X,
} from 'lucide-react';
import { FormEvent, useState } from 'react';
import { CvDocument, JobApplication, JobListing } from '../types/rental';
import { formatCurrency, formatReadableDate } from '../utils/format';

interface JobApplicationModalProps {
  job: JobListing;
  savedCvs: CvDocument[];
  onClose: () => void;
  onOpenCvMaker: () => void;
  onSubmitted: (application: JobApplication) => void;
}

export function JobApplicationModal({
  job,
  savedCvs,
  onClose,
  onOpenCvMaker,
  onSubmitted,
}: JobApplicationModalProps) {
  const defaultCv = savedCvs[0] ?? null;
  const [selectedCvId, setSelectedCvId] = useState<string>(defaultCv ? defaultCv.id : '');
  const [applicantName, setApplicantName] = useState(defaultCv?.fullName ?? '');
  const [applicantEmail, setApplicantEmail] = useState(defaultCv?.email ?? '');
  const [applicantPhone, setApplicantPhone] = useState(defaultCv?.phone || '+264 ');
  const [portfolioUrl, setPortfolioUrl] = useState(defaultCv?.linkedinOrPortfolio ?? '');
  const [cvFileName, setCvFileName] = useState(
    defaultCv ? `${defaultCv.documentTitle.replace(/\s+/g, '_')}.pdf` : 'Curriculum_Vitae_2026.pdf'
  );
  const [coverNote, setCoverNote] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submittedApp, setSubmittedApp] = useState<JobApplication | null>(null);

  function handleSelectSavedCv(nextId: string) {
    setSelectedCvId(nextId);
    const chosen = savedCvs.find((c) => c.id === nextId);
    if (!chosen) return;
    if (chosen.fullName) setApplicantName(chosen.fullName);
    if (chosen.email) setApplicantEmail(chosen.email);
    if (chosen.phone) setApplicantPhone(chosen.phone);
    if (chosen.linkedinOrPortfolio) setPortfolioUrl(chosen.linkedinOrPortfolio);
    setCvFileName(`${chosen.documentTitle.replace(/\s+/g, '_')}.pdf`);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const chosenCv = savedCvs.find((c) => c.id === selectedCvId);
    try {
      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId: job.id,
          applicantName: applicantName.trim(),
          applicantEmail: applicantEmail.trim(),
          applicantPhone: applicantPhone.trim(),
          portfolioUrl: portfolioUrl.trim(),
          cvFileName: cvFileName.trim(),
          cvId: chosenCv?.id,
          cvDocumentTitle: chosenCv?.documentTitle,
          coverNote: coverNote.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Could not submit job application.');
        return;
      }
      setSubmittedApp(data.application);
      onSubmitted(data.application);
    } catch {
      setError('Network error while submitting application.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Apply for ${job.title}`}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-3 sm:p-6 backdrop-blur-sm overflow-y-auto"
    >
      <div className="my-auto w-full max-w-4xl overflow-hidden rounded-2xl border border-white/15 bg-[#0F172A] shadow-2xl max-h-[92vh] flex flex-col">
        <div className="flex items-center justify-between gap-4 border-b border-white/10 bg-[#111A2E] px-5 py-4 shrink-0">
          <div className="min-w-0">
            <p className="text-xs font-medium text-[#9FB1CF] truncate">
              {job.employmentType} · {job.sector} · {job.city}, {job.country}
            </p>
            <h2 className="font-display truncate text-lg font-semibold text-[#EEF3FB]">
              {job.title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close job application modal"
            className="inline-flex size-9 items-center justify-center rounded-lg border border-white/10 bg-[#0B1120] text-[#C2CEE3] hover:text-white cursor-pointer shrink-0"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="overflow-y-auto p-5 md:p-6">
          {submittedApp ? (
            <div className="mx-auto max-w-2xl space-y-5">
              <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/25 p-6">
                <div className="flex items-start gap-3.5">
                  <CheckCircle2 className="mt-0.5 size-7 text-emerald-400 shrink-0" />
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-emerald-300">
                      Application Submitted
                    </p>
                    <h3 className="font-display mt-1 text-xl font-bold text-[#EEF3FB]">
                      Reference: {submittedApp.referenceCode}
                    </h3>
                    <p className="mt-1 text-sm text-[#C2CEE3]">
                      Your application for {submittedApp.jobTitle} at {submittedApp.company} has
                      been delivered, and a copy was sent to{' '}
                      <span className="font-semibold text-white">
                        {submittedApp.applicantEmail}
                      </span>
                      .
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-white/12 bg-[#111A2E] overflow-hidden">
                <div className="flex items-center gap-2 border-b border-white/10 bg-[#16233F] px-5 py-3 text-xs font-semibold text-[#EEF3FB]">
                  <Mail className="size-4 text-blue-400" />
                  Email Confirmation Dispatched
                </div>
                <div className="p-5 space-y-2">
                  <p className="text-xs text-[#9FB1CF]">
                    <span className="font-semibold text-[#EEF3FB]">Subject:</span>{' '}
                    {submittedApp.emailConfirmationSubject}
                  </p>
                  <pre className="whitespace-pre-wrap font-sans text-xs leading-relaxed text-[#C2CEE3]">
                    {submittedApp.emailConfirmationBody}
                  </pre>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-500 cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            <div className="grid gap-6 lg:grid-cols-12 lg:items-start">
              {/* Job Details */}
              <div className="lg:col-span-6 space-y-4">
                <div className="rounded-2xl border border-white/10 bg-[#111A2E] p-4 space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#EEF3FB]">
                      <Building className="size-4 text-blue-400" />
                      {job.company}
                    </span>
                    {job.verified && (
                      <span className="text-xs font-semibold text-emerald-300">
                        Verified Employer
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-[#9FB1CF]">
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="size-3.5 text-emerald-400" />
                      {job.city}, {job.region}, {job.country}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Briefcase className="size-3.5 text-blue-400" />
                      {job.employmentType}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="size-3.5 text-[#8EA2C4]" />
                      Deadline {formatReadableDate(job.applicationDeadline)}
                    </span>
                  </div>

                  <p className="font-mono-tabular pt-1 text-base font-bold text-emerald-300">
                    {formatCurrency(job.salaryMin, job.currency)} –{' '}
                    {formatCurrency(job.salaryMax, job.currency)}{' '}
                    <span className="font-sans text-xs font-normal text-[#9FB1CF]">
                      per {job.salaryPeriod}
                    </span>
                  </p>

                  <div className="border-t border-white/10 pt-2.5 space-y-1 text-xs">
                    <p className="font-medium text-emerald-300">
                      Eligibility: {job.eligibilityNote}
                    </p>
                    <p className="text-[#9FB1CF]">
                      Source:{' '}
                      {job.sourceUrl ? (
                        <a
                          href={job.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 underline hover:text-blue-300"
                        >
                          {job.sourceName}
                        </a>
                      ) : (
                        <span className="text-[#EEF3FB]">{job.sourceName}</span>
                      )}
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="font-display text-sm font-semibold text-[#EEF3FB]">
                    Role Overview
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-[#C2CEE3]">
                    {job.description}
                  </p>
                </div>

                <div className="border-t border-white/10 pt-4">
                  <h3 className="font-display text-sm font-semibold text-[#EEF3FB]">
                    Requirements
                  </h3>
                  <ul className="mt-2 space-y-1.5 text-xs text-[#B4C3DC]">
                    {job.requirements.map((req) => (
                      <li key={req} className="flex items-start gap-2">
                        <span className="mt-1.5 size-1.5 rounded-full bg-blue-400 shrink-0" />
                        <span>{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="border-t border-white/10 pt-4">
                  <h3 className="font-display text-sm font-semibold text-[#EEF3FB]">
                    Compensation &amp; Benefits
                  </h3>
                  <ul className="mt-2 space-y-1.5 text-xs text-[#B4C3DC]">
                    {job.benefits.map((b) => (
                      <li key={b} className="flex items-start gap-2">
                        <span className="mt-1.5 size-1.5 rounded-full bg-emerald-400 shrink-0" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Application Form */}
              <form
                onSubmit={handleSubmit}
                className="lg:col-span-6 rounded-2xl border border-white/15 bg-[#111A2E] p-5 space-y-3.5"
              >
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <h3 className="font-display text-base font-semibold text-[#EEF3FB]">
                    Submit Application
                  </h3>
                  <span className="inline-flex items-center gap-1 text-[11px] text-emerald-300">
                    <ShieldCheck className="size-3.5" />
                    Direct to Hiring Team
                  </span>
                </div>

                {error && (
                  <div className="rounded-xl border border-rose-500/40 bg-rose-950/40 px-3.5 py-2.5 text-xs text-rose-200">
                    {error}
                  </div>
                )}

                <label className="block space-y-1">
                  <span className="text-xs font-medium text-[#C2CEE3]">Full Name</span>
                  <input
                    type="text"
                    required
                    value={applicantName}
                    onChange={(e) => setApplicantName(e.target.value)}
                    placeholder="e.g. Johannes Shikongo"
                    className="w-full rounded-xl border border-white/10 bg-[#0B1120] px-3.5 py-2.5 text-sm text-[#EEF3FB] outline-none focus:border-blue-400"
                  />
                </label>

                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="block space-y-1">
                    <span className="text-xs font-medium text-[#C2CEE3]">Email Address</span>
                    <input
                      type="email"
                      required
                      value={applicantEmail}
                      onChange={(e) => setApplicantEmail(e.target.value)}
                      placeholder="name@example.na"
                      className="w-full rounded-xl border border-white/10 bg-[#0B1120] px-3.5 py-2.5 text-sm text-[#EEF3FB] outline-none focus:border-blue-400"
                    />
                  </label>
                  <label className="block space-y-1">
                    <span className="text-xs font-medium text-[#C2CEE3]">Phone Number</span>
                    <input
                      type="tel"
                      required
                      value={applicantPhone}
                      onChange={(e) => setApplicantPhone(e.target.value)}
                      placeholder="+264 81 555 0100"
                      className="w-full rounded-xl border border-white/10 bg-[#0B1120] px-3.5 py-2.5 text-sm text-[#EEF3FB] outline-none focus:border-blue-400"
                    />
                  </label>
                </div>

                {/* Attach CV from CV Maker or enter filename */}
                <div className="rounded-xl border border-white/10 bg-[#0B1120] p-3 space-y-2.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#EEF3FB]">
                      <FileText className="size-3.5 text-emerald-400" />
                      Attach CV Document
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenCvMaker();
                      }}
                      className="text-xs font-medium text-blue-400 hover:text-blue-300 underline cursor-pointer"
                    >
                      {savedCvs.length > 0 ? 'Edit in CV Maker' : 'Build CV in CV Maker'}
                    </button>
                  </div>

                  {savedCvs.length > 0 ? (
                    <select
                      value={selectedCvId}
                      onChange={(e) => handleSelectSavedCv(e.target.value)}
                      className="w-full rounded-lg border border-white/10 bg-[#111A2E] px-3 py-2 text-xs text-[#EEF3FB] outline-none cursor-pointer"
                    >
                      <option value="">Enter custom CV filename manually</option>
                      {savedCvs.map((cv) => (
                        <option key={cv.id} value={cv.id}>
                          {cv.documentTitle} ({cv.fullName})
                        </option>
                      ))}
                    </select>
                  ) : (
                    <p className="text-[11px] text-[#9FB1CF]">
                      No saved CVs yet. Create one in the CV Maker to auto-fill and attach, or enter
                      your CV filename below.
                    </p>
                  )}

                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="block space-y-1">
                      <span className="text-xs font-medium text-[#C2CEE3]">CV / Resume File</span>
                      <input
                        type="text"
                        value={cvFileName}
                        onChange={(e) => setCvFileName(e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-[#111A2E] px-3.5 py-2 text-sm text-[#EEF3FB] outline-none focus:border-blue-400"
                      />
                    </label>
                    <label className="block space-y-1">
                      <span className="text-xs font-medium text-[#C2CEE3]">
                        LinkedIn / Portfolio (Optional)
                      </span>
                      <input
                        type="url"
                        value={portfolioUrl}
                        onChange={(e) => setPortfolioUrl(e.target.value)}
                        placeholder="https://..."
                        className="w-full rounded-xl border border-white/10 bg-[#111A2E] px-3.5 py-2 text-sm text-[#EEF3FB] outline-none focus:border-blue-400"
                      />
                    </label>
                  </div>
                </div>

                <label className="block space-y-1">
                  <span className="text-xs font-medium text-[#C2CEE3]">
                    Cover Note &amp; Relevant Experience
                  </span>
                  <textarea
                    required
                    rows={4}
                    value={coverNote}
                    onChange={(e) => setCoverNote(e.target.value)}
                    placeholder="Summarize your relevant experience, certifications, and notice period..."
                    className="w-full rounded-xl border border-white/10 bg-[#0B1120] px-3.5 py-2.5 text-sm text-[#EEF3FB] outline-none focus:border-blue-400"
                  />
                </label>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-500 disabled:opacity-60 cursor-pointer"
                >
                  {submitting ? 'Submitting Application...' : 'Submit Application'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
