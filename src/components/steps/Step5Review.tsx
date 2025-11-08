import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { type IncidentData, type ReportData } from '../../../types';
import { formatReportContent } from '../ui/utils/markdownParser';
import Button from '../ui/Button';
import H2 from '../ui/H2';
import H3 from '../ui/H3';
import H1 from '../ui/H1';
import OutlineCard from '../ui/OutlineCard';
import StatCard from '../ui/StatCard';
import MetadataBadge from '../ui/MetadataBadge';
import { ResourceLinkCard, ResourceLinkList } from '../ui/ResourceLinks';

interface Step5ReviewProps {
  incidentData: IncidentData;
  reportData: ReportData | null;
  isGeneratingSummary: boolean;
  onExport: () => void;
  onPrint: () => void;
}

const LOADING_MESSAGES = [
  'Analyzing your narrative for key facts...',
  'Categorizing the incident based on legal standards...',
  'Identifying relevant legal considerations for your jurisdiction...',
  'Compiling the professional summary...',
  'Finalizing the report structure...',
];

const NOTES_MIN_HEIGHT = 220;

const severityThemes = {
  high: {
    card: 'bg-[#2C0F12] border-[#FFB3B3]/60 shadow-[0_10px_25px_rgba(255,59,59,0.25)]',
    label: 'text-[#FFD700]',
    value: 'text-[#FFD7A3]',
    accent: 'text-[#FFD700]',
  },
  medium: {
    card: 'bg-[#2A1A04] border-[#F4E883]/60 shadow-[0_10px_25px_rgba(244,232,131,0.2)]',
    label: 'text-[#FFD700]',
    value: 'text-[#F4E883]',
    accent: 'text-[#FFD700]',
  },
  low: {
    card: 'bg-[#0a2a1f] border-[#6fe0b1]/50 shadow-[0_10px_25px_rgba(0,128,96,0.2)]',
    label: 'text-[#F4E883]',
    value: 'text-[#CFEFDA]',
    accent: 'text-[#F4E883]',
  },
  default: {
    card: 'bg-[#01192C] border-[#F4E883]/60 shadow-[0_10px_25px_rgba(0,0,0,0.35)]',
    label: 'text-[#FFD700]',
    value: 'text-[#FFD700]',
    accent: 'text-[#FFD700]',
  },
} as const;

type CopyState = 'idle' | 'copied' | 'error';

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
        className="h-14 w-14 animate-spin text-[#FFD700]"
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
        <H3 className="heading-gold text-2xl font-normal">Generating AI analysis…</H3>
        <p className="mt-2 max-w-sm text-sm text-[#CFCBBF]/80">{LOADING_MESSAGES[messageIndex]}</p>
      </div>
    </div>
  );
};

const formatHtml = (content?: string) => formatReportContent(content ?? '');

type LegalReference = { label: string; url: string; context?: string };

const isSentenceBoundary = (char: string) => /[.!?]/.test(char);

const sanitizeMarkdownText = (text: string): string =>
  text
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\[(.*?)\]\((.*?)\)/g, '$1')
    .replace(/`/g, '')
    .trim();

const extractMarkdownLinks = (markdown?: string): LegalReference[] => {
  if (!markdown) {
    return [];
  }

  const regex = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g;
  const links: LegalReference[] = [];
  const seen = new Set<string>();
  let match: RegExpExecArray | null;

  while ((match = regex.exec(markdown)) !== null) {
    const [fullMatch, label, url] = match;
    if (seen.has(url)) continue;
    seen.add(url);

    let start = match.index;
    while (start > 0) {
      const prevChar = markdown[start - 1];
      if (isSentenceBoundary(prevChar) || prevChar === '\n') break;
      start -= 1;
    }

    let end = match.index + fullMatch.length;
    while (end < markdown.length) {
      const nextChar = markdown[end];
      if (isSentenceBoundary(nextChar)) {
        end += 1;
        break;
      }
      if (nextChar === '\n') break;
      end += 1;
    }

    const context = sanitizeMarkdownText(markdown.slice(start, end).trim());
    links.push({ label: label.trim(), url, context });
  }

  return links;
};

const isCaseLawSource = (url: string): boolean =>
  /(canlii|court|appeal|uscourts|supreme|tribunal|judgment|caselaw|gov\.uk\/guidance)/i.test(url);

const deriveReadableTitle = (url: string): string => {
  try {
    const parsed = new URL(url);
    const hostname = parsed.hostname.replace(/^www\./, '');
    const segments = parsed.pathname.split('/').filter(Boolean);
    if (segments.length === 0) {
      return hostname;
    }
    const candidate = decodeURIComponent(segments[segments.length - 1])
      .replace(/\.[a-z]+$/i, '')
      .replace(/[-_]/g, ' ')
      .trim();
    return candidate.length > 3 ? candidate : hostname;
  } catch {
    return url;
  }
};

const Step5Review: React.FC<Step5ReviewProps> = ({
  incidentData,
  reportData,
  isGeneratingSummary,
  onExport,
  onPrint,
}) => {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const notesRef = useRef<HTMLTextAreaElement>(null);
  const summaryRef = useRef<HTMLDivElement>(null);
  const [personalNotes, setPersonalNotes] = useState('');
  const [copyState, setCopyState] = useState<CopyState>('idle');

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

  const generatedAt = useMemo(
    () =>
      new Intl.DateTimeFormat(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short',
      }).format(new Date()),
    []
  );

  const severityKey = (reportData?.severity ?? '').toLowerCase() as keyof typeof severityThemes;
  const severityStyles = severityThemes[severityKey] ?? severityThemes.default;

  const overviewStats = useMemo(
    () => [
      { label: 'Category', value: reportData?.category ?? 'N/A' },
      { label: 'Jurisdiction', value: incidentData.jurisdiction || 'Not specified' },
      { label: 'Case Number', value: reportData?.caseNumber || incidentData.caseNumber || 'N/A' }
    ],
    [incidentData.caseNumber, incidentData.jurisdiction, reportData?.caseNumber, reportData?.category]
  );
  const [primaryStat, ...secondaryStats] = overviewStats;

  const severityJustificationHtml = useMemo(
    () => formatHtml(reportData?.severityJustification),
    [reportData?.severityJustification]
  );
  const summaryHtml = useMemo(
    () => formatHtml(reportData?.professionalSummary),
    [reportData?.professionalSummary]
  );
  const legalInsightsHtml = useMemo(
    () => formatHtml(reportData?.legalInsights),
    [reportData?.legalInsights]
  );

  const sources = reportData?.sources ?? [];
  const inlineReferences = useMemo(
    () => extractMarkdownLinks(reportData?.legalInsights),
    [reportData?.legalInsights]
  );
  const referenceMap = useMemo(() => {
    const map = new Map<string, LegalReference>();
    inlineReferences.forEach(ref => map.set(ref.url, ref));
    return map;
  }, [inlineReferences]);

  const { statuteReferences, caseLawReferences, potentialSources } = useMemo(() => {
    const statuteRefs: LegalReference[] = [];
    const caseLawRefs: LegalReference[] = [];
    const infoSources: string[] = [];

    sources.forEach(url => {
      if (isCaseLawSource(url)) {
        caseLawRefs.push(referenceMap.get(url) ?? { label: deriveReadableTitle(url), url });
      } else {
        infoSources.push(url);
        if (!referenceMap.has(url) && inlineReferences.length > 0) {
          statuteRefs.push({ label: deriveReadableTitle(url), url });
        }
      }
    });

    // Add inline-only statute references that may not be in sources
    inlineReferences.forEach(ref => {
      if (!isCaseLawSource(ref.url) && !statuteRefs.find(item => item.url === ref.url)) {
        statuteRefs.push(ref);
      }
      if (isCaseLawSource(ref.url) && !caseLawRefs.find(item => item.url === ref.url)) {
        caseLawRefs.push(ref);
      }
    });

    return {
      statuteReferences: statuteRefs,
      caseLawReferences: caseLawRefs,
      potentialSources: infoSources,
    };
  }, [inlineReferences, referenceMap, sources]);
  const evidenceCount = incidentData.evidence.length;
  const evidenceLabel = `${evidenceCount} ${evidenceCount === 1 ? 'Item' : 'Items'}`;

  const getDomainFromUrl = (url: string): string => {
    try {
      return new URL(url).hostname.replace(/^www\./, '');
    } catch {
      const parts = url.split('/');
      return parts[2] || url;
    }
  };

  const handleCopySummary = useCallback(async () => {
    const summaryText =
      summaryRef.current?.innerText?.trim() ?? reportData?.professionalSummary?.trim() ?? '';

    if (!summaryText) {
      setCopyState('error');
      setTimeout(() => setCopyState('idle'), 2000);
      return;
    }

    const fallbackCopy = () => {
      if (typeof document === 'undefined') {
        throw new Error('Document is not available');
      }
      const temp = document.createElement('textarea');
      temp.value = summaryText;
      temp.setAttribute('readonly', '');
      temp.style.position = 'absolute';
      temp.style.left = '-9999px';
      document.body.appendChild(temp);
      temp.select();
      document.execCommand('copy');
      document.body.removeChild(temp);
    };

    const resetStatus = () => {
      setTimeout(() => setCopyState('idle'), 2000);
    };

    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(summaryText);
      } else {
        fallbackCopy();
      }
      setCopyState('copied');
      resetStatus();
    } catch {
      try {
        fallbackCopy();
        setCopyState('copied');
      } catch {
        setCopyState('error');
      } finally {
        resetStatus();
      }
    }
  }, [reportData?.professionalSummary]);

  if (isGeneratingSummary) {
    return <LoadingSpinner />;
  }

  if (!reportData) {
    return (
      <div className="rounded-3xl border border-slate-800/80 bg-slate-950/70 p-10 text-center text-sm text-[#CFCBBF]/80 shadow-2xl">
        <p>No AI summary is available yet. Generate the report to review the analysis.</p>
      </div>
    );
  }

  const renderHtml = (html: string, emptyFallback = 'Information is not yet available.') => ({
    __html: html || `<p class="text-[#CFCBBF]">${emptyFallback}</p>`,
  });

  const summaryButtonLabel =
    copyState === 'copied' ? '✓ Copied' : copyState === 'error' ? 'Copy failed' : 'Copy summary';

  return (
    <div className="space-y-10 text-[#CFCBBF] leading-relaxed font-normal">
      <OutlineCard
        borderClassName="border-white/10"
        backgroundClassName="bg-gradient-to-br from-slate-950/85 via-slate-950/60 to-slate-900/60"
        className="sm:p-8"
      >
        <H3 className="text-xs font-semibold uppercase tracking-[0.3em] text-[#FFD700]">
          AI Generated Report
        </H3>
        <H1
          ref={headingRef}
          tabIndex={-1}
          className="heading-gold mt-3 text-3xl sm:text-4xl font-normal leading-tight"
        >
          Incident Report: {reportData.title || 'Pending Title'}
        </H1>
        <p className="mt-4 text-sm text-[#CFCBBF]">
          Prepared by CustodyBuddy Incident Reporter • {generatedAt}
        </p>
      </OutlineCard>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {primaryStat ? <StatCard label={primaryStat.label} value={primaryStat.value} /> : null}
        <div className={`rounded-2xl border p-4 shadow-lg ${severityStyles.card}`}>
          <p className={`heading-gold text-xs font-normal uppercase tracking-[0.3em] ${severityStyles.label}`}>
            Severity
          </p>
          <p className={`mt-2 text-2xl font-semibold ${severityStyles.value}`}>
            {reportData.severity ?? 'N/A'}
          </p>
        </div>
        {secondaryStats.map(stat => (
          <StatCard key={stat.label} label={stat.label} value={stat.value} />
        ))}
      </section>

      <section className="grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
        <OutlineCard>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-[#F4E883]">Professional Summary</p>
              <H3 className="heading-gold text-2xl font-normal tracking-tight">Review The Narrative</H3>
            </div>
            <button
              type="button"
              onClick={handleCopySummary}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition focus-visible:outline-[#F4E883] focus-visible:outline-offset-2 ${
                copyState === 'copied'
                  ? 'bg-[#3AD79B] text-[#011626]'
                  : copyState === 'error'
                    ? 'bg-red-500 text-white'
                    : 'bg-[#FFD700] text-[#011626] hover:bg-[#F4E883]'
              }`}
            >
              {summaryButtonLabel}
            </button>
          </div>
          <div
            ref={summaryRef}
            className="prose prose-invert prose-base mt-6 max-w-none space-y-4 text-[#CFCBBF]"
            dangerouslySetInnerHTML={renderHtml(summaryHtml, 'Summary has not been generated yet.')}
          />
        </OutlineCard>

        <div className="space-y-6">
          <article
            className={`rounded-3xl p-6 shadow-[0_18px_40px_rgba(0,0,0,0.45)] ${severityStyles.card}`}
          >
            <div className="flex items-center justify-between">
              <H3 className={`heading-gold text-xl font-normal ${severityStyles.label}`}>Severity Rationale</H3>
              <span className={`text-sm font-semibold ${severityStyles.value}`}>
                {reportData.severity ?? 'N/A'}
              </span>
            </div>
            <div
              className="prose prose-invert prose-sm mt-4 max-w-none text-[#CFCBBF]"
              dangerouslySetInnerHTML={renderHtml(severityJustificationHtml)}
            />
          </article>

          <OutlineCard backgroundClassName="bg-[#021223]" className="space-y-4">
            <div>
              <H3 className="heading-gold text-xl font-normal">Share &amp; Store</H3>
              <p className="text-sm text-[#CFCBBF]/85">
                Export a printable package or open the browser print dialog to save a PDF copy.
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <Button onClick={onExport} className="justify-center">
                Export HTML Report
              </Button>
              <Button variant="secondary" onClick={onPrint} className="justify-center">
                Print / Save PDF
              </Button>
            </div>
            <p className="text-xs text-[#CFCBBF]/70">
              Files remain local to this device until you export or print. Always secure sensitive data
              before sharing.
            </p>
          </OutlineCard>
        </div>
      </section>

      <section className="rounded-3xl border border-[#F4E883] bg-[#01192C] p-6 shadow-[0_20px_45px_rgba(0,0,0,0.45)]">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <H3 className="heading-gold text-2xl font-normal">
            Evidence Log <span className="text-sm font-semibold text-[#CFCBBF]/80">({evidenceLabel})</span>
          </H3>
          {evidenceCount > 0 && <MetadataBadge>Maintain secure backups</MetadataBadge>}
        </div>
        {evidenceCount > 0 ? (
          <div className="mt-6 space-y-4">
            {incidentData.evidence.map((evidence, index) => (
              <article
                key={evidence.id}
                className="rounded-2xl border border-[#F4E883]/40 bg-[#021223] p-4 text-sm text-[#CFCBBF] shadow-lg shadow-black/20"
              >
                <header className="flex flex-wrap items-center justify-between gap-2 border-b border-[#F4E883]/30 pb-2">
                  <p className="font-semibold text-[#FFD700]">
                    EVIDENCE {String(index + 1).padStart(3, '0')}: {evidence.name}
                  </p>
                  <span className="text-xs text-[#CFCBBF]/70">
                    {(evidence.size / 1024).toFixed(1)} kB · {evidence.category}
                  </span>
                </header>
                <dl className="mt-3 grid gap-3 text-xs text-[#CFCBBF]/80 sm:grid-cols-2">
                  <div>
                    <dt className="font-semibold uppercase tracking-widest text-[#F7EF8A]/80">Type</dt>
                    <dd className="mt-1 text-[#CFCBBF]">{evidence.type || 'Not provided'}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold uppercase tracking-widest text-[#F7EF8A]/80">
                      Description
                    </dt>
                    <dd className="mt-1 text-[#CFCBBF]">
                      {evidence.description || 'Not documented'}
                    </dd>
                  </div>
                </dl>
                {evidence.aiAnalysis ? (
                      <p className="mt-3 rounded-2xl border border-[#F4E883]/40 bg-[#071B2A] p-3 text-xs text-[#CFCBBF]">
                        <span className="heading-gold font-normal">AI insight:</span>{' '}
                        {evidence.aiAnalysis}
                      </p>
                ) : null}
              </article>
            ))}
            <article className="rounded-2xl border border-[#F4E883]/50 bg-[#021223] p-4 text-sm text-[#CFCBBF]">
              <H3 className="heading-gold font-normal uppercase tracking-widest text-base">Reminder</H3>
              <p className="mt-1">
                Keep digital and physical copies of all evidence securely stored with timestamps for
                counsel or court staff.
              </p>
            </article>
          </div>
        ) : (
          <p className="mt-4 text-sm text-[#CFCBBF]/85">No supporting evidence was uploaded.</p>
        )}
      </section>

      <section className="space-y-8">
        <H2 className="print-page-break heading-gold text-2xl font-normal mt-10 mb-2 border-l-4 border-[#F4E883] pl-4 tracking-tight">
          II. Additional Legal Context
        </H2>
        <OutlineCard className="space-y-8">
          <section className="space-y-3">
            <div className="flex flex-wrap items-center gap-2 border-b border-[#F4E883]/30 pb-2">
              <H3 className="heading-gold text-xl font-normal">III. Key Legal Narrative</H3>
              <MetadataBadge variant="subtle">Informational Only</MetadataBadge>
            </div>
            <p className="text-xs font-semibold text-[#F4E883]">
              Disclaimer: This is not legal advice. Validate with licensed counsel in your jurisdiction.
            </p>
            <div
              className="prose prose-invert prose-sm max-w-none text-[#CFCBBF]"
              dangerouslySetInnerHTML={renderHtml(legalInsightsHtml, 'No legal insights were generated.')}
            />
          </section>

          <section className="space-y-4">
            <H3 className="heading-gold text-xl font-normal border-b border-[#F4E883]/30 pb-1">
              IV. Governing Statutes (The Written Law)
            </H3>
            {statuteReferences.length > 0 ? (
              <div className="space-y-4 text-[#CFCBBF]">
                {statuteReferences.map((ref, index) => (
                  <ResourceLinkCard
                    key={ref.url}
                    index={index}
                    title={ref.label}
                    url={ref.url}
                    description={
                      ref.context ||
                      'Reference this authority when documenting how the incident aligns with statutory requirements.'
                    }
                  />
                ))}
              </div>
            ) : (
              <p className="text-sm text-[#CFCBBF]/80">
                The AI summary did not cite specific statutes for this incident.
              </p>
            )}
          </section>

          {caseLawReferences.length > 0 ? (
            <section className="space-y-4">
              <H3 className="heading-gold text-xl font-normal border-b border-[#F4E883]/30 pb-1">
                V. High-Precedent Case Law (Judicial Interpretation)
              </H3>
              <div className="space-y-4 text-[#CFCBBF]">
                {caseLawReferences.map((ref, index) => (
                  <ResourceLinkCard
                    key={ref.url}
                    index={index}
                    title={ref.label || deriveReadableTitle(ref.url)}
                    url={ref.url}
                    metadata={`Jurisdiction: ${getDomainFromUrl(ref.url)}`}
                    linkLabel="Citation Link"
                    description={
                      ref.context || 'Review this case to understand how courts weigh similar fact patterns.'
                    }
                  />
                ))}
              </div>
            </section>
          ) : null}

          <section className="space-y-3">
            <H3 className="heading-gold text-xl font-normal border-b border-[#F4E883]/30 pb-1">
              VI. Related Legal Concepts / Glossary
            </H3>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-2xl border border-[#F4E883]/40 bg-[#021223] p-3 shadow-inner shadow-black/20">
                <strong className="heading-gold block text-base font-normal">Document Preservation</strong>
                <p className="text-sm text-[#CFCBBF]/90">
                  Keep certified copies of every exhibit (screenshots, emails, call logs) with timestamps
                  for court submission.
                </p>
              </div>
              <div className="rounded-2xl border border-[#F4E883]/40 bg-[#021223] p-3 shadow-inner shadow-black/20">
                <strong className="heading-gold block text-base font-normal">Best Interests Analysis</strong>
                <p className="text-sm text-[#CFCBBF]/90">
                  Courts prioritize child safety, stability, and continuity of care when reviewing
                  co-parenting disputes.
                </p>
              </div>
            </div>
          </section>
        </OutlineCard>

        <H2 className="heading-gold text-2xl font-normal mt-8 mb-3 border-l-4 border-[#F4E883] pl-4">
          Potential Legal & Informational Sources
        </H2>
        <OutlineCard>
          <ResourceLinkList
            items={potentialSources.map(url => ({
              title: deriveReadableTitle(url),
              url,
              description: url,
            }))}
            emptyMessage="No supplemental research links were attached for this report."
          />
        </OutlineCard>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <OutlineCard>
          <H3 className="heading-gold text-xl font-normal">Personal Notes (Private)</H3>
          <p className="mt-1 text-xs text-[#CFCBBF]/70">
            These notes remain local to this browser session and are never exported.
          </p>
          <textarea
            ref={notesRef}
            id="personal-notes"
            value={personalNotes}
            onChange={event => setPersonalNotes(event.target.value)}
            placeholder="Capture follow-up actions, reminders, or attorney questions…"
            className="mt-4 w-full resize-none rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-3 text-sm text-[#CFCBBF] outline-none transition focus:border-[#F4E883] focus:ring-4 focus:ring-[#F4E883]/30 placeholder:text-[#CFCBBF]/40"
            style={{ minHeight: NOTES_MIN_HEIGHT }}
          />
        </OutlineCard>
        <OutlineCard>
          <H3 className="heading-gold text-xl font-normal">Session Security</H3>
          <p className="text-sm text-[#CFCBBF]/90">
            This workspace encrypts data locally and purges it when you reset the incident or close the tab.
          </p>
          <ul className="list-disc space-y-2 pl-5 text-sm text-[#CFCBBF]/85">
            <li>Keep exported files on encrypted or access-controlled drives.</li>
            <li>Only share reports with counsel or professionals bound by confidentiality.</li>
            <li>Delete temporary downloads after you deliver them.</li>
          </ul>
        </OutlineCard>
      </section>
    </div>
  );
};

export default Step5Review;
