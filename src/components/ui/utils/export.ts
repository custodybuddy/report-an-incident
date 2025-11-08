import { type IncidentData, type ReportData } from '@/types';
import { generateReportHTML } from '../../../services/reportFormatter';

export type ReportHelperSuccessType = 'success' | 'info';

export type ReportHelperResult =
  | { ok: true; title: string; message: string; modalType: ReportHelperSuccessType }
  | { ok: false; title: string; message: string; modalType: 'error' };

export const exportReportToHTML = (
  reportData: ReportData,
  incidentData: IncidentData,
): ReportHelperResult => {
  if (!reportData.title) {
    return {
      ok: false,
      title: 'Export Error',
      modalType: 'error',
      message: 'Report data is missing. Please generate the summary first.',
    };
  }

  const htmlContent = generateReportHTML(reportData, incidentData);

  const blob = new Blob([htmlContent], { type: 'text/html' });
  const url = URL.createObjectURL(blob);

  const newWindow = window.open(url, '_blank');
  if (newWindow) {
    window.setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 0);
    return {
      ok: true,
      title: 'Report Exported',
      modalType: 'success',
      message: `The report has been opened in a new tab. Use your browser's print function to save it as a PDF.`,
    };
  }

  URL.revokeObjectURL(url);
  return {
    ok: false,
    title: 'Export Blocked',
    modalType: 'error',
    message:
      'Your browser blocked the new window. Please allow pop-ups for this site and try again.',
  };
};

export const printReport = async (
  reportData: ReportData,
  incidentData: IncidentData,
): Promise<ReportHelperResult> => {
  if (!reportData.title) {
    return {
      ok: false,
      title: 'Print Error',
      modalType: 'error',
      message: 'Report data is missing. Please generate the summary first.',
    };
  }

  const htmlContent = generateReportHTML(reportData, incidentData);

  return await new Promise<ReportHelperResult>(resolve => {
    const iframe = document.createElement('iframe');
    iframe.style.position = 'absolute';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    iframe.style.visibility = 'hidden';
    document.body.appendChild(iframe);

    const cleanupTimeouts: Array<ReturnType<typeof window.setTimeout>> = [];

    const cleanup = () => {
      cleanupTimeouts.forEach(timeoutId => {
        window.clearTimeout(timeoutId);
      });

      if (iframe.parentElement) {
        iframe.parentElement.removeChild(iframe);
      }
    };

    const doc = iframe.contentWindow?.document;
    if (!doc) {
      cleanup();
      resolve({
        ok: false,
        title: 'Print Error',
        modalType: 'error',
        message: 'Could not create a document for printing.',
      });
      return;
    }

    doc.open();
    doc.write(htmlContent);
    doc.close();

    let resolved = false;
    const finish = (result: ReportHelperResult) => {
      if (!resolved) {
        resolved = true;
        resolve(result);
      }
    };

    const handlePrint = () => {
      try {
        if (iframe.contentWindow) {
          iframe.contentWindow.focus();
          iframe.contentWindow.print();
          finish({
            ok: true,
            title: 'Print Dialog Opened',
            modalType: 'info',
            message:
              "Your browser's print dialog should be open. You can save the report as a PDF from there.",
          });
        } else {
          cleanup();
          finish({
            ok: false,
            title: 'Print Error',
            modalType: 'error',
            message:
              'Could not open print dialog. Please try exporting as HTML and printing from there.',
          });
        }
      } catch (error) {
        cleanup();
        finish({
          ok: false,
          title: 'Print Error',
          modalType: 'error',
          message:
            'Could not open print dialog. Please try exporting as HTML and printing from there.',
        });
      }
    };

    if (doc.readyState === 'complete') {
      handlePrint();
    } else {
      iframe.onload = handlePrint;
    }

    if (iframe.contentWindow) {
      iframe.contentWindow.onafterprint = () => {
        cleanup();
      };
    }

    cleanupTimeouts.push(
      window.setTimeout(() => {
        cleanup();
      }, 5000),
    );
  });
};
