type DateInput = Date | string | number | undefined;

const normalizeDate = (input?: DateInput): Date => {
  if (!input) {
    return new Date();
  }

  if (input instanceof Date) {
    return input;
  }

  if (typeof input === 'number') {
    return new Date(input);
  }

  return new Date(input);
};

export const formatTimestamp = (
  input?: DateInput,
  options?: Intl.DateTimeFormatOptions,
  locale?: string
): string => {
  const date = normalizeDate(input);
  return new Intl.DateTimeFormat(locale, options).format(date);
};

const generatedTimestampOptions: Intl.DateTimeFormatOptions = {
  dateStyle: 'medium',
  timeStyle: 'short',
};

export const formatGeneratedTimestamp = (input?: DateInput, locale?: string): string =>
  formatTimestamp(input, generatedTimestampOptions, locale);

export default {
  formatGeneratedTimestamp,
  formatTimestamp,
};
