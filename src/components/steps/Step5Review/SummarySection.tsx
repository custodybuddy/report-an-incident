import React from 'react';
import H3 from '../../ui/H3';
import OutlineCard from './OutlineCard';
import { createHtml } from './helpers';

export type CopyState = 'idle' | 'copied' | 'error';

interface SummarySectionProps {
  summaryHtml: string;
  summaryRef: React.RefObject<HTMLDivElement>;
  copyState: CopyState;
  onCopySummary: () => void;
}

const SummarySection: React.FC<SummarySectionProps> = ({
  summaryHtml,
  summaryRef,
  copyState,
  onCopySummary,
}) => {
  const summaryButtonLabel =
    copyState === 'copied' ? '✓ Copied' : copyState === 'error' ? 'Copy failed' : 'Copy summary';

  const copyButtonClassName =
    copyState === 'copied'
      ? 'bg-[#3AD79B] text-[#011626]'
      : copyState === 'error'
        ? 'bg-red-500 text-white'
        : 'bg-[#FFD700] text-[#011626] hover:bg-[#F4E883]';

  return (
    <OutlineCard>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-[#F4E883]">Professional Summary</p>
          <H3 className="heading-gold text-2xl font-normal tracking-tight">Review The Narrative</H3>
        </div>
        <button
          type="button"
          onClick={onCopySummary}
          className={`rounded-full px-4 py-2 text-sm font-semibold transition focus-visible:outline-[#F4E883] focus-visible:outline-offset-2 ${copyButtonClassName}`}
        >
          {summaryButtonLabel}
        </button>
      </div>
      <div
        ref={summaryRef}
        className="prose prose-invert prose-base mt-6 max-w-none space-y-4 text-[#CFCBBF]"
        dangerouslySetInnerHTML={createHtml(summaryHtml, 'Summary has not been generated yet.')}
      />
    </OutlineCard>
  );
};

export default SummarySection;
