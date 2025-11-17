import React from 'react';
import Button from '../ui/Button';
import H2 from '../ui/H2';
import type { IncidentData, ReportResult } from '../../types';
import { RESOURCE_LINKS } from '../../config/links';

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

const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const formatInlineMarkdown = (value: string): string => {
  let text = escapeHtml(value);
  text = text.replace(/`([^`]+)`/g, '<code>$1</code>');
  text = text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  text = text.replace(/__([^_]+)__/g, '<strong>$1</strong>');
  text = text.replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, '<em>$1</em>');
  text = text.replace(/_([^_]+)_/g, '<em>$1</em>');
  text = text.replace(
    /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>'
  );
  return text;
};

const convertMarkdownToHtml = (value: string): string => {
  const lines = value.split(/\r?\n/);
  const htmlParts: string[] = [];
  let paragraphBuffer: string[] = [];
  let listType: 'ul' | 'ol' | null = null;
  let listItems: string[] = [];

  const flushParagraph = () => {
    if (paragraphBuffer.length) {
      htmlParts.push(`<p>${formatInlineMarkdown(paragraphBuffer.join(' '))}</p>`);
      paragraphBuffer = [];
    }
  };

  const flushList = () => {
    if (listType && listItems.length) {
      const itemsMarkup = listItems.map(item => `<li>${formatInlineMarkdown(item)}</li>`).join('');
      htmlParts.push(`<${listType}>${itemsMarkup}</${listType}>`);
      listItems = [];
    }
    listType = null;
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) {
      flushParagraph();
      flushList();
      continue;
    }

    const headingMatch = line.match(/^(#{1,6})\s+(.*)$/);
    if (headingMatch) {
      flushParagraph();
      flushList();
      const level = Math.min(headingMatch[1].length + 1, 4);
      const tag = `h${level}`;
      htmlParts.push(`<${tag}>${formatInlineMarkdown(headingMatch[2])}</${tag}>`);
      continue;
    }

    const blockquoteMatch = line.match(/^>\s?(.*)$/);
    if (blockquoteMatch) {
      flushParagraph();
      flushList();
      htmlParts.push(`<blockquote>${formatInlineMarkdown(blockquoteMatch[1])}</blockquote>`);
      continue;
    }

    const unorderedMatch = line.match(/^[-*+]\s+(.*)$/);
    if (unorderedMatch) {
      flushParagraph();
      if (listType !== 'ul') {
        flushList();
        listType = 'ul';
      }
      listItems.push(unorderedMatch[1]);
      continue;
    }

    const orderedMatch = line.match(/^\d+\.\s+(.*)$/);
    if (orderedMatch) {
      flushParagraph();
      if (listType !== 'ol') {
        flushList();
        listType = 'ol';
      }
      listItems.push(orderedMatch[1]);
      continue;
    }

    if (listType) {
      flushList();
    }
    paragraphBuffer.push(line);
  }

  flushParagraph();
  flushList();

  return htmlParts.join('');
};

interface NormalizedSource {
  id: string;
  original: string;
  url: string;
  host: string;
  isCanLii: boolean;
}

const cleanSourceValue = (value: string): string =>
  value
    .trim()
    .replace(/^[-•\s]+/, '')
    .replace(/[)\].,;]+$/, '');

const normalizeSources = (sources: string[]): NormalizedSource[] => {
  const seen = new Set<string>();

  return sources
    .map((source, index) => {
      const cleaned = cleanSourceValue(source);
      if (!cleaned) {
        return null;
      }

      const urlWithProtocol = cleaned.match(/^https?:\/\//i) ? cleaned : `https://${cleaned}`;

      try {
        const parsed = new URL(urlWithProtocol);
        if (!['http:', 'https:'].includes(parsed.protocol)) {
          return null;
        }

        const host = parsed.hostname.replace(/^www\./, '');
        const normalizedUrl = `${parsed.protocol}//${host}${parsed.pathname}${parsed.search}${parsed.hash}`;

        if (seen.has(normalizedUrl)) {
          return null;
        }

        seen.add(normalizedUrl);
        return {
          id: `${host}-${index}`,
          original: cleaned,
          url: normalizedUrl,
          host,
          isCanLii: host.includes('canlii'),
        };
      } catch {
        return null;
      }
    })
    .filter((item): item is NormalizedSource => Boolean(item));
};

const STATUTE_HINTS = [
  {
    jurisdiction: 'ontario',
    keyword: 'family law act',
    title: 'Family Law Act',
    description:
      'Covers parenting obligations, best-interest factors, and remedies available when the child is exposed to conflict.',
    url: 'https://www.ontario.ca/laws/statute/90f03',
  },
  {
    jurisdiction: 'ontario',
    keyword: "children's law reform act",
    title: "Children's Law Reform Act",
    description:
      'Sets out decision-making responsibility and contact principles, emphasizing stability and the child’s emotional safety.',
    url: 'https://www.ontario.ca/laws/statute/90c12',
  },
  {
    jurisdiction: 'ontario',
    keyword: 'child, youth and family services act',
    title: 'Child, Youth and Family Services Act',
    description: 'Defines duties to protect children from emotional harm and provides reporting routes.',
    url: 'https://www.ontario.ca/laws/statute/17c14',
  },
];

const JURISDICTION_LEGISLATION: Record<string, { title: string; url: string }[]> = {
  ontario: [
    {
      title: 'Family Law Act (Ontario)',
      url: 'https://www.ontario.ca/laws/statute/90f03',
    },
    {
      title: "Children's Law Reform Act (Ontario)",
      url: 'https://www.ontario.ca/laws/statute/90c12',
    },
    {
      title: 'Child, Youth and Family Services Act (Ontario)',
      url: 'https://www.ontario.ca/laws/statute/17c14',
    },
  ],
};

const CANADIAN_JURISDICTIONS = [
  'alberta',
  'british columbia',
  'manitoba',
  'new brunswick',
  'newfoundland and labrador',
  'northwest territories',
  'nova scotia',
  'nunavut',
  'ontario',
  'prince edward island',
  'quebec',
  'saskatchewan',
  'yukon',
];

const US_JURISDICTIONS = [
  'alabama',
  'alaska',
  'arizona',
  'arkansas',
  'california',
  'colorado',
  'connecticut',
  'delaware',
  'district of columbia',
  'florida',
  'georgia',
  'hawaii',
  'idaho',
  'illinois',
  'indiana',
  'iowa',
  'kansas',
  'kentucky',
  'louisiana',
  'maine',
  'maryland',
  'massachusetts',
  'michigan',
  'minnesota',
  'mississippi',
  'missouri',
  'montana',
  'nebraska',
  'nevada',
  'new hampshire',
  'new jersey',
  'new mexico',
  'new york',
  'north carolina',
  'north dakota',
  'ohio',
  'oklahoma',
  'oregon',
  'pennsylvania',
  'rhode island',
  'south carolina',
  'south dakota',
  'tennessee',
  'texas',
  'utah',
  'vermont',
  'virginia',
  'washington',
  'west virginia',
  'wisconsin',
  'wyoming',
];

const REGIONAL_RESOURCES: Record<'canada' | 'us', { title: string; url: string }[]> = {
  canada: [
    {
      title: 'Parenting Plan Guide (Ontario)',
      url: RESOURCE_LINKS.canadaParentingPlanGuide,
    },
    {
      title: 'Canadian Legal Aid Programs',
      url: RESOURCE_LINKS.canadaLegalAid,
    },
  ],
  us: [
    {
      title: 'Find Legal Aid (USA.gov)',
      url: RESOURCE_LINKS.usLegalAid,
    },
    {
      title: 'Child Welfare Policy Library (ChildWelfare.gov)',
      url: RESOURCE_LINKS.usChildWelfare,
    },
  ],
};

interface StatuteSummary {
  id: string;
  title: string;
  description: string;
  url: string;
  sourceLabel: string;
  isCanLii: boolean;
}

const deriveStatuteSummaries = (
  legalInsights: string,
  sources: NormalizedSource[],
  jurisdiction: string
): StatuteSummary[] => {
  const normalizedText = legalInsights.toLowerCase();
  const summaries: StatuteSummary[] = [];

  const pickSource = (predicate?: (source: NormalizedSource) => boolean) =>
    (predicate ? sources.find(predicate) : undefined) ?? sources.find(source => source.isCanLii) ?? sources[0];

  STATUTE_HINTS.forEach((hint, index) => {
    const jurisdictionMatches =
      !hint.jurisdiction || hint.jurisdiction === jurisdiction.trim().toLowerCase();
    if (jurisdictionMatches && normalizedText.includes(hint.keyword)) {
      summaries.push({
        id: `${hint.keyword}-${index}`,
        title: `${hint.title}${jurisdiction ? ` (${jurisdiction})` : ''}`,
        description: hint.description,
        url: hint.url,
        sourceLabel: 'Government of Ontario',
        isCanLii: false,
      });
    }
  });

  if (!summaries.length && sources.length) {
    const source = pickSource();
    summaries.push({
      id: `source-${source!.id}`,
      title: `Applicable Legislation (${source!.host})`,
      description: `Review the cited legislation for custody and conduct guidance in ${
        jurisdiction || 'family law'
      }.`,
      url: source!.url,
      sourceLabel: source!.host,
      isCanLii: source!.isCanLii,
    });
  }

  return summaries;
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

const getJurisdictionResources = (jurisdiction: string): { id: string; title: string; url: string }[] => {
  if (!jurisdiction) {
    return [];
  }
  const key = jurisdiction.trim().toLowerCase();
  const matches = JURISDICTION_LEGISLATION[key] ?? [];
  const region = CANADIAN_JURISDICTIONS.includes(key)
    ? 'canada'
    : US_JURISDICTIONS.includes(key)
      ? 'us'
      : null;
  const regionResources = region ? REGIONAL_RESOURCES[region] : [];

  if (!matches.length && !regionResources.length) {
    return [];
  }

  return [...matches, ...regionResources].map((resource, index) => ({
    id: `${key || region}-resource-${index}`,
    ...resource,
  }));
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
  const normalizedSources = normalizeSources(reportResult?.sources ?? []);
  const legalInsightRawBlocks = reportResult?.legalInsights
    ? reportResult.legalInsights
        .split(/\n{2,}/)
        .map(block => block.trim())
        .filter(Boolean)
    : [];
  const legalInsightBriefs = createLegalInsightBriefs(legalInsightRawBlocks);
  const statuteSummaries = reportResult
    ? deriveStatuteSummaries(reportResult.legalInsights ?? '', normalizedSources, jurisdiction)
    : [];
  const jurisdictionResources = getJurisdictionResources(jurisdiction);

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
