import { useState } from 'react';

interface UseSpeechToTextOptions {
  onFinalTranscript?: (value: string) => void;
}

// Minimal placeholder hook that keeps the UI responsive without wiring up the Web Speech API.
const useSpeechToText = (_options: UseSpeechToTextOptions = {}) => {
  const [isListening, setIsListening] = useState(false);
  const [interimTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);

  // We intentionally keep this demo-only hook disabled to avoid browser-specific speech setup.
  const isSupported = false;

  const startListening = () => {
    if (!isSupported) {
      setError('Speech recognition is not available in this stripped-down build.');
      return;
    }
    setIsListening(true);
    setError(null);
  };

  const stopListening = () => {
    setIsListening(false);
  };

  return {
    isSupported,
    isListening,
    interimTranscript,
    error,
    startListening,
    stopListening,
  };
};

export default useSpeechToText;
