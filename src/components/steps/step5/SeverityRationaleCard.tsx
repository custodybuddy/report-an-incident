import type { ReactNode } from 'react';
import H3 from '../../ui/H3';
import type { SeverityTheme } from './severityThemes';

interface SeverityRationaleCardProps {
  severity: string | null | undefined;
  theme: SeverityTheme;
  children: ReactNode;
}

const SeverityRationaleCard = ({ severity, theme, children }: SeverityRationaleCardProps) => (
  <article className={`rounded-3xl p-6 shadow-[0_18px_40px_rgba(0,0,0,0.45)] ${theme.card}`}>
    <div className="flex items-center justify-between">
      <H3 className={`heading-gold text-xl font-normal ${theme.label}`}>Severity Rationale</H3>
      <span className={`text-sm font-semibold ${theme.value}`}>{severity ?? 'N/A'}</span>
    </div>
    <div className="prose prose-invert prose-sm mt-4 max-w-none text-[#CFCBBF]">{children}</div>
  </article>
);

export default SeverityRationaleCard;
