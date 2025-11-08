const DEFAULT_EXTERNAL_LINK_ICON =
  '<svg class="w-3 h-3 inline-block ml-1 opacity-80" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" /></svg>';

export type FormatMarkdownOptions = {
  paragraphClassName?: string;
  linkClassName?: string;
  linkTarget?: string;
  linkRel?: string;
  screenReaderLabel?: string | null;
  screenReaderClassName?: string;
  includeExternalIcon?: boolean;
  externalLinkIcon?: string;
  fallbackText?: string;
  fallbackClassName?: string;
  fallbackHtml?: string;
};

type FormatMarkdownResolvedOptions = Required<Omit<FormatMarkdownOptions, 'fallbackHtml'>> & {
  fallbackHtml?: string;
};

const DEFAULT_OPTIONS: FormatMarkdownResolvedOptions = {
  paragraphClassName: 'mb-4 last:mb-0',
  linkClassName: 'text-amber-400 hover:underline inline-flex items-center',
  linkTarget: '_blank',
  linkRel: 'noopener noreferrer',
  screenReaderLabel: '(opens in new tab)',
  screenReaderClassName: 'sr-only',
  includeExternalIcon: true,
  externalLinkIcon: DEFAULT_EXTERNAL_LINK_ICON,
  fallbackText: 'N/A',
  fallbackClassName: 'mb-4 text-slate-500',
};

const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const createClassAttribute = (className?: string): string =>
  className && className.trim().length > 0 ? ` class="${className}"` : '';

const resolveOptions = (options?: FormatMarkdownOptions): FormatMarkdownResolvedOptions => ({
  ...DEFAULT_OPTIONS,
  ...options,
});

export type MarkdownFormatter = (
  input: string | null | undefined,
  overrides?: FormatMarkdownOptions,
) => string;

export const formatMarkdown = (
  input: string | null | undefined,
  options?: FormatMarkdownOptions,
): string => {
  const resolved = resolveOptions(options);

  const {
    paragraphClassName,
    linkClassName,
    linkTarget,
    linkRel,
    screenReaderLabel,
    screenReaderClassName,
    includeExternalIcon,
    externalLinkIcon,
    fallbackText,
    fallbackClassName,
    fallbackHtml,
  } = resolved;

  const normalized = typeof input === 'string' ? input.trim() : '';

  if (!normalized) {
    if (fallbackHtml !== undefined) {
      return fallbackHtml;
    }

    const classAttribute = createClassAttribute(fallbackClassName);
    return `<p${classAttribute}>${escapeHtml(fallbackText)}</p>`;
  }

  const srSpan =
    typeof screenReaderLabel === 'string' && screenReaderLabel.length > 0
      ? `<span class="${screenReaderClassName}">${screenReaderLabel}</span>`
      : '';

  const icon = includeExternalIcon ? externalLinkIcon : '';

  const html = normalized
    .replace(/\[(.*?)\]\((.*?)\)/g, (_, label: string, url: string) => {
      const attributes = [
        `href="${escapeHtml(url)}"`,
        linkTarget ? `target="${linkTarget}"` : '',
        linkRel ? `rel="${linkRel}"` : '',
        createClassAttribute(linkClassName).trim(),
      ]
        .filter(Boolean)
        .join(' ');

      const classlessAttributes = attributes.length > 0 ? ` ${attributes}` : '';

      return `<a${classlessAttributes}>${label}${srSpan}${icon}</a>`;
    })
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

  return html
    .split('\n')
    .map(paragraph => paragraph.trim())
    .filter(paragraph => paragraph.length > 0)
    .map(paragraph => `<p${createClassAttribute(paragraphClassName)}>${paragraph}</p>`)
    .join('');
};

export const createMarkdownFormatter = (
  defaults?: FormatMarkdownOptions,
): MarkdownFormatter => {
  const base = resolveOptions(defaults);

  return (input, overrides) =>
    formatMarkdown(input, {
      ...base,
      ...overrides,
    });
};

export const DEFAULT_MARKDOWN_ICON = DEFAULT_EXTERNAL_LINK_ICON;
