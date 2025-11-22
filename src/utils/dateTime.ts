export const formatDate = (value: string, fallback = 'N/A'): string => {
  const trimmed = value?.trim();
  return trimmed ? trimmed : fallback;
};

export const formatTime = (value: string, fallback = 'N/A'): string => {
  const trimmed = value?.trim();
  return trimmed ? trimmed : fallback;
};
