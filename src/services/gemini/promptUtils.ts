import { type GenerateContentResponse } from "@google/genai";
import { type IncidentData } from "../../../types";

import { getClient, MODEL_NAME } from "./client";

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

export const META_PROMPT = `You are the Family Law Research Assistant, a professional, objective, and precise legal information specialist. Your primary goal is to guide users through a 5-step conversational wizard to find and understand publicly available family law statutes and foundational case law relevant to a specific jurisdiction and query. Your final output must be a professionally structured Formal Legal Research Summary Report that users can use as documentation evidence.

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

export const sanitizeJsonResponse = (raw?: string | null): string | null => {
  if (!raw) {
    return null;
  }

  let text = raw.trim();
  if (text.startsWith("```") && text.includes("\n")) {
    const firstLineBreak = text.indexOf("\n");
    const closingFence = text.lastIndexOf("```");
    if (firstLineBreak !== -1 && closingFence > firstLineBreak) {
      text = text.slice(firstLineBreak + 1, closingFence).trim();
    } else {
      text = text.replace(/```/g, "").trim();
    }
  } else if (text.startsWith("```")) {
    text = text.replace(/```/g, "").trim();
  }

  return text;
};

export const composePrompt = (incidentData: IncidentData, template: string): string => {
  const context = buildPromptContext(incidentData);
  const instructions = template.includes("{{CONTEXT}}")
    ? template.replace("{{CONTEXT}}", context)
    : `${template.trim()}\n${context}`;
  return `${META_PROMPT}
${instructions.trim()}`;
};

export const generateStructuredJson = async <T>(
  prompt: string,
  schema: Record<string, unknown>,
  operationDescription: string
): Promise<T> => {
  const ai = getClient();
  let response: GenerateContentResponse | undefined;

  try {
    response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: { responseMimeType: "application/json", responseSchema: schema },
    });

    const text = sanitizeJsonResponse(response.text);
    if (!text) {
      throw new Error("Received an empty response from the Gemini API.");
    }

    return JSON.parse(text) as T;
  } catch (error) {
    console.error(`Gemini API Error while attempting to ${operationDescription}:`, error);

    if (error instanceof SyntaxError && response?.text) {
      console.error(`Malformed JSON response from Gemini for ${operationDescription}:`, response.text);
      throw new Error(
        `The AI returned an invalid JSON response, which could be due to safety settings or an unexpected output. Raw response: "${response.text}"`
      );
    }

    if (error instanceof Error && error.message.includes("Gemini API key")) {
      throw error;
    }

    throw new Error(`Failed to ${operationDescription}.`);
  }
};
