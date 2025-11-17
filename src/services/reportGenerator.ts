import type { IncidentData, ReportResult } from '../types';
import {
  buildPromptContext,
  generateCategorization,
  generateCommunicationDraft,
  generateLegalInsights,
  generateNextSteps,
  generateProfessionalSummary,
} from './openAiInsights';

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
};

const fallbackNextSteps = {
  observedImpact: 'Impact analysis unavailable.',
};

export const generateIncidentReport = async (incident: IncidentData): Promise<ReportResult> => {
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
    observedImpact: nextSteps.observedImpact,
    communicationDraft,
    rawResponse: buildPromptContext(incident),
  };
};
