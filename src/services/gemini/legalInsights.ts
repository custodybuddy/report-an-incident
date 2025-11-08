import { type IncidentData } from '@/types';

import { buildLegalInsightsPrompt } from "../geminiPrompts";
import { generateStructuredJson } from "./promptUtils";

export const generateLegalInsights = async (
  incidentData: IncidentData
): Promise<{ legalInsights: string; sources: string[] }> => {
  const request = buildLegalInsightsPrompt(incidentData);
  return generateStructuredJson(request);
};
