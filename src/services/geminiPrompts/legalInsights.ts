import { Type } from "@google/genai";

import { type IncidentData } from '@/types';

import { composePrompt } from './context';
import type { StructuredPromptConfig } from './types';

export const buildLegalInsightsPrompt = (
  incidentData: IncidentData
): StructuredPromptConfig<{
  legalInsights: string;
  sources: string[];
}> => {
  const schema = {
    type: Type.OBJECT,
    properties: {
      legalInsights: {
        type: Type.STRING,
        description:
          "A concise summary (2-3 sentences) of key legal considerations. Must begin with the mandatory disclaimer: 'This is not legal advice and is for informational purposes only. You should consult with a qualified legal professional.' The summary must include at least two specific, clickable markdown hyperlinks to different primary legal sources (e.g., official legislative websites, court pages) relevant to the jurisdiction.",
      },
      sources: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description:
          "An array of 2 to 4 full, direct URLs to relevant articles, statutes, or guides from official government or reputable legal aid websites. These should be different from the links embedded in 'legalInsights'. Example: 'https://www.justice.gc.ca/eng/fl-df/parent/mp-pm/toc-tdm.html'.",
      },
    },
    required: ["legalInsights", "sources"],
  } satisfies Record<string, unknown>;

  const prompt = composePrompt(
    incidentData,
    `In this step you must surface authoritative, publicly available statutes and foundational case law related to the scenario described below.
{{CONTEXT}}
Provide a brief summary of key legal considerations specific to family law in ${incidentData.jurisdiction}. The summary should be concise, around 2-3 sentences. Start with the mandatory disclaimer. Your summary must still embed at least two distinct, relevant markdown hyperlinks to primary legal sources (e.g., official legislative websites, court pages) within the 'legalInsights' text. For the 'sources' array, provide 2-4 full, direct URLs to relevant statutes, official guides, or legal aid resources. Prioritize government (.gov, .gc.ca) or official legal body websites. Avoid blogs or private law firm sites. Generate a JSON object that strictly adheres to the schema.`
  );

  return {
    prompt,
    schema,
    description: "generate legal insights",
  };
};
