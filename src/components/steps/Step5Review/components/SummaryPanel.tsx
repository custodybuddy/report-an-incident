import React, { type RefObject } from 'react';
import Button from '../../../ui/Button';
import H3 from '../../../ui/H3';
import OutlineCard from '../../../ui/OutlineCard';
import StatCard from '../../../ui/StatCard';
import { renderHtmlWithFallback } from '../utils/html';
import type { CopyState } from '../hooks/useCopyToClipboard';

interface StatItem {
  label: string;
  value: string;
}

interface SeverityStyles {
  card: string;
  label: string;
  value: string;
  accent: string;
}

interface SummaryPanelProps {
  primaryStat?: StatItem;
  secondaryStats: StatItem[];
  severity?: string | null;
  severityStyles: SeverityStyles;
  summaryHtml: string;
  summaryRef: RefObject<HTMLDivElement>;
  summaryButtonLabel: string;
  copyState: CopyState;
  onCopySummary: () => void;
  severityJustificationHtml: string;
  onExport: () => void;
  onPrint: () => void;
}

const SummaryPanel: React.FC<SummaryPanelProps> = ({
  primaryStat,
  secondaryStats,
  severity,
  severityStyles,
  summaryHtml,
  summaryRef,
  summaryButtonLabel,
  copyState,
  onCopySummary,
  severityJustificationHtml,
  onExport,
  onPrint,
}) => {
  const copyButtonClassName =
    copyState === 'copied'
      ? 'bg-[#3AD79B] text-[#011626]'
      : copyState === 'error'
        ? 'bg-red-500 text-white'
        : 'bg-[#FFD700] text-[#011626] hover:bg-[#F4E883]';

  return (
    <>
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {primaryStat ? <StatCard label={primaryStat.label} value={primaryStat.value} /> : null}
        <div className={`rounded-2xl border p-4 shadow-lg ${severityStyles.card}`}>
          <p className={`heading-gold text-xs font-normal uppercase tracking-[0.3em] ${severityStyles.label}`}>
            Severity
          </p>
          <p className={`mt-2 text-2xl font-semibold ${severityStyles.value}`}>
            {severity ?? 'N/A'}
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
              onClick={onCopySummary}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition focus-visible:outline-[#F4E883] focus-visible:outline-offset-2 ${copyButtonClassName}`}
            >
              {summaryButtonLabel}
            </button>
          </div>
          <div
            ref={summaryRef}
            className="prose prose-invert prose-base mt-6 max-w-none space-y-4 text-[#CFCBBF]"
            dangerouslySetInnerHTML={renderHtmlWithFallback(summaryHtml, 'Summary has not been generated yet.')}
          />
        </OutlineCard>

        <div className="space-y-6">
          <article className={`rounded-3xl p-6 shadow-[0_18px_40px_rgba(0,0,0,0.45)] ${severityStyles.card}`}>
            <div className="flex items-center justify-between">
              <H3 className={`heading-gold text-xl font-normal ${severityStyles.label}`}>Severity Rationale</H3>
              <span className={`text-sm font-semibold ${severityStyles.value}`}>
                {severity ?? 'N/A'}
              </span>
            </div>
            <div
              className="prose prose-invert prose-sm mt-4 max-w-none text-[#CFCBBF]"
              dangerouslySetInnerHTML={renderHtmlWithFallback(
                severityJustificationHtml,
                'Severity rationale is not yet available.'
              )}
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
              Files remain local to this device until you export or print. Always secure sensitive data before sharing.
            </p>
          </OutlineCard>
        </div>
      </section>
    </>
  );
};

export default SummaryPanel;
