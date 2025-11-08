import { saveEvidenceData, deleteEvidenceData } from './evidenceStore';
import { analyzeEvidence } from './evidenceAnalysis';
import type { EvidenceFile } from '@/types';

export interface EvidencePersistenceService {
  save: (id: string, base64: string) => Promise<void>;
  remove: (id: string) => Promise<void>;
}

export interface EvidenceAnalysisService {
  supports: (mimeType: string) => boolean;
  analyze: (file: EvidenceFile, narrative: string) => Promise<string>;
}

export interface EvidenceIdService {
  generate: () => string;
}

const randomEvidenceId = (): string =>
  (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : `evidence-${Date.now()}-${Math.random().toString(16).slice(2)}`);

export const defaultEvidencePersistenceService: EvidencePersistenceService = {
  save: async (id, base64) => {
    await saveEvidenceData(id, base64);
  },
  remove: async id => {
    await deleteEvidenceData(id);
  }
};

const analysisSupportedTypes = ['image/', 'audio/', 'video/'];

const isSupportedMimeType = (mimeType: string): boolean =>
  analysisSupportedTypes.some(prefix => mimeType.startsWith(prefix)) ||
  mimeType === 'application/pdf';

export const defaultEvidenceAnalysisService: EvidenceAnalysisService = {
  supports: isSupportedMimeType,
  analyze: analyzeEvidence
};

export const defaultEvidenceIdService: EvidenceIdService = {
  generate: randomEvidenceId
};

export interface EvidenceManagerServices {
  persistence: EvidencePersistenceService;
  analysis: EvidenceAnalysisService;
  id: EvidenceIdService;
}

export const defaultEvidenceManagerServices: EvidenceManagerServices = {
  persistence: defaultEvidencePersistenceService,
  analysis: defaultEvidenceAnalysisService,
  id: defaultEvidenceIdService
};
