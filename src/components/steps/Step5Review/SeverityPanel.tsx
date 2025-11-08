import React from 'react';
import H3 from '../../ui/H3';
import { createHtml } from './helpers';
import { severityThemes } from './constants';

interface SeverityPanelProps {
  severity?: string | null;
  severityHtml: string;
  themeKey: keyof typeof severityThemes;
}

const SeverityPanel: React.FC<SeverityPanelProps> = ({ severity, severityHtml, themeKey }) => {
  const severityStyles = severityThemes[themeKey] ?? severityThemes.default;

  return (
    <article className={`rounded-3xl p-6 shadow-[0_18px_40px_rgba(0,0,0,0.45)] ${severityStyles.card}`}>
      <div className="flex items-center justify-between">
        <H3 className={`heading-gold text-xl font-normal ${severityStyles.label}`}>Severity Rationale</H3>
        <span className={`text-sm font-semibold ${severityStyles.value}`}>{severity ?? 'N/A'}</span>
      </div>
      <div
        className="prose prose-invert prose-sm mt-4 max-w-none text-[#CFCBBF]"
        dangerouslySetInnerHTML={createHtml(severityHtml)}
      />
    </article>
  );
};

export default SeverityPanel;
