import React, { useMemo } from 'react';
import Button from '../ui/Button';
import H2 from '../ui/H2';
import type { IncidentData, ReportResult } from '../../types';
import { convertMarkdownToHtml } from '../../utils/markdown';
import {
  deriveStatuteSummaries,
  getJurisdictionResources,
  normalizeSources,
} from '../../utils/legalResources';

interface Step5ReviewProps {
  incidentData: IncidentData;
  reportResult: ReportResult | null;
  isGenerating: boolean;
  error: string | null;
  onGenerateReport: () => void;
  onReset: () => void;
}

const InfoRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="flex w-full max-w-xs flex-col items-center rounded-2xl border border-slate-800 bg-black/30 px-6 py-4 text-center">
    <span className="text-xs uppercase tracking-wide text-slate-400">{label}</span>
    <span className="text-base font-semibold text-[#FFD700]">{value || '—'}</span>
  </div>
);

const PillCard: React.FC<{ title: string; items: string[] }> = ({ title, items }) => {
  if (!items.length) {
    return null;
  }

  return (
    <section className="space-y-3 rounded-2xl border border-slate-800 bg-black/30 p-5 text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">{title}</p>
      <div className="flex flex-wrap justify-center gap-2">
        {items.map(item => (
          <span
            key={item}
            className="rounded-full border border-slate-700 bg-slate-900/60 px-3 py-1 text-xs text-slate-100"
          >
            {item}
          </span>
        ))}
      </div>
    </section>
  );
};

const CardSection: React.FC<{
  title: string;
  description?: string;
  children: React.ReactNode;
}> = ({ title, description, children }) => (
  <section className="space-y-4 rounded-2xl border border-slate-800 bg-black/30 p-6">
    <div className="space-y-1">
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-[0.3em]">
        {title}
      </p>
      {description && <p className="text-sm text-slate-400">{description}</p>}
    </div>
    {children}
  </section>
);

const Section: React.FC<{
  title: string;
  content: string | string[];
  treatAsParagraphs?: boolean;
  headingLevel?: 'h2' | 'p';
  renderHtml?: boolean;
}> = ({ title, content, treatAsParagraphs = false, headingLevel = 'p', renderHtml = false }) => {
  if (!content || (Array.isArray(content) && !content.length)) {
    return null;
  }

  return (
    <section className="rounded-2xl border border-slate-800 bg-black/30 p-6 space-y-3">
      {headingLevel === 'h2' ? (
        <H2 className="text-2xl font-semibold text-[#FFD700]">{title}</H2>
      ) : (
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-[0.3em]">{title}</p>
      )}
      {renderHtml && typeof content === 'string' ? (
        <div
          className="text-sm leading-relaxed text-slate-200 space-y-3 [&_a]:text-amber-300 [&_a:hover]:underline"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      ) : Array.isArray(content) ? (
        <ul className="list-disc space-y-2 pl-5 text-sm text-slate-200">
          {content.map(item => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      ) : treatAsParagraphs ? (
        content.split(/\n\s*\n/).map((paragraph, index) => (
          <p
            key={`${title}-${index}`}
            className="text-sm leading-relaxed text-slate-200 mb-4 last:mb-0"
          >
            {paragraph}
          </p>
        ))
      ) : (
        <p className="text-sm leading-relaxed text-slate-200">{content}</p>
      )}
    </section>
  );
};


interface LegalInsightBrief {
  id: string;
  title: string;
  html: string;
}

const createLegalInsightBriefs = (rawBlocks: string[]): LegalInsightBrief[] =>
  rawBlocks
    .map(block => block.replace(/\s+/g, ' ').trim())
    .filter(Boolean)
    .slice(0, 2)
    .map((text, index) => {
      const truncated = text.length > 200 ? `${text.slice(0, 197)}…` : text;
      const html = convertMarkdownToHtml(truncated);
      const firstLine = text.split(/[.!?]/)[0];
      return {
        id: `insight-brief-${index}`,
        title: `Insight ${index + 1}`,
        html,
      };
    });

const Step5Review: React.FC<Step5ReviewProps> = ({
  incidentData,
  reportResult,
  isGenerating,
  error,
  onGenerateReport,
  onReset,
}) => {
  const { narrative, parties, children, jurisdiction, caseNumber, evidence } = incidentData;
  const classificationDisplay = reportResult?.category ?? 'Pending AI classification';
  const severityDisplay = reportResult?.severity ?? 'Pending AI classification';
  const severityJustification = reportResult?.severityJustification ?? 'Details pending AI review.';
  const normalizedSources = useMemo(
    () => normalizeSources(reportResult?.sources ?? []),
    [reportResult?.sources],
  );

  const legalInsightRawBlocks = useMemo(() => {
    if (!reportResult?.legalInsights) {
      return [];
    }

    return reportResult.legalInsights
      .split(/\n{2,}/)
      .map(block => block.trim())
      .filter(Boolean);
  }, [reportResult?.legalInsights]);

  const legalInsightBriefs = useMemo(
    () => createLegalInsightBriefs(legalInsightRawBlocks),
    [legalInsightRawBlocks],
  );

  const statuteSummaries = useMemo(
    () =>
      reportResult
        ? deriveStatuteSummaries(reportResult.legalInsights ?? '', normalizedSources, jurisdiction)
        : [],
    [jurisdiction, normalizedSources, reportResult],
  );

  const jurisdictionResources = useMemo(
    () => getJurisdictionResources(jurisdiction),
    [jurisdiction],
  );

  return (
    <div className="space-y-8 animate-[fade-in_0.6s_cubic-bezier(0.25,0.46,0.45,0.94)_forwards]">
      <div className="text-center mb-4 space-y-2">
        <H2 className="text-3xl font-bold text-[#FFD700] mb-2">Review &amp; Generate Report</H2>
        <p className="text-slate-400 max-w-2xl mx-auto">
          Double-check the information you entered. When you are ready, tap the button below and we
          will send the data to <span className="font-semibold text-amber-200">GPT-4o-mini</span> to
          create a structured professional report.
        </p>
      </div>

      <div className="space-y-6 rounded-3xl border border-slate-800/80 bg-slate-950/70 p-8 shadow-2xl text-[#CFCBBF]">
        <CardSection
          title="Incident Overview"
          description="Confirm the factual details before generating the AI summary."
        >
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 justify-items-center">
            {[
              { label: 'Date', value: incidentData.date },
              { label: 'Time', value: incidentData.time },
              { label: 'Jurisdiction', value: jurisdiction },
              { label: 'Incident Type', value: classificationDisplay },
              { label: 'Severity', value: severityDisplay },
            ].map(item => (
              <InfoRow key={item.label} label={item.label} value={item.value} />
            ))}
          </div>

          <div className="grid gap-4 sm:grid-cols-2 justify-items-center">
            {[
              { label: 'Case Number', value: caseNumber || 'Optional' },
              { label: 'Evidence Items', value: String(evidence.length) },
            ].map(item => (
              <InfoRow key={item.label} label={item.label} value={item.value} />
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-slate-800 bg-black/30 p-6 text-center space-y-3">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-[0.3em]">
                Narrative Snapshot
              </p>
              <p className="text-sm leading-relaxed text-slate-200">
                {narrative || 'No narrative provided yet.'}
              </p>
            </div>
            <div className="space-y-6">
              <PillCard title="Parties" items={parties} />
              <PillCard title="Children" items={children} />
            </div>
          </div>

          {Boolean(evidence.length) && (
            <div className="rounded-2xl border border-slate-800 bg-black/20 px-4 py-3 text-sm">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500 mb-3 text-center">
                Evidence Overview
              </p>
              <div className="space-y-3">
                {evidence.map(item => (
                  <div
                    key={item.id}
                    className="rounded-2xl border border-slate-800 bg-black/20 px-4 py-3 text-sm text-center"
                  >
                    <p className="font-semibold text-slate-100">{item.name}</p>
                    <p className="text-xs text-slate-400">
                      {item.category} &middot; {(item.size / 1024).toFixed(2)} KB
                    </p>
                    {item.description && (
                      <p className="text-xs text-slate-300 mt-1">{item.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardSection>

        {error && (
          <div className="rounded-2xl border border-red-500/50 bg-red-950/40 p-4 text-sm text-red-200">
            {error}
          </div>
        )}

        {isGenerating && (
          <div className="flex items-center gap-3 text-sm text-slate-300">
            <svg
              className="h-5 w-5 animate-spin text-[#FFD700]"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 0 1 4 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Contacting OpenAI…
          </div>
        )}

        <CardSection
          title="AI Report Output"
          description={
            reportResult
              ? 'Review the generated analysis before sharing or exporting.'
              : 'Generate the report to preview the AI-assisted findings.'
          }
        >
          {reportResult ? (
            <div className="space-y-4">
              {reportResult.title && (
                <section className="rounded-2xl border border-slate-800 bg-black/30 p-6 text-center">
                  <H2 className="text-3xl font-semibold text-[#FFD700]">{reportResult.title}</H2>
                </section>
              )}
              <Section
                title="Professional Summary"
                content={reportResult.professionalSummary}
                treatAsParagraphs
                headingLevel="h2"
              />
              <Section title="Severity Justification" content={severityJustification} />
              {(statuteSummaries.length > 0 || legalInsightBriefs.length > 0 || jurisdictionResources.length > 0) && (
                <section className="rounded-2xl border border-amber-500/40 bg-amber-950/10 p-6 space-y-5">
                  <div className="flex flex-col gap-2 text-center sm:text-left">
                    <div className="flex items-center justify-center gap-3 text-amber-200 sm:justify-start">
                      <div className="rounded-full border border-amber-400/40 bg-amber-400/10 p-2">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth="1.5"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M7 7h.01M4 6h16M4 10h16M4 14h16M4 18h16"
                          />
                        </svg>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-[0.3em] text-amber-200">
                          Legal Insights
                        </p>
                        <p className="text-sm text-slate-300">
                          Brief statutes sourced from CanLII and public legislation databases.
                        </p>
                      </div>
                    </div>
                  </div>
                  {legalInsightBriefs.length > 0 && (
                    <div className="rounded-2xl border border-slate-800/80 bg-slate-950/60 p-4">
                      <p className="text-xs uppercase tracking-[0.3em] text-slate-400 mb-3">
                        Insight Highlights
                      </p>
                      <div className="space-y-3">
                        {legalInsightBriefs.map(brief => (
                          <div key={brief.id} className="rounded-xl border border-slate-800/60 bg-black/40 p-4">
                            <p className="text-xs uppercase tracking-[0.3em] text-amber-200 mb-2">
                              {brief.title}
                            </p>
                            <div
                              className="text-sm leading-relaxed text-slate-200 [&_a]:text-amber-300 [&_a:hover]:underline"
                              dangerouslySetInnerHTML={{ __html: brief.html }}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {statuteSummaries.length > 0 && (
                    <div className="grid gap-4 md:grid-cols-2">
                      {statuteSummaries.map(statute => (
                        <div
                          key={statute.id}
                          className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 shadow-inner"
                        >
                          <div className="flex flex-col gap-1">
                            <p className="text-sm font-semibold text-[#FFD700]">{statute.title}</p>
                            <span className="text-xs uppercase tracking-[0.3em] text-slate-400">
                              {statute.sourceLabel}
                              {statute.isCanLii && ' • CanLII'}
                            </span>
                          </div>
                          <p className="mt-3 text-sm text-slate-200">{statute.description}</p>
                          <a
                            href={statute.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-3 inline-flex items-center text-sm font-semibold text-amber-300 hover:underline"
                          >
                            View legislation
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="ml-1 h-4 w-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth="1.5"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" d="M7 17l10-10M9 7h8v8" />
                            </svg>
                          </a>
                        </div>
                      ))}
                    </div>
                  )}
                  {jurisdictionResources.length > 0 && (
                    <div className="rounded-2xl border border-slate-800 bg-black/30 p-4">
                      <p className="text-xs uppercase tracking-[0.3em] text-slate-400 mb-2">
                        Jurisdiction Legislation
                      </p>
                      <ul className="space-y-2 text-sm text-slate-200">
                        {jurisdictionResources.map(resource => (
                          <li key={resource.id}>
                            <a
                              href={resource.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-amber-300 hover:underline"
                            >
                              {resource.title}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </section>
              )}
              {Boolean(normalizedSources.length) && (
                <section className="rounded-2xl border border-slate-800 bg-black/30 p-6 space-y-3">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-[0.3em]">
                    Official Sources
                  </p>
                  <ul className="list-disc space-y-1 pl-5 text-sm text-slate-200">
                    {normalizedSources.map(source => (
                      <li key={source.id}>
                        <a
                          href={source.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-amber-300 hover:underline"
                        >
                          {source.original}
                        </a>
                      </li>
                    ))}
                  </ul>
                </section>
              )}
              {reportResult.observedImpact && (
                <Section
                  title="Observed Impact"
                  content={reportResult.observedImpact}
                  treatAsParagraphs
                  headingLevel="h2"
                />
              )}
              {reportResult.communicationDraft && (
                <Section
                  title="Draft Communication"
                  content={reportResult.communicationDraft}
                  treatAsParagraphs
                />
              )}
            </div>
          ) : (
            <p className="text-sm text-slate-400">No AI report generated yet.</p>
          )}
        </CardSection>

        <div
          className="sticky bottom-4 z-10 rounded-2xl border border-slate-800/80 bg-slate-950/90 p-4 shadow-2xl backdrop-blur"
          role="region"
          aria-label="Report actions"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
              Actions
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button
                variant="ghost"
                className="w-full sm:w-auto"
                onClick={onReset}
                disabled={isGenerating}
              >
                Start Over
              </Button>
              <Button
                className="w-full sm:w-auto"
                onClick={onGenerateReport}
                disabled={isGenerating || !incidentData.consentAcknowledged}
              >
                {isGenerating ? 'Generating...' : 'Generate AI Report'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Step5Review;
