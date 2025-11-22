interface ExportOptions {
  title?: string;
  targetWindow?: Window;
}

export interface ExportResult {
  success: boolean;
  error?: string;
}

const PDF_STYLES = `
  <style>
    body { font-family: 'Inter', system-ui, -apple-system, sans-serif; margin: 24px; color: #111827; background: #f8fafc; }
    h1, h2, h3, h4 { color: #111827; margin: 0 0 12px; }
    .section { border: 1px solid #cbd5e1; border-radius: 12px; padding: 16px; margin-bottom: 16px; background: #ffffff; }
    .title { font-size: 22px; font-weight: 700; margin-bottom: 12px; }
    .label { text-transform: uppercase; letter-spacing: 0.14em; font-size: 10px; color: #475569; }
    .text { font-size: 14px; color: #1f2937; line-height: 1.5; }
    a { color: #b45309; text-decoration: underline; }
    ul { margin: 8px 0; padding-left: 18px; }
    @media print { body { margin: 12px; } }
  </style>
`;

export const exportReportToPdf = (
  content: string | null | undefined,
  options: ExportOptions = {}
): ExportResult => {
  const target = options.targetWindow ?? (typeof window !== 'undefined' ? window : undefined);

  if (!target) {
    return { success: false, error: 'Export is unavailable in this environment.' };
  }

  if (!content || !content.trim()) {
    return { success: false, error: 'No report content is available to export.' };
  }

  const printWindow = target.open('', '_blank', 'noopener,noreferrer,width=900,height=1200');
  if (!printWindow) {
    return { success: false, error: 'Pop-up blocked. Please allow pop-ups to export the PDF.' };
  }

  try {
    printWindow.document.write(
      `<!doctype html><html><head><title>${options.title ?? 'Incident Report'}</title>${PDF_STYLES}</head><body>${content}</body></html>`
    );
    printWindow.document.close();
    printWindow.onload = () => {
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    };
    return { success: true };
  } catch (error) {
    printWindow.close();
    return { success: false, error: error instanceof Error ? error.message : 'Unable to export report as PDF.' };
  }
};
