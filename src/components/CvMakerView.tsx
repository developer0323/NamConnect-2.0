import {
  Briefcase,
  CheckCircle2,
  Copy,
  Download,
  FileText,
  Plus,
  Printer,
  Save,
  Trash2,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import {
  CV_ACCENTS,
  CV_STARTER_PRESETS,
  CV_TEMPLATES,
  NAMIBIA_COMMON_LANGUAGES,
  NAMIBIA_COMMON_SKILLS,
} from '../data/cvPresets';
import { CvDocument, CvEducation, CvExperience, CvReference } from '../types/rental';
import { CvPreviewSheet, cvToPlainText, cvToStandaloneHtml } from './CvPreviewSheet';

type EditorTab = 'personal' | 'experience' | 'education' | 'skills' | 'references' | 'style';

interface CvMakerViewProps {
  savedCvs: CvDocument[];
  onSaveCv: (cv: CvDocument) => Promise<CvDocument>;
  onDeleteCv: (id: string) => Promise<void>;
  onApplyToJobs: () => void;
}

export function CvMakerView({
  savedCvs,
  onSaveCv,
  onDeleteCv,
  onApplyToJobs,
}: CvMakerViewProps) {
  const [draft, setDraft] = useState<CvDocument>(() =>
    savedCvs.length > 0 ? savedCvs[0] : CV_STARTER_PRESETS[0].create()
  );
  const [activeTab, setActiveTab] = useState<EditorTab>('personal');
  const [skillInput, setSkillInput] = useState('');
  const [languageInput, setLanguageInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showTemplatePicker, setShowTemplatePicker] = useState(false);

  const previewContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (savedCvs.length > 0 && !draft.fullName && savedCvs[0].id !== draft.id) {
      setDraft(savedCvs[0]);
    }
  }, [savedCvs]);

  function clearMessages() {
    setStatusMessage(null);
    setErrorMessage(null);
  }

  function updateField<K extends keyof CvDocument>(key: K, value: CvDocument[K]) {
    clearMessages();
    setDraft((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSave(): Promise<CvDocument | null> {
    clearMessages();
    if (!draft.fullName.trim() || draft.fullName.trim().length < 2) {
      setErrorMessage('Enter your full name on the Personal tab before saving your CV.');
      setActiveTab('personal');
      return null;
    }
    setSaving(true);
    try {
      const saved = await onSaveCv(draft);
      setDraft(saved);
      setStatusMessage(`Saved "${saved.documentTitle}" — ready to download or attach to job applications.`);
      return saved;
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Unable to save CV right now.');
      return null;
    } finally {
      setSaving(false);
    }
  }

  function handleLoadPreset(presetId: string) {
    const preset = CV_STARTER_PRESETS.find((p) => p.id === presetId) ?? CV_STARTER_PRESETS[0];
    setDraft(preset.create());
    setShowTemplatePicker(false);
    setActiveTab('personal');
    setStatusMessage(`Loaded "${preset.label}". Customize your details and click Save CV.`);
    setErrorMessage(null);
  }

  function handleDuplicateCurrent() {
    const now = new Date().toISOString();
    setDraft((prev) => ({
      ...prev,
      id: `cv_${Date.now()}`,
      documentTitle: `${prev.documentTitle || 'CV'}_Copy`,
      createdAt: now,
      updatedAt: now,
    }));
    setStatusMessage('Created a duplicate draft. Edit and save to store as a separate CV.');
  }

  async function handleDeleteCurrent() {
    const isSaved = savedCvs.some((c) => c.id === draft.id);
    if (!isSaved) {
      setDraft(savedCvs[0] ?? CV_STARTER_PRESETS[0].create());
      return;
    }
    await onDeleteCv(draft.id);
    const remaining = savedCvs.filter((c) => c.id !== draft.id);
    setDraft(remaining[0] ?? CV_STARTER_PRESETS[0].create());
    setStatusMessage('Deleted CV document.');
  }

  function handlePrintPdf() {
    window.print();
  }

  function handleDownloadTxt() {
    const text = cvToPlainText(draft);
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(draft.documentTitle || 'My_CV').replace(/\s+/g, '_')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleDownloadHtml() {
    const sheetEl = previewContainerRef.current?.querySelector('.cv-print-sheet');
    if (!sheetEl) return;
    const html = cvToStandaloneHtml(draft, sheetEl.outerHTML);
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(draft.documentTitle || 'My_CV').replace(/\s+/g, '_')}.html`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // Experience handlers
  function addExperience() {
    const item: CvExperience = {
      id: `exp_${Date.now()}`,
      role: '',
      company: '',
      location: '',
      startDate: '',
      endDate: '',
      current: false,
      highlights: [''],
    };
    updateField('experiences', [...draft.experiences, item]);
  }

  function updateExperience(id: string, patch: Partial<CvExperience>) {
    updateField(
      'experiences',
      draft.experiences.map((exp) => (exp.id === id ? { ...exp, ...patch } : exp))
    );
  }

  function removeExperience(id: string) {
    updateField(
      'experiences',
      draft.experiences.filter((exp) => exp.id !== id)
    );
  }

  // Education handlers
  function addEducation() {
    const item: CvEducation = {
      id: `edu_${Date.now()}`,
      qualification: '',
      institution: '',
      location: '',
      yearCompleted: '',
      details: '',
    };
    updateField('education', [...draft.education, item]);
  }

  function updateEducation(id: string, patch: Partial<CvEducation>) {
    updateField(
      'education',
      draft.education.map((edu) => (edu.id === id ? { ...edu, ...patch } : edu))
    );
  }

  function removeEducation(id: string) {
    updateField(
      'education',
      draft.education.filter((edu) => edu.id !== id)
    );
  }

  // Reference handlers
  function addReference() {
    const item: CvReference = {
      id: `ref_${Date.now()}`,
      name: '',
      title: '',
      organization: '',
      contact: '',
    };
    updateField('references', [...draft.references, item]);
  }

  function updateReference(id: string, patch: Partial<CvReference>) {
    updateField(
      'references',
      draft.references.map((ref) => (ref.id === id ? { ...ref, ...patch } : ref))
    );
  }

  function removeReference(id: string) {
    updateField(
      'references',
      draft.references.filter((ref) => ref.id !== id)
    );
  }

  // Skills & languages
  function addSkill(value: string) {
    const trimmed = value.trim();
    if (!trimmed || draft.skills.includes(trimmed)) return;
    updateField('skills', [...draft.skills, trimmed]);
    setSkillInput('');
  }

  function removeSkill(value: string) {
    updateField(
      'skills',
      draft.skills.filter((s) => s !== value)
    );
  }

  function addLanguage(value: string) {
    const trimmed = value.trim();
    if (!trimmed || draft.languages.includes(trimmed)) return;
    updateField('languages', [...draft.languages, trimmed]);
    setLanguageInput('');
  }

  function removeLanguage(value: string) {
    updateField(
      'languages',
      draft.languages.filter((l) => l !== value)
    );
  }

  const isSavedDocument = savedCvs.some((c) => c.id === draft.id);

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 md:px-6 space-y-6">
      {/* Workspace Header & Saved CV Bar */}
      <div className="rounded-2xl border border-white/10 bg-[#111A2E] p-5 space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1 max-w-2xl">
            <h1 className="font-display text-2xl font-bold tracking-tight text-[#EEF3FB]">
              CV Maker &amp; Document Builder
            </h1>
            <p className="text-sm text-[#9FB1CF]">
              Build tailored, print-ready CVs for Namibian student holiday roles, local stores,
              mining trades, and SADC regional vacancies — then save and attach them directly when
              applying.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => setShowTemplatePicker((prev) => !prev)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-[#0B1120] px-3.5 py-2 text-xs font-semibold text-[#EEF3FB] hover:border-blue-400/50 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Plus className="size-3.5 text-blue-400" />
              New CV / Template
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-500 disabled:opacity-60 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Save className="size-3.5" />
              {saving ? 'Saving...' : isSavedDocument ? 'Save Changes' : 'Save CV'}
            </button>

            <button
              type="button"
              onClick={async () => {
                const saved = await handleSave();
                if (saved) onApplyToJobs();
              }}
              className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-500 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Briefcase className="size-3.5" />
              Save &amp; Apply to Jobs
            </button>
          </div>
        </div>

        {/* Starter Template Picker Drawer */}
        {showTemplatePicker && (
          <div className="border-t border-white/10 pt-4">
            <p className="text-xs font-semibold text-[#C2CEE3] mb-3">
              Choose a starting template:
            </p>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {CV_STARTER_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handleLoadPreset(preset.id)}
                  className="text-left rounded-xl border border-white/10 bg-[#0B1120] p-3.5 transition-colors hover:border-blue-400/50 cursor-pointer"
                >
                  <p className="text-xs font-semibold text-[#EEF3FB]">{preset.label}</p>
                  <p className="mt-1 text-[11px] leading-relaxed text-[#9FB1CF]">
                    {preset.subtitle}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Saved CVs Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-3.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-[#9FB1CF]">
              Saved CV Documents ({savedCvs.length}):
            </span>
            {savedCvs.length === 0 ? (
              <span className="text-xs text-[#7C8FB0]">
                None saved yet — edit below and click Save CV.
              </span>
            ) : (
              savedCvs.map((doc) => (
                <button
                  key={doc.id}
                  type="button"
                  onClick={() => {
                    setDraft(doc);
                    clearMessages();
                  }}
                  className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    draft.id === doc.id
                      ? 'border-blue-400/60 bg-blue-600/20 text-white'
                      : 'border-white/10 bg-[#0B1120] text-[#C2CEE3] hover:border-white/25'
                  }`}
                >
                  <FileText className="size-3 text-blue-400" />
                  <span className="max-w-[180px] truncate">{doc.documentTitle}</span>
                </button>
              ))
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDuplicateCurrent}
              className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-[#0B1120] px-2.5 py-1.5 text-xs font-medium text-[#C2CEE3] hover:text-white whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Copy className="size-3" />
              Duplicate
            </button>
            <button
              type="button"
              onClick={handleDeleteCurrent}
              className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-[#0B1120] px-2.5 py-1.5 text-xs font-medium text-rose-300 hover:border-rose-500/40 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Trash2 className="size-3" />
              Delete
            </button>
          </div>
        </div>

        {statusMessage && (
          <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-950/30 px-3.5 py-2.5 text-xs text-emerald-200">
            <CheckCircle2 className="size-4 text-emerald-400 shrink-0" />
            <span>{statusMessage}</span>
          </div>
        )}
        {errorMessage && (
          <div className="rounded-xl border border-rose-500/40 bg-rose-950/40 px-3.5 py-2.5 text-xs text-rose-200">
            {errorMessage}
          </div>
        )}
      </div>

      {/* Main Split Builder: Form Editor (Left) + Live A4 Document Preview (Right) */}
      <div className="grid gap-6 lg:grid-cols-12 lg:items-start">
        {/* Left: Structured Editor */}
        <div className="lg:col-span-5 rounded-2xl border border-white/10 bg-[#111A2E] overflow-hidden">
          {/* Section Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto border-b border-white/10 bg-[#0B1120] p-2">
            {(
              [
                { id: 'personal', label: 'Personal' },
                { id: 'experience', label: 'Experience' },
                { id: 'education', label: 'Education' },
                { id: 'skills', label: 'Skills' },
                { id: 'references', label: 'References' },
                { id: 'style', label: 'Layout' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'text-[#9FB1CF] hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-5 space-y-4 max-h-[820px] overflow-y-auto">
            {activeTab === 'personal' && (
              <div className="space-y-3.5">
                <label className="block space-y-1">
                  <span className="text-xs font-medium text-[#C2CEE3]">
                    CV Document Name (for saving &amp; attaching)
                  </span>
                  <input
                    type="text"
                    value={draft.documentTitle}
                    onChange={(e) => updateField('documentTitle', e.target.value)}
                    placeholder="e.g. Selma_Holiday_Retail_CV_2026"
                    className="w-full rounded-xl border border-white/10 bg-[#0B1120] px-3.5 py-2 text-sm text-[#EEF3FB] outline-none focus:border-blue-400"
                  />
                </label>

                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="block space-y-1">
                    <span className="text-xs font-medium text-[#C2CEE3]">Full Name</span>
                    <input
                      type="text"
                      value={draft.fullName}
                      onChange={(e) => updateField('fullName', e.target.value)}
                      placeholder="e.g. Selma Shikongo"
                      className="w-full rounded-xl border border-white/10 bg-[#0B1120] px-3.5 py-2 text-sm text-[#EEF3FB] outline-none focus:border-blue-400"
                    />
                  </label>
                  <label className="block space-y-1">
                    <span className="text-xs font-medium text-[#C2CEE3]">Target Role / Headline</span>
                    <input
                      type="text"
                      value={draft.headline}
                      onChange={(e) => updateField('headline', e.target.value)}
                      placeholder="e.g. Student Holiday Cashier / Junior Analyst"
                      className="w-full rounded-xl border border-white/10 bg-[#0B1120] px-3.5 py-2 text-sm text-[#EEF3FB] outline-none focus:border-blue-400"
                    />
                  </label>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="block space-y-1">
                    <span className="text-xs font-medium text-[#C2CEE3]">Email Address</span>
                    <input
                      type="email"
                      value={draft.email}
                      onChange={(e) => updateField('email', e.target.value)}
                      placeholder="name@example.na"
                      className="w-full rounded-xl border border-white/10 bg-[#0B1120] px-3.5 py-2 text-sm text-[#EEF3FB] outline-none focus:border-blue-400"
                    />
                  </label>
                  <label className="block space-y-1">
                    <span className="text-xs font-medium text-[#C2CEE3]">Phone Number</span>
                    <input
                      type="tel"
                      value={draft.phone}
                      onChange={(e) => updateField('phone', e.target.value)}
                      placeholder="+264 81 000 0000"
                      className="w-full rounded-xl border border-white/10 bg-[#0B1120] px-3.5 py-2 text-sm text-[#EEF3FB] outline-none focus:border-blue-400"
                    />
                  </label>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="block space-y-1">
                    <span className="text-xs font-medium text-[#C2CEE3]">Town &amp; Region</span>
                    <input
                      type="text"
                      value={draft.location}
                      onChange={(e) => updateField('location', e.target.value)}
                      placeholder="Walvis Bay, Erongo, Namibia"
                      className="w-full rounded-xl border border-white/10 bg-[#0B1120] px-3.5 py-2 text-sm text-[#EEF3FB] outline-none focus:border-blue-400"
                    />
                  </label>
                  <label className="block space-y-1">
                    <span className="text-xs font-medium text-[#C2CEE3]">
                      Citizenship / Work Eligibility
                    </span>
                    <input
                      type="text"
                      value={draft.citizenship}
                      onChange={(e) => updateField('citizenship', e.target.value)}
                      placeholder="Namibian Citizen"
                      className="w-full rounded-xl border border-white/10 bg-[#0B1120] px-3.5 py-2 text-sm text-[#EEF3FB] outline-none focus:border-blue-400"
                    />
                  </label>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="block space-y-1">
                    <span className="text-xs font-medium text-[#C2CEE3]">
                      Driver&apos;s Licence (Optional)
                    </span>
                    <input
                      type="text"
                      value={draft.driversLicense}
                      onChange={(e) => updateField('driversLicense', e.target.value)}
                      placeholder="e.g. Code B / Code C1"
                      className="w-full rounded-xl border border-white/10 bg-[#0B1120] px-3.5 py-2 text-sm text-[#EEF3FB] outline-none focus:border-blue-400"
                    />
                  </label>
                  <label className="block space-y-1">
                    <span className="text-xs font-medium text-[#C2CEE3]">Availability</span>
                    <input
                      type="text"
                      value={draft.availability}
                      onChange={(e) => updateField('availability', e.target.value)}
                      placeholder="e.g. Holiday Break / Immediate"
                      className="w-full rounded-xl border border-white/10 bg-[#0B1120] px-3.5 py-2 text-sm text-[#EEF3FB] outline-none focus:border-blue-400"
                    />
                  </label>
                </div>

                <label className="block space-y-1">
                  <span className="text-xs font-medium text-[#C2CEE3]">
                    LinkedIn or Portfolio URL (Optional)
                  </span>
                  <input
                    type="url"
                    value={draft.linkedinOrPortfolio}
                    onChange={(e) => updateField('linkedinOrPortfolio', e.target.value)}
                    placeholder="https://linkedin.com/in/..."
                    className="w-full rounded-xl border border-white/10 bg-[#0B1120] px-3.5 py-2 text-sm text-[#EEF3FB] outline-none focus:border-blue-400"
                  />
                </label>

                <label className="block space-y-1">
                  <span className="text-xs font-medium text-[#C2CEE3]">
                    Personal Profile / Career Summary
                  </span>
                  <textarea
                    rows={4}
                    value={draft.summary}
                    onChange={(e) => updateField('summary', e.target.value)}
                    placeholder="Summarize your strengths, availability, or key achievements..."
                    className="w-full rounded-xl border border-white/10 bg-[#0B1120] px-3.5 py-2 text-sm text-[#EEF3FB] outline-none focus:border-blue-400"
                  />
                </label>
              </div>
            )}

            {activeTab === 'experience' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-[#9FB1CF]">
                    Include paid jobs, holiday store shifts, internships, or campus volunteering.
                  </p>
                  <button
                    type="button"
                    onClick={addExperience}
                    className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-500 whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <Plus className="size-3.5" />
                    Add Role
                  </button>
                </div>

                {draft.experiences.length === 0 ? (
                  <p className="py-6 text-center text-xs text-[#7C8FB0]">
                    No work entries yet. Click Add Role to include experience or volunteering.
                  </p>
                ) : (
                  draft.experiences.map((exp, idx) => (
                    <div
                      key={exp.id}
                      className="space-y-3 border-t border-white/10 pt-4 first:border-t-0 first:pt-0"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-[#EEF3FB]">
                          Experience {idx + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeExperience(exp.id)}
                          className="text-xs text-rose-300 hover:text-rose-200 cursor-pointer"
                        >
                          Remove
                        </button>
                      </div>

                      <div className="grid gap-2.5 sm:grid-cols-2">
                        <input
                          type="text"
                          value={exp.role}
                          onChange={(e) => updateExperience(exp.id, { role: e.target.value })}
                          placeholder="Job Title (e.g. Till Operator)"
                          className="w-full rounded-xl border border-white/10 bg-[#0B1120] px-3 py-2 text-xs text-[#EEF3FB] outline-none focus:border-blue-400"
                        />
                        <input
                          type="text"
                          value={exp.company}
                          onChange={(e) => updateExperience(exp.id, { company: e.target.value })}
                          placeholder="Employer / Store Name"
                          className="w-full rounded-xl border border-white/10 bg-[#0B1120] px-3 py-2 text-xs text-[#EEF3FB] outline-none focus:border-blue-400"
                        />
                      </div>

                      <div className="grid gap-2.5 sm:grid-cols-3">
                        <input
                          type="text"
                          value={exp.location}
                          onChange={(e) => updateExperience(exp.id, { location: e.target.value })}
                          placeholder="Town (e.g. Walvis Bay)"
                          className="w-full rounded-xl border border-white/10 bg-[#0B1120] px-3 py-2 text-xs text-[#EEF3FB] outline-none focus:border-blue-400"
                        />
                        <input
                          type="text"
                          value={exp.startDate}
                          onChange={(e) => updateExperience(exp.id, { startDate: e.target.value })}
                          placeholder="Start (e.g. Nov 2025)"
                          className="w-full rounded-xl border border-white/10 bg-[#0B1120] px-3 py-2 text-xs text-[#EEF3FB] outline-none focus:border-blue-400"
                        />
                        <input
                          type="text"
                          disabled={exp.current}
                          value={exp.current ? 'Present' : exp.endDate}
                          onChange={(e) => updateExperience(exp.id, { endDate: e.target.value })}
                          placeholder="End (e.g. Jan 2026)"
                          className="w-full rounded-xl border border-white/10 bg-[#0B1120] px-3 py-2 text-xs text-[#EEF3FB] outline-none focus:border-blue-400 disabled:opacity-50"
                        />
                      </div>

                      <label className="inline-flex items-center gap-2 text-xs text-[#C2CEE3] cursor-pointer">
                        <input
                          type="checkbox"
                          checked={exp.current}
                          onChange={(e) => updateExperience(exp.id, { current: e.target.checked })}
                          className="size-3.5 accent-blue-500"
                        />
                        Currently working in this role
                      </label>

                      <label className="block space-y-1">
                        <span className="text-[11px] font-medium text-[#9FB1CF]">
                          Key Duties &amp; Achievements (one bullet per line)
                        </span>
                        <textarea
                          rows={3}
                          value={exp.highlights.join('\n')}
                          onChange={(e) =>
                            updateExperience(exp.id, {
                              highlights: e.target.value.split('\n'),
                            })
                          }
                          placeholder="Processed cash and card sales accurately&#10;Assisted customers and restocked shelves"
                          className="w-full rounded-xl border border-white/10 bg-[#0B1120] px-3 py-2 text-xs text-[#EEF3FB] outline-none focus:border-blue-400"
                        />
                      </label>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'education' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-[#9FB1CF]">
                    List UNAM, NUST, IUM, NIMT, VTC, or Grade 12 qualifications.
                  </p>
                  <button
                    type="button"
                    onClick={addEducation}
                    className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-500 whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <Plus className="size-3.5" />
                    Add Education
                  </button>
                </div>

                {draft.education.map((edu, idx) => (
                  <div
                    key={edu.id}
                    className="space-y-2.5 border-t border-white/10 pt-4 first:border-t-0 first:pt-0"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-[#EEF3FB]">
                        Qualification {idx + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeEducation(edu.id)}
                        className="text-xs text-rose-300 hover:text-rose-200 cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>

                    <input
                      type="text"
                      value={edu.qualification}
                      onChange={(e) =>
                        updateEducation(edu.id, { qualification: e.target.value })
                      }
                      placeholder="Degree, Certificate, or Grade 12"
                      className="w-full rounded-xl border border-white/10 bg-[#0B1120] px-3 py-2 text-xs text-[#EEF3FB] outline-none focus:border-blue-400"
                    />
                    <div className="grid gap-2.5 sm:grid-cols-3">
                      <input
                        type="text"
                        value={edu.institution}
                        onChange={(e) =>
                          updateEducation(edu.id, { institution: e.target.value })
                        }
                        placeholder="School / University"
                        className="sm:col-span-2 w-full rounded-xl border border-white/10 bg-[#0B1120] px-3 py-2 text-xs text-[#EEF3FB] outline-none focus:border-blue-400"
                      />
                      <input
                        type="text"
                        value={edu.yearCompleted}
                        onChange={(e) =>
                          updateEducation(edu.id, { yearCompleted: e.target.value })
                        }
                        placeholder="Year (e.g. 2025)"
                        className="w-full rounded-xl border border-white/10 bg-[#0B1120] px-3 py-2 text-xs text-[#EEF3FB] outline-none focus:border-blue-400"
                      />
                    </div>
                    <input
                      type="text"
                      value={edu.location}
                      onChange={(e) => updateEducation(edu.id, { location: e.target.value })}
                      placeholder="City / Country (e.g. Windhoek, Namibia)"
                      className="w-full rounded-xl border border-white/10 bg-[#0B1120] px-3 py-2 text-xs text-[#EEF3FB] outline-none focus:border-blue-400"
                    />
                    <input
                      type="text"
                      value={edu.details}
                      onChange={(e) => updateEducation(edu.id, { details: e.target.value })}
                      placeholder="Subjects, trade certificate, or honours (optional)"
                      className="w-full rounded-xl border border-white/10 bg-[#0B1120] px-3 py-2 text-xs text-[#EEF3FB] outline-none focus:border-blue-400"
                    />
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'skills' && (
              <div className="space-y-5">
                <div className="space-y-2.5">
                  <span className="block text-xs font-semibold text-[#EEF3FB]">Skills</span>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addSkill(skillInput);
                        }
                      }}
                      placeholder="Type a skill and press Add..."
                      className="flex-1 rounded-xl border border-white/10 bg-[#0B1120] px-3 py-2 text-xs text-[#EEF3FB] outline-none focus:border-blue-400"
                    />
                    <button
                      type="button"
                      onClick={() => addSkill(skillInput)}
                      className="rounded-xl bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-blue-500 whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      Add
                    </button>
                  </div>

                  {draft.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {draft.skills.map((skill) => (
                        <button
                          key={skill}
                          type="button"
                          onClick={() => removeSkill(skill)}
                          className="inline-flex items-center gap-1 rounded-lg border border-emerald-400/35 bg-emerald-500/15 px-2.5 py-1 text-xs font-medium text-emerald-200 hover:bg-rose-500/20 hover:border-rose-400/40 cursor-pointer"
                          title="Click to remove"
                        >
                          <span>{skill}</span>
                          <span aria-hidden="true">×</span>
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="pt-2">
                    <p className="text-[11px] text-[#9FB1CF] mb-1.5">
                      Quick-add common Namibian workplace skills:
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {NAMIBIA_COMMON_SKILLS.filter((s) => !draft.skills.includes(s)).map(
                        (skill) => (
                          <button
                            key={skill}
                            type="button"
                            onClick={() => addSkill(skill)}
                            className="rounded-lg border border-white/10 bg-[#0B1120] px-2.5 py-1 text-[11px] text-[#C2CEE3] hover:border-blue-400/45 hover:text-white cursor-pointer"
                          >
                            + {skill}
                          </button>
                        )
                      )}
                    </div>
                  </div>
                </div>

                <div className="border-t border-white/10 pt-4 space-y-2.5">
                  <span className="block text-xs font-semibold text-[#EEF3FB]">Languages</span>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={languageInput}
                      onChange={(e) => setLanguageInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addLanguage(languageInput);
                        }
                      }}
                      placeholder="e.g. Silozi (Fluent)"
                      className="flex-1 rounded-xl border border-white/10 bg-[#0B1120] px-3 py-2 text-xs text-[#EEF3FB] outline-none focus:border-blue-400"
                    />
                    <button
                      type="button"
                      onClick={() => addLanguage(languageInput)}
                      className="rounded-xl bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-blue-500 whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      Add
                    </button>
                  </div>

                  {draft.languages.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {draft.languages.map((lang) => (
                        <button
                          key={lang}
                          type="button"
                          onClick={() => removeLanguage(lang)}
                          className="inline-flex items-center gap-1 rounded-lg border border-blue-400/35 bg-blue-500/15 px-2.5 py-1 text-xs font-medium text-blue-200 hover:bg-rose-500/20 hover:border-rose-400/40 cursor-pointer"
                        >
                          <span>{lang}</span>
                          <span aria-hidden="true">×</span>
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {NAMIBIA_COMMON_LANGUAGES.filter((l) => !draft.languages.includes(l)).map(
                      (lang) => (
                        <button
                          key={lang}
                          type="button"
                          onClick={() => addLanguage(lang)}
                          className="rounded-lg border border-white/10 bg-[#0B1120] px-2.5 py-1 text-[11px] text-[#C2CEE3] hover:border-blue-400/45 hover:text-white cursor-pointer"
                        >
                          + {lang}
                        </button>
                      )
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'references' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-[#9FB1CF]">
                    Add store managers, lecturers, or previous supervisors.
                  </p>
                  <button
                    type="button"
                    onClick={addReference}
                    className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-500 whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <Plus className="size-3.5" />
                    Add Reference
                  </button>
                </div>

                {draft.references.map((ref, idx) => (
                  <div
                    key={ref.id}
                    className="space-y-2.5 border-t border-white/10 pt-4 first:border-t-0 first:pt-0"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-[#EEF3FB]">
                        Reference {idx + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeReference(ref.id)}
                        className="text-xs text-rose-300 hover:text-rose-200 cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                    <div className="grid gap-2.5 sm:grid-cols-2">
                      <input
                        type="text"
                        value={ref.name}
                        onChange={(e) => updateReference(ref.id, { name: e.target.value })}
                        placeholder="Full Name"
                        className="w-full rounded-xl border border-white/10 bg-[#0B1120] px-3 py-2 text-xs text-[#EEF3FB] outline-none focus:border-blue-400"
                      />
                      <input
                        type="text"
                        value={ref.title}
                        onChange={(e) => updateReference(ref.id, { title: e.target.value })}
                        placeholder="Role (e.g. Store Manager)"
                        className="w-full rounded-xl border border-white/10 bg-[#0B1120] px-3 py-2 text-xs text-[#EEF3FB] outline-none focus:border-blue-400"
                      />
                    </div>
                    <div className="grid gap-2.5 sm:grid-cols-2">
                      <input
                        type="text"
                        value={ref.organization}
                        onChange={(e) =>
                          updateReference(ref.id, { organization: e.target.value })
                        }
                        placeholder="Company / School"
                        className="w-full rounded-xl border border-white/10 bg-[#0B1120] px-3 py-2 text-xs text-[#EEF3FB] outline-none focus:border-blue-400"
                      />
                      <input
                        type="text"
                        value={ref.contact}
                        onChange={(e) => updateReference(ref.id, { contact: e.target.value })}
                        placeholder="Phone or Email"
                        className="w-full rounded-xl border border-white/10 bg-[#0B1120] px-3 py-2 text-xs text-[#EEF3FB] outline-none focus:border-blue-400"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'style' && (
              <div className="space-y-5">
                <div className="space-y-2.5">
                  <span className="block text-xs font-semibold text-[#EEF3FB]">
                    Document Layout Template
                  </span>
                  <div className="space-y-2">
                    {CV_TEMPLATES.map((tpl) => (
                      <button
                        key={tpl.id}
                        type="button"
                        onClick={() => updateField('template', tpl.id)}
                        className={`w-full text-left rounded-xl border p-3.5 transition-colors cursor-pointer ${
                          draft.template === tpl.id
                            ? 'border-blue-400 bg-blue-600/15'
                            : 'border-white/10 bg-[#0B1120] hover:border-white/25'
                        }`}
                      >
                        <p className="text-xs font-semibold text-[#EEF3FB]">{tpl.name}</p>
                        <p className="mt-0.5 text-[11px] text-[#9FB1CF]">{tpl.description}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2.5 border-t border-white/10 pt-4">
                  <span className="block text-xs font-semibold text-[#EEF3FB]">
                    Document Accent Tone
                  </span>
                  <div className="grid grid-cols-2 gap-2.5">
                    {CV_ACCENTS.map((accent) => (
                      <button
                        key={accent.id}
                        type="button"
                        onClick={() => updateField('accentColor', accent.id)}
                        className={`flex items-center gap-2.5 rounded-xl border px-3 py-2.5 text-xs font-medium transition-colors cursor-pointer ${
                          draft.accentColor === accent.id
                            ? 'border-blue-400 bg-blue-600/15 text-white'
                            : 'border-white/10 bg-[#0B1120] text-[#C2CEE3]'
                        }`}
                      >
                        <span
                          className="size-3.5 rounded-full shrink-0"
                          style={{ backgroundColor: accent.hex }}
                        />
                        <span>{accent.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Print & Download Bar + Crisp Live A4 CV Preview */}
        <div className="lg:col-span-7 space-y-3.5" ref={previewContainerRef}>
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-[#111A2E] px-4 py-3">
            <div className="text-xs text-[#9FB1CF]">
              <span className="font-semibold text-[#EEF3FB]">Live A4 CV Preview</span> ·{' '}
              <span>{draft.documentTitle || 'Untitled_CV'}</span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handlePrintPdf}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#0B1120] border border-white/15 px-3 py-1.5 text-xs font-semibold text-[#EEF3FB] hover:border-emerald-400/50 whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Printer className="size-3.5 text-emerald-400" />
                Print / Save PDF
              </button>
              <button
                type="button"
                onClick={handleDownloadHtml}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#0B1120] border border-white/15 px-3 py-1.5 text-xs font-semibold text-[#EEF3FB] hover:border-blue-400/50 whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Download className="size-3.5 text-blue-400" />
                Download HTML
              </button>
              <button
                type="button"
                onClick={handleDownloadTxt}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#0B1120] border border-white/15 px-3 py-1.5 text-xs font-semibold text-[#EEF3FB] hover:border-blue-400/50 whitespace-nowrap shrink-0 cursor-pointer"
              >
                <FileText className="size-3.5 text-[#9FB1CF]" />
                ATS Text (.txt)
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#080D1A] p-3 sm:p-5 overflow-x-auto">
            <CvPreviewSheet cv={draft} />
          </div>
        </div>
      </div>
    </section>
  );
}
