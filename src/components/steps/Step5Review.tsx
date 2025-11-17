import React from 'react';
import Button from '../ui/Button';
import H2 from '../ui/H2';
import type { IncidentData, ReportResult } from '../../types';

interface Step5ReviewProps {
  incidentData: IncidentData;
  reportResult: ReportResult | null;
  isGenerating: boolean;
  error: string | null;
  onGenerateReport: () => void;
  onReset: () => void;
}

const InfoRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="flex flex-col rounded-2xl border border-slate-800 bg-black/30 px-4 py-3">
    <span className="text-xs uppercase tracking-wide text-slate-400">{label}</span>
    <span className="text-base font-semibold text-[#FFD700]">{value || '—'}</span>
  </div>
);

const PillList: React.FC<{ title: string; items: string[] }> = ({ title, items }) => {
  if (!items.length) {
    return null;
  }

  return (
    <div>
      <p className="text-xs uppercase tracking-[0.3em] text-slate-500 mb-2">{title}</p>
      <div className="flex flex-wrap gap-2">
        {items.map(item => (
          <span
            key={item}
            className="rounded-full border border-slate-700 bg-slate-900/60 px-3 py-1 text-xs text-slate-100"
          >
            {item}
          </span>
        ))}
      </div>
    </div>
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

const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const convertMarkdownToHtml = (value: string): string => {
  const escaped = escapeHtml(value);
  const withBold = escaped.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  const withLinks = withBold.replace(
    /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>'
  );
  return withLinks
    .split(/\n{2,}/)
    .map(segment => `<p>${segment.replace(/\n/g, '<br />')}</p>`)
    .join('');
};

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
  const legalInsightsHtml = reportResult?.legalInsights
    ? convertMarkdownToHtml(reportResult.legalInsights)
    : '';

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
          <div className="grid gap-4 sm:grid-cols-3">
            <InfoRow label="Date" value={incidentData.date} />
            <InfoRow label="Time" value={incidentData.time} />
            <InfoRow label="Jurisdiction" value={jurisdiction} />
            <InfoRow label="Incident Type" value={classificationDisplay} />
            <InfoRow label="Severity" value={severityDisplay} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <InfoRow label="Case Number" value={caseNumber || 'Optional'} />
            <InfoRow label="Evidence Items" value={String(evidence.length)} />
          </div>

          <div className="rounded-2xl border border-slate-800 bg-black/30 p-6 space-y-3">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-[0.3em]">
              Narrative Snapshot
            </p>
            <p className="text-sm leading-relaxed text-slate-200">
              {narrative || 'No narrative provided yet.'}
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <PillList title="Parties" items={parties} />
            <PillList title="Children" items={children} />
          </div>

          {Boolean(evidence.length) && (
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500 mb-2">
                Evidence Overview
              </p>
              <div className="space-y-3">
                {evidence.map(item => (
                  <div
                    key={item.id}
                    className="rounded-2xl border border-slate-800 bg-black/20 px-4 py-3 text-sm"
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
                <Section title="Report Title" content={reportResult.title} headingLevel="h2" />
              )}
              <Section
                title="Professional Summary"
                content={reportResult.professionalSummary}
                treatAsParagraphs
                headingLevel="h2"
              />
              <Section title="Severity Justification" content={severityJustification} />
              {legalInsightsHtml && (
                <Section
                  title="Legal Insights"
                  content={legalInsightsHtml}
                  headingLevel="h2"
                  renderHtml
                />
              )}
              {Boolean(reportResult.sources?.length) && (
                <section className="rounded-2xl border border-slate-800 bg-black/30 p-6 space-y-3">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-[0.3em]">
                    Official Sources
                  </p>
                  <ul className="list-disc space-y-1 pl-5 text-sm text-slate-200">
                    {reportResult.sources.map(source => {
                      const normalized = source.startsWith('http') ? source : `https://${source}`;
                      return (
                        <li key={source}>
                          <a
                            href={normalized}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-amber-300 hover:underline"
                          >
                            {source}
                          </a>
                        </li>
                      );
                    })}
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
