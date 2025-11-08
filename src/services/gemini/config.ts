import { GoogleGenAI } from "@google/genai";

export const MODEL_NAME = "gemini-2.5-flash";

let cachedClient: GoogleGenAI | null = null;

export const resolveApiKey = (): string | undefined => {
  const env = import.meta.env as Record<string, string | undefined>;
  const key = env.VITE_GEMINI_API_KEY || env.VITE_API_KEY;
  return key?.trim() || undefined;
};

export const getClient = (): GoogleGenAI => {
  const apiKey = resolveApiKey();
  if (!apiKey) {
    throw new Error(
      "Gemini API key is not configured. Please set the VITE_GEMINI_API_KEY environment variable."
    );
  }

  if (!cachedClient) {
    cachedClient = new GoogleGenAI({ apiKey });
  }

  return cachedClient;
};

export const tryGetClient = (): GoogleGenAI | null => {
  try {
    return getClient();
  } catch (error) {
    if (error instanceof Error) {
      console.warn(error.message);
    }
    return null;
  }
};

if (!resolveApiKey()) {
  console.warn(
    "VITE_GEMINI_API_KEY environment variable not set. Gemini API calls will fail."
  );
}
