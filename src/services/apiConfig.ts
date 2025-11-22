const normalizeBaseUrl = (value: string): string => value.replace(/\/$/, '');

const getEnvApiBaseUrl = (): string | undefined => {
  const env = typeof import.meta !== 'undefined' ? import.meta.env?.VITE_REPORT_API_URL : undefined;
  const processEnv = typeof process !== 'undefined' ? process.env?.VITE_REPORT_API_URL : undefined;
  return env || processEnv || undefined;
};

const canUseLocalProxy = (): boolean => {
  if (typeof window === 'undefined') {
    return false;
  }
  const host = window.location.hostname;
  return host === 'localhost' || host === '127.0.0.1';
};

export const assertApiBaseUrl = (): string => {
  const envValue = getEnvApiBaseUrl();
  if (envValue) {
    return normalizeBaseUrl(envValue);
  }

  if (canUseLocalProxy()) {
    return 'http://127.0.0.1:8788/api';
  }

  throw new Error(
    'Report API base URL is not configured. Set VITE_REPORT_API_URL or run the app on localhost to use the dev proxy (http://127.0.0.1:8788/api).'
  );
};
