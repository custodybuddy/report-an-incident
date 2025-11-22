import { describe, expect, it } from 'vitest';
import { buildLegalResources } from '../legalResources';
import { deriveStatuteSummaries, getJurisdictionResources, normalizeSources } from '../../utils/legalResources';
import type { ReportResult } from '../../types';

describe('buildLegalResources', () => {
  const baseReport: ReportResult = {
    title: 'Test',
    professionalSummary: 'Incident occurred at home.',
    category: 'Custody',
    severity: 'High',
    severityJustification: 'Serious',
    legalInsights: "Family Law Act applies and Child, Youth and Family Services Act may be relevant.",
    sources: ['https://www.ontario.ca/laws/statute/90f03'],
    observedImpact: 'Stress',
    aiNotes: `## What I Notice
- Observation one

## Co-Parenting Guidance
- Keep communication neutral

## Documentation & Safety Reminders
- Save related messages`,
  };

  it('returns normalized sources and matching statute hints', () => {
    const result = buildLegalResources(baseReport, 'Ontario');
    const expectedSource = normalizeSources(baseReport.sources)[0];
    const expectedStatutes = deriveStatuteSummaries(
      baseReport.legalInsights,
      normalizeSources(baseReport.sources),
      'Ontario'
    );

    expect(result.normalizedSources[0]).toEqual(expectedSource);
    expect(result.statuteSummaries).toEqual(expectedStatutes);
  });

  it('includes jurisdiction resources even without report results', () => {
    const result = buildLegalResources(null, 'Ontario');
    expect(result.statuteSummaries).toEqual([]);
    expect(result.jurisdictionResources).toEqual(getJurisdictionResources('Ontario'));
  });
});
