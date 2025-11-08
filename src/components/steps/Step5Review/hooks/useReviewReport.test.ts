import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import type { IncidentData, ReportData } from '@/types';
import { buildReviewReportData } from './reviewReportData';
import { formatHtmlContent } from '../utils/html';

const baseIncident: IncidentData = {
  consentAcknowledged: true,
  date: '2024-01-01',
  time: '10:00',
  narrative: 'Test narrative',
  parties: ['Caregiver'],
  children: ['Child'],
  jurisdiction: 'California',
  evidence: [],
  caseNumber: 'ABC-123',
};

const sampleReport: ReportData = {
  title: 'Safety Concern',
  category: 'Neglect',
  severity: 'High',
  severityJustification: 'Serious risk detected.',
  professionalSummary: 'Summary content',
  legalInsights: 'Legal insight text',
  sources: ['https://example.com/statute'],
  caseNumber: 'COURT-42',
};

describe('buildReviewReportData', () => {
  it('shapes report data and formatting for downstream components', () => {
    const result = buildReviewReportData({ incidentData: baseIncident, reportData: sampleReport });

    assert.equal(result.hasReport, true);
    assert.equal(result.reportTitle, sampleReport.title);
    assert.equal(result.severity, sampleReport.severity);
    assert.deepEqual(result.primaryStat, { label: 'Category', value: sampleReport.category });
    assert.equal(result.secondaryStats.length, 2);
    assert.equal(result.secondaryStats[0].value, baseIncident.jurisdiction);
    assert.equal(result.secondaryStats[1].value, sampleReport.caseNumber);
    assert.equal(result.summaryHtml, formatHtmlContent(sampleReport.professionalSummary));
    assert.equal(result.severityJustificationHtml, formatHtmlContent(sampleReport.severityJustification));
    assert.equal(result.legalInsightsHtml, formatHtmlContent(sampleReport.legalInsights));
    assert.equal(result.severityStyles.card.includes('shadow-'), true);
  });

  it('returns safe defaults when report data is missing', () => {
    const incidentWithGaps: IncidentData = { ...baseIncident, jurisdiction: '', caseNumber: '' };
    const result = buildReviewReportData({ incidentData: incidentWithGaps, reportData: null });

    assert.equal(result.hasReport, false);
    assert.equal(result.reportTitle, 'Pending Title');
    assert.equal(result.severity, null);
    assert.deepEqual(result.primaryStat, { label: 'Category', value: 'N/A' });
    assert.equal(result.secondaryStats[0].value, 'Not specified');
    assert.equal(result.secondaryStats[1].value, 'N/A');
    assert.equal(result.summaryHtml, formatHtmlContent());
    assert.equal(result.severityJustificationHtml, formatHtmlContent());
    assert.equal(result.legalInsightsHtml, formatHtmlContent());
  });
});
