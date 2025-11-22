import React, { useCallback, useMemo, useState } from 'react';
import { EVIDENCE_CATEGORIES, JURISDICTIONS } from '../../config/evidence';
import useEvidenceList, { type EvidenceChangeHandler, type EvidenceUpdateKey } from '../../hooks/useEvidenceList';
import EvidenceItemRow from './EvidenceItemRow';
import type { EvidenceItem } from '../../types';
import H2 from '../ui/H2';
import Button from '../ui/Button';
import type { FileValidationResult } from '../../hooks/useEvidenceList';

interface Step4EvidenceProps {
  jurisdiction: string;
  caseNumber: string;
  evidence: EvidenceItem[];
  onJurisdictionChange: (value: string) => void;
  onCaseNumberChange: (value: string) => void;
  onEvidenceChange: (items: EvidenceChangeHandler) => void;
  onGenerateReport: () => void;
  onCancelGeneration: () => void;
  isGenerating: boolean;
  hasReport: boolean;
  error?: string | null;
}

const Step4Evidence: React.FC<Step4EvidenceProps> = ({
  jurisdiction,
  caseNumber,
  evidence,
  onJurisdictionChange,
  onCaseNumberChange,
  onEvidenceChange,
  onGenerateReport,
  onCancelGeneration,
  isGenerating,
  hasReport,
  error,
}) => {
  const [uploadResult, setUploadResult] = useState<FileValidationResult | null>(null);

  const { handleFileChange, removeEvidenceItem, updateEvidenceItem } = useEvidenceList({
    evidence,
    onEvidenceChange,
    onValidationResult: setUploadResult,
  });

  const handleRemoveEvidence = useCallback(
    (id: string) => {
      removeEvidenceItem(id);
    },
    [removeEvidenceItem],
  );

  const handleUpdateEvidence = useCallback(
    (id: string, key: EvidenceUpdateKey, value: string) => {
      updateEvidenceItem(id, key, value);
    },
    [updateEvidenceItem],
  );

  const renderEvidenceItem = useCallback(
    (item: EvidenceItem) => (
      <EvidenceItemRow
        key={item.id}
        item={item}
        categories={EVIDENCE_CATEGORIES}
        onRemove={handleRemoveEvidence}
        onUpdate={handleUpdateEvidence}
      />
    ),
    [handleRemoveEvidence, handleUpdateEvidence],
  );

  const uploadFeedback = useMemo(() => {
    if (!uploadResult) {
      return null;
    }

    if (uploadResult.totalSelected === 0) {
      return 'No files were selected.';
    }

    const messages = [] as string[];

    if (uploadResult.added.length > 0) {
      messages.push(`${uploadResult.added.length} file${uploadResult.added.length > 1 ? 's' : ''} added successfully.`);
    }

    if (uploadResult.rejected.length > 0) {
      const rejectedByReason = uploadResult.rejected.reduce<Record<string, number>>((acc, rejection) => {
        acc[rejection.reason] = (acc[rejection.reason] ?? 0) + 1;
        return acc;
      }, {});

      const detail = Object.entries(rejectedByReason)
        .map(([reason, count]) => {
          if (reason === 'size') {
            return `${count} over the size limit`;
          }
          return `${count} with an unsupported type`;
        })
        .join(' and ');

      messages.push(`${uploadResult.rejected.length} file${uploadResult.rejected.length > 1 ? 's' : ''} rejected (${detail}).`);
    }

    return messages.join(' ');
  }, [uploadResult]);

  return (
    <div className="space-y-8 animate-[fade-in_0.6s_cubic-bezier(0.25,0.46,0.45,0.94)_forwards]">
      <div className="text-center mb-8">
        <H2 className="text-3xl font-bold text-[#FFD700] mb-2">Jurisdiction &amp; Evidence</H2>
        <p className="text-slate-400 max-w-lg mx-auto">
          Confirm your jurisdiction, optional case number, and attach evidence. When ready, generate
          the AI report before moving to review.
        </p>
      </div>

      <div className="max-w-4xl mx-auto space-y-8">
        <div className="space-y-4">
          <label
            htmlFor="jurisdiction-select"
            className="block text-sm font-semibold text-slate-300 mb-2"
          >
            Legal Jurisdiction <span className="text-amber-400">*</span>
          </label>
          <div className="relative">
            <select
              id="jurisdiction-select"
              value={jurisdiction}
              onChange={event => onJurisdictionChange(event.target.value)}
              className="w-full appearance-none bg-slate-800/50 border-2 border-slate-600 rounded-xl px-4 py-3 text-slate-200 transition-all duration-300 focus-visible:ring-4 focus-visible:ring-amber-300/60 focus-visible:border-amber-300 hover:border-amber-500"
            >
              <option value="">Select a jurisdiction...</option>
              {JURISDICTIONS.map(name => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-4">
          <label htmlFor="case-number-input" className="block text-sm font-semibold text-slate-300 mb-2">
            Case Number (Optional)
          </label>
          <div className="relative">
            <input
              type="text"
              id="case-number-input"
              value={caseNumber}
              onChange={event => onCaseNumberChange(event.target.value)}
              placeholder="e.g., F-12345-67"
              className="w-full p-3 bg-slate-800/50 border-2 rounded-xl transition-all duration-300 shadow-sm text-slate-200 border-slate-600 focus-visible:border-amber-300 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-amber-300/60 hover:border-amber-500"
            />
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-bold text-slate-100 mb-4">Evidence Locker</h3>
          <div className="bg-black/20 rounded-2xl p-6 border border-slate-700 shadow-xl shadow-amber-500/10 space-y-6">
            <div className="space-y-4">
              {evidence.length === 0 && (
                <p className="text-center text-slate-500 py-4">
                  No evidence uploaded yet. Drop files here to see the styling.
                </p>
              )}
              {evidence.map(renderEvidenceItem)}
            </div>

            <section className="mt-6 pt-6 border-t border-slate-700/50">
              <article className="rounded-2xl shadow-lg shadow-amber-500/10 transition-transform duration-300 ease-out hover:scale-105">
                <label
                  htmlFor="file-upload"
                  className="w-full p-6 border-2 border-dashed border-amber-500/60 text-amber-300 bg-amber-900/10 rounded-2xl shadow-inner shadow-amber-500/5 hover:bg-amber-900/20 active:bg-amber-900/30 transition-all duration-300 ease-out flex flex-col items-center justify-center font-semibold cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-300"
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
                    Images, PDFs, Audio, or Video (demo only)
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
              </article>
              {uploadFeedback && (
                <div
                  className="mt-3 rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-2 text-sm text-amber-100"
                  role="status"
                  aria-live="polite"
                >
                  {uploadFeedback}
                </div>
              )}
            </section>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 justify-end">
          {error && (
            <div
              className="w-full sm:w-auto rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200"
              role="status"
              aria-live="polite"
            >
              {error}
            </div>
          )}
          {isGenerating && (
            <div className="flex items-center gap-2 text-sm text-amber-200">
              <span className="h-2 w-2 rounded-full bg-amber-300 animate-pulse" />
              Generating report...
            </div>
          )}
          {(isGenerating || (!hasReport && error)) && (
            <Button
              variant="secondary"
              className="w-full sm:w-auto"
              onClick={onCancelGeneration}
              disabled={!isGenerating && !error}
            >
              {isGenerating ? 'Cancel' : 'Try again'}
            </Button>
          )}
          <Button
            className="w-full sm:w-auto"
            onClick={onGenerateReport}
            disabled={isGenerating}
          >
            {isGenerating ? 'Generating...' : 'Generate AI Report'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Step4Evidence;
