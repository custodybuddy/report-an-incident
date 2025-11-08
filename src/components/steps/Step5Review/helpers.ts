import { formatReportContent } from '../../ui/utils/markdownParser';

export type LegalReference = { label: string; url: string; context?: string };

const isSentenceBoundary = (char: string) => /[.!?]/.test(char);

const sanitizeMarkdownText = (text: string): string =>
  text
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\[(.*?)\]\((.*?)\)/g, '$1')
    .replace(/`/g, '')
    .trim();

export const extractMarkdownLinks = (markdown?: string): LegalReference[] => {
  if (!markdown) {
    return [];
  }

  const regex = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g;
  const links: LegalReference[] = [];
  const seen = new Set<string>();
  let match: RegExpExecArray | null;

  while ((match = regex.exec(markdown)) !== null) {
    const [fullMatch, label, url] = match;
    if (seen.has(url)) continue;
    seen.add(url);

    let start = match.index;
    while (start > 0) {
      const prevChar = markdown[start - 1];
      if (isSentenceBoundary(prevChar) || prevChar === '\n') break;
      start -= 1;
    }

    let end = match.index + fullMatch.length;
    while (end < markdown.length) {
      const nextChar = markdown[end];
      if (isSentenceBoundary(nextChar)) {
        end += 1;
        break;
      }
      if (nextChar === '\n') break;
      end += 1;
    }

    const context = sanitizeMarkdownText(markdown.slice(start, end).trim());
    links.push({ label: label.trim(), url, context });
  }

  return links;
};

export const isCaseLawSource = (url: string): boolean =>
  /(canlii|court|appeal|uscourts|supreme|tribunal|judgment|caselaw|gov\.uk\/guidance)/i.test(url);

export const deriveReadableTitle = (url: string): string => {
  try {
    const parsed = new URL(url);
    const hostname = parsed.hostname.replace(/^www\./, '');
    const segments = parsed.pathname.split('/').filter(Boolean);
    if (segments.length === 0) {
      return hostname;
    }
    const candidate = decodeURIComponent(segments[segments.length - 1])
      .replace(/\.[a-z]+$/i, '')
      .replace(/[-_]/g, ' ')
      .trim();
    return candidate.length > 3 ? candidate : hostname;
  } catch {
    return url;
  }
};

export const getDomainFromUrl = (url: string): string => {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    const parts = url.split('/');
    return parts[2] || url;
  }
};

export const formatHtml = (content?: string) => formatReportContent(content ?? '');

export const createHtml = (html: string, emptyFallback = 'Information is not yet available.') => ({
  __html: html || `<p class="text-[#CFCBBF]">${emptyFallback}</p>`,
});
