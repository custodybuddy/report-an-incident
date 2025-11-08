import { Type } from "@google/genai";

import { type IncidentData } from '@/types';

import { composePrompt } from './context';
import type { StructuredPromptConfig } from './types';

export const buildCategorizationPrompt = (
  incidentData: IncidentData
): StructuredPromptConfig<{
  category: string;
  severity: string;
  severityJustification: string;
}> => {
  const schema = {
    type: Type.OBJECT,
    properties: {
      category: {
        type: Type.STRING,
        description:
          "Select the single most fitting category from this list: Child Safety & Welfare, Parenting Time Violation, Breach of Court Order (Non-Time Related), Parental Alienation Tactics, Hostile/Disparaging Conduct, Communication Breakdown, Medical/Educational Disagreements, Financial Disputes, Property/Possession Issues, Relocation/Move-Away Issues, Access to Information (Medical/School), Third-Party Contact/Grandparent Issues, Substance Abuse/Addiction Concerns, Inappropriate Use of Technology/Social Media, Other.",
      },
      severity: {
        type: Type.STRING,
        description: "Assign a severity level: Low, Medium, or High.",
      },
      severityJustification: {
        type: Type.STRING,
        description:
          "Justify the severity level in one or two sentences, referencing key facts from the narrative that support your choice. Example: 'The severity is High due to the direct violation of the parenting time order and the reported distress of the child.'",
      },
    },
    required: ["category", "severity", "severityJustification"],
  } satisfies Record<string, unknown>;

  const prompt = composePrompt(
    incidentData,
    `Your task in this step is to classify the co-parenting incident described below with a single best-fit category and severity level.
{{CONTEXT}}
Choose only one 'category' that best represents the core of the incident. Assign a 'severity' level based on the following criteria:
- High: Involves physical harm, credible threats, or direct violations of a court order concerning child safety.
- Medium: Involves significant emotional distress, clear patterns of non-compliance, or alienation tactics.
- Low: Involves minor disagreements, communication issues, or logistical disputes.
Generate a JSON object that strictly adheres to the schema.`
  );

  return {
    prompt,
    schema,
    description: "categorize incident",
  };
};
