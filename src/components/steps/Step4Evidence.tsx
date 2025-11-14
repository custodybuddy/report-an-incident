import React from 'react';
import { type IncidentData, type IncidentDataUpdater } from '@/types';
import { EVIDENCE_CATEGORIES } from '@/constants';
import { JURISDICTIONS } from '@/constants';
import H2 from '../ui/H2';
import { useEvidenceManager } from '../../hooks/useEvidenceManager';

interface Step4Props {
  data: Pick<IncidentData, 'jurisdiction' | 'evidence' | 'narrative' | 'caseNumber'>;
  updateData: IncidentDataUpdater;
  errors: { jurisdiction?: string };
}

const Step4Evidence: React.FC<Step4Props> = ({ data, updateData, errors }) => {
  const {
    handleFileChange,
    updateEvidenceItem,
    removeEvidenceItem,
    analysisState
  } = useEvidenceManager({
    narrative: data.narrative,
    evidence: data.evidence,
    updateData
  });

  const jurisdictionError = errors.jurisdiction;

  return (
    <div className="space-y-8 animate-[fade-in_0.6s_cubic-bezier(0.25,0.46,0.45,0.94)_forwards]">
      <div className="text-center mb-8">
        <H2 className="text-3xl font-bold text-[#FFD700] mb-2">Jurisdiction & Evidence</H2>
        <p className="text-slate-400 max-w-lg mx-auto">
          Specify the legal jurisdiction and upload any supporting evidence like screenshots,
          documents, or recordings.
        </p>
      </div>

      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <label
            htmlFor="jurisdiction-select"
            className="block text-sm font-semibold text-slate-300 mb-2"
          >
            Legal Jurisdiction <span className="text-amber-400">*</span>
          </label>
          <div className="relative">
            <select
              id="jurisdiction-select"
              value={data.jurisdiction}
              onChange={event => updateData('jurisdiction', event.target.value)}
              className={`w-full appearance-none bg-slate-800/50 border-2 rounded-xl px-4 py-3 text-slate-200 transition-all duration-300 focus:ring-4 focus:ring-amber-400/30 focus:border-amber-400 hover:border-amber-500 ${
                jurisdictionError
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-500/30'
                  : 'border-slate-600'
              }`}
              aria-invalid={!!jurisdictionError}
              aria-describedby={jurisdictionError ? 'jurisdiction-error' : undefined}
            >
              <option value="" disabled>
                Select a jurisdiction...
              </option>
              {JURISDICTIONS.map(j => (
                <option key={j} value={j}>
                  {j}
                </option>
              ))}
            </select>
          </div>
          {jurisdictionError && (
            <p id="jurisdiction-error" className="text-red-400 text-xs mt-1">
              {jurisdictionError}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="case-number-input"
            className="block text-sm font-semibold text-slate-300 mb-2"
          >
            Case Number (Optional)
          </label>
          <div className="relative">
            <input
              type="text"
              id="case-number-input"
              value={data.caseNumber}
              onChange={event => updateData('caseNumber', event.target.value)}
              placeholder="e.g., F-12345-67"
              className="w-full p-3 bg-slate-800/50 border-2 rounded-xl transition-all duration-300 shadow-sm text-slate-200 border-slate-600 focus:border-amber-400 focus:outline-none focus:ring-4 focus:ring-amber-400/30 hover:border-amber-500"
            />
          </div>
        </div>

        <div>
          <h3 className="text-lg font-bold text-slate-100 mb-4">Evidence Locker</h3>
          <div className="bg-black/20 rounded-xl p-6 border border-slate-700">
            <div className="space-y-4">
              {data.evidence.length === 0 && (
                <p className="text-center text-slate-500 py-4">No evidence uploaded yet.</p>
              )}
              {data.evidence.map(file => {
                const uniqueKey = file.id;
                return (
                  <div
                    key={uniqueKey}
                    className="bg-black/50 p-4 rounded-lg border border-slate-600 space-y-3"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-slate-200 break-all">{file.name}</p>
                        <p className="text-xs text-slate-400">
                          {(file.size / 1024).toFixed(2)} KB
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          void removeEvidenceItem(uniqueKey);
                        }}
                        aria-label={`Remove ${file.name}`}
                        className="text-slate-400 hover:text-red-400 transition-colors p-1 flex-shrink-0"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                          <line x1="10" y1="11" x2="10" y2="17" />
                          <line x1="14" y1="11" x2="14" y2="17" />
                        </svg>
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <select
                        value={file.category}
                        onChange={event =>
                          updateEvidenceItem(uniqueKey, 'category', event.target.value)
                        }
                        className="w-full p-2 bg-slate-700/50 border border-slate-600 rounded-md text-slate-300 text-sm focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400"
                      >
                        {EVIDENCE_CATEGORIES.map(cat => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                      <input
                        type="text"
                        placeholder="Brief description of this file..."
                        value={file.description}
                        onChange={event =>
                          updateEvidenceItem(uniqueKey, 'description', event.target.value)
                        }
                        className="w-full p-2 bg-slate-700/50 border border-slate-600 rounded-md text-slate-300 text-sm focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400"
                      />
                    </div>
                    {analysisState[uniqueKey] && (
                      <div className="text-xs text-amber-300 flex items-center pt-2">
                        <svg
                          className="animate-spin h-4 w-4 mr-2"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        AI is analyzing file...
                      </div>
                    )}
                    {file.aiAnalysis && !analysisState[uniqueKey] && (
                      <div className="mt-2 pt-2 border-t border-slate-600/50">
                        <p className="text-xs font-semibold text-amber-300">AI Analysis:</p>
                        <p className="text-xs text-slate-300 italic">{file.aiAnalysis}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="mt-6 pt-6 border-t border-slate-700/50">
              <label
                htmlFor="file-upload"
                className="w-full p-6 border-2 border-dashed border-amber-500/50 text-amber-300 bg-amber-900/10 rounded-xl hover:bg-amber-900/20 transition-all duration-200 flex flex-col items-center justify-center font-semibold cursor-pointer"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-8 h-8 mb-2"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                <span>Click to Upload or Drag &amp; Drop</span>
                <span className="text-xs text-slate-400 font-normal mt-1">
                  Images, PDFs, Audio, or Video
                </span>
              </label>
              <input
                id="file-upload"
                type="file"
                multiple
                className="hidden"
                onChange={handleFileChange}
                accept="image/*,application/pdf,audio/*,video/*"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Step4Evidence;
