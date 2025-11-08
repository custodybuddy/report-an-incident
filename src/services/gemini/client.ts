import { type GenerateContentResponse } from "@google/genai";

import { getClient, MODEL_NAME } from "./config";

export const sanitizeJsonResponse = (raw?: string | null): string | null => {
  if (!raw) {
    return null;
  }

  let text = raw.trim();
  if (text.startsWith("```")) {
    const firstLineBreak = text.indexOf("\n");
    const closingFence = text.lastIndexOf("```");
    if (firstLineBreak !== -1 && closingFence > firstLineBreak) {
      text = text.slice(firstLineBreak + 1, closingFence).trim();
    } else {
      text = text.replace(/```/g, "").trim();
    }
  }

  return text;
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
