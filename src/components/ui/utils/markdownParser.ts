import { formatMarkdown } from '../../../utils/formatMarkdown';

export const formatReportContent = (text: string | undefined | null): string =>
  formatMarkdown(text, {
    paragraphClassName: 'mb-4 last:mb-0',
    linkClassName: 'text-amber-400 hover:underline inline-flex items-center',
    fallbackText: 'N/A',
    fallbackClassName: 'mb-4 text-slate-500',
  });
