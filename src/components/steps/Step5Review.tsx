import React, { useEffect, useMemo, useRef, useState } from 'react';
import { type IncidentData, type ReportData, type ModalInfo } from '../../../types';
import { formatReportContent } from '../ui/utils/markdownParser';
import Button from '../ui/Button';

interface Step5ReviewProps {
  incidentData: IncidentData;
  reportData: ReportData | null;
  isGeneratingSummary: boolean;
  onExport: () => void;
  onPrint: () => void;
  setModal: (modal: ModalInfo) => void;
}

const LOADING_MESSAGES = [
  'Analyzing your narrative for key facts...',
  'Categorizing the incident based on legal standards...',
  'Identifying relevant legal considerations for your jurisdiction...',
  'Compiling the professional summary...',
  'Finalizing the report structure...',
];

const NOTES_MIN_HEIGHT = 220;
const CARD_CLASS = 'rounded-2xl border border-slate-800/60 bg-slate-950/70 shadow-lg';

const LoadingSpinner: React.FC = () => {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(
      () => setMessageIndex(prev => (prev + 1) % LOADING_MESSAGES.length),
      2500
    );
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      role="status"
      aria-live="polite"
      className="flex min-h-[400px] flex-col items-center justify-center gap-6 p-10 text-center"
    >
      <svg
        aria-hidden="true"
        className="h-14 w-14 animate-spin text-amber-400"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
      <div>
        <h3 className="text-2xl font-semibold text-slate-100">Generating AI analysis…</h3>
        <p className="mt-2 max-w-sm text-sm text-slate-400">{LOADING_MESSAGES[messageIndex]}</p>
      </div>
    </div>
  );
};

const SectionCard: React.FC<{
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}> = ({ title, description, children, className = '' }) => (
  <section className={`${CARD_CLASS} p-6 sm:p-8 ${className}`}>
    <header className="mb-5 space-y-2">
      <div className="flex items-center gap-3">
        <span className="h-6 w-1 rounded-full bg-amber-400" aria-hidden="true"></span>
        <h3 className="text-lg font-semibold text-amber-200">{title}</h3>
      </div>
      {description ? <p className="text-sm text-slate-400">{description}</p> : null}
    </header>
    <div className="text-sm text-slate-200">{children}</div>
  </section>
);

const MetadataStat: React.FC<{ icon: React.ReactNode; label: string; value: string }> = ({
  icon,
  label,
  value,
}) => (
  <div className="flex items-center gap-3 rounded-xl border border-slate-800/80 bg-slate-900/60 px-4 py-3">
    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-400/10 text-amber-300">
      {icon}
    </div>
    <div>
      <p className="text-xs font-semibold uppercase tracking-widest text-amber-200/90">{label}</p>
      <p className="text-sm font-semibold text-amber-100">{value}</p>
    </div>
  </div>
);

const DetailSection: React.FC<{
  title: string;
  body: string;
  isHtml?: boolean;
  bodyClassName?: string;
}> = ({ title, body, isHtml = false, bodyClassName = '' }) => (
  <SectionCard title={title}>
    {isHtml ? (
      <div
        className={`prose prose-invert prose-sm prose-headings:text-amber-200 max-w-none leading-relaxed text-slate-200 ${bodyClassName}`}
        dangerouslySetInnerHTML={{ __html: body }}
      />
    ) : (
      <p className={`whitespace-pre-wrap text-base leading-relaxed text-slate-100 ${bodyClassName}`}>
        {body || 'N/A'}
      </p>
    )}
  </SectionCard>
);

const ResourceLink: React.FC<{ href: string; domain: string; index: number }> = ({
  href,
  domain,
  index,
}) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className="group flex items-center gap-5 rounded-2xl border border-amber-400/20 bg-gradient-to-br from-amber-400/10 via-transparent to-transparent px-5 py-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-amber-300/40 hover:bg-amber-400/15"
  >
    <span className="flex h-8 min-w-[2.5rem] items-center justify-center rounded-full bg-slate-950/70 text-xs font-semibold uppercase tracking-widest text-amber-200/90">
      {index + 1 < 10 ? `0${index + 1}` : index + 1}
    </span>
    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-400/20 text-amber-100 transition-colors group-hover:bg-amber-300/30 group-hover:text-amber-50">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M10 13a5 5 0 0 0 7.54.54l2-2a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
        <path d="M14 11a5 5 0 0 0-7.54-.54l-2 2a5 5 0 0 0 7.07 7.07l1.72-1.71" />
      </svg>
    </div>
    <div className="min-w-0 flex-1">
      <p className="truncate text-sm font-semibold text-amber-100 transition group-hover:text-amber-50">
        {domain}
      </p>
      <p className="truncate text-xs text-slate-300 transition group-hover:text-amber-100/80">
        {href}
      </p>
    </div>
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="flex-shrink-0 text-amber-200 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-amber-100"
      aria-hidden="true"
    >
      <path d="M5 12h14" />
      <path d="m13 5 7 7-7 7" />
    </svg>
  </a>
);

const Step5Review: React.FC<Step5ReviewProps> = ({
  incidentData,
  reportData,
  isGeneratingSummary,
  onExport,
  onPrint,
  setModal: _setModal,
}) => {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const notesRef = useRef<HTMLTextAreaElement>(null);
  const [personalNotes, setPersonalNotes] = useState('');

  useEffect(() => {
    if (!isGeneratingSummary && reportData && headingRef.current) {
      headingRef.current.focus({ preventScroll: true });
    }
  }, [isGeneratingSummary, reportData]);

  useEffect(() => {
    const textarea = notesRef.current;
    if (!textarea) return;

    textarea.style.height = 'auto';
    textarea.style.height = `${Math.max(textarea.scrollHeight, NOTES_MIN_HEIGHT)}px`;
  }, [personalNotes]);

  const metadata = useMemo(() => {
    if (!reportData) return [];
    return [
      {
        label: 'Category',
        value: reportData.category ?? 'N/A',
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
            <line x1="7" y1="7" x2="7.01" y2="7" />
          </svg>
        ),
      },
      {
        label: 'Severity',
        value: reportData.severity ?? 'N/A',
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            <path d="M12 8v4" />
            <path d="M12 16h.01" />
          </svg>
        ),
      },
      {
        label: 'Case Number',
        value: reportData.caseNumber ?? 'Not provided',
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
          </svg>
        ),
      },
    ];
  }, [reportData]);

  const detailSections = useMemo(() => {
    if (!reportData) return [];
    return [
      { title: 'Incident Title', body: reportData.title ?? 'N/A' },
      {
        title: 'Severity Justification',
        body: formatReportContent(reportData.severityJustification ?? ''),
        isHtml: true,
      },
      {
        title: 'Professional Summary',
        body: formatReportContent(reportData.professionalSummary ?? ''),
        isHtml: true,
      },
      {
        title: 'Legal Insights & Considerations',
        body: formatReportContent(reportData.legalInsights ?? ''),
        isHtml: true,
        bodyClassName:
          'prose-p:mb-4 prose-p:text-slate-100 prose-p:leading-relaxed prose-ul:list-disc prose-ul:ml-5 prose-li:marker:text-amber-300',
      },
    ];
  }, [reportData]);

  const sources = reportData?.sources ?? [];

  const getDomainFromUrl = (url: string): string => {
    try {
      return new URL(url).hostname.replace(/^www\./, '');
    } catch {
      const parts = url.split('/');
      return parts[2] || url;
    }
  };

  if (isGeneratingSummary) {
    return <LoadingSpinner />;
  }

  if (!reportData) {
    return (
      <div className={`${CARD_CLASS} p-10 text-center text-sm text-slate-300`}>
        <p>No AI summary is available yet. Generate the report to review the analysis.</p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <header className="space-y-3 text-center lg:text-left">
        <h2
          ref={headingRef}
          tabIndex={-1}
          className="text-3xl font-semibold tracking-tight text-amber-200 outline-none"
        >
          Review &amp; Finalize
        </h2>
        <p className="mx-auto max-w-2xl text-sm text-slate-400 lg:mx-0">
          Scan the generated report, ensure the details align with your records, and add any personal
          notes before exporting or printing the final document.
        </p>
      </header>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(260px,1fr)]">
        <div className="space-y-6">
          {detailSections.map(section => (
            <DetailSection key={section.title} title={section.title} body={section.body} isHtml={section.isHtml} />
          ))}

          <SectionCard
            title="Reference Sources"
            description="Authoritative links surfaced by the AI analysis."
          >
            {sources.length > 0 ? (
              <div className="grid gap-3">
                {sources.map((source, index) => (
                  <ResourceLink
                    key={source}
                    href={source}
                    domain={getDomainFromUrl(source)}
                    index={index}
                  />
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-400">No external sources were provided for this report.</p>
            )}
          </SectionCard>

          <SectionCard
            title="Evidence On File"
            description="Files and notes you attached while documenting the incident."
          >
            {incidentData.evidence.length > 0 ? (
              <div className="space-y-4">
                {incidentData.evidence.map(evidence => (
                  <article
                    key={evidence.id}
                    className="rounded-xl border border-slate-800/70 bg-slate-900/60 p-4 text-sm text-slate-200"
                  >
                    <header className="flex flex-wrap items-baseline justify-between gap-2">
                      <p className="font-semibold text-amber-200 break-all">{evidence.name}</p>
                      <span className="text-xs text-slate-500">
                        {(evidence.size / 1024).toFixed(1)} kB
                      </span>
                    </header>
                    <dl className="mt-3 grid gap-2 text-xs text-slate-400 sm:grid-cols-2">
                      <div>
                        <dt className="font-medium text-slate-300">Category</dt>
                        <dd>{evidence.category}</dd>
                      </div>
                      <div>
                        <dt className="font-medium text-slate-300">Description</dt>
                        <dd>{evidence.description || 'Not documented'}</dd>
                      </div>
                    </dl>
                    {evidence.aiAnalysis ? (
                      <p className="mt-3 rounded-lg border border-amber-300/30 bg-amber-400/5 p-3 text-xs text-amber-100">
                        <span className="font-semibold text-amber-200">AI insight:</span>{' '}
                        {evidence.aiAnalysis}
                      </p>
                    ) : null}
                  </article>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-400">No supporting evidence was uploaded.</p>
            )}
          </SectionCard>
        </div>

        <aside className="space-y-6">
          <SectionCard title="Report Overview">
            <div className="space-y-3">
              {metadata.map(meta => (
                <MetadataStat key={meta.label} icon={meta.icon} label={meta.label} value={meta.value} />
              ))}
            </div>
          </SectionCard>

          <SectionCard title="Personal Notes" description="Visible only to you and not included in exports.">
            <textarea
              ref={notesRef}
              id="personal-notes"
              value={personalNotes}
              onChange={event => setPersonalNotes(event.target.value)}
              placeholder="Capture reminders or follow-up items before you export."
              className="w-full resize-none rounded-xl border border-slate-800 bg-slate-900/70 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-amber-400 focus:ring-4 focus:ring-amber-300/40 placeholder:text-slate-500"
              style={{ minHeight: NOTES_MIN_HEIGHT }}
            />
          </SectionCard>

          <SectionCard title="Next Steps" className="flex flex-col gap-6" description="Choose how you want to share or store the report.">
            <div className="flex flex-col gap-3">
              <Button onClick={onExport} className="justify-center">
                Export report
              </Button>
              <Button onClick={onPrint} variant="secondary" className="justify-center">
                Print summary
              </Button>
            </div>
            <p className="text-xs text-slate-500">
              Your data remains encrypted in this browser session until you export or print. Make sure to
              store the generated file securely.
            </p>
          </SectionCard>
        </aside>
      </div>
    </div>
  );
};

export default Step5Review;
