
import React from 'react';
import { type Step } from '../../types';

interface ProgressBarProps {
  steps: Step[];
  currentStep: number;
  goToStep: (step: number) => void;
}

const CheckIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <path d="m9 11 3 3L22 4"/>
        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
    </svg>
);


const ProgressBar: React.FC<ProgressBarProps> = ({ steps, currentStep, goToStep }) => {
  return (
    <div className="flex items-start justify-between">
      {steps.map((step, index) => {
        const isActive = currentStep === step.number;
        const isCompleted = currentStep > step.number;

        let iconClasses = 'bg-slate-800/50 border-slate-700 text-slate-400 hover:border-slate-500 backdrop-blur-sm';
        if (isCompleted) iconClasses = 'bg-gradient-to-br from-emerald-500 to-green-500 border-emerald-400 text-white shadow-lg transform scale-100';
        if (isActive) iconClasses = 'bg-amber-400 border-amber-300 text-slate-900 shadow-xl scale-110';

        let textClasses = 'text-slate-500';
        if (isCompleted) textClasses = 'text-emerald-300';
        if (isActive) textClasses = 'text-amber-300';

        const lineClass = isCompleted ? 'bg-gradient-to-r from-emerald-500 to-green-500' : 'bg-slate-700/50';

        const Icon = step.icon;

        return (
          <React.Fragment key={step.number}>
            {index > 0 && <div className={`h-1 flex-1 mx-2 mt-5 rounded-full transition-all duration-700 ${lineClass}`} />}
            <div className="flex flex-col items-center flex-1 min-w-0">
              <button
                onClick={() => goToStep(step.number)}
                className={`relative flex items-center justify-center w-12 h-12 rounded-xl border-2 transition-all duration-500 cursor-pointer ${iconClasses}`}
                aria-label={`Go to step ${step.number}: ${step.title}`}
              >
                {isCompleted ? <CheckIcon /> : <Icon className="w-5 h-5" />}
              </button>
              <div className="mt-2 text-center max-w-full">
                <p className={`text-xs font-semibold transition-colors duration-300 ${textClasses} truncate`}>
                  {step.title}
                </p>
              </div>
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default ProgressBar;