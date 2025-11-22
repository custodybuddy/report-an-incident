import { useCallback, useEffect, useMemo, useState } from 'react';
import type { IncidentData } from '../types';

const STORAGE_KEY = 'incident-draft';
const STORAGE_VERSION = '1';

interface StoredIncidentDraft {
  version: string;
  incidentData: IncidentData;
  currentStep: number;
}

type StorageType = 'session' | 'local';

const getStorage = (storageType: StorageType): Storage | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    return storageType === 'local' ? window.localStorage : window.sessionStorage;
  } catch (error) {
    console.warn('Storage is unavailable:', error);
    return null;
  }
};

const readDraftFromStorage = (storageType: StorageType): StoredIncidentDraft | null => {
  const storage = getStorage(storageType);
  if (!storage) {
    return null;
  }

  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as Partial<StoredIncidentDraft>;
    if (parsed.version !== STORAGE_VERSION || !parsed.incidentData) {
      storage.removeItem(STORAGE_KEY);
      return null;
    }

    return {
      version: STORAGE_VERSION,
      currentStep: Math.max(1, Number(parsed.currentStep) || 1),
      incidentData: parsed.incidentData,
    };
  } catch (error) {
    console.warn('Unable to read draft from storage:', error);
    storage.removeItem(STORAGE_KEY);
    return null;
  }
};

interface UseIncidentDraftStorageOptions {
  incidentData: IncidentData;
  currentStep: number;
  enabled?: boolean;
  storageType?: StorageType;
}

const useIncidentDraftStorage = ({
  incidentData,
  currentStep,
  enabled = false,
  storageType = 'session',
}: UseIncidentDraftStorageOptions) => {
  const [storedDraft, setStoredDraft] = useState<StoredIncidentDraft | null>(() =>
    readDraftFromStorage(storageType)
  );

  const hasStoredDraft = useMemo(() => Boolean(storedDraft), [storedDraft]);

  const persistDraft = useCallback(
    (draft: StoredIncidentDraft) => {
      const storage = getStorage(storageType);
      if (!storage) {
        return;
      }

      storage.setItem(STORAGE_KEY, JSON.stringify(draft));
      setStoredDraft(draft);
    },
    [storageType]
  );

  const clearDraft = useCallback(() => {
    const storage = getStorage(storageType);
    storage?.removeItem(STORAGE_KEY);
    setStoredDraft(null);
  }, [storageType]);

  useEffect(() => {
    if (!enabled || !incidentData.consentAcknowledged) {
      return;
    }

    const nextDraft: StoredIncidentDraft = {
      version: STORAGE_VERSION,
      incidentData,
      currentStep,
    };

    persistDraft(nextDraft);
  }, [currentStep, enabled, incidentData, persistDraft]);

  return {
    storedDraft,
    hasStoredDraft,
    clearDraft,
  } as const;
};

export type { StoredIncidentDraft };
export default useIncidentDraftStorage;
