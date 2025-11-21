import type { IncidentData } from '../../types';
import type { JsonSchemaDefinition } from './client';

export const OPENAI_MODELS = {
  chat: 'gpt-4o-mini',
  webSearch: 'gpt-4.1',
};

export const SCHEMAS: Record<
  'summary' | 'categorization' | 'legal' | 'nextSteps',
  JsonSchemaDefinition
> = {
  summary: {
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
            "Two paragraphs. Paragraph 1: A concise, objective summary (2-3 sentences) starting with 'On <DATE>, a <SEVERITY>-severity <INCIDENT TYPE> occurred when…' using the provided date, severity, and classification; include key factual actions and the immediate outcome/impact. Paragraph 2: Name the core legislation relevant to the user’s jurisdiction (e.g., Family Law Act, Divorce Act, or analogous state/provincial acts) and state in one sentence how it relates to decision-making, best interests of the child, or compliance duties. Avoid legal advice; keep it factual and cite acts by name only.",
        },
      },
      required: ['title', 'professionalSummary'],
    },
  },
  categorization: {
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
  },
  legal: {
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
  },
  nextSteps: {
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
  },
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

export const PROMPTS = {
  professionalSummary: (context: string) => `Assume the role of a seasoned paralegal specializing in family law documentation. Your primary directive is to strip all subjectivity, emotion, and speculation from the user's narrative, converting it into a sterile, factual account suitable for a court filing.

${context}

Analyze the incident and generate a JSON object that strictly adheres to the provided schema. Write the professional summary in TWO paragraphs: (1) a single paragraph (2-3 sentences) starting exactly with: "On <DATE>, a <SEVERITY>-severity <INCIDENT TYPE> occurred when..." followed by the specific factual actions by each party and the immediate outcome/impact; (2) a single sentence naming the key legislation for the user's jurisdiction (e.g., Family Law Act, Divorce Act, or a comparable state/provincial act) and noting how it frames decision-making, best interests, or compliance. Do not give legal advice; cite acts by name only.`,
  categorization: (context: string) => `You are an AI trained in family law case classification. Your task is to analyze and classify the co-parenting incident below.

${context}

Choose only one 'category' that best represents the core of the incident. Assign a 'severity' level using the provided criteria and justify your decision. Return JSON matching the schema.`,
  legalInsights: (context: string, jurisdiction: string) => `Your role is to act as an educational legal research tool, not a legal advisor. Analyze the following co-parenting incident.

${context}

Provide legal insights specific to family law in ${jurisdiction || 'the stated jurisdiction'}, starting with the mandatory disclaimer. Include at least one markdown hyperlink to an official government legislative website. Identify 2-3 official sources (government or legal aid) relevant to the jurisdiction. Respond with JSON matching the schema.`,
  nextSteps: (context: string) => `You are a legal documentation analyst AI. Review the incident below.

${context}

Analyze the potential impact on the children based only on the provided narrative. Generate a JSON object that strictly adheres to the schema.`,
  communicationDraft: (objectiveNarrative: string, date: string, time: string) => `Draft a documentation message based on the following objective report:

${objectiveNarrative}

Date of Incident: ${date || 'N/A'} at ${time || 'N/A'}.

The message must strictly adhere to the facts, confirm adherence to court orders (if referenced), avoid emotional language, and exclude salutations or subject lines. Respond with only the message text.`,
  evidenceImage: (fileName: string, fileType: string, description: string, incidentNarrative: string) => `As a neutral, objective legal assistant, analyze the attached image evidence in the context of the incident narrative below. Provide a concise, one-sentence summary of the image's potential relevance. Avoid speculation.

NARRATIVE: "${incidentNarrative || 'Not provided'}"
FILE DETAILS:
- Name: ${fileName}
- Type: ${fileType}
- User Description: ${description || 'Not provided.'}`,
  evidencePdf: (fileName: string, fileType: string, description: string, incidentNarrative: string) => `As a neutral, objective legal assistant, analyze the *potential relevance* of the attached document based on its metadata, in the context of the following co-parenting incident narrative:
---
NARRATIVE: "${incidentNarrative || 'Not provided'}"
---
DOCUMENT DETAILS:
- Name: ${fileName}
- Type: ${fileType}
- User Description: ${description || 'Not provided.'}
---
INSTRUCTIONS: Based only on the file name and user-provided description, provide a concise, one-sentence summary of this document's likely relevance and evidentiary value. Do not speculate about the document's specific contents.`,
};
