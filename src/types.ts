export interface EvidenceItem {
  id: string;
  name: string;
  size: number;
  category: string;
  description: string;
}

export interface Citation {
  url: string;
  title?: string;
  startIndex?: number;
  endIndex?: number;
}

export interface IncidentData {
  consentAcknowledged: boolean;
  date: string;
  time: string;
  narrative: string;
  parties: string[];
  children: string[];
  jurisdiction: string;
  caseNumber: string;
  evidence: EvidenceItem[];
}

export interface ReportResult {
  title: string;
  professionalSummary: string;
  category: string;
  severity: string;
  severityJustification: string;
  legalInsights: string;
  sources: string[];
  legalCitations?: Citation[];
  observedImpact: string;
  aiNotes: string;
  communicationDraft?: string;
  promptContext?: string;
  aiResponses?: {
    summary?: {
      title: string;
      professionalSummary: string;
    };
    categorization?: {
      category: string;
      severity: string;
      severityJustification: string;
    };
    legal?: {
      legalInsights: string;
      sources: string[];
      citations?: Citation[];
    };
    nextSteps?: {
      observedImpact: string;
      aiNotes: string;
    };
    communicationDraft?: string;
  };
}

export const createInitialIncident = (): IncidentData => ({
  consentAcknowledged: false,
  date: '',
  time: '',
  narrative: '',
  parties: [],
  children: [],
  jurisdiction: '',
  caseNumber: '',
  evidence: [],
});
