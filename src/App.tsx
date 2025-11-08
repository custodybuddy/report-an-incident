import React, { useState, useCallback } from 'react';
import Header from './components/Header';
import ProgressBar from './components/ProgressBar';
import Navigation from './components/Navigation';
import Step0Consent from './components/steps/Step0Consent';
import Step1DateTime from './components/steps/Step1DateTime';
import Step2Narrative from './components/steps/Step2Narrative';
import Step3Involved from './components/steps/Step3Involved';
import Step4Evidence from './components/steps/Step4Evidence';
import Step5Review from './components/steps/Step5Review';
import Modal from './components/Modal';
import Footer from './components/Footer';
import { STEPS } from './constants';
import { type ReportData, type ModalInfo } from '../types';
import {
  generateProfessionalSummary,
  generateCategorization,
  generateLegalInsights
} from './services/geminiService';
import { exportReportToHTML, printReport } from './components/ui/utils/export';
import { useIncidentState } from './hooks/useIncidentState';

function App() {
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
    resetIncident
  } = useIncidentState();

  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [modal, setModal] = useState<ModalInfo | null>(null);

  const handleGenerateSummary = useCallback(async () => {
    setIsGeneratingSummary(true);
    setReportData(null);

    try {
      const [summaryResult, categorizationResult, legalResult] = await Promise.all([
        generateProfessionalSummary(incidentData),
        generateCategorization(incidentData),
        generateLegalInsights(incidentData)
      ]);

      const finalReportData: ReportData = {
        ...summaryResult,
        ...categorizationResult,
        ...legalResult,
        caseNumber: incidentData.caseNumber
      };

      setReportData(finalReportData);
    } catch (error) {
      console.error('Error generating AI Summary:', error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'An unknown error occurred while generating the report. One or more AI analysis steps may have failed.';
      setModal({
        title: 'Report Generation Failed',
        message: errorMessage,
        type: 'error',
        onClose: () => setModal(null)
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
        caseNumber: incidentData.caseNumber
      });
    } finally {
      setIsGeneratingSummary(false);
    }
  }, [incidentData]);

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
  }, [currentStep, validateCurrentStep, reportData, setCurrentStep, handleGenerateSummary]);

  const handlePrevStep = useCallback(() => {
    if (currentStep > 1) {
      goToStep(currentStep - 1);
    }
  }, [currentStep, goToStep]);

  const handleStartNewReport = useCallback(() => {
    goToStep(1);
  }, [goToStep]);

  const handleCancel = useCallback(() => {
    setModal({
      title: 'Discard Changes?',
      message:
        'Are you sure you want to cancel? All your progress will be lost and you will be returned to the first step.',
      type: 'confirm',
      onClose: () => setModal(null),
      onConfirm: () => {
        void (async () => {
          await resetIncident();
          setReportData(null);
          setModal(null);
        })();
      },
      confirmText: 'Yes, Discard',
      cancelText: 'No, Keep Editing'
    });
  }, [resetIncident]);

  const handleExport = () => {
    if (reportData) {
      markClean();
      exportReportToHTML(reportData, incidentData, modalInfo =>
        setModal({ ...modalInfo, onClose: () => setModal(null) })
      );
    } else {
      setModal({
        title: 'Export Error',
        message: 'Report data is missing. Please generate the summary first.',
        type: 'error',
        onClose: () => setModal(null)
      });
    }
  };

  const handlePrint = () => {
    if (reportData) {
      markClean();
      printReport(reportData, incidentData, modalInfo =>
        setModal({ ...modalInfo, onClose: () => setModal(null) })
      );
    } else {
      setModal({
        title: 'Print Error',
        message: 'Report data is missing. Please generate the summary first.',
        type: 'error',
        onClose: () => setModal(null)
      });
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <Step0Consent data={incidentData} updateData={updateIncidentData} errors={errors} />
        );
      case 2:
        return (
          <Step1DateTime data={incidentData} updateData={updateIncidentData} errors={errors} />
        );
      case 3:
        return (
          <Step2Narrative data={incidentData} updateData={updateIncidentData} errors={errors} />
        );
      case 4:
        return (
          <Step3Involved data={incidentData} updateData={updateIncidentData} errors={errors} />
        );
      case 5:
        return (
          <Step4Evidence data={incidentData} updateData={updateIncidentData} errors={errors} />
        );
      case 6:
        return (
          <Step5Review
            incidentData={incidentData}
            reportData={reportData}
            isGeneratingSummary={isGeneratingSummary}
            onExport={handleExport}
            onPrint={handlePrint}
            setModal={modalInfo => setModal({ ...modalInfo, onClose: () => setModal(null) })}
          />
        );
      default:
        return null;
    }
  };

  return (
    <>
      <Header onCreateNewReport={handleStartNewReport} />
      <main className="max-w-5xl mx-auto py-16 px-6 md:px-12">
        <ProgressBar steps={STEPS} currentStep={currentStep} goToStep={goToStep} />
        <div className="bg-black/50 backdrop-blur-2xl rounded-2xl shadow-2xl border border-slate-700/80 p-6 md:p-10 transition-all duration-300 mt-8 flex flex-col gap-6">
          {renderStepContent()}
          {currentStep < 6 && (
            <Navigation
              onPrev={handlePrevStep}
              onNext={handleNextStep}
              onCancel={handleCancel}
              currentStep={currentStep}
              canProceed={canProceed}
            />
          )}
        </div>
      </main>
      <Footer />
      {modal && <Modal {...modal} />}
    </>
  );
}

export default App;
