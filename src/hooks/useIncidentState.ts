import { useCallback, useState } from 'react';
import { type IncidentData } from '../../types';
import { deleteEvidenceBatch } from '../services/evidenceStore';
import {
  createEmptyIncident,
  useIncidentPersistence
} from './useIncidentPersistence';
import { useDirtyTracking } from './useDirtyTracking';
import {
  type ValidationErrors,
  useIncidentValidation
} from './useIncidentValidation';

export const useIncidentState = () => {
  const {
    currentStep,
    setCurrentStep,
    incidentData,
    setIncidentData,
    clearPersistedState
  } = useIncidentPersistence();
  const { currentValidationErrors, isCurrentStepValid } =
    useIncidentValidation(currentStep, incidentData);
  const { isDirty, markDirty, markClean } = useDirtyTracking();
  const [errors, setErrors] = useState<ValidationErrors>({});

  const validateCurrentStep = useCallback((): boolean => {
    setErrors(currentValidationErrors);
    return isCurrentStepValid;
  }, [currentValidationErrors, isCurrentStepValid]);

  const updateIncidentData = useCallback(
    <K extends keyof IncidentData>(
      key: K,
      valueOrUpdater:
        | IncidentData[K]
        | ((prevIncident: IncidentData) => IncidentData[K])
    ) => {
      setIncidentData(prevIncident => {
        const nextValue =
          typeof valueOrUpdater === 'function'
            ? (valueOrUpdater as (prev: IncidentData) => IncidentData[K])(
                prevIncident
              )
            : valueOrUpdater;

        return {
          ...prevIncident,
          [key]: nextValue
        };
      });

      markDirty();
      setErrors(prevErrors => {
        const nextErrors = { ...prevErrors };
        delete nextErrors[key];
        return nextErrors;
      });
    },
    [markDirty, setIncidentData]
  );

  const goToStep = useCallback(
    (step: number) => {
      setCurrentStep(prevStep => {
        if (step < prevStep) {
          setErrors({});
          return step;
        }
        return prevStep;
      });
    },
    [setCurrentStep]
  );

  const resetIncident = useCallback(async () => {
    const evidenceIds = incidentData.evidence
      .map(item => item.storageId)
      .filter((id): id is string => Boolean(id));

    setIncidentData(createEmptyIncident());
    setCurrentStep(1);
    setErrors({});
    markClean();
    clearPersistedState();

    if (evidenceIds.length > 0) {
      try {
        await deleteEvidenceBatch(evidenceIds);
      } catch (error) {
        console.warn('Failed to clear evidence cache during reset', error);
      }
    }
  }, [
    clearPersistedState,
    incidentData.evidence,
    markClean,
    setIncidentData,
    setCurrentStep
  ]);

  return {
    incidentData,
    currentStep,
    setCurrentStep,
    updateIncidentData,
    goToStep,
    validateCurrentStep,
    canProceed: isCurrentStepValid,
    errors,
    isDirty,
    markClean,
    resetIncident
  };
};

export type UseIncidentStateReturn = ReturnType<typeof useIncidentState>;
