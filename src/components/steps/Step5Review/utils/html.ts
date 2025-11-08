import { formatReportContent } from '../../../ui/utils/markdownParser';

export const formatHtmlContent = (content?: string | null) =>
  formatReportContent(content ?? '');

export const renderHtmlWithFallback = (html: string, fallback: string) => ({
  __html: html || `<p class="text-[#CFCBBF]">${fallback}</p>`,
});
