import { useCallback, useMemo, useRef } from 'react';
import { formatGeneratedTimestamp } from '@/utils/dateTime';
import { useCopyToClipboard } from './useCopyToClipboard';
import { useLegalReferences } from './useLegalReferences';
import { buildReviewReportData, type BuildReviewReportDataParams } from './reviewReportData';

interface UseReviewReportParams extends BuildReviewReportDataParams {}

export const useReviewReport = ({
  incidentData,
  reportData,
}: UseReviewReportParams) => {
  const summaryRef = useRef<HTMLDivElement>(null);

  const reportDataResult = useMemo(
    () => buildReviewReportData({ incidentData, reportData }),
    [incidentData, reportData]
  );

  const { statuteReferences, caseLawReferences } = useLegalReferences({
    legalInsights: reportData?.legalInsights,
    sources: reportData?.sources ?? [],
  });

  const generatedAt = useMemo(() => formatGeneratedTimestamp(), []);

  const getSummaryText = useCallback(
    () => summaryRef.current?.innerText?.trim() ?? reportData?.professionalSummary?.trim() ?? '',
    [reportData?.professionalSummary]
  );

  const { copyState, handleCopy, buttonLabel } = useCopyToClipboard({ getText: getSummaryText });

  return {
    ...reportDataResult,
    generatedAt,
    summaryRef,
    statuteReferences,
    caseLawReferences,
    copyState,
    handleCopy,
    buttonLabel,
  };
};

export default useReviewReport;
