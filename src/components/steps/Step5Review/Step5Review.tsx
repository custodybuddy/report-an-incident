import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { IncidentData, ReportData } from '@/types';
import H1 from '../../ui/H1';
import H3 from '../../ui/H3';
import OutlineCard from '../../ui/OutlineCard';
import SummaryPanel from './components/SummaryPanel';
import EvidenceList from './components/EvidenceList';
import LegalReferencesSection from './components/LegalReferencesSection';
import { useCopyToClipboard } from './hooks/useCopyToClipboard';
import { useLegalReferences } from './hooks/useLegalReferences';
import { formatHtmlContent } from './utils/html';

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
      { label: 'Case Number', value: reportData?.caseNumber || incidentData.caseNumber || 'N/A' },
    ],
    [incidentData.caseNumber, incidentData.jurisdiction, reportData?.caseNumber, reportData?.category]
  );
  const [primaryStat, ...secondaryStats] = overviewStats;

  const severityJustificationHtml = useMemo(
    () => formatHtmlContent(reportData?.severityJustification),
    [reportData?.severityJustification]
  );
  const summaryHtml = useMemo(
    () => formatHtmlContent(reportData?.professionalSummary),
    [reportData?.professionalSummary]
  );
  const legalInsightsHtml = useMemo(
    () => formatHtmlContent(reportData?.legalInsights),
    [reportData?.legalInsights]
  );

  const { statuteReferences, caseLawReferences, potentialSources } = useLegalReferences({
    legalInsights: reportData?.legalInsights,
    sources: reportData?.sources ?? [],
  });

  const getSummaryText = useCallback(
    () => summaryRef.current?.innerText?.trim() ?? reportData?.professionalSummary?.trim() ?? '',
    [reportData?.professionalSummary]
  );

  const { copyState, handleCopy, buttonLabel } = useCopyToClipboard({ getText: getSummaryText });

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

      <SummaryPanel
        primaryStat={primaryStat}
        secondaryStats={secondaryStats}
        severity={reportData.severity}
        severityStyles={severityStyles}
        summaryHtml={summaryHtml}
        summaryRef={summaryRef}
        summaryButtonLabel={buttonLabel}
        copyState={copyState}
        onCopySummary={handleCopy}
        severityJustificationHtml={severityJustificationHtml}
        onExport={onExport}
        onPrint={onPrint}
      />

      <EvidenceList evidence={incidentData.evidence} />

      <LegalReferencesSection
        legalInsightsHtml={legalInsightsHtml}
        statuteReferences={statuteReferences}
        caseLawReferences={caseLawReferences}
        potentialSources={potentialSources}
      />

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
