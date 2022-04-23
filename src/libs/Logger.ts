/* eslint-disable no-console */

export interface LoggerArgs {
  fileName?: string;
  functionCall?: string;
  type?: 'ERROR' | 'LOG';
  description?: string;
}

export const logger = (
  message: string | unknown,
  { fileName, functionCall, description, type }: LoggerArgs = { type: 'ERROR' },
): void => {
  if (process.env.NODE_ENV !== 'development') return
  console.log('message: ', message || '-');
  console.table({ fileName, functionCall, type, description });
};
