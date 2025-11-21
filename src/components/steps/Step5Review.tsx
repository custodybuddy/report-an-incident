import React, { useRef } from 'react';
import Button from '../ui/Button';
import H2 from '../ui/H2';
import type { IncidentData, ReportResult } from '../../types';
import { RESOURCE_LINKS } from '../../config/links';

interface Step5ReviewProps {
  incidentData: IncidentData;
  reportResult: ReportResult | null;
  onReset: () => void;
  onPrev: () => void;
}

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

const normalizeProfessionalSummary = (
  summary: string | undefined,
  date: string,
  severity: string,
  category: string
): string => {
  const trimmed = (summary ?? '').trim();
  const sentences = trimmed.split(/(?<=\.)\s+/).filter(Boolean);
  const first = sentences[0] ?? '';
  const occurredTail = first.match(/occurred\s*(.*)$/i)?.[1]?.trim() ?? '';
  const remainder = sentences.slice(1).join(' ').trim();
  const tailParts = [occurredTail, remainder].filter(Boolean);

  const baseIntro = `On ${date || 'the reported date'}, a ${(severity || 'reported').toLowerCase()}-severity ${category || 'incident'} occurred`;
  const tail = tailParts.length ? ` ${tailParts.join(' ')}` : '';
  const normalized = `${baseIntro}${tail}`;

  return normalized.endsWith('.') ? normalized : `${normalized}.`;
};

const Step5Review: React.FC<Step5ReviewProps> = ({
  incidentData,
  reportResult,
  onReset,
  onPrev,
}) => {
  const reportRef = useRef<HTMLDivElement>(null);
  const { jurisdiction } = incidentData;
  const classificationDisplay = reportResult?.category ?? 'Pending AI classification';
  const severityDisplay = reportResult?.severity ?? 'Pending AI classification';
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
  const normalizedProfessionalSummary = reportResult
    ? normalizeProfessionalSummary(
        reportResult.professionalSummary,
        incidentData.date,
        severityDisplay,
        classificationDisplay
      )
    : '';

  const handleExportPdf = () => {
    if (typeof window === 'undefined' || !reportResult) {
      return;
    }
    const content = reportRef.current?.innerHTML;
    if (!content) {
      return;
    }

    const printWindow = window.open('', '_blank', 'noopener,noreferrer,width=900,height=1200');
    if (!printWindow) {
      return;
    }

    const style = `
      <style>
        body { font-family: 'Inter', system-ui, -apple-system, sans-serif; margin: 24px; color: #111827; background: #f8fafc; }
        h1, h2, h3, h4 { color: #111827; margin: 0 0 12px; }
        .section { border: 1px solid #cbd5e1; border-radius: 12px; padding: 16px; margin-bottom: 16px; background: #ffffff; }
        .title { font-size: 22px; font-weight: 700; margin-bottom: 12px; }
        .label { text-transform: uppercase; letter-spacing: 0.14em; font-size: 10px; color: #475569; }
        .text { font-size: 14px; color: #1f2937; line-height: 1.5; }
        a { color: #b45309; text-decoration: underline; }
        ul { margin: 8px 0; padding-left: 18px; }
        @media print { body { margin: 12px; } }
      </style>
    `;

    printWindow.document.write(
      `<!doctype html><html><head><title>Incident Report</title>${style}</head><body>${content}</body></html>`
    );
    printWindow.document.close();
    printWindow.onload = () => {
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    };
  };

  return (
    <div className="space-y-8 bg-slate-950 text-slate-100 p-3 sm:p-4 rounded-3xl animate-[fade-in_0.6s_cubic-bezier(0.25,0.46,0.45,0.94)_forwards]">
      <div className="text-center mb-2 space-y-2">
        <H2 className="text-3xl font-bold text-amber-200">Court-Ready Review</H2>
        <p className="text-slate-200 max-w-2xl mx-auto">
          Confirm the facts, then generate a clean, court-focused document with structured findings and cited sources.
        </p>
      </div>

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

            {(statuteSummaries.length > 0 || jurisdictionResources.length > 0) && (
              <section className="rounded-2xl border border-slate-700 bg-slate-900/70 p-6 shadow-sm space-y-3">
                <p className="text-xs font-semibold text-slate-300 uppercase tracking-[0.24em]">
                  Referenced Legislation
                </p>
                <div className="space-y-4">
                  {statuteSummaries.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm text-slate-200">Key acts cited by the AI for this jurisdiction:</p>
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
