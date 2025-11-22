import { fireEvent, render, screen } from '@testing-library/react';
import React, { useState } from 'react';
import { describe, expect, it } from 'vitest';
import Step4Evidence from './Step4Evidence';
import type { EvidenceItem } from '../../types';
import { DEFAULT_MAX_FILE_SIZE_BYTES } from '../../hooks/useEvidenceList';

type StepWrapperProps = { initialEvidence?: EvidenceItem[] };

const StepWrapper: React.FC<StepWrapperProps> = ({ initialEvidence = [] }) => {
  const [evidence, setEvidence] = useState<EvidenceItem[]>(initialEvidence);
  const handleEvidenceChange = (items: EvidenceItem[]) => setEvidence(items);

  return (
    <Step4Evidence
      jurisdiction=""
      caseNumber=""
      evidence={evidence}
      onJurisdictionChange={() => null}
      onCaseNumberChange={() => null}
      onEvidenceChange={handleEvidenceChange}
      onGenerateReport={() => null}
      onCancelGeneration={() => null}
      isGenerating={false}
      hasReport={false}
    />
  );
};

const createFile = (name: string, size: number, type: string) => new File([new Uint8Array(size)], name, { type });

const setInputValue = (input: HTMLInputElement, value: string) => {
  Object.defineProperty(input, 'value', { writable: true, value });
};

describe('Step4Evidence file handling', () => {
  it('adds accepted files and shows success feedback', () => {
    render(<StepWrapper />);

    const fileInput = screen.getByLabelText(/click to upload or drag & drop/i) as HTMLInputElement;
    setInputValue(fileInput, 'placeholder');
    const file = createFile('image.png', 1024, 'image/png');

    fireEvent.change(fileInput, { target: { files: [file] } });

    expect(screen.getByText('image.png')).toBeInTheDocument();
    expect(screen.getByText(/1 file added successfully/i)).toBeInTheDocument();
    expect(fileInput.value).toBe('');
  });

  it('rejects unsupported file types and reports the issue', () => {
    render(<StepWrapper />);

    const fileInput = screen.getByLabelText(/click to upload or drag & drop/i) as HTMLInputElement;
    setInputValue(fileInput, 'placeholder');
    const file = createFile('notes.txt', 1024, 'text/plain');

    fireEvent.change(fileInput, { target: { files: [file] } });

    expect(screen.queryByText('notes.txt')).not.toBeInTheDocument();
    expect(screen.getByText(/unsupported type/i)).toBeInTheDocument();
    expect(fileInput.value).toBe('');
  });

  it('rejects files that exceed the size limit and keeps the input clear', () => {
    render(<StepWrapper />);

    const fileInput = screen.getByLabelText(/click to upload or drag & drop/i) as HTMLInputElement;
    setInputValue(fileInput, 'placeholder');
    const largeSize = DEFAULT_MAX_FILE_SIZE_BYTES + 1;
    const file = createFile('large.pdf', largeSize, 'application/pdf');

    fireEvent.change(fileInput, { target: { files: [file] } });

    expect(screen.queryByText('large.pdf')).not.toBeInTheDocument();
    expect(screen.getByText(/over the size limit/i)).toBeInTheDocument();
    expect(fileInput.value).toBe('');
  });
});
