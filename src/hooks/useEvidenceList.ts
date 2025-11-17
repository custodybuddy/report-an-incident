import { useCallback, type ChangeEventHandler } from 'react';
import { DEFAULT_EVIDENCE_CATEGORY } from '../config/evidence';
import type { EvidenceItem } from '../types';

type EvidenceUpdateKey = 'category' | 'description';

interface UseEvidenceListParams {
  evidence: EvidenceItem[];
  onEvidenceChange: (items: EvidenceItem[]) => void;
  defaultCategory?: string;
}

const useEvidenceList = ({
  evidence,
  onEvidenceChange,
  defaultCategory = DEFAULT_EVIDENCE_CATEGORY,
}: UseEvidenceListParams) => {
  const addEvidenceFiles = useCallback(
    (files: File[]) => {
      if (!files.length) {
        return;
      }

      onEvidenceChange([
        ...evidence,
        ...files.map((file, index) => ({
          id: `${file.name}-${Date.now()}-${index}`,
          name: file.name,
          size: file.size,
          category: defaultCategory,
          description: '',
        })),
      ]);
    },
    [defaultCategory, evidence, onEvidenceChange],
  );

  const updateEvidenceItem = useCallback(
    (id: string, key: EvidenceUpdateKey, value: string) => {
      onEvidenceChange(evidence.map(item => (item.id === id ? { ...item, [key]: value } : item)));
    },
    [evidence, onEvidenceChange],
  );

  const removeEvidenceItem = useCallback(
    (id: string) => {
      onEvidenceChange(evidence.filter(item => item.id !== id));
    },
    [evidence, onEvidenceChange],
  );

  const handleFileChange: ChangeEventHandler<HTMLInputElement> = useCallback(
    event => {
      const files = Array.from(event.target.files ?? []);
      if (!files.length) {
        event.target.value = '';
        return;
      }

      addEvidenceFiles(files);
      event.target.value = '';
    },
    [addEvidenceFiles],
  );

  return {
    addEvidenceFiles,
    handleFileChange,
    removeEvidenceItem,
    updateEvidenceItem,
  } as const;
};

export default useEvidenceList;
