import { useState } from 'react';
import { EVIDENCE_CATEGORIES } from '@/constants';
import { type EvidenceItem, type IncidentData, type IncidentDataUpdater } from '@/types';

interface UseEvidenceManagerProps {
  narrative: IncidentData['narrative'];
  evidence: EvidenceItem[];
  updateData: IncidentDataUpdater;
}

// Lightweight file handler to keep the evidence UI usable without storage or AI backends.
export const useEvidenceManager = ({ evidence, updateData }: UseEvidenceManagerProps) => {
  const [analysisState, setAnalysisState] = useState<Record<string, boolean>>({});

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files?.length) return;

    const newItems: EvidenceItem[] = Array.from(files).map((file) => ({
      id: typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
      name: file.name,
      size: file.size,
      category: EVIDENCE_CATEGORIES[0],
      description: '',
    }));

    updateData('evidence', (prev) => [...prev.evidence, ...newItems]);
    event.target.value = '';
  };

  const updateEvidenceItem = <K extends keyof EvidenceItem>(id: string, key: K, value: EvidenceItem[K]) => {
    updateData('evidence', (prev) =>
      prev.evidence.map((item) => (item.id === id ? { ...item, [key]: value } : item))
    );
  };

  const removeEvidenceItem = (id: string) => {
    updateData('evidence', (prev) => prev.evidence.filter((item) => item.id !== id));
    setAnalysisState((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  return {
    handleFileChange,
    updateEvidenceItem,
    removeEvidenceItem,
    analysisState,
  };
};
