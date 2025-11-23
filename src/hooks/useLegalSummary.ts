import { useState } from 'react';
import { generateLegalSummary } from '@/services/legalSummary';
import { type LegalSummaryResponse } from '@/types/legal';

export const useLegalSummary = () => {
  const [legalSummary, setLegalSummary] = useState<LegalSummaryResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = async (narrative: string, jurisdiction?: string) => {
    if (!narrative.trim()) {
      setError('Add narrative details before generating a legal summary.');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const result = await generateLegalSummary(narrative, jurisdiction);
      setLegalSummary(result);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to generate legal summary.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return { legalSummary, isLoading, error, run };
};
