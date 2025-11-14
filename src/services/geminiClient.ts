import { GoogleGenAI } from "@google/genai";

type EnvRecord = Record<string, string | undefined>;

const resolveViteEnv = (): EnvRecord => {
  if (typeof import.meta !== "undefined" && typeof import.meta.env !== "undefined") {
    return import.meta.env as EnvRecord;
  }
  return {};
};

const resolveApiKey = (): string | undefined => {
  const { VITE_GEMINI_API_KEY, VITE_API_KEY } = resolveViteEnv();
  const key =
    VITE_GEMINI_API_KEY ||
    VITE_API_KEY ||
    process.env.GEMINI_API_KEY ||
    process.env.API_KEY;
  return key?.trim() || undefined;
};

const API_KEY = resolveApiKey();

if (!API_KEY) {
  console.warn(
    "VITE_GEMINI_API_KEY environment variable not set. Gemini API calls will fail."
  );
}

export const MODEL_NAME = "gemini-2.5-flash";

let cachedClient: GoogleGenAI | null = null;

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

export { resolveApiKey };
