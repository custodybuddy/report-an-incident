import type { IncidentData } from '../types';
import {
  createOpenAIClient,
  OpenAIClientError,
  type MessageContent,
  type OpenAIMessage,
  type OpenAIRequestOptions,
} from './openai/client';
import { OPENAI_MODELS, PROMPTS, SCHEMAS, buildPromptContext } from './openai/definitions';
export { buildPromptContext } from './openai/definitions';

export interface EvidenceFile {
  name: string;
  type: string;
  base64: string;
  description?: string;
}

const getOpenAiApiKey = (): string => {
  const serverKey =
    typeof process !== 'undefined'
      ? process.env.OPENAI_API_KEY ?? process.env.VITE_OPENAI_API_KEY
      : undefined;
  const clientKey = typeof import.meta !== 'undefined'
    ? import.meta.env?.OPENAI_API_KEY ?? import.meta.env?.VITE_OPENAI_API_KEY
    : undefined;

  const apiKey = serverKey ?? clientKey;
  if (!apiKey) {
    throw new Error('Missing OpenAI API key. The key must be provided on the server.');
  }
  return apiKey;
};

const getClient = (() => {
  let client: ReturnType<typeof createOpenAIClient> | null = null;
  return () => {
    if (!client) {
      client = createOpenAIClient({
        apiKey: getOpenAiApiKey(),
        defaultModel: OPENAI_MODELS.chat,
        webModel: OPENAI_MODELS.webSearch,
      });
    }
    return client;
  };
})();

const normalizeErrorForUi = (error: unknown): never => {
  console.error('OpenAI request failed:', error);

  if (error instanceof OpenAIClientError) {
    if (error.isAbortError) {
      throw new Error('The AI request was canceled. Please try again if needed.');
    }

    throw new Error('The AI service is unavailable right now. Please try again shortly.');
  }

  throw new Error('An unexpected error occurred while generating AI insights.');
};

const callChatJson = async <T>(
  payload: { messages: OpenAIMessage[]; schema: typeof SCHEMAS[keyof typeof SCHEMAS] },
  options?: OpenAIRequestOptions
): Promise<T> => {
  try {
    return await getClient().chatJson<T>(
      { messages: payload.messages, schema: payload.schema },
      options
    );
  } catch (error) {
    return normalizeErrorForUi(error);
  }
};

const callChatText = async (messages: OpenAIMessage[], options?: OpenAIRequestOptions) => {
  try {
    return await getClient().chatText({ messages }, options);
  } catch (error) {
    return normalizeErrorForUi(error);
  }
};

const callResponseJson = async <T>(
  payload: {
    prompt: string;
    schema: typeof SCHEMAS[keyof typeof SCHEMAS];
    tools?: unknown[];
  },
  options?: OpenAIRequestOptions
): Promise<T> => {
  try {
    return await getClient().responseJson<T>(
      {
        prompt: payload.prompt,
        schema: payload.schema,
        tools: payload.tools,
      },
      options
    );
  } catch (error) {
    return normalizeErrorForUi(error);
  }
};

export const generateProfessionalSummary = async (
  incidentData: IncidentData,
  options?: OpenAIRequestOptions
): Promise<{ title: string; professionalSummary: string }> => {
  const context = buildPromptContext(incidentData);
  return callChatJson<{ title: string; professionalSummary: string }>(
    {
      messages: [
        {
          role: 'system',
          content:
            'You are an expert legal documentation assistant. All outputs must be impartial, precise, and compliant with the requested schema.',
        },
        { role: 'user', content: PROMPTS.professionalSummary(context) },
      ],
      schema: SCHEMAS.summary,
    },
    options
  );
};

export const generateCategorization = async (
  incidentData: IncidentData,
  options?: OpenAIRequestOptions
): Promise<{
  category: string;
  severity: string;
  severityJustification: string;
}> => {
  const context = buildPromptContext(incidentData);
  return callChatJson(
    {
      messages: [
        {
          role: 'system',
          content: 'Classify incidents using formal legal language and adhere to the provided JSON schema.',
        },
        { role: 'user', content: PROMPTS.categorization(context) },
      ],
      schema: SCHEMAS.categorization,
    },
    options
  );
};

export const generateLegalInsights = async (
  incidentData: IncidentData,
  options?: OpenAIRequestOptions
): Promise<{ legalInsights: string; sources: string[] }> => {
  const context = buildPromptContext(incidentData);
  const prompt = PROMPTS.legalInsights(context, incidentData.jurisdiction);

  try {
    return await callResponseJson<{ legalInsights: string; sources: string[] }>(
      {
        prompt,
        schema: SCHEMAS.legal,
        tools: [{ type: 'web_search_preview' }],
      },
      options
    );
  } catch (error) {
    console.error('Web search legal insights failed, falling back to standard completion:', error);
    return callChatJson(
      {
        messages: [
          {
            role: 'system',
            content:
              'Provide neutral, jurisdiction-aware legal information with official sources. Never offer legal advice.',
          },
          { role: 'user', content: prompt },
        ],
        schema: SCHEMAS.legal,
      },
      options
    );
  }
};

export const generateNextSteps = async (
  incidentData: IncidentData,
  options?: OpenAIRequestOptions
): Promise<{ observedImpact: string }> => {
  const context = buildPromptContext(incidentData);
  return callChatJson(
    {
      messages: [
        {
          role: 'system',
          content: 'Focus on child-centered, de-escalating insights. Follow the schema exactly and keep tone neutral.',
        },
        { role: 'user', content: PROMPTS.nextSteps(context) },
      ],
      schema: SCHEMAS.nextSteps,
    },
    options
  );
};

export const generateCommunicationDraft = async (
  objectiveNarrative: string,
  date: string,
  time: string,
  options?: OpenAIRequestOptions
): Promise<string> =>
  callChatText(
    [
      {
        role: 'system',
        content:
          'You are a legal assistant specializing in communication documentation. Draft concise, professional, purely objective messages suitable for court disclosure.',
      },
      { role: 'user', content: PROMPTS.communicationDraft(objectiveNarrative, date, time) },
    ],
    options
  );

export const analyzeEvidence = async (
  file: EvidenceFile,
  incidentNarrative: string,
  options?: OpenAIRequestOptions
): Promise<string> => {
  if (file.type.startsWith('image/')) {
    const contentParts: MessageContent = [
      { type: 'text', text: PROMPTS.evidenceImage(file.name, file.type, file.description || '', incidentNarrative) },
      {
        type: 'image_url',
        image_url: {
          url: `data:${file.type};base64,${file.base64}`,
          detail: 'low',
        },
      },
    ];

    return callChatText([{ role: 'user', content: contentParts }], options);
  }

  if (file.type === 'application/pdf') {
    return callChatText(
      [{ role: 'user', content: PROMPTS.evidencePdf(file.name, file.type, file.description || '', incidentNarrative) }],
      options
    );
  }

  if (file.type.startsWith('audio/')) {
    return 'AI analysis for audio files is in development. The file has been logged as evidence.';
  }

  if (file.type.startsWith('video/')) {
    return 'AI analysis for video files is in development. The file has been logged as evidence.';
  }

  return `Analysis for '${file.type}' files is not yet supported.`;
};
