import React, { useEffect, useState } from 'react';
import H3 from '../../ui/H3';
import { LOADING_MESSAGES } from './constants';

const LoadingSpinner: React.FC = () => {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(
      () => setMessageIndex(prev => (prev + 1) % LOADING_MESSAGES.length),
      2500,
    );
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      role="status"
      aria-live="polite"
      className="flex min-h-[400px] flex-col items-center justify-center gap-6 p-10 text-center"
    >
      <svg
        aria-hidden="true"
        className="h-14 w-14 animate-spin text-[#FFD700]"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
      <div>
        <H3 className="heading-gold text-2xl font-normal">Generating AI analysis…</H3>
        <p className="mt-2 max-w-sm text-sm text-[#CFCBBF]/80">{LOADING_MESSAGES[messageIndex]}</p>
      </div>
    </div>
  );
};

export default LoadingSpinner;
