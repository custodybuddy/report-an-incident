import React, { useId } from 'react';
import H2 from '../../../ui/H2';
import H3 from '../../../ui/H3';
import MetadataBadge from '../../../ui/MetadataBadge';
import OutlineCard from '../../../ui/OutlineCard';
import { ResourceLinkCard } from '../../../ui/ResourceLinks';
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
}

const LegalReferencesSection: React.FC<LegalReferencesSectionProps> = ({
  legalInsightsHtml,
  statuteReferences,
  caseLawReferences,
}) => {
  const contextHeadingId = useId();
  const narrativeHeadingId = useId();
  const statutesHeadingId = useId();
  const caseLawHeadingId = useId();
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
        <article className={`space-y-4 ${sectionBodyClasses}`} aria-labelledby={narrativeHeadingId}>
          <header className="space-y-1 border-b border-[#F4E883]/30 pb-3">
            <div className="flex flex-wrap items-center gap-3">
              <H3 id={narrativeHeadingId} className="heading-gold text-xl font-normal">
                Key Legal Narrative
              </H3>
              <MetadataBadge variant="subtle">Informational Only</MetadataBadge>
            </div>
            <p className="text-xs text-[#CFCBBF]/80">
              A structured summary of how the facts align (or conflict) with the cited legal standards.
            </p>
          </header>

          <div className="rounded-2xl border border-white/10 bg-white/5 bg-gradient-to-br from-white/5 to-transparent p-4 sm:p-5 shadow-inner">
            <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-[#F4E883]/10 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.35em] text-[#F4E883]">
              <span className="inline-block h-2 w-2 rounded-full bg-[#F4E883]" aria-hidden="true" />
              Not Legal Advice — confirm with counsel
            </p>
            <div
              className="prose prose-invert prose-sm max-w-none text-[#E6E1D2] prose-headings:text-white prose-strong:text-white/90 prose-li:marker:text-[#F4E883]"
              aria-live="polite"
              dangerouslySetInnerHTML={renderHtmlWithFallback(
                legalInsightsHtml,
                'No legal insights were generated.'
              )}
            />
          </div>
        </article>

        <article className={`text-[#CFCBBF] ${sectionBodyClasses}`} aria-labelledby={statutesHeadingId}>
          <header className="flex flex-col gap-2 border-b border-[#F4E883]/30 pb-2">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#F4E883]/70">Statutory Sources</p>
            <H3 id={statutesHeadingId} className="heading-gold text-xl font-normal">
              Governing Statutes (The Written Law)
            </H3>
          </header>
          {statuteReferences.length > 0 ? (
            <ol className="space-y-4" aria-live="polite">
              {statuteReferences.map((ref, index) => {
                const title = ref.label || deriveReadableTitle(ref.url);
                const description =
                  ref.context ||
                  'Reference this authority when documenting how the incident aligns with statutory requirements.';
                const displayIndex = String(index + 1).padStart(2, '0');

                return (
                  <li
                    key={ref.url}
                    className="group rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/0 p-4 transition ring-1 ring-transparent hover:border-[#F4E883]/50 hover:ring-[#F4E883]/30"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <p className="text-[0.6rem] uppercase tracking-[0.35em] text-[#F4E883]/65">Statute</p>
                        <strong className="heading-gold block text-lg font-semibold leading-tight">{title}</strong>
                      </div>
                      <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-sm font-semibold text-white/80">
                        {displayIndex}
                      </span>
                    </div>
                    <p className="mt-3 text-sm text-[#CFCBBF]/85">{description}</p>
                    <a
                      href={ref.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] text-[#F4E883] hover:text-white focus-visible:outline-offset-4 focus-visible:outline-[#F4E883]"
                    >
                      View Source
                      <span aria-hidden="true" className="text-base leading-none">
                        ↗
                      </span>
                    </a>
                  </li>
                );
              })}
            </ol>
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
      </OutlineCard>

    </section>
  );
};

export default LegalReferencesSection;
