import { CvAccentColor, CvDocument } from '../types/rental';

const ACCENT_STYLES: Record<
  CvAccentColor,
  { heading: string; bar: string; subtleBg: string; border: string; hex: string }
> = {
  navy: {
    heading: 'text-[#1E3A8A]',
    bar: 'bg-[#1E3A8A]',
    subtleBg: 'bg-slate-50',
    border: 'border-[#1E3A8A]/25',
    hex: '#1E3A8A',
  },
  emerald: {
    heading: 'text-[#065F46]',
    bar: 'bg-[#065F46]',
    subtleBg: 'bg-emerald-50/40',
    border: 'border-[#065F46]/25',
    hex: '#065F46',
  },
  slate: {
    heading: 'text-slate-900',
    bar: 'bg-slate-900',
    subtleBg: 'bg-slate-100/70',
    border: 'border-slate-300',
    hex: '#0F172A',
  },
  amber: {
    heading: 'text-[#92400E]',
    bar: 'bg-[#92400E]',
    subtleBg: 'bg-amber-50/40',
    border: 'border-[#92400E]/25',
    hex: '#92400E',
  },
};

export function cvToPlainText(cv: CvDocument): string {
  const lines: string[] = [];
  lines.push(cv.fullName || 'Your Name');
  if (cv.headline) lines.push(cv.headline);
  const contacts = [cv.location, cv.phone, cv.email, cv.linkedinOrPortfolio].filter(Boolean);
  if (contacts.length > 0) lines.push(contacts.join(' | '));
  const eligibilityBits = [
    cv.citizenship ? `Eligibility: ${cv.citizenship}` : '',
    cv.driversLicense ? `Driver's Licence: ${cv.driversLicense}` : '',
    cv.availability ? `Availability: ${cv.availability}` : '',
  ].filter(Boolean);
  if (eligibilityBits.length > 0) lines.push(eligibilityBits.join(' | '));

  if (cv.summary.trim()) {
    lines.push('', 'PROFESSIONAL PROFILE', '-'.repeat(24), cv.summary.trim());
  }

  const validExperiences = cv.experiences.filter((e) => e.role.trim() || e.company.trim());
  if (validExperiences.length > 0) {
    lines.push('', 'WORK EXPERIENCE', '-'.repeat(24));
    for (const exp of validExperiences) {
      const period = [exp.startDate, exp.current ? 'Present' : exp.endDate]
        .filter(Boolean)
        .join(' – ');
      lines.push(`${exp.role}${exp.company ? ` — ${exp.company}` : ''}`);
      if (exp.location || period) {
        lines.push([exp.location, period].filter(Boolean).join(' | '));
      }
      for (const h of exp.highlights.filter((x) => x.trim())) {
        lines.push(`• ${h.trim()}`);
      }
      lines.push('');
    }
  }

  const validEducation = cv.education.filter((e) => e.qualification.trim() || e.institution.trim());
  if (validEducation.length > 0) {
    lines.push('EDUCATION & QUALIFICATIONS', '-'.repeat(24));
    for (const edu of validEducation) {
      lines.push(
        `${edu.qualification}${edu.institution ? ` — ${edu.institution}` : ''}${
          edu.yearCompleted ? ` (${edu.yearCompleted})` : ''
        }`
      );
      if (edu.location) lines.push(edu.location);
      if (edu.details.trim()) lines.push(edu.details.trim());
      lines.push('');
    }
  }

  if (cv.skills.length > 0) {
    lines.push('KEY SKILLS', '-'.repeat(24), cv.skills.join(', '), '');
  }

  if (cv.languages.length > 0) {
    lines.push('LANGUAGES', '-'.repeat(24), cv.languages.join(' · '), '');
  }

  const validRefs = cv.references.filter((r) => r.name.trim() || r.organization.trim());
  if (validRefs.length > 0) {
    lines.push('REFERENCES', '-'.repeat(24));
    for (const ref of validRefs) {
      lines.push(
        [ref.name, ref.title, ref.organization, ref.contact].filter(Boolean).join(' — ')
      );
    }
  }

  return lines.join('\n').trim() + '\n';
}

export function cvToStandaloneHtml(cv: CvDocument, innerHtml: string): string {
  const safeTitle = (cv.documentTitle || cv.fullName || 'Curriculum_Vitae').replace(/[<>]/g, '');
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${safeTitle}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    @page { size: A4 portrait; margin: 12mm; }
    body { background: #ffffff; color: #0f172a; font-family: system-ui, -apple-system, sans-serif; margin: 0; padding: 24px; }
    @media print { body { padding: 0; } }
  </style>
</head>
<body>
  <div style="max-width: 794px; margin: 0 auto;">
    ${innerHtml}
  </div>
</body>
</html>`;
}

interface CvPreviewSheetProps {
  cv: CvDocument;
}

export function CvPreviewSheet({ cv }: CvPreviewSheetProps) {
  const accent = ACCENT_STYLES[cv.accentColor] ?? ACCENT_STYLES.navy;
  const validExperiences = cv.experiences.filter((e) => e.role.trim() || e.company.trim());
  const validEducation = cv.education.filter((e) => e.qualification.trim() || e.institution.trim());
  const validRefs = cv.references.filter((r) => r.name.trim() || r.organization.trim());

  const contactItems = [cv.location, cv.phone, cv.email, cv.linkedinOrPortfolio].filter(Boolean);
  const credentialItems = [
    cv.citizenship ? `Citizenship: ${cv.citizenship}` : '',
    cv.driversLicense ? `Licence: ${cv.driversLicense}` : '',
    cv.availability ? `Availability: ${cv.availability}` : '',
  ].filter(Boolean);

  if (cv.template === 'modern-coastal') {
    return (
      <article className="cv-print-sheet mx-auto w-full max-w-[794px] bg-white text-slate-900 shadow-2xl border border-slate-200 rounded-lg overflow-hidden">
        <div className="h-2 w-full" style={{ backgroundColor: accent.hex }} />
        <div className="grid grid-cols-1 sm:grid-cols-12 min-h-[960px]">
          <aside className={`sm:col-span-4 ${accent.subtleBg} border-b sm:border-b-0 sm:border-r border-slate-200 p-6 space-y-6`}>
            <div>
              <h1 className={`font-display text-xl font-bold leading-tight tracking-tight ${accent.heading}`}>
                {cv.fullName || 'Your Full Name'}
              </h1>
              {cv.headline && (
                <p className="mt-1.5 text-xs font-medium leading-snug text-slate-600">
                  {cv.headline}
                </p>
              )}
            </div>

            <div className="space-y-2 border-t border-slate-200 pt-4">
              <h2 className={`text-[11px] font-bold tracking-wider ${accent.heading}`}>
                Contact Details
              </h2>
              <ul className="space-y-1.5 text-xs text-slate-700 break-words">
                {contactItems.length > 0 ? (
                  contactItems.map((item) => <li key={item}>{item}</li>)
                ) : (
                  <li className="text-slate-400">Add phone, email &amp; town</li>
                )}
              </ul>
            </div>

            {credentialItems.length > 0 && (
              <div className="space-y-2 border-t border-slate-200 pt-4">
                <h2 className={`text-[11px] font-bold tracking-wider ${accent.heading}`}>
                  Eligibility &amp; Readiness
                </h2>
                <ul className="space-y-1.5 text-xs text-slate-700">
                  {credentialItems.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            )}

            {cv.skills.length > 0 && (
              <div className="space-y-2 border-t border-slate-200 pt-4">
                <h2 className={`text-[11px] font-bold tracking-wider ${accent.heading}`}>
                  Core Skills
                </h2>
                <ul className="space-y-1 text-xs text-slate-700">
                  {cv.skills.map((skill) => (
                    <li key={skill} className="flex items-start gap-1.5">
                      <span className="mt-1.5 size-1 rounded-full bg-slate-500 shrink-0" />
                      <span>{skill}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {cv.languages.length > 0 && (
              <div className="space-y-2 border-t border-slate-200 pt-4">
                <h2 className={`text-[11px] font-bold tracking-wider ${accent.heading}`}>
                  Languages
                </h2>
                <ul className="space-y-1 text-xs text-slate-700">
                  {cv.languages.map((lang) => (
                    <li key={lang}>{lang}</li>
                  ))}
                </ul>
              </div>
            )}
          </aside>

          <div className="sm:col-span-8 p-6 sm:p-7 space-y-6">
            {cv.summary.trim() && (
              <section className="space-y-1.5">
                <h2 className={`text-xs font-bold tracking-wider border-b pb-1 ${accent.heading} ${accent.border}`}>
                  Profile Summary
                </h2>
                <p className="text-xs leading-relaxed text-slate-700 whitespace-pre-line">
                  {cv.summary}
                </p>
              </section>
            )}

            {validExperiences.length > 0 && (
              <section className="space-y-3">
                <h2 className={`text-xs font-bold tracking-wider border-b pb-1 ${accent.heading} ${accent.border}`}>
                  Work &amp; Practical Experience
                </h2>
                <div className="space-y-4">
                  {validExperiences.map((exp) => {
                    const period = [exp.startDate, exp.current ? 'Present' : exp.endDate]
                      .filter(Boolean)
                      .join(' – ');
                    return (
                      <div key={exp.id} className="space-y-1">
                        <div className="flex flex-wrap items-baseline justify-between gap-2">
                          <h3 className="text-sm font-semibold text-slate-900">
                            {exp.role || 'Role Title'}
                          </h3>
                          {period && (
                            <span className="font-mono-tabular text-[11px] font-medium text-slate-500">
                              {period}
                            </span>
                          )}
                        </div>
                        {(exp.company || exp.location) && (
                          <p className="text-xs font-medium text-slate-600">
                            {[exp.company, exp.location].filter(Boolean).join(' · ')}
                          </p>
                        )}
                        {exp.highlights.some((h) => h.trim()) && (
                          <ul className="mt-1 space-y-1 pl-4 list-disc text-xs leading-relaxed text-slate-700">
                            {exp.highlights
                              .filter((h) => h.trim())
                              .map((h, idx) => (
                                <li key={`${exp.id}-h-${idx}`}>{h}</li>
                              ))}
                          </ul>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {validEducation.length > 0 && (
              <section className="space-y-3">
                <h2 className={`text-xs font-bold tracking-wider border-b pb-1 ${accent.heading} ${accent.border}`}>
                  Education &amp; Training
                </h2>
                <div className="space-y-3">
                  {validEducation.map((edu) => (
                    <div key={edu.id} className="space-y-0.5">
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <h3 className="text-sm font-semibold text-slate-900">
                          {edu.qualification || 'Qualification'}
                        </h3>
                        {edu.yearCompleted && (
                          <span className="font-mono-tabular text-[11px] font-medium text-slate-500">
                            {edu.yearCompleted}
                          </span>
                        )}
                      </div>
                      {(edu.institution || edu.location) && (
                        <p className="text-xs font-medium text-slate-600">
                          {[edu.institution, edu.location].filter(Boolean).join(' · ')}
                        </p>
                      )}
                      {edu.details.trim() && (
                        <p className="text-xs leading-relaxed text-slate-700">{edu.details}</p>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {validRefs.length > 0 && (
              <section className="space-y-2">
                <h2 className={`text-xs font-bold tracking-wider border-b pb-1 ${accent.heading} ${accent.border}`}>
                  References
                </h2>
                <div className="grid gap-3 sm:grid-cols-2">
                  {validRefs.map((ref) => (
                    <div key={ref.id} className="text-xs text-slate-700 space-y-0.5">
                      <p className="font-semibold text-slate-900">{ref.name}</p>
                      {(ref.title || ref.organization) && (
                        <p className="text-slate-600">
                          {[ref.title, ref.organization].filter(Boolean).join(', ')}
                        </p>
                      )}
                      {ref.contact && <p className="font-mono-tabular text-slate-600">{ref.contact}</p>}
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      </article>
    );
  }

  // Student & Retail OR Classic Executive single-column paper layouts
  const isStudent = cv.template === 'student-retail';

  return (
    <article className="cv-print-sheet mx-auto w-full max-w-[794px] bg-white text-slate-900 shadow-2xl border border-slate-200 rounded-lg overflow-hidden">
      <div className="h-2 w-full" style={{ backgroundColor: accent.hex }} />
      <div className="p-7 sm:p-9 space-y-5 min-h-[960px]">
        {/* Document Header */}
        <header className={`border-b pb-4 ${accent.border}`}>
          <h1 className={`font-display text-2xl font-bold tracking-tight ${accent.heading}`}>
            {cv.fullName || 'Your Full Name'}
          </h1>
          {cv.headline && (
            <p className="mt-1 text-sm font-medium text-slate-700">{cv.headline}</p>
          )}
          {contactItems.length > 0 && (
            <p className="mt-2 text-xs text-slate-600">
              {contactItems.join('  ·  ')}
            </p>
          )}
          {credentialItems.length > 0 && (
            <p className="mt-1 text-xs font-medium text-slate-700">
              {credentialItems.join('  ·  ')}
            </p>
          )}
        </header>

        {cv.summary.trim() && (
          <section className="space-y-1.5">
            <h2 className={`text-xs font-bold tracking-wider ${accent.heading}`}>
              {isStudent ? 'Availability & Personal Profile' : 'Executive Profile'}
            </h2>
            <p className="text-xs leading-relaxed text-slate-700 whitespace-pre-line">
              {cv.summary}
            </p>
          </section>
        )}

        {isStudent && cv.skills.length > 0 && (
          <section className="space-y-1.5">
            <h2 className={`text-xs font-bold tracking-wider border-b pb-1 ${accent.heading} ${accent.border}`}>
              Key Store &amp; Workplace Skills
            </h2>
            <p className="text-xs leading-relaxed text-slate-800">
              {cv.skills.join('  ·  ')}
            </p>
          </section>
        )}

        {validEducation.length > 0 && isStudent && (
          <section className="space-y-2.5">
            <h2 className={`text-xs font-bold tracking-wider border-b pb-1 ${accent.heading} ${accent.border}`}>
              Education &amp; Academic Standing
            </h2>
            <div className="space-y-2.5">
              {validEducation.map((edu) => (
                <div key={edu.id}>
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h3 className="text-sm font-semibold text-slate-900">
                      {edu.qualification}
                      {edu.institution ? ` — ${edu.institution}` : ''}
                    </h3>
                    {edu.yearCompleted && (
                      <span className="font-mono-tabular text-[11px] font-medium text-slate-500">
                        {edu.yearCompleted}
                      </span>
                    )}
                  </div>
                  {edu.location && <p className="text-xs text-slate-600">{edu.location}</p>}
                  {edu.details.trim() && (
                    <p className="mt-0.5 text-xs text-slate-700">{edu.details}</p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {validExperiences.length > 0 && (
          <section className="space-y-3">
            <h2 className={`text-xs font-bold tracking-wider border-b pb-1 ${accent.heading} ${accent.border}`}>
              {isStudent ? 'Holiday Work, Volunteering & Practical Experience' : 'Professional Experience'}
            </h2>
            <div className="space-y-3.5">
              {validExperiences.map((exp) => {
                const period = [exp.startDate, exp.current ? 'Present' : exp.endDate]
                  .filter(Boolean)
                  .join(' – ');
                return (
                  <div key={exp.id} className="space-y-1">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <h3 className="text-sm font-semibold text-slate-900">
                        {exp.role}
                        {exp.company ? ` — ${exp.company}` : ''}
                      </h3>
                      {period && (
                        <span className="font-mono-tabular text-[11px] font-medium text-slate-500">
                          {period}
                        </span>
                      )}
                    </div>
                    {exp.location && <p className="text-xs text-slate-600">{exp.location}</p>}
                    {exp.highlights.some((h) => h.trim()) && (
                      <ul className="mt-1 space-y-1 pl-4 list-disc text-xs leading-relaxed text-slate-700">
                        {exp.highlights
                          .filter((h) => h.trim())
                          .map((h, idx) => (
                            <li key={`${exp.id}-h-${idx}`}>{h}</li>
                          ))}
                      </ul>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {validEducation.length > 0 && !isStudent && (
          <section className="space-y-2.5">
            <h2 className={`text-xs font-bold tracking-wider border-b pb-1 ${accent.heading} ${accent.border}`}>
              Education &amp; Qualifications
            </h2>
            <div className="space-y-2.5">
              {validEducation.map((edu) => (
                <div key={edu.id}>
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h3 className="text-sm font-semibold text-slate-900">
                      {edu.qualification}
                      {edu.institution ? ` — ${edu.institution}` : ''}
                    </h3>
                    {edu.yearCompleted && (
                      <span className="font-mono-tabular text-[11px] font-medium text-slate-500">
                        {edu.yearCompleted}
                      </span>
                    )}
                  </div>
                  {edu.location && <p className="text-xs text-slate-600">{edu.location}</p>}
                  {edu.details.trim() && (
                    <p className="mt-0.5 text-xs text-slate-700">{edu.details}</p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {!isStudent && cv.skills.length > 0 && (
          <section className="space-y-1.5">
            <h2 className={`text-xs font-bold tracking-wider border-b pb-1 ${accent.heading} ${accent.border}`}>
              Core Competencies &amp; Technical Skills
            </h2>
            <p className="text-xs leading-relaxed text-slate-800">{cv.skills.join('  ·  ')}</p>
          </section>
        )}

        {cv.languages.length > 0 && (
          <section className="space-y-1">
            <h2 className={`text-xs font-bold tracking-wider border-b pb-1 ${accent.heading} ${accent.border}`}>
              Languages
            </h2>
            <p className="text-xs text-slate-800">{cv.languages.join('  ·  ')}</p>
          </section>
        )}

        {validRefs.length > 0 && (
          <section className="space-y-2">
            <h2 className={`text-xs font-bold tracking-wider border-b pb-1 ${accent.heading} ${accent.border}`}>
              References
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {validRefs.map((ref) => (
                <div key={ref.id} className="text-xs text-slate-700 space-y-0.5">
                  <p className="font-semibold text-slate-900">{ref.name}</p>
                  {(ref.title || ref.organization) && (
                    <p className="text-slate-600">
                      {[ref.title, ref.organization].filter(Boolean).join(', ')}
                    </p>
                  )}
                  {ref.contact && <p className="font-mono-tabular text-slate-600">{ref.contact}</p>}
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </article>
  );
}
