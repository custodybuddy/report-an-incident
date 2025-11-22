export type MessageContent =
  | string
  | Array<
      | { type: 'text'; text: string }
      | { type: 'image_url'; image_url: { url: string; detail?: 'auto' | 'low' | 'high' } }
    >;

export interface OpenAIMessage {
  role: 'system' | 'user';
  content: MessageContent;
}

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

export interface JsonSchemaDefinition {
  name: string;
  schema: Record<string, unknown>;
}

export interface OpenAIRequestOptions {
  signal?: AbortSignal;
  timeoutMs?: number;
}

export class OpenAIClientError extends Error {
  status?: number;
  isAbortError?: boolean;

  constructor(message: string, init?: { status?: number; isAbortError?: boolean; cause?: unknown }) {
    super(message);
    this.name = 'OpenAIClientError';
    this.status = init?.status;
    this.isAbortError = init?.isAbortError;
    if (init?.cause) {
      this.cause = init.cause;
    }
  }
}

interface OpenAIClientConfig {
  apiKey: string;
  chatUrl?: string;
  responsesUrl?: string;
  defaultModel?: string;
  webModel?: string;
  temperature?: number;
  fetchImpl?: typeof fetch;
}

const DEFAULT_CHAT_URL = 'https://api.openai.com/v1/chat/completions';
const DEFAULT_RESPONSES_URL = 'https://api.openai.com/v1/responses';
const DEFAULT_TEMPERATURE = 0.2;

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
        if (typeof part === 'object' && part && 'text' in part && typeof part.text === 'string') {
          return part.text;
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

const extractResponseOutput = (responseJson: any): string => {
  const output = responseJson?.output;
  if (Array.isArray(output)) {
    const message = output.find((item: any) => item?.type === 'message');
    if (message?.content) {
      return extractText(message.content);
    }
  }

  const text = responseJson?.text;
  if (typeof text === 'string') {
    return text;
  }

  if (Array.isArray(text)) {
    return text.map((item: any) => (typeof item === 'string' ? item : '')).join('\n');
  }

  return '';
};

const extractCitations = (responseJson: any): UrlCitation[] => {
  const message = responseJson?.output?.find((item: any) => item?.type === 'message');
  if (!message?.content) {
    return [];
  }

  const annotations = (Array.isArray(message.content) ? message.content : [])
    .flatMap((item: any) => (item?.annotations && Array.isArray(item.annotations) ? item.annotations : []))
    .filter((annotation: any) => annotation?.type === 'url_citation' && annotation?.url);

  const seen = new Set<string>();
  return annotations
    .map((annotation: any) => {
      // Normalize snake_case fields from the API into camelCase for downstream consumers.
      const startIndex =
        (annotation.startIndex as number | undefined) ?? (annotation.start_index as number | undefined);
      const endIndex = (annotation.endIndex as number | undefined) ?? (annotation.end_index as number | undefined);

      const key = `${annotation.url}-${startIndex ?? 'x'}-${endIndex ?? 'y'}`;
      if (seen.has(key)) {
        return null;
      }
      seen.add(key);
      return {
        url: annotation.url as string,
        title: annotation.title as string | undefined,
        startIndex,
        endIndex,
      };
    })
    .filter((item): item is UrlCitation => Boolean(item));
};

const extractSources = (responseJson: any): string[] => {
  const sources = new Set<string>();

  const searchCalls = Array.isArray(responseJson?.output)
    ? responseJson.output.filter((item: any) => item?.type === 'web_search_call')
    : [];

  searchCalls.forEach((call: any) => {
    const fromAction = call?.action?.sources ?? call?.sources ?? call?.output?.sources;
    (Array.isArray(fromAction) ? fromAction : []).forEach((url: any) => {
      if (typeof url === 'string' && url.trim()) {
        sources.add(url.trim());
      }
    });
  });

  // Also include any URLs present in citations for completeness.
  extractCitations(responseJson).forEach(citation => sources.add(citation.url));

  return Array.from(sources);
};

const parseJson = <T>(text: string, errorMessage: string): T => {
  try {
    return JSON.parse(text || '{}') as T;
  } catch (error) {
    throw new OpenAIClientError(errorMessage, { cause: error });
  }
};

const combineSignalWithTimeout = (
  options?: OpenAIRequestOptions
): { signal?: AbortSignal; cleanup: () => void; timedOut: () => boolean } => {
  if (!options?.timeoutMs) {
    return { signal: options?.signal, cleanup: () => {}, timedOut: () => false };
  }

  const controller = new AbortController();
  const timeoutReason = new DOMException('Request timed out', 'TimeoutError');
  const timeoutId = setTimeout(() => controller.abort(timeoutReason), options.timeoutMs);
  const timedOut = () => controller.signal.reason instanceof DOMException && controller.signal.reason.name === 'TimeoutError';

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

export const createOpenAIClient = (config: OpenAIClientConfig) => {
  const fetchImpl = (...args: Parameters<typeof fetch>) => (config.fetchImpl ?? fetch)(...args);

  const resolvedConfig = {
    chatUrl: config.chatUrl ?? DEFAULT_CHAT_URL,
    responsesUrl: config.responsesUrl ?? DEFAULT_RESPONSES_URL,
    defaultModel: config.defaultModel,
    webModel: config.webModel,
    temperature: config.temperature ?? DEFAULT_TEMPERATURE,
    fetchImpl,
  };

  const defaultHeaders = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${config.apiKey}`,
  };

  const withDefaults = (model?: string, temperature?: number, modelFallback?: string) => ({
    model: model ?? modelFallback ?? resolvedConfig.defaultModel,
    temperature: temperature ?? resolvedConfig.temperature,
  });

  const execute = async (url: string, body: Record<string, unknown>, options?: OpenAIRequestOptions) => {
    const { signal, cleanup, timedOut } = combineSignalWithTimeout(options);

    try {
      const response = await resolvedConfig.fetchImpl(url, {
        method: 'POST',
        headers: defaultHeaders,
        body: JSON.stringify(body),
        signal,
      });

      if (!response.ok) {
        const errorBody = await response.text().catch(() => '');
        throw new OpenAIClientError(`OpenAI request failed (${response.status})`, {
          status: response.status,
          cause: errorBody,
        });
      }

      return response.json();
    } catch (error) {
      if (error instanceof OpenAIClientError) {
        throw error;
      }

      if (error instanceof DOMException && error.name === 'AbortError') {
        throw new OpenAIClientError(timedOut() ? 'OpenAI request timed out' : 'OpenAI request was aborted', {
          isAbortError: true,
          cause: error,
        });
      }

      throw new OpenAIClientError('Failed to reach OpenAI services', { cause: error });
    } finally {
      cleanup();
    }
  };

  const chatText = async (
    payload: { messages: OpenAIMessage[]; model?: string; temperature?: number; response_format?: unknown },
    options?: OpenAIRequestOptions
  ): Promise<string> => {
    const json = await execute(
      resolvedConfig.chatUrl,
      {
        ...withDefaults(payload.model, payload.temperature),
        messages: payload.messages,
        ...(payload.response_format ? { response_format: payload.response_format } : {}),
      },
      options
    );

    const content = json?.choices?.[0]?.message?.content;
    const text = extractText(content);
    if (!text) {
      throw new OpenAIClientError('OpenAI returned an empty response.');
    }
    return text.trim();
  };

  const chatJson = async <T>(
    payload: { messages: OpenAIMessage[]; schema: JsonSchemaDefinition; model?: string; temperature?: number },
    options?: OpenAIRequestOptions
  ): Promise<T> => {
    const text = await chatText(
      {
        messages: payload.messages,
        model: payload.model,
        temperature: payload.temperature,
        response_format: { type: 'json_schema', json_schema: payload.schema },
      },
      options
    );

    return parseJson<T>(text, 'OpenAI response was not valid JSON.');
  };

  const responseJson = async <T>(
    payload: {
      prompt: string;
      schema: JsonSchemaDefinition;
      model?: string;
      tools?: unknown[];
      tool_choice?: 'auto' | 'none';
      include?: string[];
      temperature?: number;
    },
    options?: OpenAIRequestOptions
  ): Promise<ResponseJsonResult<T>> => {
    const json = await execute(
      resolvedConfig.responsesUrl,
      {
        model: payload.model ?? resolvedConfig.webModel ?? resolvedConfig.defaultModel,
        input: [{ role: 'user', content: payload.prompt }],
        temperature: payload.temperature ?? resolvedConfig.temperature,
        tools: payload.tools,
        tool_choice: payload.tool_choice ?? 'auto',
        response_format: { type: 'json_schema', json_schema: payload.schema },
        ...(payload.include ? { include: payload.include } : {}),
      },
      options
    );

    const text = extractResponseOutput(json);
    const data = parseJson<T>(text, 'OpenAI response was not valid JSON.');
    const citations = extractCitations(json);
    const sources = extractSources(json);

    return { data, citations, sources };
  };

  return {
    chatText,
    chatJson,
    responseJson,
  };
};
