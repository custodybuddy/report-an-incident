import type { ReportResult } from '../types';
import { deriveStatuteSummaries, getJurisdictionResources, normalizeSources } from '../utils/legalResources';

export interface LegalResourcesResult {
  normalizedSources: ReturnType<typeof normalizeSources>;
  statuteSummaries: ReturnType<typeof deriveStatuteSummaries>;
  jurisdictionResources: ReturnType<typeof getJurisdictionResources>;
}

export const buildLegalResources = (
  reportResult: ReportResult | null,
  jurisdiction: string
): LegalResourcesResult => {
  const normalizedSources = normalizeSources(reportResult?.sources ?? []);
  const statuteSummaries = reportResult
    ? deriveStatuteSummaries(reportResult.legalInsights ?? '', normalizedSources, jurisdiction)
    : [];
  const jurisdictionResources = getJurisdictionResources(jurisdiction);

  return { normalizedSources, statuteSummaries, jurisdictionResources };
};
