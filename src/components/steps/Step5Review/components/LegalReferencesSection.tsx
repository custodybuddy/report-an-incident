import React, { useId } from 'react';
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

const GLOSSARY_ENTRIES = [
  {
    title: 'Document Preservation',
    description:
      'Keep certified copies of every exhibit (screenshots, emails, call logs) with timestamps for court submission.',
  },
  {
    title: 'Best Interests Analysis',
    description:
      'Courts prioritize child safety, stability, and continuity of care when reviewing co-parenting disputes.',
  },
] as const;

const LegalReferencesSection: React.FC<LegalReferencesSectionProps> = ({
  legalInsightsHtml,
  statuteReferences,
  caseLawReferences,
  potentialSources,
}) => {
  const contextHeadingId = useId();
  const narrativeHeadingId = useId();
  const statutesHeadingId = useId();
  const caseLawHeadingId = useId();
  const glossaryHeadingId = useId();
  const sourcesHeadingId = useId();
  const hasCaseLaw = caseLawReferences.length > 0;
  const sectionBodyClasses = 'space-y-4 py-8 first:pt-0 last:pb-0';

  return (
    <section className="space-y-8 lg:space-y-10" aria-labelledby={contextHeadingId}>
      <header className="space-y-2 sm:space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#F4E883]/75">Legal Analysis</p>
        <H2
          id={contextHeadingId}
          className="print-page-break heading-gold text-2xl font-normal border-l-4 border-[#F4E883] pl-4 tracking-tight"
        >
          Additional Legal Context
        </H2>
        <p className="text-sm text-[#CFCBBF]/85">
          Use these AI-generated reference points to explain how the documented incident maps to prevailing legal
          standards in your jurisdiction.
        </p>
      </header>

      <OutlineCard className="divide-y divide-white/10 bg-gradient-to-br from-[#021223] via-[#03182d] to-[#071b2a] p-6 sm:p-8">
        <article className={`space-y-3 ${sectionBodyClasses}`} aria-labelledby={narrativeHeadingId}>
          <header className="flex flex-wrap items-center gap-2 border-b border-[#F4E883]/30 pb-2">
            <H3 id={narrativeHeadingId} className="heading-gold text-xl font-normal">
              Key Legal Narrative
            </H3>
            <MetadataBadge variant="subtle">Informational Only</MetadataBadge>
          </header>
          <p className="text-xs font-semibold uppercase tracking-widest text-[#F4E883]/80">
            Disclaimer: This is not legal advice. Validate with licensed counsel in your jurisdiction.
          </p>
          <div
            className="prose prose-invert prose-sm max-w-none text-[#CFCBBF]"
            dangerouslySetInnerHTML={renderHtmlWithFallback(
              legalInsightsHtml,
              'No legal insights were generated.'
            )}
          />
        </article>

        <article className={`text-[#CFCBBF] ${sectionBodyClasses}`} aria-labelledby={statutesHeadingId}>
          <header className="flex flex-col gap-2 border-b border-[#F4E883]/30 pb-2">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#F4E883]/70">Statutory Sources</p>
            <H3 id={statutesHeadingId} className="heading-gold text-xl font-normal">
              Governing Statutes (The Written Law)
            </H3>
          </header>
          {statuteReferences.length > 0 ? (
            <div className="space-y-4">
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
        </article>

        {hasCaseLaw ? (
          <article className={`text-[#CFCBBF] ${sectionBodyClasses}`} aria-labelledby={caseLawHeadingId}>
            <header className="flex flex-col gap-2 border-b border-[#F4E883]/30 pb-2">
              <p className="text-xs font-semibold uppercase tracking-widest text-[#F4E883]/70">Judicial Guidance</p>
              <H3 id={caseLawHeadingId} className="heading-gold text-xl font-normal">
                High-Precedent Case Law (Judicial Interpretation)
              </H3>
            </header>
            <div className="space-y-4">
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
          </article>
        ) : null}

        <article className={`space-y-4 ${sectionBodyClasses}`} aria-labelledby={glossaryHeadingId}>
          <header className="flex flex-col gap-2 border-b border-[#F4E883]/30 pb-2">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#F4E883]/70">Key Concepts</p>
            <H3 id={glossaryHeadingId} className="heading-gold text-xl font-normal">
              Related Legal Concepts / Glossary
            </H3>
          </header>
          <div className="grid gap-3 md:grid-cols-2">
            {GLOSSARY_ENTRIES.map(entry => (
              <div
                key={entry.title}
                className="rounded-2xl border border-[#F4E883]/40 bg-[#021223] p-3 shadow-inner shadow-black/20"
              >
                <strong className="heading-gold block text-base font-normal">{entry.title}</strong>
                <p className="text-sm text-[#CFCBBF]/90">{entry.description}</p>
              </div>
            ))}
          </div>
        </article>
      </OutlineCard>

      <section aria-labelledby={sourcesHeadingId} className="space-y-3">
        <header className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#F4E883]/75">
            Supplemental Research
          </p>
          <H2 id={sourcesHeadingId} className="heading-gold text-2xl font-normal border-l-4 border-[#F4E883] pl-4">
            Potential Legal & Informational Sources
          </H2>
          <p className="text-sm text-[#CFCBBF]/85">
            Provide these links to counsel or the court to show your supporting research trail.
          </p>
        </header>
        <OutlineCard aria-live="polite">
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
    </section>
  );
};

export default LegalReferencesSection;
