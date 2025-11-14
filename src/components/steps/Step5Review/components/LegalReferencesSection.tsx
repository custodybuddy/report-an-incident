import React, { useId } from 'react';
import { formatDisplayIndex } from '@/utils/numberFormatting';
import H2 from '../../../ui/H2';
import H3 from '../../../ui/H3';
import MetadataBadge from '../../../ui/MetadataBadge';
import OutlineCard from '../../../ui/OutlineCard';
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
  const cardSectionClasses = 'p-6 sm:p-8 space-y-6';

  return (
    <section className="space-y-8 lg:space-y-10" aria-labelledby={contextHeadingId}>
      <header className="space-y-2 sm:space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#F4E883]/80">Legal Analysis</p>
        <H2
          id={contextHeadingId}
          className="print-page-break text-2xl font-semibold tracking-tight text-white"
        >
          Additional Legal Context
        </H2>
        <p className="text-sm text-[#CFCBBF]/80 max-w-2xl leading-relaxed">
          Use these AI-generated reference points to explain how the documented incident maps to prevailing legal
          standards in your jurisdiction.
        </p>
      </header>

      <OutlineCard
        className="p-0 overflow-hidden"
        borderClassName="border-white/10"
        backgroundClassName="bg-[#050C18]"
      >
        <article className={cardSectionClasses} aria-labelledby={narrativeHeadingId}>
          <header className="space-y-2">
            <div className="flex flex-wrap items-center gap-3 text-white">
              <H3 id={narrativeHeadingId} className="text-xl font-semibold tracking-tight text-white">
                Key Legal Narrative
              </H3>
              <MetadataBadge variant="subtle">Informational Only</MetadataBadge>
            </div>
            <p className="text-sm text-[#B8C2D1]/90 leading-relaxed">
              A structured summary of how the facts align (or conflict) with the cited legal standards.
            </p>
          </header>

          <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-transparent p-5 text-[#E6E1D2] shadow-inner">
            <p className="mb-4 inline-flex items-center gap-2 text-[0.65rem] font-semibold uppercase tracking-[0.35em] text-[#F4E883]">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#F4E883]" aria-hidden="true" />
              Not legal advice — confirm with counsel
            </p>
            <div
              className="prose prose-invert prose-sm max-w-none text-[#E6E1D2] leading-relaxed prose-p:mb-4 prose-p:last:mb-0"
              aria-live="polite"
              dangerouslySetInnerHTML={renderHtmlWithFallback(
                legalInsightsHtml,
                'No legal insights were generated.'
              )}
            />
          </div>
        </article>

        <article className={`${cardSectionClasses} border-t border-white/5`} aria-labelledby={statutesHeadingId}>
          <header className="space-y-1 text-white">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#F4E883]/75">Statutory Sources</p>
            <H3 id={statutesHeadingId} className="text-xl font-semibold tracking-tight">
              Governing Statutes (The Written Law)
            </H3>
          </header>
          {statuteReferences.length > 0 ? (
            <ol className="space-y-3" aria-live="polite">
              {statuteReferences.map((ref, index) => {
                const title = ref.label || deriveReadableTitle(ref.url);
                const description =
                  ref.context ||
                  'Reference this authority when documenting how the incident aligns with statutory requirements.';
                const displayIndex = formatDisplayIndex(index);

                return (
                  <li
                    key={ref.url}
                    className="rounded-2xl border border-white/10 bg-white/5 bg-[linear-gradient(145deg,rgba(255,255,255,0.04),rgba(255,255,255,0.01))] p-5 text-[#D7DFEA] shadow-[0_10px_30px_rgba(0,0,0,0.35)]"
                  >
                    <div className="flex items-start gap-4">
                      <span className="inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl border border-white/15 text-sm font-semibold text-white/80">
                        {displayIndex}
                      </span>
                      <div className="space-y-2">
                        <div className="space-y-1">
                          <p className="text-[0.6rem] uppercase tracking-[0.35em] text-[#F4E883]/70">Statute</p>
                          <p className="text-lg font-semibold text-white">{title}</p>
                        </div>
                        <p className="text-sm text-[#D7DFEA]/90 leading-relaxed">{description}</p>
                        <a
                          href={ref.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-sm font-semibold text-[#F4E883] hover:text-white focus-visible:outline-[#F4E883] focus-visible:outline-offset-2"
                        >
                          View source
                          <span aria-hidden="true" className="ml-1 text-base leading-none">
                            ↗
                          </span>
                        </a>
                      </div>
                    </div>
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
          <article className={`${cardSectionClasses} border-t border-white/5`} aria-labelledby={caseLawHeadingId}>
            <header className="space-y-1 text-white">
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#F4E883]/75">Judicial Guidance</p>
              <H3 id={caseLawHeadingId} className="text-xl font-semibold tracking-tight">
                High-Precedent Case Law (Judicial Interpretation)
              </H3>
            </header>
            <div className="space-y-3">
              {caseLawReferences.map((ref, index) => (
                <article
                  key={ref.url}
                  className="rounded-2xl border border-white/10 bg-white/5 bg-[linear-gradient(145deg,rgba(16,25,46,0.8),rgba(8,13,26,0.95))] p-5 text-[#D7DFEA]"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-base font-semibold text-white">
                      {formatDisplayIndex(index)}. {ref.label || deriveReadableTitle(ref.url)}
                    </p>
                    <span className="text-xs font-semibold uppercase tracking-[0.25em] text-[#F4E883]/80">
                      Jurisdiction: {getDomainFromUrl(ref.url)}
                    </span>
                  </div>
                  <p className="mt-2 text-xs uppercase tracking-[0.3em] text-[#9FAEC7]">Citation Link</p>
                  <a
                    href={ref.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-[#F4E883] underline-offset-4 hover:underline"
                  >
                    {ref.url}
                  </a>
                  <p className="mt-3 text-sm leading-relaxed text-[#D7DFEA]/90">
                    {ref.context || 'Review this case to understand how courts weigh similar fact patterns.'}
                  </p>
                </article>
              ))}
            </div>
          </article>
        ) : null}
      </OutlineCard>

    </section>
  );
};

export default LegalReferencesSection;
