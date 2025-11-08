import { type EvidenceFile } from '@/types';

import { getEvidenceData } from "./evidenceStore";
import { MODEL_NAME, tryGetClient } from "./geminiClient";

const resolveEvidenceBase64 = async (file: EvidenceFile): Promise<string | undefined> => {
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
    } as const;

    const prompt = `As a neutral, objective legal assistant, analyze the attached image evidence in the context of the following co-parenting incident narrative:
---
NARRATIVE: "${incidentNarrative}"
---
FILE DETAILS:
- Name: ${file.name}
- User Description: ${file.description || "Not provided."}
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
- User Description: ${file.description || "Not provided."}
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
    return "AI analysis for audio files is in development. The file has been logged as evidence.";
  } else if (file.type.startsWith("video/")) {
    return "AI analysis for video files is in development. The file has been logged as evidence.";
  }

  return `Analysis for '${file.type}' files is not yet supported.`;
};
