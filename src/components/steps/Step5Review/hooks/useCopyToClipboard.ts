import { useCallback, useState } from 'react';

export type CopyState = 'idle' | 'copied' | 'error';

interface UseCopyToClipboardOptions {
  getText: () => string;
  resetDelay?: number;
}

export const useCopyToClipboard = ({
  getText,
  resetDelay = 2000,
}: UseCopyToClipboardOptions) => {
  const [copyState, setCopyState] = useState<CopyState>('idle');

  const resetStatus = useCallback(() => {
    setTimeout(() => setCopyState('idle'), resetDelay);
  }, [resetDelay]);

  const fallbackCopy = useCallback((text: string) => {
    if (typeof document === 'undefined') {
      throw new Error('Document is not available');
    }

    const temp = document.createElement('textarea');
    temp.value = text;
    temp.setAttribute('readonly', '');
    temp.style.position = 'absolute';
    temp.style.left = '-9999px';
    document.body.appendChild(temp);
    temp.select();
    document.execCommand('copy');
    document.body.removeChild(temp);
  }, []);

  const handleCopy = useCallback(async () => {
    const text = getText().trim();

    if (!text) {
      setCopyState('error');
      resetStatus();
      return;
    }

    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        fallbackCopy(text);
      }
      setCopyState('copied');
    } catch {
      try {
        fallbackCopy(text);
        setCopyState('copied');
      } catch {
        setCopyState('error');
      }
    } finally {
      resetStatus();
    }
  }, [fallbackCopy, getText, resetStatus]);

  const buttonLabel =
    copyState === 'copied' ? '✓ Copied' : copyState === 'error' ? 'Copy failed' : 'Copy summary';

  return { copyState, handleCopy, buttonLabel };
};

export default useCopyToClipboard;
