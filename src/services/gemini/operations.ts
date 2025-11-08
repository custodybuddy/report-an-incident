import { type IncidentData, type EvidenceFile } from "../../../types";
import { getEvidenceData } from "../evidenceStore";

import { generateStructuredJson } from "./client";
import { tryGetClient, MODEL_NAME } from "./config";
import { composePrompt } from "./prompts";
import { categorizationSchema, legalSchema, summarySchema } from "./schemas";

const resolveEvidenceBase64 = async (
  file: EvidenceFile
): Promise<string | undefined> => {
  if (file.base64) {
    return file.base64;
  }

  if (file.storageId) {
    try {
      return await getEvidenceData(file.storageId);
    } catch (error) {
      console.warn("Failed to retrieve evidence data from IndexedDB", error);
    }
  }

  return undefined;
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

export const generateCategorization = async (
  incidentData: IncidentData
): Promise<{ category: string; severity: string; severityJustification: string }> => {
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

  return generateStructuredJson<{
    category: string;
    severity: string;
    severityJustification: string;
  }>(prompt, categorizationSchema, "categorize incident");
};

export const generateLegalInsights = async (
  incidentData: IncidentData
): Promise<{ legalInsights: string; sources: string[] }> => {
  const prompt = composePrompt(
    incidentData,
    `In this step you must surface authoritative, publicly available statutes and foundational case law related to the scenario described below.
{{CONTEXT}}
Provide a brief summary of key legal considerations specific to family law in ${incidentData.jurisdiction}. The summary should be concise, around 2-3 sentences. Start with the mandatory disclaimer. Your summary must still embed at least two distinct, relevant markdown hyperlinks to primary legal sources (e.g., official legislative websites, court pages) within the 'legalInsights' text. For the 'sources' array, provide 2-4 full, direct URLs to relevant statutes, official guides, or legal aid resources. Prioritize government (.gov, .gc.ca) or official legal body websites. Avoid blogs or private law firm sites. Generate a JSON object that strictly adheres to the schema.`
  );

  return generateStructuredJson<{ legalInsights: string; sources: string[] }>(
    prompt,
    legalSchema,
    "generate legal insights"
  );
};

export const analyzeEvidence = async (
  file: EvidenceFile,
  incidentNarrative: string
): Promise<string> => {
  if (file.type.startsWith("image/")) {
    const base64Data = await resolveEvidenceBase64(file);
    if (!base64Data) {
      return "AI analysis could not be generated because the underlying image data is unavailable.";
    }

    const client = tryGetClient();
    if (!client) {
      return "AI analysis is unavailable because the Gemini API key is not configured.";
    }

    const imagePart = {
      inlineData: {
        mimeType: file.type,
        data: base64Data,
      },
    };

    const prompt = `As a neutral, objective legal assistant, analyze the attached image evidence in the context of the following co-parenting incident narrative:
---
NARRATIVE: "${incidentNarrative}"
---
FILE DETAILS:
- Name: ${file.name}
- User Description: ${file.description || 'Not provided.'}
---
INSTRUCTIONS: Provide a concise, one-sentence summary of this image's potential relevance and evidentiary value. Be factual and avoid speculation.

Example Analysis: "This screenshot appears to corroborate the user's claim of receiving a message at the specified time."`;

    try {
      const response = await client.models.generateContent({
        model: MODEL_NAME,
        contents: { parts: [imagePart, { text: prompt }] },
        config: {
          maxOutputTokens: 100,
        },
      });

      const analysis = response.text?.trim();
      return analysis || "AI analysis could not be generated for this file.";
    } catch (error) {
      console.error("Gemini API Error in analyzeEvidence (image):", error);
      return "AI analysis failed due to a system error.";
    }
  } else if (file.type === "application/pdf") {
    const client = tryGetClient();
    if (!client) {
      return "AI analysis is unavailable because the Gemini API key is not configured.";
    }

    const prompt = `As a neutral, objective legal assistant, analyze the *potential relevance* of the attached document based on its metadata, in the context of the following co-parenting incident narrative:
---
NARRATIVE: "${incidentNarrative}"
---
DOCUMENT DETAILS:
- Name: ${file.name}
- Type: ${file.type}
- User Description: ${file.description || 'Not provided.'}
---
INSTRUCTIONS: Based *only* on the file name and user-provided description, provide a concise, one-sentence summary of this document's likely relevance and evidentiary value. Do not speculate about the document's specific contents, as you cannot read them.

Example Analysis: "A document named 'school_report.pdf' could be relevant if its contents detail the child's academic performance or behavior during the period of the incident."`;

    try {
      const response = await client.models.generateContent({
        model: MODEL_NAME,
        contents: prompt,
        config: {
          maxOutputTokens: 100,
        },
      });

      const analysis = response.text?.trim();
      return analysis || "AI analysis could not be generated for this document's metadata.";
    } catch (error) {
      console.error("Gemini API Error in analyzeEvidence (document):", error);
      return "AI analysis of document metadata failed due to a system error.";
    }
  } else if (file.type.startsWith("audio/")) {
    return `AI analysis for audio files is in development. The file has been logged as evidence.`;
  } else if (file.type.startsWith("video/")) {
    return `AI analysis for video files is in development. The file has been logged as evidence.`;
  }

  return `Analysis for '${file.type}' files is not yet supported.`;
};
