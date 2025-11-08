import { Type } from "@google/genai";

import { type IncidentData } from '@/types';
import { composePrompt, generateStructuredJson } from "./promptUtils";

const summarySchema = {
  type: Type.OBJECT,
  properties: {
    title: {
      type: Type.STRING,
      description:
        "A brief, factual title for the incident report. Example: 'Dispute Regarding Parenting Time Exchange on Month Day, Year'.",
    },
    professionalSummary: {
      type: Type.STRING,
      description:
        "A detailed, objective summary written in the third person, spanning 2-3 paragraphs. The first paragraph must establish the context (date, time, parties). The second must chronologically detail the key factual events—what was said and done by each party. The final paragraph must state the outcome or resolution of the immediate incident. Use newline characters ('\\n') to separate paragraphs. Strictly adhere to factual reporting.",
    },
  },
  required: ["title", "professionalSummary"],
};

export const generateProfessionalSummary = async (
  incidentData: IncidentData
): Promise<{ title: string; professionalSummary: string }> => {
  const prompt = composePrompt(
    incidentData,
    `Strip all subjectivity, emotion, and speculation from the user's narrative, converting it into a sterile, factual account suitable for legal documentation.
{{CONTEXT}}
Analyze the incident and generate a JSON object that strictly adheres to the provided schema. Structure the summary into three distinct paragraphs: 1) Context, 2) Chronology of Events, 3) Outcome.`
  );

  return generateStructuredJson<{ title: string; professionalSummary: string }>(
    prompt,
    summarySchema,
    "generate professional summary"
  );
};
