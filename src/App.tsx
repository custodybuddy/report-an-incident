import React, { useMemo } from 'react';
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
import { STEPS } from '@/ui/steps';
import { useReportWorkflow } from './hooks/useReportWorkflow';

function App() {
  const {
    incidentData,
    currentStep,
    updateIncidentData,
    goToStep,
    canProceed,
    errors,
    reportData,
    isGeneratingSummary,
    modal,
    handleNextStep,
    handlePrevStep,
    handleStartNewReport,
    handleCancel,
    handleExport,
    handlePrint,
  } = useReportWorkflow();

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
            isGeneratingSummary={isGeneratingSummary}
            onExport={handleExport}
            onPrint={handlePrint}
          />
        );
      default:
        return null;
    }
  }, [
    currentStep,
    errors,
    handleExport,
    handlePrint,
    incidentData,
    isGeneratingSummary,
    reportData,
    updateIncidentData,
  ]);

  return (
    <>
      <Header onCreateNewReport={handleStartNewReport} />
      <main className="max-w-5xl mx-auto py-16 px-6 md:px-12">
        <ProgressBar steps={STEPS} currentStep={currentStep} goToStep={goToStep} />
        <div className="bg-black/50 backdrop-blur-2xl rounded-2xl shadow-2xl border border-slate-700/80 p-6 md:p-10 transition-all duration-300 mt-8 flex flex-col gap-6">
          {stepContent}
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
