import React from 'react';
import Button from '../ui/Button';
import { type IncidentData, type ReportData } from '@/types';

interface Step5Props {
  incidentData: IncidentData;
  reportData: ReportData | null;
  isGenerating: boolean;
  onExport: () => void;
  onPrint: () => void;
  onRestart: () => void;
}

const LoadingState = () => (
  <div className="flex flex-col items-center justify-center py-10 gap-3">
    <div className="w-12 h-12 rounded-full border-4 border-amber-300/60 border-t-transparent animate-spin" aria-hidden />
    <p className="text-amber-200 font-semibold">Generating report…</p>
    <p className="text-sm text-slate-400 text-center max-w-md">
      We are creating a court-ready, neutral summary with linked statutes. This may take a few seconds.
    </p>
  </div>
);

const Step5Review: React.FC<Step5Props> = ({ incidentData, reportData, isGenerating, onExport, onPrint, onRestart }) => {
  if (isGenerating || !reportData) {
    return <LoadingState />;
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-wide text-amber-300 mb-1">Summary</p>
        <h2 className="text-2xl font-bold text-white">Court-ready Report</h2>
        <p className="text-sm text-slate-400">Created: {new Date(reportData.createdAt).toLocaleString()}</p>
      </div>

      <div className="bg-black/30 border border-slate-700 rounded-2xl p-6 space-y-4">
        <div className="flex flex-wrap gap-4 text-sm text-slate-300">
          <span className="px-3 py-1 rounded-full bg-slate-800 border border-slate-700">
            Jurisdiction: {reportData.jurisdiction.region || 'N/A'}
          </span>
          <span className="px-3 py-1 rounded-full bg-slate-800 border border-slate-700">
            Evidence items: {reportData.evidenceCount}
          </span>
          <span className="px-3 py-1 rounded-full bg-slate-800 border border-slate-700">
            Parties noted: {incidentData.parties.length || 'None'}
          </span>
        </div>

        <div className="text-slate-200 leading-relaxed whitespace-pre-wrap border-t border-slate-700/60 pt-4">
          {reportData.summary}
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button onClick={onExport}>Export</Button>
        <Button onClick={onPrint} variant="secondary">
          Print
        </Button>
        <Button onClick={onRestart} variant="ghost">
          Start New Report
        </Button>
      </div>
    </div>
  );
};

export default Step5Review;
