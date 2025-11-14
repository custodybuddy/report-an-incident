import React, { useEffect, useRef, useState } from 'react';
import type { IncidentData, ReportData } from '@/types';
import H3 from '../../ui/H3';
import SummaryPanel from './components/SummaryPanel';
import LegalReferencesSection from './components/LegalReferencesSection';
import EvidenceSection from './components/EvidenceSection';
import ReviewHeader from './components/ReviewHeader';
import SessionSecuritySection from './components/SessionSecuritySection';
import { useReviewReport } from './hooks/useReviewReport';

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

  const {
    hasReport,
    reportTitle,
    generatedAt,
    summaryRef,
    buttonLabel,
    copyState,
    handleCopy,
    primaryStat,
    secondaryStats,
    severity,
    severityStyles,
    summaryHtml,
    severityJustificationHtml,
    legalInsightsHtml,
    statuteReferences,
    caseLawReferences,
  } = useReviewReport({ incidentData, reportData });

  useEffect(() => {
    if (!isGeneratingSummary && hasReport && headingRef.current) {
      headingRef.current.focus({ preventScroll: true });
    }
  }, [hasReport, isGeneratingSummary]);

  if (isGeneratingSummary) {
    return <LoadingSpinner />;
  }

  if (!hasReport) {
    return (
      <div className="rounded-3xl border border-slate-800/80 bg-slate-950/70 p-10 text-center text-sm text-[#CFCBBF]/80 shadow-2xl">
        <p>No AI summary is available yet. Generate the report to review the analysis.</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 text-[#CFCBBF] leading-relaxed font-normal">
      <ReviewHeader headingRef={headingRef} title={reportTitle} generatedAt={generatedAt} />

      <SummaryPanel
        primaryStat={primaryStat}
        secondaryStats={secondaryStats}
        severity={severity}
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

      <EvidenceSection evidence={incidentData.evidence} />

      <LegalReferencesSection
        legalInsightsHtml={legalInsightsHtml}
        statuteReferences={statuteReferences}
        caseLawReferences={caseLawReferences}
      />

      <SessionSecuritySection />
    </div>
  );
};

export default Step5Review;
