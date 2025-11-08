import React from 'react';
import H2 from '../../../ui/H2';
import H3 from '../../../ui/H3';
import MetadataBadge from '../../../ui/MetadataBadge';
import OutlineCard from '../../../ui/OutlineCard';
import { ResourceLinkCard, ResourceLinkList } from '../../../ui/ResourceLinks';
import { renderHtmlWithFallback } from '../utils/html';
import {
  deriveReadableTitle,
  getDomainFromUrl,
  type LegalReference,
} from '@/services/reportReferences';

interface LegalReferencesSectionProps {
  legalInsightsHtml: string;
  statuteReferences: LegalReference[];
  caseLawReferences: LegalReference[];
  potentialSources: string[];
}

const LegalReferencesSection: React.FC<LegalReferencesSectionProps> = ({
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
          <MetadataBadge variant="subtle">Informational Only</MetadataBadge>
        </div>
        <p className="text-xs font-semibold text-[#F4E883]">
          Disclaimer: This is not legal advice. Validate with licensed counsel in your jurisdiction.
        </p>
        <div
          className="prose prose-invert prose-sm max-w-none text-[#CFCBBF]"
          dangerouslySetInnerHTML={renderHtmlWithFallback(
            legalInsightsHtml,
            'No legal insights were generated.'
          )}
        />
      </section>

      <section className="space-y-4">
        <H3 className="heading-gold text-xl font-normal border-b border-[#F4E883]/30 pb-1">
          IV. Governing Statutes (The Written Law)
        </H3>
        {statuteReferences.length > 0 ? (
          <div className="space-y-4 text-[#CFCBBF]">
            {statuteReferences.map((ref, index) => (
              <ResourceLinkCard
                key={ref.url}
                index={index}
                title={ref.label}
                url={ref.url}
                description={
                  ref.context ||
                  'Reference this authority when documenting how the incident aligns with statutory requirements.'
                }
              />
            ))}
          </div>
        ) : (
          <p className="text-sm text-[#CFCBBF]/80">
            The AI summary did not cite specific statutes for this incident.
          </p>
        )}
      </section>

      {caseLawReferences.length > 0 ? (
        <section className="space-y-4">
          <H3 className="heading-gold text-xl font-normal border-b border-[#F4E883]/30 pb-1">
            V. High-Precedent Case Law (Judicial Interpretation)
          </H3>
          <div className="space-y-4 text-[#CFCBBF]">
            {caseLawReferences.map((ref, index) => (
              <ResourceLinkCard
                key={ref.url}
                index={index}
                title={ref.label || deriveReadableTitle(ref.url)}
                url={ref.url}
                metadata={`Jurisdiction: ${getDomainFromUrl(ref.url)}`}
                linkLabel="Citation Link"
                description={
                  ref.context || 'Review this case to understand how courts weigh similar fact patterns.'
                }
              />
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
      <ResourceLinkList
        items={potentialSources.map(url => ({
          title: deriveReadableTitle(url),
          url,
          description: url,
        }))}
        emptyMessage="No supplemental research links were attached for this report."
      />
    </OutlineCard>
  </section>
);

export default LegalReferencesSection;
