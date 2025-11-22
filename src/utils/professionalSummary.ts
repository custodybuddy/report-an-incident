import { formatDate } from './dateTime';

export const normalizeProfessionalSummary = (
  summary: string | undefined,
  date: string,
  severity: string,
  category: string
): string => {
  const trimmed = (summary ?? '').trim();
  const sentences = trimmed.split(/(?<=\.)\s+/).filter(Boolean);
  const first = sentences[0] ?? '';
  const occurredTail = first.match(/occurred\s*(.*)$/i)?.[1]?.trim() ?? '';
  const remainder = sentences.slice(1).join(' ').trim();
  const tailParts = [occurredTail, remainder].filter(Boolean);

  const baseIntro = `On ${formatDate(date, 'the reported date')}, a ${(severity || 'reported').toLowerCase()}-severity ${
    category || 'incident'
  } occurred`;
  const tail = tailParts.length ? ` ${tailParts.join(' ')}` : '';
  const normalized = `${baseIntro}${tail}`;

  return normalized.endsWith('.') ? normalized : `${normalized}.`;
};
