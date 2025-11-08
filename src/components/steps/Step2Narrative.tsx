import React from 'react';
import { type IncidentData, type IncidentDataUpdater } from '../../../types';

interface Step2Props {
  data: Pick<IncidentData, 'narrative'>;
  updateData: IncidentDataUpdater;
  errors: { narrative?: string };
}

const Step2Narrative: React.FC<Step2Props> = ({ data, updateData, errors }) => {
  const charCount = data.narrative.length;
  const isMinLengthMet = charCount >= 100;
  const narrativeError = errors.narrative;

  return (
    <div className="space-y-8 animate-[fade-in_0.6s_cubic-bezier(0.25,0.46,0.45,0.94)_forwards]">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-amber-400 mb-2">The Incident Narrative</h2>
        <p className="text-slate-400 max-w-md mx-auto">Describe the incident objectively. Our AI will filter out emotional language for the professional report.</p>
      </div>
      <div className="max-w-4xl mx-auto">
        <label htmlFor="narrative-input" className="block text-sm font-semibold text-slate-300 mb-3">Incident Description (Min 100 characters) <span className="text-amber-400">*</span></label>
        <div className="relative">
          <textarea
            id="narrative-input"
            rows={10}
            placeholder="Describe what happened in detail..."
            value={data.narrative}
            onChange={(e) => updateData('narrative', e.target.value)}
            className={`w-full p-4 bg-slate-800/50 border-2 rounded-xl transition-all duration-300 shadow-lg resize-none text-slate-200 focus:outline-none focus:ring-4
                        ${narrativeError 
                            ? 'border-red-500 focus:border-red-500 focus:ring-red-500/30' 
                            : 'border-slate-600 focus:border-amber-400 focus:ring-amber-400/30 hover:border-amber-500'}`}
            aria-invalid={!!narrativeError}
            aria-describedby={narrativeError ? "narrative-error" : undefined}
          />
          <div className={`absolute bottom-4 right-4 px-3 py-1 rounded-full text-xs font-medium transition-all duration-300 ${isMinLengthMet ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}>
            {charCount} / 100 characters
          </div>
        </div>
        {narrativeError && <p id="narrative-error" className="text-red-400 text-xs mt-1">{narrativeError}</p>}
        <div className="mt-3 flex items-start text-sm text-slate-400 p-3 bg-black/30 rounded-lg border border-slate-700">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 mt-1 mr-2 flex-shrink-0 text-amber-400"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          <span><strong>Focus on facts.</strong> The more detail, the better. State what you saw or heard, not how you felt about it.</span>
        </div>
      </div>
    </div>
  );
};

export default Step2Narrative;
