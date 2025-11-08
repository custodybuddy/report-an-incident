import type { EvidenceFile } from '../../../../types';

interface EvidenceCardProps {
  evidence: EvidenceFile;
  index: number;
}

const EvidenceCard = ({ evidence, index }: EvidenceCardProps) => (
  <article className="rounded-2xl border border-[#F4E883]/40 bg-[#021223] p-4 text-sm text-[#CFCBBF] shadow-lg shadow-black/20">
    <header className="flex flex-wrap items-center justify-between gap-2 border-b border-[#F4E883]/30 pb-2">
      <p className="font-semibold text-[#FFD700]">
        EVIDENCE {String(index + 1).padStart(3, '0')}: {evidence.name}
      </p>
      <span className="text-xs text-[#CFCBBF]/70">
        {(evidence.size / 1024).toFixed(1)} kB · {evidence.category}
      </span>
    </header>
    <dl className="mt-3 grid gap-3 text-xs text-[#CFCBBF]/80 sm:grid-cols-2">
      <div>
        <dt className="font-semibold uppercase tracking-widest text-[#F7EF8A]/80">Type</dt>
        <dd className="mt-1 text-[#CFCBBF]">{evidence.type || 'Not provided'}</dd>
      </div>
      <div>
        <dt className="font-semibold uppercase tracking-widest text-[#F7EF8A]/80">Description</dt>
        <dd className="mt-1 text-[#CFCBBF]">{evidence.description || 'Not documented'}</dd>
      </div>
    </dl>
    {evidence.aiAnalysis ? (
      <p className="mt-3 rounded-2xl border border-[#F4E883]/40 bg-[#071B2A] p-3 text-xs text-[#CFCBBF]">
        <span className="heading-gold font-normal">AI insight:</span> {evidence.aiAnalysis}
      </p>
    ) : null}
  </article>
);

export default EvidenceCard;
