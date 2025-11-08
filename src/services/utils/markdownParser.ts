import { createMarkdownFormatter, type FormatMarkdownOptions } from '../../utils/formatMarkdown';

const formatSectionMarkdown = createMarkdownFormatter({
  paragraphClassName: 'mb-4 last:mb-0',
  linkClassName: 'text-amber-400 hover:underline inline-flex items-center',
  fallbackText: 'N/A',
  fallbackClassName: 'muted',
});

export const formatSectionContent = (
  text: string | null | undefined,
  overrides?: FormatMarkdownOptions,
): string => formatSectionMarkdown(text, overrides);
