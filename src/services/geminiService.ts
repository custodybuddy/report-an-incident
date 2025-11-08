import { GoogleGenAI, Type, type GenerateContentResponse } from "@google/genai";
import { type IncidentData, type EvidenceFile } from '../../types';
import { getEvidenceData } from './evidenceStore';

if (!process.env.API_KEY) {
    console.warn("API_KEY environment variable not set. Gemini API calls will fail.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });


// Helper to build the common context for prompts
const buildPromptContext = (incidentData: IncidentData): string => {
    const evidenceDetails = incidentData.evidence.length > 0
    ? incidentData.evidence.map(e => `- File: ${e.name} (Category: ${e.category})\n  Description: ${e.description || 'N/A'}`).join('\n')
    : 'None specified';

    return `
INCIDENT DETAILS:
- Date: ${incidentData.date}
- Time: ${incidentData.time}
- Jurisdiction: ${incidentData.jurisdiction}
- Case Number: ${incidentData.caseNumber || 'N/A'}
- Parties Involved: ${incidentData.parties.join(', ')}
- Children Present/Affected: ${incidentData.children.join(', ') || 'None specified'}
- Evidence Attached:\n${evidenceDetails}
- Original Account: ${incidentData.narrative}
`;
};

// --- API Call 1: Professional Summary ---
const summarySchema = {
    type: Type.OBJECT,
    properties: {
        title: { type: Type.STRING, description: "A brief, factual title for the incident report. Example: 'Dispute Regarding Parenting Time Exchange on YYYY-MM-DD'." },
        professionalSummary: { type: Type.STRING, description: "A detailed, objective summary written in the third person, spanning 2-3 paragraphs. The first paragraph must establish the context (date, time, parties). The second must chronologically detail the key factual events—what was said and done by each party. The final paragraph must state the outcome or resolution of the immediate incident. Use newline characters ('\\n') to separate paragraphs. Strictly adhere to factual reporting." },
    },
    required: ["title", "professionalSummary"]
};

export const generateProfessionalSummary = async (incidentData: IncidentData): Promise<{ title: string; professionalSummary: string }> => {
    const context = buildPromptContext(incidentData);
    const prompt = `Assume the role of a seasoned paralegal specializing in family law documentation. Your primary directive is to strip all subjectivity, emotion, and speculation from the user's narrative, converting it into a sterile, factual account suitable for a court filing.
${context}
Analyze the incident and generate a JSON object that strictly adheres to the provided schema. Structure the summary into three distinct paragraphs: 1) Context, 2) Chronology of Events, 3) Outcome.`;
    
    let response: GenerateContentResponse | undefined;
    try {
        response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: { responseMimeType: "application/json", responseSchema: summarySchema },
        });
        return JSON.parse(response.text);
    } catch (error) {
        console.error("Gemini API Error in generateProfessionalSummary:", error);
        if (error instanceof SyntaxError && response) {
            console.error("Malformed JSON response from Gemini in generateProfessionalSummary:", response.text);
            throw new Error(`The AI returned an invalid JSON response, which could be due to safety settings or an unexpected output. Raw response: "${response.text}"`);
        }
        throw new Error("Failed to generate professional summary.");
    }
};

// --- API Call 2: Categorization ---
const categorizationSchema = {
    type: Type.OBJECT,
    properties: {
        category: { type: Type.STRING, description: "Select the single most fitting category from this list: Child Safety & Welfare, Communication Breakdown, Parenting Time Violation, Breach of Court Order (Non-Time Related), Parental Alienation Tactics, Hostile/Disparaging Conduct, Financial Disputes, Medical/Educational Disagreements, Property/Possession Issues, Other." },
        severity: { type: Type.STRING, description: "Assign a severity level: Low, Medium, or High." },
        severityJustification: { type: Type.STRING, description: "Justify the severity level in one or two sentences, referencing key facts from the narrative that support your choice. Example: 'The severity is High due to the direct violation of the parenting time order and the reported distress of the child.'" },
    },
    required: ["category", "severity", "severityJustification"]
};

export const generateCategorization = async (incidentData: IncidentData): Promise<{ category: string; severity: string; severityJustification: string; }> => {
    const context = buildPromptContext(incidentData);
    const prompt = `You are an AI trained in family law case classification. Your task is to analyze and classify the co-parenting incident below.
${context}
Choose only one 'category' that best represents the core of the incident. Assign a 'severity' level based on the following criteria:
- High: Involves physical harm, credible threats, or direct violations of a court order concerning child safety.
- Medium: Involves significant emotional distress, clear patterns of non-compliance, or alienation tactics.
- Low: Involves minor disagreements, communication issues, or logistical disputes.
Generate a JSON object that strictly adheres to the schema.`;
    
    let response: GenerateContentResponse | undefined;
    try {
        response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: { responseMimeType: "application/json", responseSchema: categorizationSchema },
        });
        return JSON.parse(response.text);
    } catch (error) {
        console.error("Gemini API Error in generateCategorization:", error);
        if (error instanceof SyntaxError && response) {
            console.error("Malformed JSON response from Gemini in generateCategorization:", response.text);
            throw new Error(`The AI returned an invalid JSON response, which could be due to safety settings or an unexpected output. Raw response: "${response.text}"`);
        }
        throw new Error("Failed to categorize incident.");
    }
};

// --- API Call 3: Legal Insights ---
const legalSchema = {
    type: Type.OBJECT,
    properties: {
        legalInsights: { type: Type.STRING, description: "A concise summary (2-3 sentences) of key legal considerations. Must begin with the mandatory disclaimer: 'This is not legal advice and is for informational purposes only. You should consult with a qualified legal professional.' The summary must include at least two specific, clickable markdown hyperlinks to different primary legal sources (e.g., official legislative websites, court pages) relevant to the jurisdiction." },
        sources: { type: Type.ARRAY, items: { type: Type.STRING }, description: "An array of 2 to 4 full, direct URLs to relevant articles, statutes, or guides from official government or reputable legal aid websites. These should be different from the links embedded in 'legalInsights'. Example: 'https://www.justice.gc.ca/eng/fl-df/parent/mp-pm/toc-tdm.html'." },
    },
    required: ["legalInsights", "sources"]
};

export const generateLegalInsights = async (incidentData: IncidentData): Promise<{ legalInsights: string; sources: string[]; }> => {
    const context = buildPromptContext(incidentData);
    const prompt = `Your role is to act as an educational legal research tool, not a legal advisor. Your goal is to provide well-researched information based on primary legal sources. Analyze the following co-parenting incident.
${context}
Provide a brief summary of key legal considerations specific to family law in ${incidentData.jurisdiction}. The summary should be concise, around 2-3 sentences. Start with the mandatory disclaimer. Your summary must still embed at least two distinct, relevant markdown hyperlinks to primary legal sources (e.g., official government legislative websites, statutes, or court resource pages) within the 'legalInsights' text. For the 'sources' array, provide 2-4 full, direct URLs to relevant statutes, official guides, or legal aid resources. Prioritize government (.gov, .gc.ca) or official legal body websites. Avoid blogs or private law firm sites. Generate a JSON object that strictly adheres to the schema.`;

    let response: GenerateContentResponse | undefined;
    try {
        response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: { responseMimeType: "application/json", responseSchema: legalSchema },
        });
        return JSON.parse(response.text);
    } catch (error) {
        console.error("Gemini API Error in generateLegalInsights:", error);
        if (error instanceof SyntaxError && response) {
            console.error("Malformed JSON response from Gemini in generateLegalInsights:", response.text);
            throw new Error(`The AI returned an invalid JSON response, which could be due to safety settings or an unexpected output. Raw response: "${response.text}"`);
        }
        throw new Error("Failed to generate legal insights.");
    }
};

const resolveEvidenceBase64 = async (file: EvidenceFile): Promise<string | undefined> => {
    if (file.base64) {
        return file.base64;
    }

    if (file.storageId) {
        try {
            return await getEvidenceData(file.storageId);
        } catch (error) {
            console.warn('Failed to retrieve evidence data from IndexedDB', error);
        }
    }

    return undefined;
};

export const analyzeEvidence = async (file: EvidenceFile, incidentNarrative: string): Promise<string> => {
    // Case 1: Handle image files with multimodal analysis
    if (file.type.startsWith('image/')) {
        const base64Data = await resolveEvidenceBase64(file);
        if (!base64Data) {
            return 'AI analysis could not be generated because the underlying image data is unavailable.';
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
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: { parts: [imagePart, { text: prompt }] },
                config: {
                    maxOutputTokens: 100,
                }
            });

            const analysis = response.text?.trim();
            return analysis || "AI analysis could not be generated for this file.";
        } catch (error) {
            console.error("Gemini API Error in analyzeEvidence (image):", error);
            return "AI analysis failed due to a system error.";
        }
    }
    // Case 2: Handle PDF documents by analyzing their metadata
    else if (file.type === 'application/pdf') {
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
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: {
                    maxOutputTokens: 100,
                }
            });

            const analysis = response.text?.trim();
            return analysis || "AI analysis could not be generated for this document's metadata.";
        } catch (error) {
            console.error("Gemini API Error in analyzeEvidence (document):", error);
            return "AI analysis of document metadata failed due to a system error.";
        }
    }
    // Case 3 & 4: Handle audio and video with placeholders
    else if (file.type.startsWith('audio/')) {
        return `AI analysis for audio files is in development. The file has been logged as evidence.`;
    }
    else if (file.type.startsWith('video/')) {
        return `AI analysis for video files is in development. The file has been logged as evidence.`;
    }
    // Case 5: Handle all other unsupported file types
    else {
        return `Analysis for '${file.type}' files is not yet supported.`;
    }
};
