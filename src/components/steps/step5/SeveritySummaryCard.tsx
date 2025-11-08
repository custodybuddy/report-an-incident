import type { SeverityTheme } from './severityThemes';

interface SeveritySummaryCardProps {
  severity: string | null | undefined;
  theme: SeverityTheme;
}

const SeveritySummaryCard = ({ severity, theme }: SeveritySummaryCardProps) => (
  <div className={`rounded-2xl border p-4 shadow-lg ${theme.card}`}>
    <p className={`heading-gold text-xs font-normal uppercase tracking-[0.3em] ${theme.label}`}>
      Severity
    </p>
    <p className={`mt-2 text-2xl font-semibold ${theme.value}`}>{severity ?? 'N/A'}</p>
  </div>
);

export default SeveritySummaryCard;
