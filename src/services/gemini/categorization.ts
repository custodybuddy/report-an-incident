import { type IncidentData } from '@/types';

import { generateStructuredJson } from "./promptUtils";
import { buildCategorizationPrompt } from "../geminiPrompts";

export const generateCategorization = async (
  incidentData: IncidentData
): Promise<{
  category: string;
  severity: string;
  severityJustification: string;
}> => {
  const request = buildCategorizationPrompt(incidentData);
  return generateStructuredJson(request);
};
