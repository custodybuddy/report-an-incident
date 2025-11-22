import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Header from './components/Header';
import ProgressBar from './components/ProgressBar';
import Navigation from './components/Navigation';
import DraftRestoreBanner from './components/DraftRestoreBanner';
import Step0Consent from './components/steps/Step0Consent';
import Step1DateTime from './components/steps/Step1DateTime';
import Step2Narrative from './components/steps/Step2Narrative';
import Step3Involved from './components/steps/Step3Involved';
import Step4Evidence from './components/steps/Step4Evidence';
import Step5Review from './components/steps/Step5Review';
import Footer from './components/Footer';
import { STEPS } from './ui/steps';
import { createInitialIncident, type IncidentData, type ReportResult } from './types';
import { generateIncidentReport } from './services/reportGenerator';
import { assertApiBaseUrl } from './services/apiConfig';
import useIncidentDraftStorage, { type StorageType } from './hooks/useIncidentDraftStorage';

function App() {
  const [currentStep, setCurrentStep] = useState(1);
  const [incidentData, setIncidentData] = useState<IncidentData>(() => createInitialIncident());
  const [reportResult, setReportResult] = useState<ReportResult | null>(null);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [reportError, setReportError] = useState<string | null>(null);
  const [generationController, setGenerationController] = useState<AbortController | null>(null);
  const [showRestorePrompt, setShowRestorePrompt] = useState(false);
  const [hasHandledStoredDraft, setHasHandledStoredDraft] = useState(false);
  const [shouldPersistDraft, setShouldPersistDraft] = useState(false);
  const draftStorageType: StorageType = 'local';

  const storagePersistenceMessage = useMemo(() => {
    return draftStorageType === 'local'
      ? 'Drafts save to this browser so you can close the tab and pick up where you left off.'
      : 'Drafts stay available while this tab remains open. Start fresh anytime to clear them.';
  }, [draftStorageType]);

  const { storedDraft, hasStoredDraft, clearDraft } = useIncidentDraftStorage({
    incidentData,
    currentStep,
    enabled: shouldPersistDraft,
    storageType: draftStorageType,
  });

  const clearGeneratedReport = useCallback(() => {
    setReportResult(null);
    setReportError(null);
  }, []);

  const updateIncidentData = useCallback(
    <K extends keyof IncidentData>(key: K, value: IncidentData[K]) => {
      setIncidentData(prev => {
        if (prev[key] === value) {
          return prev;
        }
        clearGeneratedReport();
        return {
          ...prev,
          [key]: value,
        };
      });
    },
    [clearGeneratedReport]
  );

  const resetWizard = useCallback(() => {
    clearDraft();
    setIncidentData(createInitialIncident());
    setReportResult(null);
    setReportError(null);
    setCurrentStep(1);
    setHasHandledStoredDraft(true);
    setShouldPersistDraft(true);
  }, [clearDraft]);

  type StepValidationEntry = [step: number, isValid: boolean];
  const stepValidationEntries = useMemo<StepValidationEntry[]>(
    () => [
      [1, incidentData.consentAcknowledged],
      [2, Boolean(incidentData.date && incidentData.time)],
      [3, incidentData.narrative.trim().length >= 100],
      [4, incidentData.parties.length > 0],
      [5, Boolean(incidentData.jurisdiction)],
      [6, Boolean(reportResult)],
    ],
    [incidentData, reportResult]
  );

  const maxAccessibleStep = useMemo(() => {
    let maxStep = 1;
    for (const [step, isValid] of stepValidationEntries) {
      if (!isValid) {
        break;
      }
      maxStep = Math.min(step + 1, STEPS.length);
    }
    return maxStep;
  }, [stepValidationEntries]);

  useEffect(() => {
    if (currentStep > maxAccessibleStep) {
      setCurrentStep(maxAccessibleStep);
    }
  }, [currentStep, maxAccessibleStep]);

  const goToStep = useCallback(
    (step: number) => {
      setCurrentStep(Math.min(Math.max(step, 1), maxAccessibleStep));
    },
    [maxAccessibleStep]
  );

  const handlePrevStep = useCallback(() => {
    setCurrentStep(prev => Math.max(1, prev - 1));
  }, []);

  const handleNextStep = useCallback(() => {
    setCurrentStep(prev => Math.min(maxAccessibleStep, prev + 1));
  }, [maxAccessibleStep]);

  const handleStartNewReport = useCallback(() => {
    resetWizard();
  }, [resetWizard]);

  const handleRestoreDraft = useCallback(() => {
    if (!storedDraft) {
      return;
    }

    setIncidentData(prev => ({
      ...createInitialIncident(),
      ...prev,
      ...storedDraft.incidentData,
    }));
    setReportResult(null);
    setReportError(null);
    setCurrentStep(Math.min(Math.max(storedDraft.currentStep, 1), STEPS.length));
    setShowRestorePrompt(false);
    setHasHandledStoredDraft(true);
    setShouldPersistDraft(true);
  }, [storedDraft]);

  const handleDiscardDraft = useCallback(() => {
    clearDraft();
    resetWizard();
    setShowRestorePrompt(false);
    setHasHandledStoredDraft(true);
    setShouldPersistDraft(true);
  }, [clearDraft, resetWizard]);

  useEffect(() => {
    if (currentStep !== 5 || typeof window === 'undefined') {
      return;
    }

    try {
      assertApiBaseUrl();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Report API base URL is not configured. Set VITE_REPORT_API_URL or use the localhost proxy (http://127.0.0.1:8788/api).';
      setReportError(prev => prev ?? message);
    }
  }, [currentStep]);

  const handleGenerateReport = async () => {
    if (isGeneratingReport) {
      return;
    }
    const controller = new AbortController();
    setGenerationController(controller);
    setIsGeneratingReport(true);
    setReportError(null);
    try {
      if (typeof window !== 'undefined') {
        assertApiBaseUrl();
      }
      const result = await generateIncidentReport(incidentData, controller.signal);
      setReportResult(result);
    } catch (error) {
      const wasAborted = controller.signal.aborted;
      const reason = controller.signal.reason;
      const isTimeout = reason instanceof DOMException && reason.name === 'TimeoutError';

      if (wasAborted) {
        setReportError(
          isTimeout
            ? 'Report generation timed out. Please try again.'
            : 'Report generation was canceled. You can try again.'
        );
      } else {
        setReportError(
          error instanceof Error ? error.message : 'Unable to generate report. Please try again.'
        );
      }
    } finally {
      setIsGeneratingReport(false);
      setGenerationController(null);
    }
  };

  const handleCancelGeneration = () => {
    setReportError(null);
    setReportResult(null);
    const controller = generationController;
    if (controller && !controller.signal.aborted) {
      controller.abort(new DOMException('Canceled by user', 'AbortError'));
    } else {
      setIsGeneratingReport(false);
    }
    setGenerationController(null);
  };

  const canProceed = useMemo(() => {
    const entry = stepValidationEntries.find(([step]) => step === currentStep);
    return entry ? entry[1] : true;
  }, [currentStep, stepValidationEntries]);

  useEffect(() => {
    if (hasHandledStoredDraft) {
      return;
    }

    if (hasStoredDraft) {
      setShowRestorePrompt(true);
      return;
    }

    setHasHandledStoredDraft(true);
    setShouldPersistDraft(true);
  }, [hasHandledStoredDraft, hasStoredDraft]);

  const stepContent = useMemo(() => {
    switch (currentStep) {
      case 1:
        return (
          <Step0Consent
            acknowledged={incidentData.consentAcknowledged}
            onChange={value => updateIncidentData('consentAcknowledged', value)}
          />
        );
      case 2:
        return (
          <Step1DateTime
            date={incidentData.date}
            time={incidentData.time}
            onChange={(field, value) => updateIncidentData(field, value)}
          />
        );
      case 3:
        return (
          <Step2Narrative
            narrative={incidentData.narrative}
            onChange={value => updateIncidentData('narrative', value)}
          />
        );
      case 4:
        return (
          <Step3Involved
            parties={incidentData.parties}
            children={incidentData.children}
            onPartiesChange={items => updateIncidentData('parties', items)}
            onChildrenChange={items => updateIncidentData('children', items)}
          />
        );
      case 5:
        return (
          <Step4Evidence
            jurisdiction={incidentData.jurisdiction}
            caseNumber={incidentData.caseNumber}
            evidence={incidentData.evidence}
            onJurisdictionChange={value => updateIncidentData('jurisdiction', value)}
            onCaseNumberChange={value => updateIncidentData('caseNumber', value)}
            onEvidenceChange={items => updateIncidentData('evidence', items)}
            onGenerateReport={handleGenerateReport}
            onCancelGeneration={handleCancelGeneration}
            isGenerating={isGeneratingReport}
            hasReport={Boolean(reportResult)}
            error={reportError}
          />
        );
      case 6:
        return (
          <Step5Review
            incidentData={incidentData}
            reportResult={reportResult}
            onReset={resetWizard}
            onPrev={handlePrevStep}
          />
        );
      default:
        return null;
    }
  }, [currentStep, incidentData, reportResult, isGeneratingReport, reportError]);

  return (
    <>
      <Header onCreateNewReport={handleStartNewReport} />
      <main className="max-w-5xl mx-auto py-16 px-6 md:px-12">
        {showRestorePrompt && storedDraft && (
          <DraftRestoreBanner onRestore={handleRestoreDraft} onDiscard={handleDiscardDraft} />
        )}
        <p className="mb-4 text-sm text-slate-300">{storagePersistenceMessage}</p>
        <ProgressBar steps={STEPS} currentStep={currentStep} goToStep={goToStep} />
        <div className="bg-black/50 backdrop-blur-2xl rounded-2xl shadow-2xl border border-slate-700/80 p-6 md:p-10 transition-all duration-300 mt-8 flex flex-col gap-6">
          {stepContent}
          {currentStep < 6 && (
            <Navigation
              onPrev={handlePrevStep}
              onNext={handleNextStep}
              onCancel={handleStartNewReport}
              currentStep={currentStep}
              canProceed={canProceed}
            />
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}

export default App;
