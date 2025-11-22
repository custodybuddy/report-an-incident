import { describe, expect, it, vi } from 'vitest';
import { exportReportToPdf } from '../pdfExport';

describe('exportReportToPdf', () => {
  it('returns an error when content is missing', () => {
    const result = exportReportToPdf('', { targetWindow: window });
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/No report content/);
  });

  it('returns an error when pop-ups are blocked', () => {
    const mockWindow = {
      ...window,
      open: vi.fn(() => null),
    } as unknown as Window;

    const result = exportReportToPdf('<div>content</div>', { targetWindow: mockWindow });
    expect(mockWindow.open).toHaveBeenCalled();
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/Pop-up blocked/);
  });
});
