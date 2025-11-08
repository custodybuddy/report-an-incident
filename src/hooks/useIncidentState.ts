import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { type IncidentData } from '../../types';
import { deleteEvidenceBatch } from '../services/evidenceStore';

const LOCAL_STORAGE_KEY = 'coParentingReportData';

type ValidationErrors = Partial<Record<keyof IncidentData, string>>;

const createEmptyIncident = (): IncidentData => ({
  consentAcknowledged: false,
  date: '',
  time: '',
  narrative: '',
  parties: [],
  children: [],
  jurisdiction: '',
  evidence: [],
  caseNumber: ''
});

interface StoredState {
  currentStep: number;
  incidentData: IncidentData;
}

const sanitizeIncidentData = (data: IncidentData): IncidentData => ({
  ...data,
  evidence: data.evidence.map(({ base64, ...rest }) => rest)
});

const loadState = (): StoredState | undefined => {
  if (typeof window === 'undefined') return undefined;
  try {
    const serializedState = window.localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!serializedState) {
      return undefined;
    }
    const parsed = JSON.parse(serializedState) as StoredState;
    if (
      !parsed ||
      typeof parsed.currentStep !== 'number' ||
      typeof parsed.incidentData !== 'object'
    ) {
      return undefined;
    }

    const incidentData: IncidentData = {
      ...createEmptyIncident(),
      ...parsed.incidentData,
      evidence: Array.isArray(parsed.incidentData.evidence)
        ? parsed.incidentData.evidence.map(evidence => ({
            ...evidence,
            base64: undefined
          }))
        : []
    };

    return {
      currentStep: Math.min(Math.max(parsed.currentStep, 1), 6),
      incidentData
    };
  } catch (error) {
    console.warn('Could not load state from local storage', error);
    return undefined;
  }
};

const saveState = (state: StoredState) => {
  if (typeof window === 'undefined') return;
  try {
    const serializedState = JSON.stringify({
      currentStep: state.currentStep,
      incidentData: sanitizeIncidentData(state.incidentData)
    });
    window.localStorage.setItem(LOCAL_STORAGE_KEY, serializedState);
  } catch (error) {
    console.warn('Could not save state to local storage', error);
  }
};

export const useIncidentState = () => {
  const savedStateRef = useRef<StoredState | undefined>(loadState());

  const [currentStep, setCurrentStep] = useState<number>(
    savedStateRef.current?.currentStep ?? 1
  );
  const [incidentData, setIncidentData] = useState<IncidentData>(
    savedStateRef.current?.incidentData ?? createEmptyIncident()
  );
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isDirty, setIsDirty] = useState(false);
  const hasHydratedRef = useRef(false);

  const computeValidationErrors = useCallback(
    (step: number, data: IncidentData): ValidationErrors => {
      const validationErrors: ValidationErrors = {};
      switch (step) {
        case 1:
          if (!data.consentAcknowledged) {
            validationErrors.consentAcknowledged =
              'You must acknowledge the terms to proceed.';
          }
          break;
        case 2:
          if (!data.date) validationErrors.date = 'Incident date is required.';
          if (!data.time) validationErrors.time = 'Incident time is required.';
          break;
        case 3:
          if (data.narrative.trim().length < 100) {
            validationErrors.narrative =
              'Narrative must be at least 100 characters.';
          }
          break;
        case 4:
          if (data.parties.length === 0) {
            validationErrors.parties = 'At least one party must be involved.';
          }
          break;
        case 5:
          if (!data.jurisdiction) {
            validationErrors.jurisdiction =
              'Legal jurisdiction must be selected.';
          }
          break;
        default:
          break;
      }
      return validationErrors;
    },
    []
  );

  const currentValidationErrors = useMemo(
    () => computeValidationErrors(currentStep, incidentData),
    [computeValidationErrors, currentStep, incidentData]
  );

  const isCurrentStepValid = useMemo(
    () => Object.keys(currentValidationErrors).length === 0,
    [currentValidationErrors]
  );

  const validateCurrentStep = useCallback((): boolean => {
    setErrors(currentValidationErrors);
    return isCurrentStepValid;
  }, [currentValidationErrors, isCurrentStepValid]);

  const canProceed = isCurrentStepValid;

  const updateIncidentData = useCallback(
    <K extends keyof IncidentData>(
      key: K,
      valueOrUpdater: IncidentData[K] | ((prevIncident: IncidentData) => IncidentData[K])
    ) => {
      setIncidentData(prevIncident => {
        const nextValue =
          typeof valueOrUpdater === 'function'
            ? (valueOrUpdater as (prev: IncidentData) => IncidentData[K])(prevIncident)
            : valueOrUpdater;

        const nextIncident = {
          ...prevIncident,
          [key]: nextValue
        };

        return nextIncident;
      });

      setIsDirty(true);
      setErrors(prevErrors => {
        const nextErrors = { ...prevErrors };
        delete nextErrors[key];
        return nextErrors;
      });
    },
    []
  );

  const goToStep = useCallback((step: number) => {
    setCurrentStep(prevStep => {
      if (step < prevStep) {
        setErrors({});
        return step;
      }
      return prevStep;
    });
  }, []);

  const markClean = useCallback(() => {
    setIsDirty(false);
  }, []);

  const resetIncident = useCallback(async () => {
    const evidenceIds = incidentData.evidence
      .map(item => item.storageId)
      .filter((id): id is string => Boolean(id));

    setIncidentData(createEmptyIncident());
    setCurrentStep(1);
    setErrors({});
    setIsDirty(false);

    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(LOCAL_STORAGE_KEY);
    }

    if (evidenceIds.length > 0) {
      try {
        await deleteEvidenceBatch(evidenceIds);
      } catch (error) {
        console.warn('Failed to clear evidence cache during reset', error);
      }
    }
  }, [incidentData.evidence]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (isDirty) {
        event.preventDefault();
        event.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isDirty]);

  useEffect(() => {
    if (!hasHydratedRef.current) {
      hasHydratedRef.current = true;
      return;
    }

    saveState({ currentStep, incidentData });
  }, [currentStep, incidentData]);

  return {
    incidentData,
    currentStep,
    setCurrentStep,
    updateIncidentData,
    goToStep,
    validateCurrentStep,
    canProceed,
    errors,
    isDirty,
    markClean,
    resetIncident
  };
};

export type UseIncidentStateReturn = ReturnType<typeof useIncidentState>;
