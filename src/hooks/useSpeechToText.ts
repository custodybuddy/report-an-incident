import { useCallback, useEffect, useRef, useState } from 'react';

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionResult extends Array<SpeechRecognitionAlternative> {
  isFinal: boolean;
}

type SpeechRecognitionResultList = SpeechRecognitionResult[];

interface SpeechRecognitionEvent {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent {
  error: string;
  message?: string;
}

interface SpeechRecognitionInstance {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
}

type SpeechRecognitionConstructor = new () => SpeechRecognitionInstance;

interface SpeechRecognitionWindow extends Window {
  SpeechRecognition?: SpeechRecognitionConstructor;
  webkitSpeechRecognition?: SpeechRecognitionConstructor;
}

interface UseSpeechToTextOptions {
  lang?: string;
  onFinalTranscript?: (text: string) => void;
}

interface UseSpeechToTextResult {
  isSupported: boolean;
  isListening: boolean;
  interimTranscript: string;
  error: string | null;
  startListening: () => void;
  stopListening: () => void;
}

const getSpeechRecognition = (): SpeechRecognitionConstructor | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  const speechWindow = window as SpeechRecognitionWindow;
  return speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition ?? null;
};

export const useSpeechToText = (options?: UseSpeechToTextOptions): UseSpeechToTextResult => {
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const shouldRestartRef = useRef(false);
  const finalTranscriptCallbackRef = useRef<UseSpeechToTextOptions['onFinalTranscript']>();

  const [isSupported, setIsSupported] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);

  finalTranscriptCallbackRef.current = options?.onFinalTranscript;

  useEffect(() => {
    const SpeechRecognition = getSpeechRecognition();

    if (!SpeechRecognition) {
      setIsSupported(false);
      return undefined;
    }

    setIsSupported(true);
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = options?.lang ?? 'en-US';

    recognition.onresult = (event) => {
      let interim = '';
      let finalChunk = '';

      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const result = event.results[i];
        const transcript = result[0]?.transcript ?? '';

        if (result.isFinal) {
          finalChunk += transcript;
        } else {
          interim += transcript;
        }
      }

      setInterimTranscript(interim.trim());

      const cleanedFinal = finalChunk.trim();
      if (cleanedFinal && finalTranscriptCallbackRef.current) {
        finalTranscriptCallbackRef.current(cleanedFinal);
      }
    };

    recognition.onerror = (event) => {
      setError(event.message ?? event.error);
      shouldRestartRef.current = false;
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
      setInterimTranscript('');
      if (shouldRestartRef.current) {
        try {
          recognition.start();
          setIsListening(true);
        } catch (err) {
          setError((err as Error).message);
          shouldRestartRef.current = false;
        }
      }
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.onresult = null;
      recognition.onerror = null;
      recognition.onend = null;
      recognition.stop();
      recognitionRef.current = null;
      shouldRestartRef.current = false;
    };
  }, [options?.lang]);

  const startListening = useCallback(() => {
    if (!isSupported || !recognitionRef.current) {
      return;
    }

    try {
      setError(null);
      setInterimTranscript('');
      shouldRestartRef.current = true;
      recognitionRef.current.start();
      setIsListening(true);
    } catch (err) {
      setError((err as Error).message);
      shouldRestartRef.current = false;
    }
  }, [isSupported]);

  const stopListening = useCallback(() => {
    if (!recognitionRef.current) {
      return;
    }

    shouldRestartRef.current = false;
    recognitionRef.current.stop();
    setIsListening(false);
    setInterimTranscript('');
  }, []);

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
