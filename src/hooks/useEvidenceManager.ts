import { type ChangeEvent, useCallback, useEffect, useState } from 'react';
import type { EvidenceFile, IncidentDataUpdater } from '@/types';
import {
  defaultEvidenceManagerServices,
  type EvidenceManagerServices
} from '../services/evidenceManagement';

type EditableEvidenceField = 'category' | 'description';

interface UseEvidenceManagerArgs {
  narrative: string;
  evidence: EvidenceFile[];
  updateData: IncidentDataUpdater;
}

interface PreparedEvidenceResult {
  file: File;
  base64: string;
}

const readFileAsBase64 = (file: File): Promise<PreparedEvidenceResult> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve({ file, base64: result.split(',')[1] ?? '' });
    };
    reader.onerror = error => reject(error);
    reader.readAsDataURL(file);
  });

const services: EvidenceManagerServices = { ...defaultEvidenceManagerServices };

export const __setEvidenceManagerDependencies = (overrides: Partial<EvidenceManagerServices>) => {
  Object.assign(services, overrides);
};

export const __resetEvidenceManagerDependencies = () => {
  services.persistence = defaultEvidenceManagerServices.persistence;
  services.analysis = defaultEvidenceManagerServices.analysis;
  services.id = defaultEvidenceManagerServices.id;
};

const persistEvidenceSafely = async (id: string, base64: string) => {
  try {
    await services.persistence.save(id, base64);
  } catch (error) {
    console.warn('Failed to persist evidence in IndexedDB', error);
  }
};

const removeEvidenceSafely = async (id: string) => {
  try {
    await services.persistence.remove(id);
  } catch (error) {
    console.warn('Failed to delete evidence from IndexedDB', error);
  }
};

interface UseEvidenceManagerReturn {
  handleFileChange: (event: ChangeEvent<HTMLInputElement>) => Promise<void>;
  updateEvidenceItem: (id: string, field: EditableEvidenceField, value: string) => void;
  removeEvidenceItem: (id: string) => Promise<void>;
  analysisState: Record<string, boolean>;
}

export const useEvidenceManager = ({
  narrative,
  evidence,
  updateData
}: UseEvidenceManagerArgs): UseEvidenceManagerReturn => {
  const [analysisState, setAnalysisState] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setAnalysisState(prev => {
      const next: Record<string, boolean> = {};
      evidence.forEach(item => {
        if (prev[item.id]) {
          next[item.id] = true;
        }
      });
      return next;
    });
  }, [evidence]);

  const handleFileChange = useCallback<UseEvidenceManagerReturn['handleFileChange']>(
    async event => {
      if (!event.target.files) return;

      const filesToProcess = Array.from(event.target.files);
      event.target.value = '';

      try {
        const results = await Promise.all(filesToProcess.map(readFileAsBase64));

        const preparedEvidence: EvidenceFile[] = await Promise.all(
          results.map(async ({ file, base64 }) => {
            const id = services.id.generate();
            await persistEvidenceSafely(id, base64);

            return {
              id,
              storageId: id,
              name: file.name,
              size: file.size,
              type: file.type,
              category: 'Other',
              description: '',
              base64: services.analysis.supports(file.type) ? base64 : undefined
            } satisfies EvidenceFile;
          })
        );

        updateData('evidence', prev => [...prev.evidence, ...preparedEvidence]);

        preparedEvidence.forEach(newFile => {
          if (!services.analysis.supports(newFile.type) || !newFile.base64) {
            return;
          }

          setAnalysisState(prev => ({ ...prev, [newFile.id]: true }));

          services.analysis.analyze(newFile, narrative)
            .then(analysis => {
              updateData('evidence', prevIncident =>
                prevIncident.evidence.map(item =>
                  item.id === newFile.id
                    ? { ...item, aiAnalysis: analysis, base64: undefined }
                    : item
                )
              );
            })
            .catch(error => {
              console.error('AI analysis failed:', error);
              updateData('evidence', prevIncident =>
                prevIncident.evidence.map(item =>
                  item.id === newFile.id
                    ? {
                        ...item,
                        aiAnalysis: 'Analysis failed due to a system error.',
                        base64: undefined
                      }
                    : item
                )
              );
            })
            .finally(() => {
              setAnalysisState(prev => {
                const next = { ...prev };
                delete next[newFile.id];
                return next;
              });
            });
        });
      } catch (error) {
        console.error('Failed to process uploaded files', error);
      }
    },
    [narrative, updateData]
  );

  const updateEvidenceItem = useCallback<UseEvidenceManagerReturn['updateEvidenceItem']>(
    (id, field, value) => {
      updateData('evidence', prevIncident =>
        prevIncident.evidence.map(item =>
          item.id === id ? { ...item, [field]: value } : item
        )
      );
    },
    [updateData]
  );

  const removeEvidenceItem = useCallback<UseEvidenceManagerReturn['removeEvidenceItem']>(
    async id => {
      const target = evidence.find(item => item.id === id);
      if (!target) return;

      updateData('evidence', prevIncident =>
        prevIncident.evidence.filter(item => item.id !== id)
      );

      setAnalysisState(prev => {
        if (!prev[id]) return prev;
        const next = { ...prev };
        delete next[id];
        return next;
      });

      await removeEvidenceSafely(target.storageId);
    },
    [evidence, updateData]
  );

  return {
    handleFileChange,
    updateEvidenceItem,
    removeEvidenceItem,
    analysisState
  };
};

