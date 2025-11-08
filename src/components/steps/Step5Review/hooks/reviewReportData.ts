import type { IncidentData, ReportData } from '@/types';
import { formatHtmlContent } from '../utils/html';
import type { SeverityStyles, StatItem } from '../types';

const severityThemes: Record<string, SeverityStyles> = {
  high: {
    card: 'bg-[#2C0F12] border-[#FFB3B3]/60 shadow-[0_10px_25px_rgba(255,59,59,0.25)]',
    label: 'text-[#FFD700]',
    value: 'text-[#FFD7A3]',
    accent: 'text-[#FFD700]',
  },
  medium: {
    card: 'bg-[#2A1A04] border-[#F4E883]/60 shadow-[0_10px_25px_rgba(244,232,131,0.2)]',
    label: 'text-[#FFD700]',
    value: 'text-[#F4E883]',
    accent: 'text-[#FFD700]',
  },
  low: {
    card: 'bg-[#0a2a1f] border-[#6fe0b1]/50 shadow-[0_10px_25px_rgba(0,128,96,0.2)]',
    label: 'text-[#F4E883]',
    value: 'text-[#CFEFDA]',
    accent: 'text-[#F4E883]',
  },
  default: {
    card: 'bg-[#01192C] border-[#F4E883]/60 shadow-[0_10px_25px_rgba(0,0,0,0.35)]',
    label: 'text-[#FFD700]',
    value: 'text-[#FFD700]',
    accent: 'text-[#FFD700]',
  },
};

export interface BuildReviewReportDataParams {
  incidentData: IncidentData;
  reportData: ReportData | null;
}

export interface ReviewReportDataResult {
  hasReport: boolean;
  reportTitle: string;
  severity: string | null;
  severityStyles: SeverityStyles;
  primaryStat?: StatItem;
  secondaryStats: StatItem[];
  summaryHtml: string;
  severityJustificationHtml: string;
  legalInsightsHtml: string;
}

export const buildReviewReportData = ({
  incidentData,
  reportData,
}: BuildReviewReportDataParams): ReviewReportDataResult => {
  const severityKey = (reportData?.severity ?? '').toLowerCase();
  const severityStyles = severityThemes[severityKey] ?? severityThemes.default;

  const overviewStats: StatItem[] = [
    { label: 'Category', value: reportData?.category ?? 'N/A' },
    { label: 'Jurisdiction', value: incidentData.jurisdiction || 'Not specified' },
    { label: 'Case Number', value: reportData?.caseNumber || incidentData.caseNumber || 'N/A' },
  ];

  const [primaryStat, ...secondaryStats] = overviewStats;

  return {
    hasReport: Boolean(reportData),
    reportTitle: reportData?.title || 'Pending Title',
    severity: reportData?.severity ?? null,
    severityStyles,
    primaryStat,
    secondaryStats,
    summaryHtml: formatHtmlContent(reportData?.professionalSummary),
    severityJustificationHtml: formatHtmlContent(reportData?.severityJustification),
    legalInsightsHtml: formatHtmlContent(reportData?.legalInsights),
  };
};

export default buildReviewReportData;
