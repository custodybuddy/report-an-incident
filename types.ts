import type React from 'react';

export const EVIDENCE_CATEGORIES = ['Screenshot', 'Document', 'Audio', 'Video', 'Other'] as const;
export type EvidenceCategory = typeof EVIDENCE_CATEGORIES[number];

export interface EvidenceFile {
  id: string;
  name: string;
  size: number;
  type: string;
  category: EvidenceCategory;
  description: string;
  storageId: string;
  base64?: string;
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
  evidence: EvidenceFile[];
  caseNumber: string;
}

export type IncidentDataUpdater = <K extends keyof IncidentData>(
  key: K,
  value: IncidentData[K] | ((prev: IncidentData) => IncidentData[K])
) => void;

export interface ReportData {
  title: string;
  category: string;
  severity: string;
  severityJustification: string;
  professionalSummary: string;
  legalInsights: string;
  sources: string[];
  caseNumber?: string;
}

export interface Step {
  number: number;
  title: string;
  icon: React.ReactElement;
}

export interface ModalInfo {
    title: string;
    message: string;
    type: 'success' | 'error' | 'info' | 'confirm';
    onClose: () => void;
    onConfirm?: () => void;
    confirmText?: string;
    cancelText?: string;
}
