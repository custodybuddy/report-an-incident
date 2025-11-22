const INVALID_DATE_PLACEHOLDER = 'Invalid date';
const INVALID_TIME_PLACEHOLDER = 'Invalid time';

export const formatDate = (value: string, fallback = INVALID_DATE_PLACEHOLDER): string => {
  const trimmed = value?.trim();

  if (!trimmed) {
    return fallback;
  }

  return Number.isNaN(Date.parse(trimmed)) ? fallback : trimmed;
};

export const formatTime = (value: string, fallback = INVALID_TIME_PLACEHOLDER): string => {
  const trimmed = value?.trim();

  if (!trimmed) {
    return fallback;
  }

  // Prefix with a date to leverage Date parsing for time validation.
  return Number.isNaN(Date.parse(`1970-01-01T${trimmed}`)) ? fallback : trimmed;
};
