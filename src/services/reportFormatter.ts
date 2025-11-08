import { type IncidentData, type ReportData } from '@/types';
import { AI_INSIGHT_LABEL } from '@/constants';
import { formatSectionContent } from './utils/markdownParser';
import {
  compileLegalReferences,
  deriveReadableTitle,
  getDomainFromUrl,
} from '@/services/reportReferences';

type SeverityTheme = {
  background: string;
  border: string;
  shadow: string;
  labelColor: string;
  valueColor: string;
};

const severityThemes: Record<string, SeverityTheme> = {
  high: {
    background: 'linear-gradient(160deg,#2C0F12 0%,#401519 100%)',
    border: 'rgba(255,179,179,0.6)',
    shadow: '0 20px 45px rgba(255,59,59,0.25)',
    labelColor: '#FFD700',
    valueColor: '#FFD7A3',
  },
  medium: {
    background: 'linear-gradient(160deg,#2A1A04 0%,#3a2a0d 100%)',
    border: 'rgba(244,232,131,0.6)',
    shadow: '0 20px 40px rgba(244,232,131,0.2)',
    labelColor: '#FFD700',
    valueColor: '#F4E883',
  },
  low: {
    background: 'linear-gradient(160deg,#0a2a1f 0%,#123f2f 100%)',
    border: 'rgba(111,224,177,0.5)',
    shadow: '0 20px 40px rgba(0,128,96,0.25)',
    labelColor: '#CFEFDA',
    valueColor: '#CFEFDA',
  },
  default: {
    background: 'linear-gradient(160deg,#01192C 0%,#082d4b 100%)',
    border: 'rgba(244,232,131,0.6)',
    shadow: '0 20px 45px rgba(0,0,0,0.35)',
    labelColor: '#FFD700',
    valueColor: '#FFD700',
  },
};

const escapeHtml = (value: string | null | undefined): string => {
  if (!value) return '';
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
};

const renderStatCard = (label: string, value: string): string => `
  <div class="stat-card">
    <p class="label">${escapeHtml(label)}</p>
    <p class="value">${escapeHtml(value)}</p>
  </div>
`;

const renderSeverityCard = (severity: string, theme: SeverityTheme): string => `
  <div
    class="stat-card"
    style="background:${theme.background};border-color:${theme.border};box-shadow:${theme.shadow};"
  >
    <p class="label" style="color:${theme.labelColor};">Severity</p>
    <p class="value" style="color:${theme.valueColor};">${escapeHtml(severity)}</p>
  </div>
`;

const formatEvidenceMeta = (size: number, category: string) => {
  const formattedSize = Number.isFinite(size) && size > 0 ? `${(size / 1024).toFixed(1)} kB` : 'Unknown size';
  return `${formattedSize} · ${category || 'Uncategorized'}`;
};

const renderEvidenceItems = (incidentData: IncidentData): string => {
  if (incidentData.evidence.length === 0) {
    return '<p class="muted">No supporting evidence was uploaded.</p>';
  }

  const items = incidentData.evidence
    .map((item, index) => {
      const position = String(index + 1).padStart(3, '0');
      const description = item.description ? escapeHtml(item.description) : 'Not documented';
      const type = item.type ? escapeHtml(item.type) : 'Not provided';
      const meta = escapeHtml(formatEvidenceMeta(item.size, item.category));
      const analysis =
        item.aiAnalysis
          ? `<p class="analysis"><strong>${escapeHtml(AI_INSIGHT_LABEL)}</strong> ${escapeHtml(item.aiAnalysis)}</p>`
          : '';

      return `
        <article class="evidence-card">
          <header>
            <p class="name">EVIDENCE ${position}: ${escapeHtml(item.name)}</p>
            <span class="meta">${meta}</span>
          </header>
          <dl>
            <div>
              <dt>Type</dt>
              <dd>${type}</dd>
            </div>
            <div>
              <dt>Description</dt>
              <dd>${description}</dd>
            </div>
          </dl>
          ${analysis}
        </article>
      `;
    })
    .join('');

  return `
    <div class="evidence-items">
      ${items}
      <article class="evidence-reminder">
        <strong>Reminder:</strong> Keep digital and physical copies of all evidence securely stored with timestamps for counsel or court staff.
      </article>
    </div>
  `;
};

const formatIndex = (index: number) => String(index + 1).padStart(2, '0');

const renderLegalReferenceCard = (
  label: string,
  url: string,
  description: string,
  index: number,
  metadata?: string,
): string => `
  <article class="resource-card">
    <h4>${formatIndex(index)}. ${escapeHtml(label)}</h4>
    ${metadata ? `<p class="metadata">${escapeHtml(metadata)}</p>` : ''}
    <p>${escapeHtml(description)}</p>
    <p><a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">Open reference</a></p>
  </article>
`;

const renderStatuteSection = (
  statuteReferences: ReturnType<typeof compileLegalReferences>['statuteReferences'],
): string => {
  if (statuteReferences.length === 0) {
    return '<p class="muted">The AI summary did not cite specific statutes for this incident.</p>';
  }

  return `
    <div class="resource-list">
      ${statuteReferences
        .map((ref, index) =>
          renderLegalReferenceCard(
            ref.label || deriveReadableTitle(ref.url),
            ref.url,
            ref.context || 'Reference this authority when documenting how the incident aligns with statutory requirements.',
            index,
          ),
        )
        .join('')}
    </div>
  `;
};

const renderCaseLawSection = (
  caseLawReferences: ReturnType<typeof compileLegalReferences>['caseLawReferences'],
): string => {
  if (caseLawReferences.length === 0) {
    return '';
  }

  return `
    <section>
      <h3>V. High-Precedent Case Law (Judicial Interpretation)</h3>
      <div class="resource-list">
        ${caseLawReferences
          .map((ref, index) =>
            renderLegalReferenceCard(
              ref.label || deriveReadableTitle(ref.url),
              ref.url,
              ref.context || 'Review this case to understand how courts weigh similar fact patterns.',
              index,
              `Jurisdiction: ${getDomainFromUrl(ref.url)}`,
            ),
          )
          .join('')}
      </div>
    </section>
  `;
};

const renderPotentialSources = (potentialSources: string[]): string => {
  if (potentialSources.length === 0) {
    return '<p class="muted">No supplemental research links were attached for this report.</p>';
  }

  return `
    <div class="resource-list">
      ${potentialSources
        .map((url, index) =>
          renderLegalReferenceCard(
            deriveReadableTitle(url),
            url,
            url,
            index,
            getDomainFromUrl(url),
          ),
        )
        .join('')}
    </div>
  `;
};

const renderGlossary = (): string => `
  <div class="glossary">
    <article class="resource-card">
      <h4>Document Preservation</h4>
      <p>Keep certified copies of every exhibit (screenshots, emails, call logs) with timestamps for court submission.</p>
    </article>
    <article class="resource-card">
      <h4>Best Interests Analysis</h4>
      <p>Courts prioritize child safety, stability, and continuity of care when reviewing co-parenting disputes.</p>
    </article>
  </div>
`;

const STYLES = `
:root { color-scheme: dark; font-family: 'Inter', 'Segoe UI', system-ui, sans-serif; }
* { box-sizing: border-box; }
body { margin: 0; background: #010b18; color: #CFCBBF; line-height: 1.6; font-family: 'Inter', 'Segoe UI', system-ui, sans-serif; padding: 40px 0; }
a { color: inherit; }
main.report-app { max-width: 960px; margin: 0 auto; padding: 0 32px 48px; display: flex; flex-direction: column; gap: 32px; }
.card { border-radius: 24px; border: 1px solid rgba(244,232,131,0.25); background: linear-gradient(145deg, rgba(1,18,35,0.95), rgba(1,25,44,0.88)); padding: 28px; box-shadow: 0 20px 55px rgba(0,0,0,0.45); }
.intro-card { background: linear-gradient(160deg, rgba(2,18,35,0.92), rgba(9,26,43,0.85)); border: 1px solid rgba(244,232,131,0.35); }
.eyebrow { margin: 0; text-transform: uppercase; letter-spacing: 0.3em; font-size: 0.75rem; color: #F4E883; font-weight: 600; }
.title { margin: 12px 0 0; font-size: 2.4rem; line-height: 1.15; color: #F4E883; font-weight: 500; }
.meta { margin-top: 0.75rem; font-size: 0.95rem; color: rgba(207,203,191,0.85); }
.stats-grid { display: grid; gap: 18px; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); }
.stat-card { border-radius: 20px; padding: 20px; border: 1px solid rgba(244,232,131,0.35); background: rgba(2,18,35,0.85); box-shadow: 0 16px 40px rgba(0,0,0,0.4); }
.stat-card .label { margin: 0; font-size: 0.7rem; letter-spacing: 0.3em; text-transform: uppercase; color: rgba(244,232,131,0.75); font-weight: 600; }
.stat-card .value { margin: 10px 0 0; font-size: 1.15rem; font-weight: 600; color: #FDF5C5; }
.summary-layout { display: grid; gap: 24px; grid-template-columns: minmax(0, 2fr) minmax(0, 1fr); }
@media (max-width: 900px) { .summary-layout { grid-template-columns: minmax(0, 1fr); } }
.section-heading { display: flex; flex-direction: column; gap: 4px; border-bottom: 1px solid rgba(244,232,131,0.25); padding-bottom: 12px; }
.section-heading h2, .section-heading h3 { margin: 0; font-size: 1.6rem; color: #F4E883; font-weight: 500; }
.section-heading .caption { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.25em; color: rgba(244,232,131,0.8); }
.prose { margin-top: 18px; font-size: 0.95rem; color: #CFCBBF; }
.prose p { margin: 0 0 1rem 0; color: inherit; }
.prose p:last-child { margin-bottom: 0; }
.muted { color: rgba(207,203,191,0.65); font-style: italic; }
.badge { display: inline-flex; align-items: center; border-radius: 999px; background: rgba(1,25,44,0.85); border: 1px solid rgba(244,232,131,0.35); padding: 4px 12px; font-size: 0.75rem; color: rgba(244,232,131,0.9); font-weight: 600; }
.evidence-section .eyebrow { color: #F4E883; }
.evidence-section .evidence-count { color: rgba(207,203,191,0.85); font-size: 0.9rem; }
.evidence-items { margin-top: 20px; display: flex; flex-direction: column; gap: 16px; }
.evidence-card { border-radius: 20px; border: 1px solid rgba(244,232,131,0.3); background: rgba(2,18,35,0.9); padding: 18px; box-shadow: 0 12px 30px rgba(0,0,0,0.45); font-size: 0.9rem; }
.evidence-card header { display: flex; flex-wrap: wrap; justify-content: space-between; gap: 8px; border-bottom: 1px solid rgba(244,232,131,0.25); padding-bottom: 10px; margin-bottom: 12px; }
.evidence-card header .name { font-weight: 600; color: #FFD700; letter-spacing: 0.15em; font-size: 0.85rem; }
.evidence-card header .meta { font-size: 0.75rem; color: rgba(207,203,191,0.7); }
.evidence-card dl { display: grid; gap: 12px; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); margin: 0; }
.evidence-card dt { font-size: 0.65rem; letter-spacing: 0.3em; text-transform: uppercase; color: rgba(244,232,131,0.7); }
.evidence-card dd { margin: 6px 0 0; color: #CFCBBF; font-size: 0.85rem; }
.evidence-card .analysis { margin-top: 12px; border-radius: 18px; border: 1px solid rgba(244,232,131,0.3); background: rgba(7,27,42,0.9); padding: 12px; font-size: 0.85rem; color: #CFCBBF; }
.evidence-reminder { border-radius: 18px; border: 1px dashed rgba(244,232,131,0.4); padding: 16px; font-size: 0.85rem; color: rgba(207,203,191,0.85); background: rgba(2,18,35,0.75); }
.section-title { font-size: 2rem; color: #F4E883; border-left: 4px solid #F4E883; padding-left: 16px; margin: 0; font-weight: 500; }
.legal-card { border-radius: 24px; border: 1px solid rgba(244,232,131,0.3); background: rgba(2,18,35,0.92); padding: 24px; display: flex; flex-direction: column; gap: 24px; box-shadow: 0 20px 45px rgba(0,0,0,0.5); }
.legal-card section { display: flex; flex-direction: column; gap: 12px; }
.legal-card h3 { margin: 0; font-size: 1.3rem; color: #F4E883; font-weight: 500; border-bottom: 1px solid rgba(244,232,131,0.25); padding-bottom: 8px; }
.legal-card p.note { font-size: 0.75rem; color: rgba(244,232,131,0.7); letter-spacing: 0.1em; text-transform: uppercase; margin: 0; }
.resource-list { display: flex; flex-direction: column; gap: 16px; }
.resource-card { border-radius: 18px; border: 1px solid rgba(244,232,131,0.3); padding: 18px; background: rgba(2,18,35,0.85); box-shadow: 0 10px 30px rgba(0,0,0,0.4); }
.resource-card h4 { margin: 0; font-size: 1rem; color: #FFD700; font-weight: 600; }
.resource-card .metadata { font-size: 0.75rem; color: rgba(207,203,191,0.65); margin-top: 4px; }
.resource-card p { margin: 8px 0 0; color: #CFCBBF; font-size: 0.9rem; }
.resource-card a { color: #F4E883; font-weight: 600; text-decoration: none; }
.resource-card a:hover { text-decoration: underline; }
.glossary { display: grid; gap: 16px; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); }
.footer { text-align: center; font-size: 0.75rem; color: rgba(207,203,191,0.6); border-top: 1px dashed rgba(244,232,131,0.35); padding-top: 12px; margin-top: 32px; }
.page-break { page-break-before: always; margin-top: 40px; }
@media print { body { background: #fff; color: #1a1a1a; padding: 0; } main.report-app { padding: 0 20px 20px; gap: 24px; } .card, .stat-card, .resource-card, .evidence-card { box-shadow: none; background: #fff; color: #1a1a1a; border-color: #d6d6d6; } .intro-card { background: #fff; } .title { color: #111; } .eyebrow { color: #333; } .meta, .muted { color: #444; } .badge { border-color: #555; background: transparent; color: #333; } .resource-card h4, .section-heading h2, .section-heading h3, .legal-card h3 { color: #111; } .legal-card { background: #fff; } .page-break { page-break-before: always; } }

/* Markdown utility classes */
.mb-4 { margin-bottom: 1rem; }
.mb-4:last-child { margin-bottom: 0; }
.last\:mb-0:last-child { margin-bottom: 0; }
.text-slate-500 { color: #64748b; }
.text-amber-400 { color: #fbbf24; }
.hover\:underline:hover { text-decoration: underline; }
.inline-flex { display: inline-flex; }
.items-center { align-items: center; }
.inline-block { display: inline-block; }
.w-3 { width: 0.75rem; }
.h-3 { height: 0.75rem; }
.ml-1 { margin-left: 0.25rem; }
.opacity-80 { opacity: 0.8; }
.sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border: 0; }
`;

const renderIntroCard = (reportData: ReportData, generatedAt: string): string => `
  <section class="card intro-card">
    <p class="eyebrow">AI-Generated Report</p>
    <h1 class="title">Incident Report: ${escapeHtml(reportData.title || 'Pending Title')}</h1>
    <p class="meta">Prepared by CustodyBuddy Incident Reporter • ${escapeHtml(generatedAt)}</p>
  </section>
`;

const renderSummarySection = (
  reportData: ReportData,
  summaryHtml: string,
  severityJustificationHtml: string,
  theme: SeverityTheme,
): string => `
  <section class="summary-layout">
    <article class="card">
      <div class="section-heading">
        <span class="caption">Professional Summary</span>
        <h2>Review The Narrative</h2>
      </div>
      <div class="prose">${summaryHtml}</div>
    </article>
    <article
      class="card"
      style="background:${theme.background};border-color:${theme.border};box-shadow:${theme.shadow};color:${theme.valueColor};"
    >
      <div class="section-heading" style="border-bottom-color: rgba(244,232,131,0.4);">
        <h3 style="color:${theme.labelColor};">Severity Rationale</h3>
        <span class="badge" style="border-color:${theme.border};color:${theme.valueColor};">${escapeHtml(reportData.severity || 'N/A')}</span>
      </div>
      <div class="prose">${severityJustificationHtml}</div>
    </article>
  </section>
`;

const renderEvidenceSection = (incidentData: IncidentData): string => {
  const count = incidentData.evidence.length;
  const label = `${count} ${count === 1 ? 'Item' : 'Items'}`;

  return `
    <section class="card evidence-section page-break">
      <div class="section-heading">
        <h2>Evidence Log</h2>
        <span class="evidence-count">${label}</span>
      </div>
      ${renderEvidenceItems(incidentData)}
    </section>
  `;
};

const renderLegalContextSection = (
  legalInsightsHtml: string,
  statuteReferences: ReturnType<typeof compileLegalReferences>['statuteReferences'],
  caseLawReferences: ReturnType<typeof compileLegalReferences>['caseLawReferences'],
): string => `
  <section class="page-break">
    <h2 class="section-title">II. Additional Legal Context</h2>
    <article class="legal-card">
      <section>
        <div class="section-heading">
          <h3>III. Key Legal Narrative</h3>
          <span class="badge">Informational Only</span>
        </div>
        <p class="note">Disclaimer: This is not legal advice. Validate with licensed counsel in your jurisdiction.</p>
        <div class="prose">${legalInsightsHtml}</div>
      </section>
      <section>
        <h3>IV. Governing Statutes (The Written Law)</h3>
        ${renderStatuteSection(statuteReferences)}
      </section>
      ${renderCaseLawSection(caseLawReferences)}
      <section>
        <h3>VI. Related Legal Concepts / Glossary</h3>
        ${renderGlossary()}
      </section>
    </article>
  </section>
`;

const renderPotentialSourcesSection = (potentialSources: string[]): string => `
  <section>
    <h2 class="section-title">Potential Legal &amp; Informational Sources</h2>
    <article class="card">
      ${renderPotentialSources(potentialSources)}
    </article>
  </section>
`;

const renderFooter = (): string => `
  <p class="footer">
    This document was generated for informational and legal preparation purposes. Review by legal counsel is strongly advised.
  </p>
`;

export const generateReportHTML = (reportData: ReportData, incidentData: IncidentData): string => {
  const generatedAt = new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date());

  const severityKey = (reportData.severity || '').toLowerCase();
  const severityTheme = severityThemes[severityKey] ?? severityThemes.default;

  const summaryHtml = formatSectionContent(
    reportData.professionalSummary,
    { fallbackText: 'Summary has not been generated yet.' },
  );
  const severityJustificationHtml = formatSectionContent(
    reportData.severityJustification,
    { fallbackText: 'Severity rationale is not yet available.' },
  );
  const legalInsightsHtml = formatSectionContent(
    reportData.legalInsights,
    { fallbackText: 'No legal insights were generated.' },
  );

  const { statuteReferences, caseLawReferences, potentialSources } = compileLegalReferences({
    legalInsights: reportData.legalInsights,
    sources: reportData.sources ?? [],
  });

  const statsMarkup = [
    renderStatCard('Category', reportData.category || 'N/A'),
    renderSeverityCard(reportData.severity || 'N/A', severityTheme),
    renderStatCard('Jurisdiction', incidentData.jurisdiction || 'Not specified'),
    renderStatCard('Case Number', reportData.caseNumber || incidentData.caseNumber || 'N/A'),
  ].join('');

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Incident Report: ${escapeHtml(reportData.title || 'Report')}</title>
    <style>${STYLES}</style>
  </head>
  <body>
    <main class="report-app">
      ${renderIntroCard(reportData, generatedAt)}
      <section class="stats-grid">${statsMarkup}</section>
      ${renderSummarySection(reportData, summaryHtml, severityJustificationHtml, severityTheme)}
      ${renderEvidenceSection(incidentData)}
      ${renderLegalContextSection(legalInsightsHtml, statuteReferences, caseLawReferences)}
      ${renderPotentialSourcesSection(potentialSources)}
      ${renderFooter()}
    </main>
  </body>
</html>`;
};

export type { ReportData, IncidentData };
