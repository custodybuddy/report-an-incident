const normalizeBaseUrl = (value: string): string => value.replace(/\/$/, '');

const getEnvApiBaseUrl = (): string | undefined => {
  const env = typeof import.meta !== 'undefined' ? import.meta.env?.VITE_REPORT_API_URL : undefined;
  const processEnv = typeof process !== 'undefined' ? process.env?.VITE_REPORT_API_URL : undefined;
  return env || processEnv || undefined;
};

const resolvedApiBaseUrl = (() => {
  const envValue = getEnvApiBaseUrl();
  return envValue ? normalizeBaseUrl(envValue) : undefined;
})();

export const assertApiBaseUrl = (): string => {
  if (resolvedApiBaseUrl) {
    return resolvedApiBaseUrl;
  }

  throw new Error(
    'Report API base URL is not configured. Set VITE_REPORT_API_URL in your environment (e.g., .env or .env.local).'
  );
};
