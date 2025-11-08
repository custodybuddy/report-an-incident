import React, { type RefObject } from 'react';
import H1 from '../../../ui/H1';
import H3 from '../../../ui/H3';
import OutlineCard from '../../../ui/OutlineCard';

interface ReviewHeaderProps {
  headingRef: RefObject<HTMLHeadingElement>;
  title: string;
  generatedAt: string;
}

const ReviewHeader: React.FC<ReviewHeaderProps> = ({ headingRef, title, generatedAt }) => (
  <OutlineCard
    borderClassName="border-white/10"
    backgroundClassName="bg-gradient-to-br from-slate-950/85 via-slate-950/60 to-slate-900/60"
    className="sm:p-8"
  >
    <H3 className="text-xs font-semibold uppercase tracking-[0.3em] text-[#FFD700]">AI-Generated Report</H3>
    <H1 ref={headingRef} tabIndex={-1} className="heading-gold mt-3 text-3xl sm:text-4xl font-normal leading-tight">
      Incident Report: {title}
    </H1>
    <p className="mt-4 text-sm text-[#CFCBBF]">Prepared by CustodyBuddy Incident Reporter • {generatedAt}</p>
  </OutlineCard>
);

export default ReviewHeader;
