import React, { memo } from 'react';
import Button from './ui/Button';

interface DraftRestoreBannerProps {
  onRestore: () => void;
  onDiscard: () => void;
}

const DraftRestoreBanner: React.FC<DraftRestoreBannerProps> = ({ onRestore, onDiscard }) => {
  return (
    <div
      className="mb-6 rounded-2xl border border-amber-400/40 bg-amber-400/10 text-amber-50 shadow-lg shadow-amber-900/30"
      role="alert"
      aria-live="polite"
    >
      <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <div className="flex gap-3 sm:items-center">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-400/20 text-amber-200">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 6v6l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </span>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-200">Draft available</p>
            <p className="text-base text-amber-50/90">
              We saved your report draft in this browser so it stays available even after closing the tab. Restore it or start
              a fresh report.
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Button variant="ghost" size="sm" onClick={onDiscard}>
            Start fresh
          </Button>
          <Button size="sm" onClick={onRestore}>
            Restore draft
          </Button>
        </div>
      </div>
    </div>
  );
};

export default memo(DraftRestoreBanner);
