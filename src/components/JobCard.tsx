import { Building, Calendar, ExternalLink, GraduationCap, MapPin, ShieldCheck } from 'lucide-react';
import { JobListing } from '../types/rental';
import { formatCurrency, formatReadableDate } from '../utils/format';

interface JobCardProps {
  job: JobListing;
  isHighlighted?: boolean;
  onSelect: (job: JobListing) => void;
  onHover?: (id: string | null) => void;
}

export function JobCard({
  job,
  isHighlighted = false,
  onSelect,
  onHover,
}: JobCardProps) {
  return (
    <article
      onMouseEnter={() => onHover?.(job.id)}
      onMouseLeave={() => onHover?.(null)}
      className={`flex flex-col justify-between rounded-2xl border bg-[#111A2E] p-5 transition-all duration-200 hover:-translate-y-0.5 ${
        isHighlighted
          ? 'border-blue-400 ring-1 ring-blue-400/50'
          : 'border-white/10 hover:border-white/25'
      }`}
    >
      <div>
        <p className="text-xs font-medium text-[#8EA2C4] truncate">
          {job.employmentType} · {job.sector} · {job.city}, {job.country}
        </p>

        <h3 className="font-display mt-2 line-clamp-2 text-base font-semibold leading-snug text-[#EEF3FB]">
          <button
            type="button"
            onClick={() => onSelect(job)}
            className="text-left hover:text-blue-300 transition-colors cursor-pointer"
          >
            {job.title}
          </button>
        </h3>

        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#C2CEE3]">
          <span className="inline-flex items-center gap-1 font-medium">
            <Building className="size-3.5 text-blue-400 shrink-0" />
            {job.company}
          </span>
          <span className="inline-flex items-center gap-1 text-[#9FB1CF]">
            <MapPin className="size-3.5 text-emerald-400 shrink-0" />
            {job.city}, {job.country}
          </span>
        </div>

        {/* Clean single-line eligibility / student holiday indicator */}
        <p
          className={`mt-2 inline-flex items-center gap-1.5 text-[11px] font-semibold ${
            job.isStudentHoliday
              ? 'text-amber-300'
              : job.eligibilityScope === 'SADC & International (Namibians Eligible)'
                ? 'text-emerald-300'
                : 'text-blue-300'
          }`}
        >
          {job.isStudentHoliday ? (
            <GraduationCap className="size-3.5 shrink-0" />
          ) : (
            <ShieldCheck className="size-3.5 shrink-0" />
          )}
          <span className="truncate">{job.eligibilityNote}</span>
        </p>

        <p className="mt-2.5 line-clamp-2 text-xs leading-relaxed text-[#9FB1CF]">
          {job.description}
        </p>
      </div>

      <div className="mt-4 border-t border-white/10 pt-3.5 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="font-mono-tabular text-sm font-semibold text-emerald-300">
            {formatCurrency(job.salaryMin, job.currency)} –{' '}
            {formatCurrency(job.salaryMax, job.currency)}
            <span className="font-sans text-[11px] font-normal text-[#8EA2C4]">
              {' '}
              /{job.salaryPeriod}
            </span>
          </p>
          <p className="mt-0.5 flex items-center gap-1.5 text-[11px] text-[#7C8FB0] truncate">
            <Calendar className="size-3 shrink-0" />
            <span>Closes {formatReadableDate(job.applicationDeadline)}</span>
            <span aria-hidden="true">·</span>
            {job.sourceUrl ? (
              <a
                href={job.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 truncate"
              >
                <span className="truncate">{job.sourceName}</span>
                <ExternalLink className="size-2.5 shrink-0" />
              </a>
            ) : (
              <span className="truncate">{job.sourceName}</span>
            )}
          </p>
        </div>

        <button
          type="button"
          onClick={() => onSelect(job)}
          className="rounded-lg bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white whitespace-nowrap shrink-0 transition-colors hover:bg-blue-500 cursor-pointer"
        >
          Apply Now
        </button>
      </div>
    </article>
  );
}
