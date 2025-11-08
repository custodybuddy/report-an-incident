import { useCallback, useMemo } from 'react';
import { type IncidentData } from '@/types';

export type ValidationErrors = Partial<Record<keyof IncidentData, string>>;

export const useIncidentValidation = (
  currentStep: number,
  incidentData: IncidentData
) => {
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

  return {
    computeValidationErrors,
    currentValidationErrors,
    isCurrentStepValid
  } as const;
};
