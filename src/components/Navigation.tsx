
import React, { memo } from 'react';
import Button from './ui/Button';

interface NavigationProps {
  onPrev: () => void;
  onNext: () => void;
  onCancel: () => void;
  currentStep: number;
  canProceed: boolean;
}

const Navigation: React.FC<NavigationProps> = ({ onPrev, onNext, onCancel, currentStep, canProceed }) => {
  return (
    <div className="mt-10 pt-6 border-t border-slate-700 flex justify-between items-center">
      <div>
        {currentStep > 1 && (
          <Button
            onClick={onCancel}
            variant="ghost"
            className="text-slate-400 hover:bg-red-900/40 hover:text-red-300"
          >
            Cancel &amp; Reset
          </Button>
        )}
      </div>

      <div className="flex items-center gap-4">
        <Button
          id="prev-step-btn"
          onClick={onPrev}
          variant="secondary"
          disabled={currentStep === 1}
          className="transform hover:scale-[1.03]"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
            <path d="m12 19-7-7 7-7" />
            <path d="M19 12H5" />
          </svg>
          Back
        </Button>
        {currentStep !== 5 && (
          <Button
            id="next-step-btn"
            onClick={onNext}
            disabled={!canProceed}
            className={`px-8 font-bold transform transition-transform duration-300 ${canProceed ? 'hover:scale-[1.03] active:scale-[0.98]' : ''}`}
          >
            Next Step
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          </Button>
        )}
      </div>
    </div>
  );
};

export default memo(Navigation);
