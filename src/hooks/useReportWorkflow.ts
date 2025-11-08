import { useCallback, useState } from 'react';
import { type ModalInfo, type ReportData } from '@/types';
import { STEPS } from '@/ui/steps';
import {
  generateCategorization,
  generateLegalInsights,
  generateProfessionalSummary,
} from '../services/gemini';
import {
  exportReportToHTML,
  printReport,
  type ReportHelperResult,
} from '../components/ui/utils/export';
import { useIncidentState } from './useIncidentState';

type ModalRequest = Omit<ModalInfo, 'onClose'> & { onClose?: () => void };

export const useReportWorkflow = () => {
  const {
    incidentData,
    currentStep,
    setCurrentStep,
    updateIncidentData,
    goToStep,
    validateCurrentStep,
    canProceed,
    errors,
    markClean,
    resetIncident,
  } = useIncidentState();

  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [modal, setModal] = useState<ModalInfo | null>(null);

  const showModal = useCallback(
    (modalInfo: ModalRequest) => {
      setModal({
        ...modalInfo,
        onClose: () => {
          modalInfo.onClose?.();
          setModal(null);
        },
      });
    },
    [setModal],
  );

  const handleGenerateSummary = useCallback(async () => {
    setIsGeneratingSummary(true);
    setReportData(null);

    try {
      const [summaryResult, categorizationResult, legalResult] = await Promise.all([
        generateProfessionalSummary(incidentData),
        generateCategorization(incidentData),
        generateLegalInsights(incidentData),
      ]);

      const finalReportData: ReportData = {
        ...summaryResult,
        ...categorizationResult,
        ...legalResult,
        caseNumber: incidentData.caseNumber,
      };

      setReportData(finalReportData);
    } catch (error) {
      console.error('Error generating AI Summary:', error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'An unknown error occurred while generating the report. One or more AI analysis steps may have failed.';

      showModal({
        title: 'Report Generation Failed',
        message: errorMessage,
        type: 'error',
      });

      setReportData({
        title: 'Report Generation Failed',
        category: 'Other',
        severity: 'Low',
        severityJustification:
          'System Error: The AI model failed to process the incident data.',
        professionalSummary:
          'An internal processing error occurred. Please ensure your narrative is sufficient and try generating again. This report contains placeholder data.',
        legalInsights: 'N/A due to system error.',
        sources: [],
        caseNumber: incidentData.caseNumber,
      });
    } finally {
      setIsGeneratingSummary(false);
    }
  }, [incidentData, showModal]);

  const handleNextStep = useCallback(async () => {
    if (validateCurrentStep()) {
      const nextStep = currentStep + 1;
      if (nextStep === 6 && !reportData) {
        setCurrentStep(nextStep);
        await handleGenerateSummary();
      } else if (nextStep <= STEPS.length) {
        setCurrentStep(nextStep);
      }
    }
  }, [currentStep, handleGenerateSummary, reportData, setCurrentStep, validateCurrentStep]);

  const handlePrevStep = useCallback(() => {
    if (currentStep > 1) {
      goToStep(currentStep - 1);
    }
  }, [currentStep, goToStep]);

  const handleStartNewReport = useCallback(() => {
    goToStep(1);
    setReportData(null);
  }, [goToStep]);

  const handleCancel = useCallback(() => {
    showModal({
      title: 'Discard Changes?',
      message:
        'Are you sure you want to cancel? All your progress will be lost and you will be returned to the first step.',
      type: 'confirm',
      onConfirm: () => {
        void (async () => {
          await resetIncident();
          setReportData(null);
        })();
      },
      confirmText: 'Yes, Discard',
      cancelText: 'No, Keep Editing',
    });
  }, [resetIncident, showModal]);

  const showHelperResultModal = useCallback(
    (result: ReportHelperResult) => {
      showModal({
        title: result.title,
        message: result.message,
        type: result.modalType,
      });
    },
    [showModal],
  );

  const handleExport = useCallback(() => {
    if (!reportData) {
      showModal({
        title: 'Export Error',
        message: 'Report data is missing. Please generate the summary first.',
        type: 'error',
      });
      return;
    }

    const result = exportReportToHTML(reportData, incidentData);
    if (result.ok) {
      markClean();
    }
    showHelperResultModal(result);
  }, [incidentData, markClean, reportData, showHelperResultModal, showModal]);

  const handlePrint = useCallback(() => {
    if (!reportData) {
      showModal({
        title: 'Print Error',
        message: 'Report data is missing. Please generate the summary first.',
        type: 'error',
      });
      return;
    }

    void (async () => {
      const result = await printReport(reportData, incidentData);
      if (result.ok) {
        markClean();
      }
      showHelperResultModal(result);
    })();
  }, [incidentData, markClean, reportData, showHelperResultModal, showModal]);

  return {
    incidentData,
    currentStep,
    updateIncidentData,
    goToStep,
    validateCurrentStep,
    canProceed,
    errors,
    reportData,
    isGeneratingSummary,
    modal,
    showModal,
    handleGenerateSummary,
    handleNextStep,
    handlePrevStep,
    handleStartNewReport,
    handleCancel,
    handleExport,
    handlePrint,
  };
};

export type UseReportWorkflowReturn = ReturnType<typeof useReportWorkflow>;
export type { ModalRequest };
