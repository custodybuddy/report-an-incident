import { Type } from "@google/genai";

import { type IncidentData } from '@/types';

export const buildPromptContext = (incidentData: IncidentData): string => {
  const evidenceDetails =
    incidentData.evidence.length > 0
      ? incidentData.evidence
          .map(
            evidence =>
              `- File: ${evidence.name} (Category: ${evidence.category})\n  Description: ${evidence.description || "N/A"}`
          )
          .join("\n")
      : "None specified";

  const formatList = (items: string[], fallback = "None specified") =>
    items.length > 0 ? items.join(", ") : fallback;

  return `
INCIDENT DETAILS:
- Date: ${incidentData.date || "Not specified"}
- Time: ${incidentData.time || "Not specified"}
- Jurisdiction: ${incidentData.jurisdiction || "Not specified"}
- Case Number: ${incidentData.caseNumber || "N/A"}
- Parties Involved: ${formatList(incidentData.parties)}
- Children Present/Affected: ${formatList(incidentData.children)}
- Evidence Attached:\n${evidenceDetails}
- Original Account: ${incidentData.narrative}
`;
};

export const META_PROMPT = `You are the Family Law Research Assistant, a professional, objective, and precise legal information
specialist. Your primary goal is to guide users through a 5-step conversational wizard to find and understand publicly available
 family law statutes and foundational case law relevant to a specific jurisdiction and query. Your final output must be a professionally structured Formal Legal Research Summary Report that users can use as documentation evidence.

Search & Synthesize (The Research)
- Action (Browsing): Once you have the jurisdiction and topic, you must use the browsing tool.
- Search Strategy: Formulate multiple search queries to find the most relevant information.
  • For Statutes: Search for the official state/provincial legal codes (e.g., "California Family Code spousal support," "Ontario Family Law Act parenting time").
  • For Case Law: Search for landmark or recent cases (e.g., "landmark child custody cases Texas," "Ontario case law on property division").
- Action (Synthesize): Organize the search results clearly for the user.
  • For Statutes: Provide the code or statute number (e.g., CA Family Code § 4320), its title, and a brief, objective summary of its content.
  • For Case Law: Provide the case name (e.g., Smith v. Smith, 2023 ONCA 123), the court, the year, and a one-sentence summary of the legal principle or holding.
- Language: Use clear, plain English. When you quote a statute or case, you may use the formal legal text, but you must offer a simple, plain-English summary of its meaning immediately after.
- Accuracy: You must use the Browsing tool to find current, verifiable information. Prioritize official legislative websites (e.g., .gov, .gc.ca, state legislature sites) and reputable legal citation databases (e.g., CanLII, Cornell LII).
- Citations: Provide a precise citation for every statute and case (e.g., [Jurisdiction] Family Code § 4055 or Smith v. Smith, 123 Cal. App. 4th 567 (2020)).

GOVERNING STATUTES
Purpose: These are the foundational laws passed by the legislature relevant to the research query.

[Statute Name and Citation, e.g., Family Code § 4055]
Source URL: [Provide direct URL from browsing tool]
Plain English Summary: "In simple terms, this statute establishes/defines/mandates..."

[Statute Name 2 and Citation...]
Source URL: [Provide direct URL from browsing tool]
Plain English Summary: "In simple terms, this statute addresses..."

II. HIGH-PRECEDENT CASE LAW
Purpose: These cases interpret the statutes above and set binding legal precedent for lower courts in the jurisdiction.

[Case Name and Full Citation, e.g., Smith v. Jones, 123 Cal. App. 4th 567 (2020)]
Jurisdictional Level: [e.g., State Supreme Court, Appellate Court, etc.]
Holding Summary: "The court's decision (holding) in this case established the legal test/standard that..."

[Case Name 2 and Full Citation...]
Jurisdictional Level: [e.g., State Supreme Court, Appellate Court, etc.]
Holding Summary: "The court further clarified/modified the law by ruling that..."

III. RELATED LEGAL CONCEPTS / GLOSSARY
Purpose: Definitions of key legal terms relevant to the findings.

[Term 1, e.g., 'Best Interests of the Child']: [Provide a concise legal definition.]

[Term 2, e.g., 'Community Property']: [Provide a concise legal definition.]`;

const composePrompt = (incidentData: IncidentData, template: string): string => {
  const context = buildPromptContext(incidentData);
  const instructions = template.includes("{{CONTEXT}}")
    ? template.replace("{{CONTEXT}}", context)
    : `${template.trim()}\n${context}`;
  return `${META_PROMPT}
${instructions.trim()}`;
};

export interface StructuredPromptConfig<T> {
  prompt: string;
  schema: Record<string, unknown>;
  description: string;
}

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

export const buildProfessionalSummaryPrompt = (
  incidentData: IncidentData
): StructuredPromptConfig<{
  title: string;
  professionalSummary: string;
}> => {
  const schema = {
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
  } satisfies Record<string, unknown>;

  const prompt = composePrompt(
    incidentData,
    `Strip all subjectivity, emotion, and speculation from the user's narrative, converting it into a sterile, factual account suitable for legal documentation.
{{CONTEXT}}
Analyze the incident and generate a JSON object that strictly adheres to the provided schema. Structure the summary into three distinct paragraphs: 1) Context, 2) Chronology of Events, 3) Outcome.`
  );

  return {
    prompt,
    schema,
    description: "generate professional summary",
  };
};
