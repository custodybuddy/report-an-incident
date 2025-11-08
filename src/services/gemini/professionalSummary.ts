import { type IncidentData } from '@/types';

import { buildProfessionalSummaryPrompt } from "../geminiPrompts";
import { generateStructuredJson } from "./promptUtils";

export const generateProfessionalSummary = async (
  incidentData: IncidentData
): Promise<{ title: string; professionalSummary: string }> => {
  const request = buildProfessionalSummaryPrompt(incidentData);
  return generateStructuredJson(request);
};
