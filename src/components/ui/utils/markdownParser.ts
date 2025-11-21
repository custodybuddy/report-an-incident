import { convertMarkdownToHtml } from '../../../utils/markdown';

const FALLBACK_MARKUP = '<p class="mb-4 text-slate-500">N/A</p>';

export const formatReportContent = (text: string | undefined | null): string => {
  const html = convertMarkdownToHtml(text ?? '');
  return html || FALLBACK_MARKUP;
};
