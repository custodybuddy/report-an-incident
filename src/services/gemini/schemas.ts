import { Type } from "@google/genai";

export const summarySchema = {
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
} as const;

export const categorizationSchema = {
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
} as const;

export const legalSchema = {
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
} as const;
