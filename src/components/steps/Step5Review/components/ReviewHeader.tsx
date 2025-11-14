import React, { type RefObject } from 'react';
import H1 from '../../../ui/H1';
import OutlineCard from '../../../ui/OutlineCard';

interface ReviewHeaderProps {
  headingRef: RefObject<HTMLHeadingElement>;
  title: string;
  generatedAt: string;
}

const ReviewHeader: React.FC<ReviewHeaderProps> = ({ headingRef, title, generatedAt }) => (
  <OutlineCard
    borderClassName="border-white/10"
    backgroundClassName="bg-slate-950/60 backdrop-blur"
    className="space-y-6 p-6 sm:p-8"
  >
    <div className="flex items-center gap-3 text-[0.65rem] font-semibold uppercase tracking-[0.35em] text-[#F4E883]/70">
      <span className="inline-flex h-px flex-1 bg-white/15" aria-hidden="true" />
      <span>AI-Generated Report</span>
      <span className="inline-flex h-px flex-1 bg-white/15" aria-hidden="true" />
    </div>
    <div className="space-y-2">
      <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#CFCBBF]/70">Incident Report</p>
      <H1
        ref={headingRef}
        tabIndex={-1}
        className="heading-gold !text-left normal-case text-[clamp(2rem,4vw,3rem)] font-semibold leading-tight tracking-tight"
      >
        {title || 'Pending Title'}
      </H1>
    </div>
    <dl className="flex flex-wrap gap-8 text-sm text-[#CFCBBF]/85" aria-label="Report metadata">
      <div className="space-y-1">
        <dt className="text-[0.6rem] uppercase tracking-[0.35em] text-[#F4E883]/60">Prepared By</dt>
        <dd className="text-base text-white/90">CustodyBuddy Incident Reporter</dd>
      </div>
      <div className="space-y-1">
        <dt className="text-[0.6rem] uppercase tracking-[0.35em] text-[#F4E883]/60">Generated</dt>
        <dd className="text-base text-white/90">{generatedAt}</dd>
      </div>
    </dl>
  </OutlineCard>
);

export default ReviewHeader;
