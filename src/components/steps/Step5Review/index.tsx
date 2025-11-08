import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { type IncidentData, type ReportData } from '@/types';
import H1 from '../../ui/H1';
import H3 from '../../ui/H3';
import OutlineCard from './OutlineCard';
import StatsOverview, { type OverviewStat } from './StatsOverview';
import SummarySection, { type CopyState } from './SummarySection';
import SeverityPanel from './SeverityPanel';
import ShareActionsCard from './ShareActionsCard';
import EvidenceLog from './EvidenceLog';
import LegalContextSection from './LegalContextSection';
import PersonalNotesSection from './PersonalNotesSection';
import SessionSecurityCard from './SessionSecurityCard';
import LoadingSpinner from './LoadingSpinner';
import {
  extractMarkdownLinks,
  formatHtml,
  isCaseLawSource,
  deriveReadableTitle,
  type LegalReference,
} from './helpers';
import { getSeverityThemeKey } from './constants';

interface Step5ReviewProps {
  incidentData: IncidentData;
  reportData: ReportData | null;
  isGeneratingSummary: boolean;
  onExport: () => void;
  onPrint: () => void;
}

const Step5Review: React.FC<Step5ReviewProps> = ({
  incidentData,
  reportData,
  isGeneratingSummary,
  onExport,
  onPrint,
}) => {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const summaryRef = useRef<HTMLDivElement>(null);
  const [personalNotes, setPersonalNotes] = useState('');
  const [copyState, setCopyState] = useState<CopyState>('idle');

  useEffect(() => {
    if (!isGeneratingSummary && reportData && headingRef.current) {
      headingRef.current.focus({ preventScroll: true });
    }
  }, [isGeneratingSummary, reportData]);

  const generatedAt = useMemo(
    () =>
      new Intl.DateTimeFormat(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short',
      }).format(new Date()),
    [],
  );

  const overviewStats = useMemo<OverviewStat[]>(
    () => [
      { label: 'Category', value: reportData?.category ?? 'N/A' },
      { label: 'Jurisdiction', value: incidentData.jurisdiction || 'Not specified' },
      { label: 'Case Number', value: reportData?.caseNumber || incidentData.caseNumber || 'N/A' },
    ],
    [incidentData.caseNumber, incidentData.jurisdiction, reportData?.caseNumber, reportData?.category],
  );
  const [primaryStat, ...secondaryStats] = overviewStats;

  const severityThemeKey = getSeverityThemeKey(reportData?.severity);
  const severityJustificationHtml = useMemo(
    () => formatHtml(reportData?.severityJustification),
    [reportData?.severityJustification],
  );
  const summaryHtml = useMemo(
    () => formatHtml(reportData?.professionalSummary),
    [reportData?.professionalSummary],
  );
  const legalInsightsHtml = useMemo(
    () => formatHtml(reportData?.legalInsights),
    [reportData?.legalInsights],
  );

  const inlineReferences = useMemo(
    () => extractMarkdownLinks(reportData?.legalInsights),
    [reportData?.legalInsights],
  );
  const referenceMap = useMemo(() => {
    const map = new Map<string, LegalReference>();
    inlineReferences.forEach(ref => map.set(ref.url, ref));
    return map;
  }, [inlineReferences]);

  const sources = reportData?.sources ?? [];
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

  const handleCopySummary = useCallback(async () => {
    const summaryText = summaryRef.current?.innerText?.trim() ?? reportData?.professionalSummary?.trim() ?? '';

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

  return (
    <div className="space-y-10 text-[#CFCBBF] leading-relaxed font-normal">
      <OutlineCard
        borderClassName="border-white/10"
        backgroundClassName="bg-gradient-to-br from-slate-950/85 via-slate-950/60 to-slate-900/60"
        className="sm:p-8"
      >
        <H3 className="text-xs font-semibold uppercase tracking-[0.3em] text-[#FFD700]">AI Generated Report</H3>
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

      <StatsOverview
        primaryStat={primaryStat}
        secondaryStats={secondaryStats}
        severity={reportData.severity}
        severityThemeKey={severityThemeKey}
      />

      <section className="grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
        <SummarySection
          summaryHtml={summaryHtml}
          summaryRef={summaryRef}
          copyState={copyState}
          onCopySummary={handleCopySummary}
        />

        <div className="space-y-6">
          <SeverityPanel
            severity={reportData.severity}
            severityHtml={severityJustificationHtml}
            themeKey={severityThemeKey}
          />
          <ShareActionsCard onExport={onExport} onPrint={onPrint} />
        </div>
      </section>

      <EvidenceLog evidence={incidentData.evidence} />

      <LegalContextSection
        legalInsightsHtml={legalInsightsHtml}
        statuteReferences={statuteReferences}
        caseLawReferences={caseLawReferences}
        potentialSources={potentialSources}
      />

      <section className="grid gap-6 lg:grid-cols-2">
        <PersonalNotesSection notes={personalNotes} onNotesChange={setPersonalNotes} />
        <SessionSecurityCard />
      </section>
    </div>
  );
};

export default Step5Review;
