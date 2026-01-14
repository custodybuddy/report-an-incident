import React from 'react';
import H2 from '../../ui/H2';
import H3 from '../../ui/H3';
import OutlineCard from './OutlineCard';
import { createHtml, deriveReadableTitle, getDomainFromUrl, type LegalReference } from './helpers';

interface LegalContextSectionProps {
  legalInsightsHtml: string;
  statuteReferences: LegalReference[];
  caseLawReferences: LegalReference[];
  potentialSources: string[];
}

const LegalContextSection: React.FC<LegalContextSectionProps> = ({
  legalInsightsHtml,
  statuteReferences,
  caseLawReferences,
  potentialSources,
}) => (
  <section className="space-y-8">
    <H2 className="print-page-break heading-gold text-2xl font-normal mt-10 mb-2 border-l-4 border-[#F4E883] pl-4 tracking-tight">
      II. Additional Legal Context
    </H2>
    <OutlineCard className="space-y-8">
      <section className="space-y-3">
        <div className="flex flex-wrap items-center gap-2 border-b border-[#F4E883]/30 pb-2">
          <H3 className="heading-gold text-xl font-normal">III. Key Legal Narrative</H3>
          <span className="text-xs font-semibold uppercase tracking-widest text-[#F4E883]">Informational Only</span>
        </div>
        <p className="text-xs font-semibold text-[#F4E883]">
          Disclaimer: This is not legal advice. Validate with licensed counsel in your jurisdiction.
        </p>
        <div
          className="prose prose-invert prose-sm max-w-none text-[#CFCBBF]"
          dangerouslySetInnerHTML={createHtml(legalInsightsHtml, 'No legal insights were generated.')}
        />
      </section>

      <section className="space-y-4">
        <H3 className="heading-gold text-xl font-normal border-b border-[#F4E883]/30 pb-1">
          IV. Governing Statutes (The Written Law)
        </H3>
        {statuteReferences.length > 0 ? (
          <div className="space-y-4 text-[#CFCBBF]">
            {statuteReferences.map((ref, index) => (
              <div
                key={ref.url}
                className="rounded-2xl border border-[#F4E883]/40 bg-[#021223] p-4 shadow-lg shadow-black/30"
              >
                <strong className="heading-gold block text-base font-normal">
                  {index + 1}. {ref.label}
                </strong>
                <a
                  href={ref.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-[#FFD700] hover:text-[#F4E883] focus-visible:outline-[#F4E883] focus-visible:outline-offset-2"
                >
                  Source URL: {ref.url}
                </a>
                <p className="text-sm mt-2 text-[#CFCBBF]/90">
                  {ref.context || 'Reference this authority when documenting how the incident aligns with statutory requirements.'}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-[#CFCBBF]/80">The AI summary did not cite specific statutes for this incident.</p>
        )}
      </section>

      {caseLawReferences.length > 0 ? (
        <section className="space-y-4">
          <H3 className="heading-gold text-xl font-normal border-b border-[#F4E883]/30 pb-1">
            V. High-Precedent Case Law (Judicial Interpretation)
          </H3>
          <div className="space-y-4 text-[#CFCBBF]">
            {caseLawReferences.map((ref, index) => (
              <div
                key={ref.url}
                className="rounded-2xl border border-[#F4E883]/40 bg-[#021223] p-4 shadow-lg shadow-black/30"
              >
                <strong className="heading-gold block text-base font-normal">
                  {index + 1}. {ref.label || deriveReadableTitle(ref.url)}
                </strong>
                <p className="text-xs text-[#CFCBBF]/70">Jurisdiction: {getDomainFromUrl(ref.url)}</p>
                <a
                  href={ref.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-[#FFD700] hover:text-[#F4E883] focus-visible:outline-[#F4E883] focus-visible:outline-offset-2"
                >
                  Citation Link: {ref.url}
                </a>
                <p className="text-sm mt-2 text-[#CFCBBF]/90">
                  {ref.context || 'Review this case to understand how courts weigh similar fact patterns.'}
                </p>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <section className="space-y-3">
        <H3 className="heading-gold text-xl font-normal border-b border-[#F4E883]/30 pb-1">
          VI. Related Legal Concepts / Glossary
        </H3>
        <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded-2xl border border-[#F4E883]/40 bg-[#021223] p-3 shadow-inner shadow-black/20">
            <strong className="heading-gold block text-base font-normal">Document Preservation</strong>
            <p className="text-sm text-[#CFCBBF]/90">
              Keep certified copies of every exhibit (screenshots, emails, call logs) with timestamps for court submission.
            </p>
          </div>
          <div className="rounded-2xl border border-[#F4E883]/40 bg-[#021223] p-3 shadow-inner shadow-black/20">
            <strong className="heading-gold block text-base font-normal">Best Interests Analysis</strong>
            <p className="text-sm text-[#CFCBBF]/90">
              Courts prioritize child safety, stability, and continuity of care when reviewing co-parenting disputes.
            </p>
          </div>
        </div>
      </section>
    </OutlineCard>

    <H2 className="heading-gold text-2xl font-normal mt-8 mb-3 border-l-4 border-[#F4E883] pl-4">
      Potential Legal &amp; Informational Sources
    </H2>
    <OutlineCard>
      {potentialSources.length > 0 ? (
        <ul className="list-disc space-y-3 pl-5 text-sm text-[#CFCBBF]">
          {potentialSources.map(url => (
            <li key={url} className="space-y-1">
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-[#FFD700] hover:text-[#F4E883] focus-visible:outline-[#F4E883] focus-visible:outline-offset-2"
              >
                {deriveReadableTitle(url)}
              </a>
              <p className="text-xs text-[#CFCBBF]/70 italic">{url}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-[#CFCBBF]/80">No supplemental research links were attached for this report.</p>
      )}
    </OutlineCard>
  </section>
);

export default LegalContextSection;
