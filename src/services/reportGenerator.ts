import type { IncidentData, ReportResult } from '../types';
import {
  buildPromptContext,
  generateCategorization,
  generateCommunicationDraft,
  generateLegalInsights,
  generateNextSteps,
  generateProfessionalSummary,
} from './openAiInsights';
import { assertApiBaseUrl } from './apiConfig';

const isBrowser = typeof window !== 'undefined';

const REQUEST_TIMEOUT_MS = 25_000;

const requestViaProxy = async (
  incident: IncidentData,
  signal?: AbortSignal
): Promise<ReportResult> => {
  const abortController = new AbortController();
  const abortHandler = () =>
    abortController.abort(signal?.reason ?? new DOMException('Aborted', 'AbortError'));

  signal?.addEventListener('abort', abortHandler);

  const timeoutId = setTimeout(
    () => abortController.abort(new DOMException('Request timed out', 'TimeoutError')),
    REQUEST_TIMEOUT_MS
  );

  try {
    const response = await fetch(`${assertApiBaseUrl()}/incident-report`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(incident),
      signal: abortController.signal,
    });

    if (!response.ok) {
      const payload = await response.json().catch(() => ({}));
      const message: string =
        typeof payload.error === 'string'
          ? payload.error
          : `Report generation failed (${response.status})`;
      throw new Error(message);
    }

    return (await response.json()) as ReportResult;
  } catch (error) {
    if (abortController.signal.aborted) {
      const reason = abortController.signal.reason;
      if (reason instanceof DOMException && reason.name === 'TimeoutError') {
        throw new Error('Report generation timed out. Please try again.');
      }
      throw new Error('Report generation was canceled. Please try again.');
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
    signal?.removeEventListener('abort', abortHandler);
  }
};

const withFallback = <T>(promise: Promise<T>, fallback: () => T): Promise<T> =>
  promise.catch(error => {
    console.error('OpenAI helper failed:', error);
    return fallback();
  });

const fallbackSummary = {
  title: 'Incident Summary',
  professionalSummary: 'The AI report could not be generated at this time.',
};

const fallbackCategorization = {
  category: 'Pending AI classification',
  severity: 'Unknown',
  severityJustification: 'The AI did not provide a severity rationale.',
};

const fallbackLegal = {
  legalInsights:
    'This is not legal advice and is for informational purposes only. You should consult with a qualified legal professional.',
  sources: [],
  citations: [],
};

const fallbackNextSteps = {
  observedImpact: 'Impact analysis unavailable.',
};

const hasServerApiKey = (): boolean =>
  typeof process !== 'undefined' &&
  Boolean(process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY);

export const generateIncidentReport = async (
  incident: IncidentData,
  signal?: AbortSignal
): Promise<ReportResult> => {
  if (isBrowser) {
    return requestViaProxy(incident, signal);
  }

  if (!hasServerApiKey()) {
    console.warn('Missing OpenAI API key; returning fallback incident report.');
    return {
      title: fallbackSummary.title,
      professionalSummary: fallbackSummary.professionalSummary,
      category: fallbackCategorization.category,
      severity: fallbackCategorization.severity,
      severityJustification: fallbackCategorization.severityJustification,
      legalInsights: fallbackLegal.legalInsights,
      sources: fallbackLegal.sources,
      legalCitations: fallbackLegal.citations,
      observedImpact: fallbackNextSteps.observedImpact,
      communicationDraft: undefined,
      promptContext: buildPromptContext(incident),
      aiResponses: {
        summary: fallbackSummary,
        categorization: fallbackCategorization,
        legal: fallbackLegal,
        nextSteps: fallbackNextSteps,
        communicationDraft: undefined,
      },
    };
  }

  const summaryPromise = withFallback(generateProfessionalSummary(incident), () => fallbackSummary);
  const categorizationPromise = withFallback(generateCategorization(incident), () => fallbackCategorization);
  const legalPromise = withFallback(generateLegalInsights(incident), () => fallbackLegal);
  const nextStepsPromise = withFallback(generateNextSteps(incident), () => fallbackNextSteps);

  const [summary, categorization, legal, nextSteps] = await Promise.all([
    summaryPromise,
    categorizationPromise,
    legalPromise,
    nextStepsPromise,
  ]);

  let communicationDraft: string | undefined;
  try {
    communicationDraft = await generateCommunicationDraft(
      summary.professionalSummary,
      incident.date,
      incident.time
    );
  } catch (error) {
    console.error('OpenAI helper failed (communication draft):', error);
  }

  return {
    title: summary.title,
    professionalSummary: summary.professionalSummary,
    category: categorization.category,
    severity: categorization.severity,
    severityJustification: categorization.severityJustification,
    legalInsights: legal.legalInsights,
    sources: legal.sources,
    legalCitations: legal.citations,
    observedImpact: nextSteps.observedImpact,
    communicationDraft,
    promptContext: buildPromptContext(incident),
    aiResponses: {
      summary,
      categorization,
      legal,
      nextSteps,
      communicationDraft,
    },
  };
};
