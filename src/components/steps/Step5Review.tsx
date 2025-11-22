import React, { useMemo, useRef, useState } from 'react';
import Button from '../ui/Button';
import H2 from '../ui/H2';
import { cardPadding } from '../ui/layoutTokens';
import type { IncidentData, ReportResult } from '../../types';
import { normalizeProfessionalSummary } from '../../utils/professionalSummary';
import { buildLegalResources } from '../../services/legalResources';
import { exportReportToPdf } from '../../services/pdfExport';

interface Step5ReviewProps {
  incidentData: IncidentData;
  reportResult: ReportResult | null;
  onReset: () => void;
  onPrev: () => void;
}

interface SectionProps {
  title: string;
  content: string | string[];
  treatAsParagraphs?: boolean;
  headingLevel?: 'h2' | 'p';
  renderHtml?: boolean;
}

const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const formatAiNotes = (notes: string): string => {
  if (!notes.trim()) {
    return '';
  }

  const lines = notes.split(/\r?\n/);
  const chunks: string[] = [];
  let inList = false;

  const closeList = () => {
    if (inList) {
      chunks.push('</ul>');
      inList = false;
    }
  };

  lines.forEach(line => {
    const trimmed = line.trim();

    if (trimmed.startsWith('## ')) {
      closeList();
      const heading = escapeHtml(trimmed.replace(/^##\s*/, ''));
      chunks.push(`<h3 class="text-base font-semibold text-amber-200">${heading}</h3>`);
      return;
    }

    if (trimmed.startsWith('- ')) {
      if (!inList) {
        chunks.push('<ul class="list-disc space-y-2 pl-5">');
        inList = true;
      }
      const bullet = escapeHtml(trimmed.replace(/^-\s*/, ''));
      chunks.push(`<li class="text-sm leading-relaxed text-slate-100">${bullet}</li>`);
      return;
    }

    if (trimmed) {
      closeList();
      chunks.push(`<p class="text-sm leading-relaxed text-slate-100">${escapeHtml(trimmed)}</p>`);
    }
  });

  closeList();

  return chunks.join('');
};

const Section: React.FC<SectionProps> = ({
  title,
  content,
  treatAsParagraphs = false,
  headingLevel = 'p',
  renderHtml = false,
}) => {
  if (!content || (Array.isArray(content) && !content.length)) {
    return null;
  }

  return (
    <section className="rounded-2xl border border-slate-700 bg-slate-900/80 p-6 shadow-sm space-y-3">
      {headingLevel === 'h2' ? (
        <H2 className="text-2xl font-semibold text-amber-200">{title}</H2>
      ) : (
        <p className="text-[11px] font-semibold text-slate-300 uppercase tracking-[0.24em]">{title}</p>
      )}
      {renderHtml && typeof content === 'string' ? (
        <div
          className="text-sm leading-relaxed text-slate-100 space-y-3 [&_a]:text-amber-200 [&_a:hover]:underline"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      ) : Array.isArray(content) ? (
        <ul className="list-disc space-y-2 pl-5 text-sm text-slate-100">
          {content.map(item => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      ) : treatAsParagraphs ? (
        content.split(/\n\s*\n/).map((paragraph, index) => (
          <p
            key={`${title}-${index}`}
            className="text-sm leading-relaxed text-slate-100 mb-4 last:mb-0"
          >
            {paragraph}
          </p>
        ))
      ) : (
        <p className="text-sm leading-relaxed text-slate-100">{content}</p>
      )}
    </section>
  );
};

const Step5Review: React.FC<Step5ReviewProps> = ({
  incidentData,
  reportResult,
  onReset,
  onPrev,
}) => {
  const reportRef = useRef<HTMLDivElement>(null);
  const [exportError, setExportError] = useState<string | null>(null);
  const { jurisdiction } = incidentData;
  const classificationDisplay = reportResult?.category ?? 'Pending AI classification';
  const severityDisplay = reportResult?.severity ?? 'Pending AI classification';

  const { statuteSummaries, jurisdictionResources } = useMemo(
    () => buildLegalResources(reportResult, jurisdiction),
    [jurisdiction, reportResult],
  );

  const normalizedProfessionalSummary = useMemo(
    () =>
      reportResult
        ? normalizeProfessionalSummary(
            reportResult.professionalSummary,
            incidentData.date,
            severityDisplay,
            classificationDisplay
          )
        : '',
    [classificationDisplay, incidentData.date, reportResult, severityDisplay],
  );

  const formattedAiNotes = useMemo(
    () => (reportResult?.aiNotes ? formatAiNotes(reportResult.aiNotes) : ''),
    [reportResult?.aiNotes]
  );

  const handleExportPdf = () => {
    setExportError(null);
    const content = reportRef.current?.innerHTML ?? '';
    const result = exportReportToPdf(content, { title: reportResult?.title });

    if (!result.success) {
      setExportError(result.error ?? 'We were unable to export your report.');
    }
  };

  return (
    <div
      className={`space-y-8 bg-slate-950 text-slate-100 ${cardPadding} rounded-3xl animate-[fade-in_0.6s_cubic-bezier(0.25,0.46,0.45,0.94)_forwards]`}
    >
      <div className="text-center mb-2 space-y-2">
        <H2 className="text-3xl font-bold text-amber-200">Court-Ready Review</H2>
        <p className="text-slate-200 max-w-2xl mx-auto">
          Confirm the facts, then generate a clean, court-focused document with structured findings.
        </p>
      </div>

      {exportError && (
        <div
          role="alert"
          aria-live="assertive"
          className="rounded-2xl border border-red-500/40 bg-red-500/10 p-4 text-red-100 shadow-lg shadow-red-900/30"
        >
          <div className="flex items-start gap-3">
            <span aria-hidden className="mt-1 text-red-300">
              &#9888;
            </span>
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-[0.22em] text-red-200">Export issue</p>
              <p className="text-sm leading-relaxed">{exportError}</p>
            </div>
          </div>
        </div>
      )}

      <div
        ref={reportRef}
        className="space-y-6 rounded-3xl border border-slate-800 bg-slate-900/80 p-6 sm:p-8 shadow-2xl"
      >
        {reportResult ? (
          <div className="space-y-5 rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow">
            {reportResult.title && (
              <section className="space-y-1 text-center">
                <p className="text-sm uppercase tracking-[0.28em] text-slate-300">Incident Report</p>
                <H2 className="text-3xl font-semibold text-amber-200">{reportResult.title}</H2>
              </section>
            )}

            <div className="grid gap-4 md:grid-cols-2">
              <Section title="Incident Type" content={classificationDisplay} />
              <Section title="Severity" content={severityDisplay} />
            </div>

            <Section
              title="Professional Summary"
              content={normalizedProfessionalSummary}
              treatAsParagraphs
              headingLevel="h2"
            />

            <Section
              title="Observed/Projected Impact on Children"
              content={reportResult.observedImpact}
              treatAsParagraphs
              headingLevel="h2"
            />

            <Section
              title="AI Notes & Guidance"
              content={formattedAiNotes}
              renderHtml
              headingLevel="h2"
            />

            {(statuteSummaries.length > 0 || jurisdictionResources.length > 0) && (
              <section className="rounded-2xl border border-slate-700 bg-slate-900/70 p-6 shadow-sm space-y-3">
                <p className="text-xs font-semibold text-slate-300 uppercase tracking-[0.24em]">
                  Referenced Legislation
                </p>
                <div className="space-y-4">
                  {statuteSummaries.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm text-slate-200">Key acts for this jurisdiction:</p>
                      <ul className="space-y-2">
                        {statuteSummaries.map(statute => (
                          <li key={statute.id} className="text-sm text-slate-100">
                            <a
                              href={statute.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-amber-200 underline"
                            >
                              {statute.title}
                            </a>
                            <span className="text-slate-400 text-xs ml-2">
                              {statute.sourceLabel}
                              {statute.isCanLii && ' • CanLII'}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {jurisdictionResources.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm text-slate-200">Additional legislation and guidance links:</p>
                      <ul className="space-y-2">
                        {jurisdictionResources.map(resource => (
                          <li key={resource.id} className="text-sm text-slate-100">
                            <a
                              href={resource.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-amber-200 underline"
                            >
                              {resource.title}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </section>
            )}
          </div>
        ) : (
          <p className="text-sm text-slate-200">No AI report generated yet.</p>
        )}

        <div
          className="sticky bottom-4 z-10 rounded-2xl border border-slate-700 bg-slate-900 p-4 shadow-lg backdrop-blur"
          role="region"
          aria-label="Report actions"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-200">
              Actions
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button
                variant="secondary"
                className="w-full sm:w-auto"
                onClick={onPrev}
              >
                Back
              </Button>
              <Button
                className="w-full sm:w-auto"
                onClick={handleExportPdf}
              >
                Export PDF
              </Button>
              <Button
                variant="ghost"
                className="w-full sm:w-auto"
                onClick={onReset}
              >
                Start Over
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Step5Review;
