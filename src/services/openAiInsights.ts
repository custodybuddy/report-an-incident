import type { IncidentData } from '../types';

const OPENAI_URL = 'https://api.openai.com/v1/chat/completions';
const OPENAI_RESPONSES_URL = 'https://api.openai.com/v1/responses';
const OPENAI_MODEL = 'gpt-4o-mini';
const OPENAI_WEB_MODEL = 'gpt-4.1';

type MessageContent =
  | string
  | Array<
      | { type: 'text'; text: string }
      | { type: 'image_url'; image_url: { url: string; detail?: 'auto' | 'low' | 'high' } }
    >;

interface OpenAIMessage {
  role: 'system' | 'user';
  content: MessageContent;
}

interface JsonSchemaDefinition {
  name: string;
  schema: Record<string, unknown>;
}

export interface EvidenceFile {
  name: string;
  type: string;
  base64: string;
  description?: string;
}

const getApiKey = () => {
  const key = import.meta.env.VITE_OPENAI_API_KEY || import.meta.env.OPENAI_API_KEY;
  if (!key) {
    throw new Error('Missing OpenAI API key. Set VITE_OPENAI_API_KEY in your environment.');
  }
  return key;
};

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

const callOpenAi = async (payload: Record<string, unknown>) => {
  const apiKey = getApiKey();
  const response = await fetch(OPENAI_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      temperature: 0.2,
      ...payload,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`OpenAI request failed (${response.status}): ${body}`);
  }

  const json = await response.json();
  const content = json?.choices?.[0]?.message?.content;
  return extractText(content);
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

const callOpenAiWebSearchJson = async <T>(
  prompt: string,
  schema: JsonSchemaDefinition
): Promise<T> => {
  const apiKey = getApiKey();
  const response = await fetch(OPENAI_RESPONSES_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: OPENAI_WEB_MODEL,
      temperature: 0.2,
      tools: [{ type: 'web_search_preview' }],
      response_format: {
        type: 'json_schema',
        json_schema: schema,
      },
      input: prompt,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`OpenAI web search request failed (${response.status}): ${body}`);
  }

  const json = await response.json();
  const text = extractResponseOutput(json);
  try {
    return JSON.parse(text || '{}') as T;
  } catch (error) {
    console.error('Failed to parse JSON from web-search response:', error, text);
    throw new Error('OpenAI web search response was not valid JSON.');
  }
};

const callOpenAiJson = async <T>(
  messages: OpenAIMessage[],
  schema: JsonSchemaDefinition
): Promise<T> => {
  const text = await callOpenAi({
    messages,
    response_format: {
      type: 'json_schema',
      json_schema: schema,
    },
  });

  try {
    return JSON.parse(text || '{}') as T;
  } catch (error) {
    console.error('Failed to parse JSON from OpenAI response:', error, text);
    throw new Error('OpenAI response was not valid JSON.');
  }
};

const callOpenAiText = async (messages: OpenAIMessage[]): Promise<string> => {
  const text = await callOpenAi({ messages });
  if (!text) {
    throw new Error('OpenAI returned an empty response.');
  }
  return text.trim();
};

export const buildPromptContext = (incidentData: IncidentData): string => {
  const evidenceDetails =
    incidentData.evidence.length > 0
      ? incidentData.evidence
          .map(
            e =>
              `- File: ${e.name} (Category: ${e.category})\n  Description: ${e.description || 'N/A'}`
          )
          .join('\n')
      : 'None specified';

  const parties = incidentData.parties.length
    ? incidentData.parties.join(', ')
    : 'None specified';
  const children = incidentData.children.length
    ? incidentData.children.join(', ')
    : 'None specified';

  return `
INCIDENT DETAILS:
- Date: ${incidentData.date || 'N/A'}
- Time: ${incidentData.time || 'N/A'}
- Jurisdiction: ${incidentData.jurisdiction || 'N/A'}
- Case Number: ${incidentData.caseNumber || 'N/A'}
- Parties Involved: ${parties}
- Children Present/Affected: ${children}
- Evidence Attached:
${evidenceDetails}
- Original Account: ${incidentData.narrative || 'Not provided'}
`.trim();
};

const summarySchema: JsonSchemaDefinition = {
  name: 'ProfessionalSummary',
  schema: {
    type: 'object',
    additionalProperties: false,
    properties: {
      title: {
        type: 'string',
        description:
          "A brief, factual title for the incident report. Example: 'Dispute Regarding Parenting Time Exchange on YYYY-MM-DD'.",
      },
      professionalSummary: {
        type: 'string',
        description:
          'A detailed, objective summary written in the third person, spanning 2-3 paragraphs. The first paragraph must establish the context (date, time, parties). The second must chronologically detail the key factual events—what was said and done by each party. The final paragraph must state the outcome or resolution of the immediate incident. Use newline characters (\\n) to separate paragraphs. Strictly adhere to factual reporting.',
      },
    },
    required: ['title', 'professionalSummary'],
  },
};

const categorizationSchema: JsonSchemaDefinition = {
  name: 'IncidentCategorization',
  schema: {
    type: 'object',
    additionalProperties: false,
    properties: {
      category: {
        type: 'string',
        description:
          "Select the single most fitting category from this list: Child Safety & Welfare, Communication Breakdown, Parenting Time Violation, Breach of Court Order (Non-Time Related), Parental Alienation Tactics, Hostile/Disparaging Conduct, Financial Disputes, Medical/Educational Disagreements, Property/Possession Issues, Other.",
      },
      severity: {
        type: 'string',
        enum: ['Low', 'Medium', 'High'],
        description: 'Assign a severity level: Low, Medium, or High.',
      },
      severityJustification: {
        type: 'string',
        description:
          "Justify the severity level in one or two sentences, referencing key facts from the narrative that support your choice. Example: 'The severity is High due to the direct violation of the parenting time order and the reported distress of the child.'",
      },
    },
    required: ['category', 'severity', 'severityJustification'],
  },
};

const legalSchema: JsonSchemaDefinition = {
  name: 'LegalInsights',
  schema: {
    type: 'object',
    additionalProperties: false,
    properties: {
      legalInsights: {
        type: 'string',
        description:
          "A 2-3 paragraph analysis for informational purposes. Begin with the mandatory disclaimer: 'This is not legal advice and is for informational purposes only. You should consult with a qualified legal professional.' Following the disclaimer, discuss relevant family law principles for the specified jurisdiction (e.g., 'best interests of the child'). The text must include at least one specific, clickable markdown hyperlink to an official government legislative website relevant to the jurisdiction. Use newline characters ('\\n') for paragraph breaks.",
      },
      sources: {
        type: 'array',
        minItems: 2,
        maxItems: 3,
        items: {
          type: 'string',
          description:
            'Domain name of an official government or reputable legal aid resource (e.g., justice.gc.ca).',
        },
      },
    },
    required: ['legalInsights', 'sources'],
  },
};

const nextStepsSchema: JsonSchemaDefinition = {
  name: 'AiNextSteps',
  schema: {
    type: 'object',
    additionalProperties: false,
    properties: {
      observedImpact: {
        type: 'string',
        description:
          'A 1-2 paragraph analysis of the potential or observed impact on the children, based strictly on the information provided in the narrative. Use newline characters (\\n) for paragraph breaks.',
      },
    },
    required: ['observedImpact'],
  },
};

export const generateProfessionalSummary = async (
  incidentData: IncidentData
): Promise<{ title: string; professionalSummary: string }> => {
  const context = buildPromptContext(incidentData);
  const prompt = `Assume the role of a seasoned paralegal specializing in family law documentation. Your primary directive is to strip all subjectivity, emotion, and speculation from the user's narrative, converting it into a sterile, factual account suitable for a court filing.

${context}

Analyze the incident and generate a JSON object that strictly adheres to the provided schema. Structure the summary into three distinct paragraphs: 1) Context, 2) Chronology of Events, 3) Outcome.`;

  return callOpenAiJson<{ title: string; professionalSummary: string }>(
    [
      {
        role: 'system',
        content:
          'You are an expert legal documentation assistant. All outputs must be impartial, precise, and compliant with the requested schema.',
      },
      { role: 'user', content: prompt },
    ],
    summarySchema
  );
};

export const generateCategorization = async (
  incidentData: IncidentData
): Promise<{
  category: string;
  severity: string;
  severityJustification: string;
}> => {
  const context = buildPromptContext(incidentData);
  const prompt = `You are an AI trained in family law case classification. Your task is to analyze and classify the co-parenting incident below.

${context}

Choose only one 'category' that best represents the core of the incident. Assign a 'severity' level using the provided criteria and justify your decision. Return JSON matching the schema.`;

  return callOpenAiJson(
    [
      {
        role: 'system',
        content:
          'Classify incidents using formal legal language and adhere to the provided JSON schema.',
      },
      { role: 'user', content: prompt },
    ],
    categorizationSchema
  );
};

export const generateLegalInsights = async (
  incidentData: IncidentData
): Promise<{ legalInsights: string; sources: string[] }> => {
  const context = buildPromptContext(incidentData);
  const prompt = `Your role is to act as an educational legal research tool, not a legal advisor. Analyze the following co-parenting incident.

${context}

Provide legal insights specific to family law in ${incidentData.jurisdiction || 'the stated jurisdiction'}, starting with the mandatory disclaimer. Include at least one markdown hyperlink to an official government legislative website. Identify 2-3 official sources (government or legal aid) relevant to the jurisdiction. Respond with JSON matching the schema.`;

  try {
    return await callOpenAiWebSearchJson(prompt, legalSchema);
  } catch (error) {
    console.error('Web search legal insights failed, falling back to standard completion:', error);
    return callOpenAiJson(
      [
        {
          role: 'system',
          content:
            'Provide neutral, jurisdiction-aware legal information with official sources. Never offer legal advice.',
        },
        { role: 'user', content: prompt },
      ],
      legalSchema
    );
  }
};

export const generateNextSteps = async (
  incidentData: IncidentData
): Promise<{ observedImpact: string }> => {
  const context = buildPromptContext(incidentData);
  const prompt = `You are a legal documentation analyst AI. Review the incident below.

${context}

Analyze the potential impact on the children based only on the provided narrative. Generate a JSON object that strictly adheres to the schema.`;

  return callOpenAiJson(
    [
      {
        role: 'system',
        content:
          'Focus on child-centered, de-escalating insights. Follow the schema exactly and keep tone neutral.',
      },
      { role: 'user', content: prompt },
    ],
    nextStepsSchema
  );
};

export const generateCommunicationDraft = async (
  objectiveNarrative: string,
  date: string,
  time: string
): Promise<string> => {
  const systemPrompt =
    'You are a legal assistant specializing in communication documentation. Draft concise, professional, purely objective messages suitable for court disclosure.';
  const userPrompt = `Draft a documentation message based on the following objective report:

${objectiveNarrative}

Date of Incident: ${date || 'N/A'} at ${time || 'N/A'}.

The message must strictly adhere to the facts, confirm adherence to court orders (if referenced), avoid emotional language, and exclude salutations or subject lines. Respond with only the message text.`;

  return callOpenAiText([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ]);
};

export const analyzeEvidence = async (
  file: EvidenceFile,
  incidentNarrative: string
): Promise<string> => {
  if (file.type.startsWith('image/')) {
    const contentParts: MessageContent = [
      {
        type: 'text',
        text: `As a neutral, objective legal assistant, analyze the attached image evidence in the context of the incident narrative below. Provide a concise, one-sentence summary of the image's potential relevance. Avoid speculation.

NARRATIVE: "${incidentNarrative || 'Not provided'}"
FILE DETAILS:
- Name: ${file.name}
- User Description: ${file.description || 'Not provided.'}`,
      },
      {
        type: 'image_url',
        image_url: {
          url: `data:${file.type};base64,${file.base64}`,
          detail: 'low',
        },
      },
    ];

    return callOpenAiText([{ role: 'user', content: contentParts }]);
  }

  if (file.type === 'application/pdf') {
    const prompt = `As a neutral, objective legal assistant, analyze the *potential relevance* of the attached document based on its metadata, in the context of the following co-parenting incident narrative:
---
NARRATIVE: "${incidentNarrative || 'Not provided'}"
---
DOCUMENT DETAILS:
- Name: ${file.name}
- Type: ${file.type}
- User Description: ${file.description || 'Not provided.'}
---
INSTRUCTIONS: Based only on the file name and user-provided description, provide a concise, one-sentence summary of this document's likely relevance and evidentiary value. Do not speculate about the document's specific contents.`;

    return callOpenAiText([{ role: 'user', content: prompt }]);
  }

  if (file.type.startsWith('audio/')) {
    return 'AI analysis for audio files is in development. The file has been logged as evidence.';
  }

  if (file.type.startsWith('video/')) {
    return 'AI analysis for video files is in development. The file has been logged as evidence.';
  }

  return `Analysis for '${file.type}' files is not yet supported.`;
};
