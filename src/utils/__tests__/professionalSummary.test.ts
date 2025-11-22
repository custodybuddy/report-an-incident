import { describe, expect, it } from 'vitest';
import { normalizeProfessionalSummary } from '../professionalSummary';

describe('normalizeProfessionalSummary', () => {
  it('builds a normalized sentence with date, severity, and category', () => {
    const result = normalizeProfessionalSummary(
      'Incident occurred at the playground. Child was upset.',
      '2023-10-05',
      'High',
      'Custody'
    );

    expect(result).toBe(
      'On 2023-10-05, a high-severity Custody occurred at the playground. Child was upset.'
    );
  });

  it('ensures a trailing period and handles missing details gracefully', () => {
    const result = normalizeProfessionalSummary('  ', '', '', '');
    expect(result.endsWith('.')).toBe(true);
    expect(result).toBe('On the reported date, a reported-severity incident occurred.');
  });
});
