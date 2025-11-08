import React from 'react';
import StatCard from './StatCard';
import { severityThemes } from './constants';

export interface OverviewStat {
  label: string;
  value: string;
}

interface StatsOverviewProps {
  primaryStat?: OverviewStat;
  secondaryStats: OverviewStat[];
  severity?: string | null;
  severityThemeKey: keyof typeof severityThemes;
}

const StatsOverview: React.FC<StatsOverviewProps> = ({
  primaryStat,
  secondaryStats,
  severity,
  severityThemeKey,
}) => {
  const severityStyles = severityThemes[severityThemeKey] ?? severityThemes.default;

  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {primaryStat ? <StatCard label={primaryStat.label} value={primaryStat.value} /> : null}
      <div className={`rounded-2xl border p-4 shadow-lg ${severityStyles.card}`}>
        <p className={`heading-gold text-xs font-normal uppercase tracking-[0.3em] ${severityStyles.label}`}>
          Severity
        </p>
        <p className={`mt-2 text-2xl font-semibold ${severityStyles.value}`}>{severity ?? 'N/A'}</p>
      </div>
      {secondaryStats.map(stat => (
        <StatCard key={stat.label} label={stat.label} value={stat.value} />
      ))}
    </section>
  );
};

export default StatsOverview;
