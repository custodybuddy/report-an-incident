import { useCallback, useEffect, useRef, useState } from 'react';
import { type IncidentData } from '@/types';

const LOCAL_STORAGE_KEY = 'coParentingReportData';

interface StoredState {
  currentStep: number;
  incidentData: IncidentData;
}

export const createEmptyIncident = (): IncidentData => ({
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

export const useIncidentPersistence = () => {
  const savedStateRef = useRef<StoredState | undefined>(loadState());
  const [currentStep, setCurrentStep] = useState<number>(
    savedStateRef.current?.currentStep ?? 1
  );
  const [incidentData, setIncidentData] = useState<IncidentData>(
    savedStateRef.current?.incidentData ?? createEmptyIncident()
  );
  const hasHydratedRef = useRef(false);

  useEffect(() => {
    if (!hasHydratedRef.current) {
      hasHydratedRef.current = true;
      return;
    }

    saveState({ currentStep, incidentData });
  }, [currentStep, incidentData]);

  const clearPersistedState = useCallback(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.removeItem(LOCAL_STORAGE_KEY);
  }, []);

  return {
    currentStep,
    setCurrentStep,
    incidentData,
    setIncidentData,
    clearPersistedState
  } as const;
};
