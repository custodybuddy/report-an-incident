import React from 'react';
import H1 from '../ui/H1';
import {
  cardBase,
  cardPadding,
  cardStack,
  inputGroupBase,
  inputGroupGap,
  inputGroupPadding,
  sectionStack,
} from '../ui/layoutTokens';

interface Step2NarrativeProps {
  narrative: string;
  onChange: (value: string) => void;
}

const Step2Narrative: React.FC<Step2NarrativeProps> = ({ narrative, onChange }) => {
  const charCount = narrative.length;
  const isMinLengthMet = charCount >= 100;

  return (
    <div className="space-y-10 animate-[fade-in_0.6s_cubic-bezier(0.25,0.46,0.45,0.94)_forwards]">
      <StepHero
        title="The Incident Narrative"
        description="This pared-down page keeps the original look so you can mock up narratives without any AI or storage layers attached."
      />
      <div className="max-w-4xl mx-auto">
        <label htmlFor="narrative-input" className="block text-sm font-semibold text-slate-300 mb-3">
          Incident Description (Min 100 characters) <span className="text-amber-400">*</span>
        </label>
        <div className="relative">
          <textarea
            id="narrative-input"
            rows={10}
            placeholder="Describe what happened in detail..."
            value={narrative}
            onChange={event => onChange(event.target.value)}
            className="w-full p-4 bg-slate-800/50 border-2 border-slate-600 rounded-xl transition-all duration-300 shadow-lg resize-none text-slate-200 focus:outline-none focus:ring-4 focus:border-amber-400 focus:ring-amber-400/30 hover:border-amber-500"
          />
          <div
            className={`absolute bottom-4 right-4 px-3 py-1 rounded-full text-xs font-medium transition-all duration-300 ${isMinLengthMet ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}
          >
            {charCount} / 100 characters
          </div>
        </div>

        <div className={`${sectionStack} mt-6`}>
          <div className={`${cardBase} ${cardPadding} ${cardStack}`}>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-slate-200">Voice dictation</p>
                <p className="text-xs text-slate-400">
                  In the full product we capture live transcripts here. For now this block is purely
                  decorative so you can keep the CSS.
                </p>
              </div>
              <button
                type="button"
                disabled
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-slate-700 text-slate-500 text-sm font-semibold shadow-md cursor-not-allowed"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-4 h-4"
                >
                  <path d="M9 5a3 3 0 1 1 6 0v6a3 3 0 1 1-6 0Z" />
                  <path d="M5 10a7 7 0 0 0 14 0" />
                  <path d="M12 19v4" />
                  <path d="M8 23h8" />
                </svg>
                Dictation unavailable
              </button>
            </div>
            <p className={`text-sm text-amber-100 bg-slate-800/60 border border-slate-700 rounded-lg ${inputGroupPadding}`}>
              <span className="font-semibold text-amber-300">Tip:</span> Type freely, nothing is
              saved beyond this browser session.
            </p>
          </div>

          <div
            className={`${inputGroupBase} ${inputGroupPadding} flex items-start ${inputGroupGap}`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-4 h-4 mt-1 flex-shrink-0 text-amber-400"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span>
              <strong>Focus on facts.</strong> The stripped copy keeps the coaching tone without
              needing validation logic.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Step2Narrative;
