/* eslint-disable no-console */

export interface LoggerArgs {
  fileName?: string;
  type?: 'ERROR' | 'LOG';
  description?: string;
}

export const logger = (
  message: string | unknown,
  { fileName, description, type }: LoggerArgs = { type: 'ERROR' },
): void => {
  if (process.env.NODE_ENV === 'development') {
    console.log(
      `
        \n
        ----
        fileName: ${fileName ?? '-'},
        type: ${type ?? '-'},
        description: ${description ?? '-'},
        ----
        \n
        `,
      message,
    );
  }
};
