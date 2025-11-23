import React, { useCallback } from 'react';
import { type IncidentData, type IncidentDataUpdater } from '@/types';
import useSpeechToText from '@/hooks/useSpeechToText';
import { useOpenAiSummary } from '@/hooks/useOpenAiSummary';
import H1 from '../ui/H1';
import Button from '../ui/Button';

interface Step2Props {
  data: Pick<IncidentData, 'narrative'>;
  updateData: IncidentDataUpdater;
  errors: { narrative?: string };
}

const Step2Narrative: React.FC<Step2Props> = ({ data, updateData, errors }) => {
  const charCount = data.narrative.length;
  const isMinLengthMet = charCount >= 20;
  const narrativeError = errors.narrative;

  const handleDictationAppend = useCallback(
    (transcript: string) => {
      const cleaned = transcript.replace(/\s+/g, ' ').trim();
      if (!cleaned) {
        return;
      }

      updateData('narrative', (prevState) => {
        const current = prevState.narrative;
        const needsSpace = current && !current.endsWith(' ');
        return `${current}${needsSpace ? ' ' : ''}${cleaned}`;
      });
    },
    [updateData]
  );

  const {
    isSupported,
    isListening,
    interimTranscript,
    error: speechError,
    startListening,
    stopListening,
  } = useSpeechToText({ onFinalTranscript: handleDictationAppend });
  const {
    summary,
    error: aiError,
    isLoading,
    isAvailable,
    runSummary,
  } = useOpenAiSummary();

  const handleMicToggle = () => {
    if (!isSupported) {
      return;
    }

    if (isListening) {
      stopListening();
      return;
    }
    startListening();
  };

  const voiceStatus = !isSupported
    ? 'Speech recognition is not supported in this browser.'
    : isListening
      ? 'Listening… speak naturally and pause briefly for punctuation.'
      : 'Tap start and dictate your narrative hands-free.';

  return (
    <div className="space-y-8 animate-[fade-in_0.6s_cubic-bezier(0.25,0.46,0.45,0.94)_forwards]">
      <div className="text-center mb-8">
        <H1 className="text-3xl sm:text-4xl font-bold text-[#FFD700] mb-2">The Incident Narrative</H1>
        <p className="text-slate-400 max-w-md mx-auto">Describe the incident objectively. Our AI will filter out emotional language for the professional report.</p>
      </div>
      <div className="max-w-4xl mx-auto">
        <label htmlFor="narrative-input" className="block text-sm font-semibold text-slate-300 mb-3">Incident Description (Min 20 characters) <span className="text-amber-400">*</span></label>
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
            {charCount} / 20 characters
          </div>
        </div>
        {narrativeError && <p id="narrative-error" className="text-red-400 text-xs mt-1">{narrativeError}</p>}

        <div className="mt-4 p-4 rounded-xl border border-slate-700 bg-slate-900/40 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-slate-200">Voice dictation</p>
              <p className="text-xs text-slate-400">{voiceStatus}</p>
            </div>
            <button
              type="button"
              onClick={handleMicToggle}
              disabled={!isSupported}
              aria-pressed={isListening}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border transition-colors text-sm font-semibold shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-amber-400 focus-visible:ring-offset-slate-900 ${
                !isSupported
                  ? 'border-slate-700 text-slate-500 cursor-not-allowed'
                  : isListening
                    ? 'bg-red-500/20 border-red-400 text-red-200'
                    : 'bg-amber-500/20 border-amber-400 text-amber-100 hover:bg-amber-500/30'
              }`}
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
                {isListening ? (
                  <path d="M12 1v10" />
                ) : (
                  <path d="M9 5a3 3 0 1 1 6 0v6a3 3 0 1 1-6 0Z" />
                )}
                <path d="M5 10a7 7 0 0 0 14 0" />
                <path d="M12 19v4" />
                <path d="M8 23h8" />
              </svg>
              {isListening ? 'Stop dictation' : 'Start dictation'}
            </button>
          </div>

          {interimTranscript && (
            <p className="text-sm text-amber-100 bg-slate-800/60 border border-slate-700 rounded-lg p-3">
              <span className="font-semibold text-amber-300">Interim:</span> {interimTranscript}
            </p>
          )}

          {speechError && <p className="text-xs text-red-400">{speechError}</p>}
        </div>

        <div className="mt-4 p-4 rounded-xl border border-slate-700 bg-slate-900/40 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-slate-200">OpenAI quick summary</p>
              <p className="text-xs text-slate-400">
                {isAvailable
                  ? 'Generate a concise, objective summary to reuse later.'
                  : 'Add VITE_OPENAI_API_KEY to enable OpenAI-powered summaries.'}
              </p>
            </div>
            <Button
              onClick={() => {
                void runSummary(data.narrative);
              }}
              disabled={!isAvailable || isLoading || !isMinLengthMet}
              variant="secondary"
              className="whitespace-nowrap"
            >
              {isLoading ? 'Summarizing…' : 'Summarize with OpenAI'}
            </Button>
          </div>
          {aiError && <p className="text-xs text-red-400">{aiError}</p>}
          {summary && (
            <div className="bg-black/40 border border-slate-700 rounded-lg p-3 text-sm text-slate-200">
              <p className="text-amber-300 font-semibold mb-1">Summary</p>
              <p className="leading-relaxed">{summary}</p>
            </div>
          )}
        </div>

        <div className="mt-3 flex items-start text-sm text-slate-400 p-3 bg-black/30 rounded-lg border border-slate-700">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 mt-1 mr-2 flex-shrink-0 text-amber-400"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          <span><strong>Focus on facts.</strong> The more detail, the better. State what you saw or heard, not how you felt about it.</span>
        </div>
      </div>
    </div>
  );
};

export default Step2Narrative;
