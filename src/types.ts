export interface EvidenceItem {
  id: string;
  name: string;
  size: number;
  category: string;
  description: string;
  aiAnalysis?: string;
}

export interface IncidentData {
  consentAcknowledged: boolean;
  date: string;
  time: string;
  narrative: string;
  parties: string[];
  children: string[];
  jurisdiction: string;
  evidence: EvidenceItem[];
  caseNumber: string;
}

export type IncidentDataUpdater = <K extends keyof IncidentData>(
  key: K,
  value: IncidentData[K] | ((prev: IncidentData) => IncidentData[K])
) => void;

export interface IncidentErrors {
  consentAcknowledged?: string;
  date?: string;
  time?: string;
  narrative?: string;
  parties?: string;
  jurisdiction?: string;
}

export interface ReportData {
  summary: string;
  createdAt: string;
  evidenceCount: number;
  jurisdiction: {
    region: string;
    country: string;
  };
}
