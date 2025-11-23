import React, { useMemo, useState } from 'react';
import Header from './components/Header';
import ProgressBar from './components/ProgressBar';
import Navigation from './components/Navigation';
import Step0Consent from './components/steps/Step0Consent';
import Step1DateTime from './components/steps/Step1DateTime';
import Step2Narrative from './components/steps/Step2Narrative';
import Step3Involved from './components/steps/Step3Involved';
import Step4Evidence from './components/steps/Step4Evidence';
import Step5Review from './components/steps/Step5Review';
import Footer from './components/Footer';
import Button from './components/ui/Button';
import { STEPS } from '@/ui/steps';
import { type IncidentData, type IncidentDataUpdater, type IncidentErrors, type ReportData } from './types';
import { resolveJurisdiction } from '@/legal';

const TOTAL_STEPS = STEPS.length;
const initialIncidentData: IncidentData = {
  consentAcknowledged: false,
  date: '',
  time: '',
  narrative: '',
  parties: [],
  children: [],
  jurisdiction: '',
  evidence: [],
  caseNumber: '',
};

function App() {
  const [incidentData, setIncidentData] = useState<IncidentData>(initialIncidentData);
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState<IncidentErrors>({});
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  const updateIncidentData: IncidentDataUpdater = (key, valueOrUpdater) => {
    setIncidentData((prev) => {
      const nextValue =
        typeof valueOrUpdater === 'function'
          ? (valueOrUpdater as (prev: IncidentData) => IncidentData[typeof key])(prev)
          : valueOrUpdater;

      return {
        ...prev,
        [key]: nextValue,
      };
    });

    // Clear any error tied to the updated field so users can retry immediately.
    setErrors((prevErrors) => ({
      ...prevErrors,
      [key]: undefined,
    }));
  };

  const goToStep = (step: number) => {
    setCurrentStep(Math.min(Math.max(step, 1), TOTAL_STEPS));
  };

  const validateStep = (step: number) => {
    const nextErrors: IncidentErrors = {};

    if (step === 1 && !incidentData.consentAcknowledged) {
      nextErrors.consentAcknowledged = 'Please acknowledge the terms to proceed.';
    }

    if (step === 2) {
      if (!incidentData.date) nextErrors.date = 'Date is required.';
      if (!incidentData.time) nextErrors.time = 'Time is required.';
    }

    if (step === 3 && incidentData.narrative.trim().length < 20) {
      nextErrors.narrative = 'Add a bit more detail (20+ characters) before moving on.';
    }

    if (step === 4 && incidentData.parties.length === 0) {
      nextErrors.parties = 'Pick at least one party involved.';
    }

    if (step === 5 && !incidentData.jurisdiction) {
      nextErrors.jurisdiction = 'Select a jurisdiction.';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const canProceed = useMemo(() => {
    switch (currentStep) {
      case 1:
        return incidentData.consentAcknowledged;
      case 2:
        return Boolean(incidentData.date && incidentData.time);
      case 3:
        return incidentData.narrative.trim().length >= 20;
      case 4:
        return incidentData.parties.length > 0;
      case 5:
        return Boolean(incidentData.jurisdiction);
      default:
        return true;
    }
  }, [currentStep, incidentData]);

  const handleNextStep = () => {
    if (currentStep >= TOTAL_STEPS) return;
    if (!validateStep(currentStep)) return;

    // When leaving Evidence (step 5), simulate report generation
    if (currentStep === 5) {
      setIsGeneratingReport(true);
      setReportData(null);
      setCurrentStep(6);

      setTimeout(() => {
        const resolvedJurisdiction = resolveJurisdiction(incidentData.jurisdiction);
        setReportData({
          summary:
            'This is a generated report preview summarizing the incident in a neutral, fact-focused tone with linked statutes. Replace this with OpenAI output when backend is ready.',
          createdAt: new Date().toISOString(),
          evidenceCount: incidentData.evidence.length,
          jurisdiction: {
            region: resolvedJurisdiction.region || 'N/A',
            country: resolvedJurisdiction.country || 'N/A',
          },
        });
        setIsGeneratingReport(false);
      }, 1200);
      return;
    }

    setCurrentStep((prev) => prev + 1);
  };

  const handlePrevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleStartNewReport = () => {
    setIncidentData(initialIncidentData);
    setCurrentStep(1);
    setErrors({});
    setReportData(null);
    setIsGeneratingReport(false);
  };

  const handleCancel = handleStartNewReport;

  const stepContent = useMemo(() => {
    switch (currentStep) {
      case 1:
        return <Step0Consent data={incidentData} updateData={updateIncidentData} errors={errors} />;
      case 2:
        return <Step1DateTime data={incidentData} updateData={updateIncidentData} errors={errors} />;
      case 3:
        return <Step2Narrative data={incidentData} updateData={updateIncidentData} errors={errors} />;
      case 4:
        return <Step3Involved data={incidentData} updateData={updateIncidentData} errors={errors} />;
      case 5:
        return <Step4Evidence data={incidentData} updateData={updateIncidentData} errors={errors} />;
      case 6:
        return (
          <Step5Review
            incidentData={incidentData}
            reportData={reportData}
            isGenerating={isGeneratingReport}
            onExport={() => window.print()}
            onPrint={() => window.print()}
            onRestart={handleStartNewReport}
          />
        );
      default:
        return null;
    }
  }, [
    currentStep,
    errors,
    incidentData,
    updateIncidentData,
  ]);

  return (
    <>
      <Header onCreateNewReport={handleStartNewReport} />
      <main className="max-w-5xl mx-auto py-16 px-6 md:px-12">
        <ProgressBar steps={STEPS} currentStep={currentStep} goToStep={goToStep} />
        <div className="bg-black/50 backdrop-blur-2xl rounded-2xl shadow-2xl border border-slate-700/80 p-6 md:p-10 transition-all duration-300 mt-8 flex flex-col gap-6">
          {stepContent}
          {currentStep < TOTAL_STEPS && (
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
    </>
  );
}

export default App;
