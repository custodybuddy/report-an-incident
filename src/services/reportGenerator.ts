import type { IncidentData, ReportResult } from '../types';
import {
  buildPromptContext,
  generateCategorization,
  generateCommunicationDraft,
  generateLegalInsights,
  generateNextSteps,
  generateProfessionalSummary,
} from './openAiInsights';

const isBrowser = typeof window !== 'undefined';
const getApiBaseUrl = () => {
  // Prefer explicit env configuration.
  const envValue =
    typeof import.meta !== 'undefined' && import.meta.env?.VITE_REPORT_API_URL
      ? import.meta.env.VITE_REPORT_API_URL
      : undefined;

  if (envValue) {
    return envValue.replace(/\/$/, '');
  }

  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    const isLocalHost = host === 'localhost' || host === '127.0.0.1';
    if (isLocalHost) {
      // Local dev: route to local proxy to avoid CORS.
      return 'http://127.0.0.1:8788/api';
    }
    // Non-localhost fallback to hosted API.
    return 'https://custodybuddy.com/api';
  }

  return 'https://custodybuddy.com/api';
};

const requestViaProxy = async (incident: IncidentData): Promise<ReportResult> => {
  const response = await fetch(`${getApiBaseUrl()}/incident-report`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(incident),
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

export const generateIncidentReport = async (incident: IncidentData): Promise<ReportResult> => {
  if (isBrowser) {
    return requestViaProxy(incident);
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
