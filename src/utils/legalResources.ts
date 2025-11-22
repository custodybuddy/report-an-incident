import { RESOURCE_LINKS } from '../config/links';
import {
  CANADIAN_JURISDICTIONS,
  US_JURISDICTIONS,
  normalizeJurisdiction,
} from '../config/jurisdictions';

export interface NormalizedSource {
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

export const normalizeSources = (sources: string[]): NormalizedSource[] => {
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

export interface StatuteSummary {
  id: string;
  title: string;
  description: string;
  url: string;
  sourceLabel: string;
  isCanLii: boolean;
}

export const deriveStatuteSummaries = (
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

export const getJurisdictionResources = (
  jurisdiction: string
): { id: string; title: string; url: string }[] => {
  if (!jurisdiction) {
    return [];
  }
  const key = normalizeJurisdiction(jurisdiction);
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
