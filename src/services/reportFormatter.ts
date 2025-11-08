import { type IncidentData, type ReportData } from '@/types';

const formatSectionContent = (text: string | undefined | null) => {
  if (!text) return '<p>N/A</p>';
  // First, handle markdown links and bolding
  let html = text
    .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

  // Then, split by newline, filter empty lines, and wrap in <p> tags
  return html
    .split('\n')
    .filter(paragraph => paragraph.trim() !== '')
    .map(paragraph => `<p>${paragraph}</p>`)
    .join('');
};

const sourcesList = (sources: string[] | undefined) =>
  (sources && sources.length > 0 ? sources : []).map(
    source =>
      `<li><a href="${source}" target="_blank" rel="noopener noreferrer">${source}</a></li>`,
  ).join('');

const buildEvidenceSection = (incidentData: IncidentData) => {
  if (incidentData.evidence.length === 0) {
    return "<div class=\"section-content\"><p>No evidence was logged with this report.</p></div>";
  }

  return incidentData.evidence
    .map(
      evidence => `
        <div class="evidence-item">
            <div class="evidence-header">
                <strong>File:</strong> ${evidence.name}
            </div>
            <div class="evidence-details">
                <p><strong>Category:</strong> ${evidence.category}</p>
                <p><strong>Description:</strong> ${evidence.description || 'No description provided.'}</p>
                ${
                  evidence.aiAnalysis
                    ? `<p class="ai-analysis"><strong>AI Analysis:</strong> <span>${evidence.aiAnalysis}</span></p>`
                    : ''
                }
            </div>
        </div>
    `,
    )
    .join('');
};

export const generateReportHTML = (reportData: ReportData, incidentData: IncidentData): string => {
  const evidenceItems = buildEvidenceSection(incidentData);

  const evidenceSection = `
        <h2 class="print-page-break">Evidence Log</h2>
        <article class="section evidence-log">${evidenceItems}</article>
    `;

  const generatedAt = new Date();

  const sources = sourcesList(reportData.sources);

  return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Incident Report: ${reportData.title || 'Report'}</title>
            <style>
                body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px; background-color: #f8f8f8; }
                .report-container { max-width: 800px; margin: 0 auto; background-color: white; padding: 30px; border: 1px solid #ddd; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
                h1 { color: #004d40; border-bottom: 3px solid #004d40; padding-bottom: 10px; margin-bottom: 20px; font-size: 24px; }
                h2 { color: #00796b; border-left: 5px solid #00796b; padding-left: 10px; margin-top: 30px; margin-bottom: 15px; font-size: 18px; }
                .section { margin-bottom: 20px; padding: 15px; border: 1px solid #e0e0e0; border-radius: 4px; background-color: #f9f9f9; }
                .section-content { color: #555; font-size: 14px; }
                .section p { color: #555; font-size: 14px; margin: 0 0 1em 0; }
                .section p:last-child { margin-bottom: 0; }
                .section a { color: #004d40; text-decoration: underline; font-weight: bold; }
                .section a:hover { color: #00796b; }
                .meta-data { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin-bottom: 20px; }
                .meta-item strong { display: block; color: #00796b; margin-bottom: 5px; font-size: 14px; }
                .meta-item span { font-size: 14px; color: #555; }
                .ai-notes { background-color: #fffbe6; border-color: #facc15; }
                .ai-notes .section-content { color: #713f12; }
                ul { list-style: disc; margin-left: 20px; padding-left: 0; font-size: 14px; color: #555; }
                .evidence-log { display: flex; flex-direction: column; gap: 15px; }
                .evidence-item { border: 1px solid #e0e0e0; border-radius: 4px; background-color: #ffffff; }
                .evidence-header { background-color: #f0f0f0; padding: 8px 12px; border-bottom: 1px solid #e0e0e0; font-size: 14px; }
                .evidence-details { padding: 12px; font-size: 13px; color: #555; }
                .evidence-details p { margin: 0 0 5px 0; }
                .evidence-details p strong { color: #333; }
                .ai-analysis { margin-top: 8px; padding-top: 8px; border-top: 1px dashed #e0e0e0; font-size: 12px; }
                .ai-analysis strong { color: #00796b; }
                .ai-analysis span { color: #555; font-style: italic; }
                .resource-list { display: flex; flex-direction: column; gap: 15px; }
                .resource-item { border: 1px solid #e0e0e0; border-radius: 4px; background-color: #ffffff; padding: 12px; }
                .resource-item a { font-weight: bold; color: #004d40; text-decoration: none; font-size: 14px; }
                .resource-item a:hover { text-decoration: underline; }
                .resource-item p { margin: 5px 0 0 0; font-size: 13px; color: #555; }

                @media print {
                    body { background-color: white; padding: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                    .report-container { box-shadow: none; border: none; width: 100%; padding: 0; }
                    .no-print { display: none; }
                    .print-page-break { page-break-before: always; margin-top: 40px; }
                    .section { page-break-inside: avoid; background-color: #f9f9f9 !important; }
                    article[style*="background-color: #e0f2f1"] { background-color: #e0f2f1 !important; }
                    .ai-notes { background-color: #fffbe6 !important; }
                    h1, h2 { page-break-after: avoid; }
                }
            </style>
        </head>
        <body>
            <div class="report-container">
                <h1>Incident Report: ${reportData.title || 'N/A'}</h1>
                <p class="no-print" style="font-size: 12px; color: #777;"><strong>Generated By:</strong> AI Co-Parenting Reporter Tool | <strong>Date:</strong> ${generatedAt.toLocaleDateString()} ${generatedAt.toLocaleTimeString()}</p>

                <div class="meta-data">
                    <div class="meta-item"><strong>Category</strong> <span>${reportData.category || 'N/A'}</span></div>
                    <div class="meta-item"><strong>Assigned Severity</strong> <span>${reportData.severity || 'N/A'}</span></div>
                    <div class="meta-item"><strong>Jurisdiction</strong> <span>${incidentData.jurisdiction || 'N/A'}</span></div>
                    <div class="meta-item"><strong>Case Number</strong> <span>${reportData.caseNumber || 'N/A'}</span></div>
                </div>

                <h2>Severity Justification</h2>
                <article class="section">${formatSectionContent(reportData.severityJustification)}</article>

                <h2 class="print-page-break">Professional Summary</h2>
                <article class="section">${formatSectionContent(reportData.professionalSummary)}</article>

                ${evidenceSection}

                <h2 class="print-page-break">Legal Insights & Considerations</h2>
                <article class="section">${formatSectionContent(reportData.legalInsights)}</article>

                <h2>Potential Legal & Informational Sources</h2>
                <article class="section"><ul>${sources || '<li>None provided</li>'}</ul></article>

                <div style="margin-top: 50px; text-align: center; color: #aaa; font-size: 10px; border-top: 1px dashed #ddd; padding-top: 10px;">
                    This document was generated for informational and legal preparation purposes. Review by legal counsel is strongly advised.
                </div>
            </div>
        </body>
        </html>
    `;
};

export type { ReportData, IncidentData };
