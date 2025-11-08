import { useCallback, useMemo, useRef } from 'react';
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

  const { statuteReferences, caseLawReferences, potentialSources } = useLegalReferences({
    legalInsights: reportData?.legalInsights,
    sources: reportData?.sources ?? [],
  });

  const generatedAt = useMemo(
    () =>
      new Intl.DateTimeFormat(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short',
      }).format(new Date()),
    []
  );

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
    potentialSources,
    copyState,
    handleCopy,
    buttonLabel,
  };
};

export default useReviewReport;
