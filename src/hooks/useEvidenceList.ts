import { useCallback, type ChangeEventHandler } from 'react';
import { DEFAULT_EVIDENCE_CATEGORY } from '../config/evidence';
import type { EvidenceItem } from '../types';

type FileRejectionReason = 'type' | 'size';

type EvidenceUpdateKey = 'category' | 'description';

export interface FileRejection {
  file: File;
  reason: FileRejectionReason;
}

export interface FileValidationResult {
  added: EvidenceItem[];
  rejected: FileRejection[];
  totalSelected: number;
}

interface UseEvidenceListParams {
  evidence: EvidenceItem[];
  onEvidenceChange: (items: EvidenceItem[]) => void;
  defaultCategory?: string;
  allowedMimeTypes?: string[];
  maxFileSizeBytes?: number;
  onValidationResult?: (result: FileValidationResult) => void;
}

export const DEFAULT_ALLOWED_EVIDENCE_TYPES = ['image/', 'application/pdf', 'audio/', 'video/'];
export const DEFAULT_MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024; // 25MB

const useEvidenceList = ({
  evidence,
  onEvidenceChange,
  defaultCategory = DEFAULT_EVIDENCE_CATEGORY,
  allowedMimeTypes = DEFAULT_ALLOWED_EVIDENCE_TYPES,
  maxFileSizeBytes = DEFAULT_MAX_FILE_SIZE_BYTES,
  onValidationResult,
}: UseEvidenceListParams) => {
  const addEvidenceFiles = useCallback(
    (files: File[]): FileValidationResult => {
      if (!files.length) {
        const emptyResult = { added: [], rejected: [], totalSelected: 0 } satisfies FileValidationResult;
        onValidationResult?.(emptyResult);
        return emptyResult;
      }

      const result = files.reduce<FileValidationResult>(
        (acc, file, index) => {
          const isTypeAllowed = allowedMimeTypes.some(type =>
            type.endsWith('/*') ? file.type.startsWith(type.replace('/*', '')) : file.type === type || file.type.startsWith(type),
          );
          const isSizeAllowed = file.size <= maxFileSizeBytes;

          if (!isTypeAllowed) {
            acc.rejected.push({ file, reason: 'type' });
            return acc;
          }

          if (!isSizeAllowed) {
            acc.rejected.push({ file, reason: 'size' });
            return acc;
          }

          acc.added.push({
            id: `${file.name}-${Date.now()}-${index}`,
            name: file.name,
            size: file.size,
            category: defaultCategory,
            description: '',
          });

          return acc;
        },
        { added: [], rejected: [], totalSelected: files.length },
      );

      if (result.added.length > 0) {
        onEvidenceChange([...evidence, ...result.added]);
      }

      onValidationResult?.(result);
      return result;
    },
    [allowedMimeTypes, defaultCategory, evidence, maxFileSizeBytes, onEvidenceChange, onValidationResult],
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
      const result = addEvidenceFiles(files);
      event.target.value = '';
      return result;
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
