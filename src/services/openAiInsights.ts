import OpenAI from 'openai';
import type { IncidentData } from '../types';
import { OPENAI_MODELS, PROMPTS, SCHEMAS, buildPromptContext, type JsonSchemaDefinition } from './openai/definitions';
export { buildPromptContext } from './openai/definitions';
import { getJurisdictionMetadata } from '../config/jurisdictions';

export interface EvidenceFile {
  name: string;
  type: string;
  base64: string;
  description?: string;
}

export type MessageContent =
  | string
  | Array<
      | { type: 'text'; text: string }
      | { type: 'image_url'; image_url: { url: string; detail?: 'auto' | 'low' | 'high' } }
    >;

export interface UrlCitation {
  url: string;
  title?: string;
  startIndex?: number;
  endIndex?: number;
}

export interface ResponseJsonResult<T> {
  data: T;
  citations: UrlCitation[];
  sources: string[];
}

export interface OpenAIRequestOptions {
  signal?: AbortSignal;
  timeoutMs?: number;
}

class AIRequestError extends Error {
  isAbort?: boolean;
  isTimeout?: boolean;

  constructor(message: string, init?: { cause?: unknown; isAbort?: boolean; isTimeout?: boolean }) {
    super(message);
    this.name = 'AIRequestError';
    this.isAbort = init?.isAbort;
    this.isTimeout = init?.isTimeout;
    if (init?.cause) {
      this.cause = init.cause;
    }
  }
}

const buildSearchFilters = (jurisdiction: string): { allowed_domains?: string[]; user_location?: Record<string, string> } => {
  const location = getJurisdictionMetadata(jurisdiction);

  let allowed_domains: string[] | undefined;
  if (location?.country === 'CA') {
    allowed_domains = ['justice.gc.ca', 'canada.ca', 'canlii.org', 'ontario.ca'];
  } else if (location?.country === 'US') {
    allowed_domains = ['usa.gov', 'uscourts.gov', 'childwelfare.gov', 'hhs.gov'];
  }

  const user_location =
    location?.country
      ? {
          type: 'approximate',
          country: location.country,
          ...(location.region ? { region: location.region } : {}),
        }
      : undefined;

  return { allowed_domains, user_location };
};

const ensureServerEnvironment = () => {
  if (typeof window !== 'undefined') {
    throw new Error('OpenAI calls must be routed through a server; no API key is available in the browser.');
  }
};

const client = new OpenAI();

type OpenAIResponse = Awaited<ReturnType<OpenAI['responses']['create']>>;

type ResponseOutputItem =
  | { type?: string; content?: Array<string | { text?: string; annotations?: Array<Record<string, unknown>> }> }
  | { type?: string; action?: { sources?: string[] }; sources?: string[]; output?: { sources?: string[] } }
  | ({ type?: string } & Record<string, unknown>);

const extractText = (content: unknown): string => {
  if (!content) {
    return '';
  }

  if (typeof content === 'string') {
    return content;
  }

  if (Array.isArray(content)) {
    return content
      .map(part => {
        if (typeof part === 'string') {
          return part;
        }
        if (typeof part === 'object' && part && 'text' in part && typeof (part as { text?: string }).text === 'string') {
          return (part as { text?: string }).text ?? '';
        }
        return '';
      })
      .join('\n')
      .trim();
  }

  if (typeof content === 'object' && 'text' in (content as { text?: string })) {
    return String((content as { text?: string }).text ?? '');
  }

  return '';
};

const extractResponseText = (response: OpenAIResponse): string => {
  if (typeof (response as { output_text?: unknown }).output_text === 'string') {
    const text = (response as { output_text: string }).output_text.trim();
    if (text) {
      return text;
    }
  }

  const output = (response as { output?: ResponseOutputItem[] }).output;
  if (Array.isArray(output)) {
    for (const item of output) {
      const content = (item as { content?: unknown }).content;
      if (Array.isArray(content)) {
        for (const part of content) {
          const text = extractText(part);
          if (text) {
            return text.trim();
          }
        }
      }
      if ((item as { type?: string }).type === 'output_text') {
        const text = extractText((item as { text?: unknown }).text ?? (item as { content?: unknown }).content);
        if (text) {
          return text.trim();
        }
      }
    }
  }

  return '';
};

const extractCitations = (response: OpenAIResponse): UrlCitation[] => {
  const output = (response as { output?: ResponseOutputItem[] }).output;
  if (!Array.isArray(output)) {
    return [];
  }

  const citations: UrlCitation[] = [];
  const seen = new Set<string>();

  output.forEach(item => {
    const content = (item as { content?: unknown }).content;
    if (!Array.isArray(content)) {
      return;
    }

    content.forEach(part => {
      if (part && typeof part === 'object' && 'annotations' in part && Array.isArray((part as { annotations?: unknown }).annotations)) {
        (part as { annotations: Array<Record<string, unknown>> }).annotations.forEach(annotation => {
          const type = annotation.type as string | undefined;
          const url = annotation.url as string | undefined;
          if (type === 'url_citation' && url) {
            const startIndex = (annotation.startIndex as number | undefined) ?? (annotation.start_index as number | undefined);
            const endIndex = (annotation.endIndex as number | undefined) ?? (annotation.end_index as number | undefined);
            const key = `${url}-${startIndex ?? 'x'}-${endIndex ?? 'y'}`;
            if (seen.has(key)) {
              return;
            }
            seen.add(key);
            citations.push({
              url,
              title: annotation.title as string | undefined,
              startIndex,
              endIndex,
            });
          }
        });
      }
    });
  });

  return citations;
};

const extractSources = (response: OpenAIResponse): string[] => {
  const sources = new Set<string>();
  const output = (response as { output?: ResponseOutputItem[] }).output;

  (Array.isArray(output) ? output : []).forEach(item => {
    if ((item as { type?: string }).type === 'web_search_call') {
      const fromAction = (item as { action?: { sources?: string[] } }).action?.sources;
      const directSources = (item as { sources?: string[] }).sources;
      const nestedSources = (item as { output?: { sources?: string[] } }).output?.sources;
      [fromAction, directSources, nestedSources].forEach(list => {
        (Array.isArray(list) ? list : []).forEach(url => {
          if (typeof url === 'string' && url.trim()) {
            sources.add(url.trim());
          }
        });
      });
    }
  });

  extractCitations(response).forEach(citation => sources.add(citation.url));

  return Array.from(sources);
};

const parseJson = <T>(text: string, errorMessage: string): T => {
  try {
    return JSON.parse(text || '{}') as T;
  } catch (error) {
    throw new AIRequestError(errorMessage, { cause: error });
  }
};

const combineSignalWithTimeout = (
  options?: OpenAIRequestOptions
): { signal?: AbortSignal; cleanup: () => void; timedOut: () => boolean } => {
  if (!options?.timeoutMs) {
    return { signal: options?.signal, cleanup: () => {}, timedOut: () => false };
  }

  const controller = new AbortController();
  const timeoutReason = new Error('timeout');
  const timeoutId = setTimeout(() => controller.abort(timeoutReason), options.timeoutMs);
  const timedOut = () => controller.signal.reason === timeoutReason;

  if (options.signal) {
    if (options.signal.aborted) {
      controller.abort(options.signal.reason);
    } else {
      options.signal.addEventListener('abort', () => controller.abort(options.signal?.reason));
    }
  }

  return {
    signal: controller.signal,
    cleanup: () => clearTimeout(timeoutId),
    timedOut,
  };
};

const createResponse = async (params: Parameters<OpenAI['responses']['create']>[0], options?: OpenAIRequestOptions) => {
  ensureServerEnvironment();
  const { signal, cleanup, timedOut } = combineSignalWithTimeout(options);

  try {
    return await client.responses.create(params, { signal });
  } catch (error) {
    if (error instanceof OpenAI.APIError) {
      throw error;
    }

    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new AIRequestError('OpenAI request was aborted', { cause: error, isAbort: true, isTimeout: timedOut() });
    }

    throw new AIRequestError('Failed to reach OpenAI services', { cause: error });
  } finally {
    cleanup();
  }
};

const normalizeErrorForUi = (error: unknown): never => {
  console.error('OpenAI request failed:', error);

  if (error instanceof AIRequestError) {
    if (error.isAbort) {
      if (error.isTimeout) {
        throw new Error('The AI request timed out. Please try again.');
      }
      throw new Error('The AI request was canceled. Please try again if needed.');
    }

    throw new Error('The AI service is unavailable right now. Please try again shortly.');
  }

  if (error instanceof OpenAI.APIError) {
    throw new Error('The AI service is unavailable right now. Please try again shortly.');
  }

  throw new Error('An unexpected error occurred while generating AI insights.');
};

const callChatJson = async <T>(
  payload: { instructions: string; prompt: string; schema: JsonSchemaDefinition; model?: string; temperature?: number },
  options?: OpenAIRequestOptions
): Promise<T> => {
  try {
    const response = await createResponse(
      {
        model: payload.model ?? OPENAI_MODELS.chat,
        instructions: payload.instructions,
        input: [{ role: 'user', content: payload.prompt }],
        temperature: payload.temperature,
        response_format: { type: 'json_schema', json_schema: payload.schema },
      },
      options
    );

    const text = extractResponseText(response);
    return parseJson<T>(text, 'OpenAI response was not valid JSON.');
  } catch (error) {
    return normalizeErrorForUi(error);
  }
};

const callChatText = async (
  payload: { instructions?: string; content: MessageContent; model?: string; temperature?: number },
  options?: OpenAIRequestOptions
): Promise<string> => {
  try {
    const response = await createResponse(
      {
        model: payload.model ?? OPENAI_MODELS.chat,
        instructions: payload.instructions,
        input: [{ role: 'user', content: payload.content }],
        temperature: payload.temperature,
      },
      options
    );

    const text = extractResponseText(response);
    if (!text) {
      throw new AIRequestError('OpenAI returned an empty response.');
    }
    return text.trim();
  } catch (error) {
    return normalizeErrorForUi(error);
  }
};

const callResponseJson = async <T>(
  payload: {
    instructions: string;
    prompt: string;
    schema: JsonSchemaDefinition;
    model?: string;
    tools?: unknown[];
    include?: string[];
    temperature?: number;
  },
  options?: OpenAIRequestOptions
): Promise<ResponseJsonResult<T>> => {
  try {
    const response = await createResponse(
      {
        model: payload.model ?? OPENAI_MODELS.webSearch ?? OPENAI_MODELS.chat,
        instructions: payload.instructions,
        input: [{ role: 'user', content: payload.prompt }],
        temperature: payload.temperature,
        tools: payload.tools,
        tool_choice: payload.tools ? 'auto' : 'none',
        response_format: { type: 'json_schema', json_schema: payload.schema },
        ...(payload.include ? { include: payload.include } : {}),
      },
      options
    );

    const text = extractResponseText(response);
    const data = parseJson<T>(text, 'OpenAI response was not valid JSON.');
    const citations = extractCitations(response);
    const sources = extractSources(response);

    return { data, citations, sources };
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
      instructions:
        'You are an expert legal documentation assistant. All outputs must be impartial, precise, and compliant with the requested schema.',
      prompt: PROMPTS.professionalSummary(context),
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
      instructions: 'Classify incidents using formal legal language and adhere to the provided JSON schema.',
      prompt: PROMPTS.categorization(context),
      schema: SCHEMAS.categorization,
    },
    options
  );
};

export const generateLegalInsights = async (
  incidentData: IncidentData,
  options?: OpenAIRequestOptions
): Promise<{ legalInsights: string; sources: string[]; citations: ResponseJsonResult<unknown>['citations'] }> => {
  const context = buildPromptContext(incidentData);
  const prompt = PROMPTS.legalInsights(context, incidentData.jurisdiction);
  const { allowed_domains, user_location } = buildSearchFilters(incidentData.jurisdiction || '');

  try {
    const result = await callResponseJson<{ legalInsights: string; sources: string[] }>(
      {
        instructions: 'Provide neutral, jurisdiction-aware legal information with official sources. Never offer legal advice.',
        prompt,
        schema: SCHEMAS.legal,
        tools: [
          {
            type: 'web_search',
            ...(allowed_domains ? { filters: { allowed_domains } } : {}),
            ...(user_location ? { user_location } : {}),
          },
        ],
        include: ['output_text', 'web_search_call.action.sources'],
      },
      options
    );

    return {
      legalInsights: result.data.legalInsights,
      sources: result.sources.length ? result.sources : result.data.sources,
      citations: result.citations,
    };
  } catch (error) {
    console.error('Web search legal insights failed, falling back to standard completion:', error);
    const fallback = await callChatJson<{ legalInsights: string; sources: string[] }>(
      {
        instructions: 'Provide neutral, jurisdiction-aware legal information with official sources. Never offer legal advice.',
        prompt,
        schema: SCHEMAS.legal,
      },
      options
    );

    return {
      legalInsights: fallback.legalInsights,
      sources: fallback.sources,
      citations: [],
    };
  }
};

export const generateNextSteps = async (
  incidentData: IncidentData,
  options?: OpenAIRequestOptions
): Promise<{ observedImpact: string }> => {
  const context = buildPromptContext(incidentData);
  return callChatJson(
    {
      instructions: 'Focus on child-centered, de-escalating insights. Follow the schema exactly and keep tone neutral.',
      prompt: PROMPTS.nextSteps(context),
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
    {
      instructions:
        'You are a legal assistant specializing in communication documentation. Draft concise, professional, purely objective messages suitable for court disclosure.',
      content: PROMPTS.communicationDraft(objectiveNarrative, date, time),
    },
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

    return callChatText({ content: contentParts }, options);
  }

  if (file.type === 'application/pdf') {
    return callChatText(
      { content: PROMPTS.evidencePdf(file.name, file.type, file.description || '', incidentNarrative) },
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
