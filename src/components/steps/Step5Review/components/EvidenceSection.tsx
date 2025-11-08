import React from 'react';
import type { EvidenceFile } from '@/types';
import { AI_INSIGHT_LABEL } from '@/constants';
import H3 from '../../../ui/H3';
import MetadataBadge from '../../../ui/MetadataBadge';

interface EvidenceSectionProps {
  evidence: EvidenceFile[];
}

const EvidenceSection: React.FC<EvidenceSectionProps> = ({ evidence }) => {
  const evidenceCount = evidence.length;
  const evidenceLabel = `${evidenceCount} ${evidenceCount === 1 ? 'Item' : 'Items'}`;

  return (
    <section className="rounded-3xl border border-[#F4E883] bg-[#01192C] p-6 shadow-[0_20px_45px_rgba(0,0,0,0.45)]">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <H3 className="heading-gold text-2xl font-normal">
          I. Evidence Log{' '}
          <span className="text-sm font-semibold text-[#CFCBBF]/80">({evidenceLabel})</span>
        </H3>
        {evidenceCount > 0 && <MetadataBadge>Maintain secure backups</MetadataBadge>}
      </div>
      {evidenceCount > 0 ? (
        <div className="mt-6 space-y-4">
          {evidence.map((item, index) => (
            <article
              key={item.id}
              className="rounded-2xl border border-[#F4E883]/40 bg-[#021223] p-4 text-sm text-[#CFCBBF] shadow-lg shadow-black/20"
            >
              <header className="flex flex-wrap items-center justify-between gap-2 border-b border-[#F4E883]/30 pb-2">
                <p className="font-semibold text-[#FFD700]">
                  EVIDENCE {String(index + 1).padStart(3, '0')}: {item.name}
                </p>
                <span className="text-xs text-[#CFCBBF]/70">
                  {(item.size / 1024).toFixed(1)} kB · {item.category}
                </span>
              </header>
              <dl className="mt-3 grid gap-3 text-xs text-[#CFCBBF]/80 sm:grid-cols-2">
                <div>
                  <dt className="font-semibold uppercase tracking-widest text-[#F7EF8A]/80">Type</dt>
                  <dd className="mt-1 text-[#CFCBBF]">{item.type || 'Not provided'}</dd>
                </div>
                <div>
                  <dt className="font-semibold uppercase tracking-widest text-[#F7EF8A]/80">Description</dt>
                  <dd className="mt-1 text-[#CFCBBF]">{item.description || 'Not documented'}</dd>
                </div>
              </dl>
              {item.aiAnalysis ? (
                <p className="mt-3 rounded-2xl border border-[#F4E883]/40 bg-[#071B2A] p-3 text-xs text-[#CFCBBF]">
                  <span className="heading-gold font-normal">{AI_INSIGHT_LABEL}</span> {item.aiAnalysis}
                </p>
              ) : null}
            </article>
          ))}
          <article className="rounded-2xl border border-[#F4E883]/50 bg-[#021223] p-4 text-sm text-[#CFCBBF]">
            <H3 className="heading-gold font-normal uppercase tracking-widest text-base">Reminder</H3>
            <p className="mt-1">
              Keep digital and physical copies of all evidence securely stored with timestamps for counsel or court staff.
            </p>
          </article>
        </div>
      ) : (
        <p className="mt-4 text-sm text-[#CFCBBF]/85">No supporting evidence was uploaded.</p>
      )}
    </section>
  );
};

export default EvidenceSection;
