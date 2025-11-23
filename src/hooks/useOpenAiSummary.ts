import { useState } from 'react';
import { generateNarrativeSummary, isOpenAIConfigured } from '@/services/openaiClient';

export const useOpenAiSummary = () => {
  const [summary, setSummary] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const runSummary = async (narrative: string) => {
    if (!narrative.trim()) {
      setError('Add narrative details before requesting a summary.');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const result = await generateNarrativeSummary(narrative);
      setSummary(result);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to generate summary.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    summary,
    error,
    isLoading,
    isAvailable: isOpenAIConfigured,
    runSummary,
  };
};
