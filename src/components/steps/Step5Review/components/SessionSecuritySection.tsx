import React from 'react';
import OutlineCard from '../../../ui/OutlineCard';
import H3 from '../../../ui/H3';

const tips = [
  {
    title: 'Secure storage',
    detail: 'Keep exported files on encrypted or access-controlled drives to prevent unauthorized access.',
  },
  {
    title: 'Controlled sharing',
    detail: 'Only share reports with counsel or professionals who are bound by confidentiality obligations.',
  },
  {
    title: 'Clean exits',
    detail: 'Delete temporary downloads once they have been delivered to reduce residual exposure.',
  },
];

const SessionSecuritySection: React.FC = () => (
  <OutlineCard
    className="space-y-6"
    borderClassName="border-white/10"
    backgroundClassName="bg-[#050C18]"
  >
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#F4E883]/80">Session Security</p>
        <H3 className="text-xl font-semibold text-white">Protect confidential work products</H3>
        <p className="text-sm text-[#CFCBBF]/85 leading-relaxed">
          This workspace encrypts data locally and purges it when you reset the incident or close the tab. Your device
          remains the first line of defense.
        </p>
      </div>
      <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 text-[#F4E883]">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-6 w-6"
          aria-hidden="true"
        >
          <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      </div>
    </div>

    <ul className="space-y-5">
      {tips.map((tip) => (
        <li key={tip.title} className="flex gap-4">
          <span className="mt-1 inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-2xl border border-white/20 text-xs font-semibold uppercase tracking-widest text-[#F4E883]">
            •
          </span>
          <div className="space-y-1">
            <p className="text-sm font-semibold text-white">{tip.title}</p>
            <p className="text-sm text-[#CFCBBF]/85 leading-relaxed">{tip.detail}</p>
          </div>
        </li>
      ))}
    </ul>
  </OutlineCard>
);

export default SessionSecuritySection;
