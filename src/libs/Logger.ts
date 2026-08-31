/* eslint-disable no-console */

const REDACTED_VALUE = '[REDACTED]';
const CIRCULAR_VALUE = '[Circular]';
const SENSITIVE_KEY_PATTERN = /authorization|cookie|token|password|secret|api[-_]?key/i;

export interface LoggerArgs {
  fileName?: string;
  functionCall?: string;
  type?: 'ERROR' | 'LOG';
  context?: Record<string, unknown>;
}

const sanitize = (value: unknown, seen = new WeakSet<object>()): unknown => {
  if (typeof value !== 'object' || value === null) return value;
  if (seen.has(value)) return CIRCULAR_VALUE;

  seen.add(value);

  if (Array.isArray(value)) {
    const sanitizedArray = value.map(item => sanitize(item, seen));
    seen.delete(value);
    return sanitizedArray;
  }

  const sanitizedObject = Object.entries(value).reduce<Record<string, unknown>>(
    (result, [key, item]) => {
      result[key] = SENSITIVE_KEY_PATTERN.test(key) ? REDACTED_VALUE : sanitize(item, seen);
      return result;
    },
    {},
  );
  seen.delete(value);
  return sanitizedObject;
};

export const logger = (message: unknown, options: LoggerArgs = {}): void => {
  if (process.env.NODE_ENV !== 'development') return;

  const { fileName, functionCall, context, type = 'ERROR' } = options;

  try {
    console.log(`[Chapar] ${type}`, message || '-');

    if (fileName || functionCall) {
      console.table({ fileName, functionCall });
    }

    if (context) {
      console.log('Context:', sanitize(context));
    }
  } catch {
    // Logging must never interfere with request error handling.
  }
};
