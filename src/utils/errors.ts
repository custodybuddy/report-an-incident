export const createTimeoutError = (message = 'Request timed out') =>
  new DOMException(message, 'TimeoutError');

export const isTimeoutError = (reason: unknown): boolean =>
  reason instanceof DOMException && reason.name === 'TimeoutError';
