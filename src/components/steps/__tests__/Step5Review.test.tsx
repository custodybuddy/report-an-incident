import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import Step5Review from '../Step5Review';
import type { IncidentData, ReportResult } from '../../../types';

const incidentData: IncidentData = {
  consentAcknowledged: true,
  date: '2024-01-01',
  time: '12:00',
  narrative: 'Sample narrative',
  parties: ['Parent A', 'Parent B'],
  children: ['Child'],
  jurisdiction: 'Ontario',
  caseNumber: '123',
  evidence: [],
};

const reportResult: ReportResult = {
  title: 'Sample Incident',
  professionalSummary: 'Incident occurred during exchange.',
  category: 'Custody',
  severity: 'High',
  severityJustification: 'Serious',
  legalInsights: 'Family Law Act applies.',
  sources: ['https://www.ontario.ca/laws/statute/90f03'],
  observedImpact: 'Stress',
};

let originalOpen: typeof window.open;

beforeEach(() => {
  originalOpen = window.open;
});

afterEach(() => {
  window.open = originalOpen;
});

describe('Step5Review export', () => {
  it('shows an inline alert when export fails', () => {
    window.open = vi.fn(() => null) as unknown as typeof window.open;

    render(
      <Step5Review
        incidentData={incidentData}
        reportResult={reportResult}
        onReset={() => undefined}
        onPrev={() => undefined}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: /export pdf/i }));

    expect(screen.getByRole('alert').textContent).toContain('Pop-up blocked');
  });
});
