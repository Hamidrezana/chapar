import { logger } from '../src/libs/Logger';

describe('Logger', () => {
  const originalNodeEnv = process.env.NODE_ENV;

  beforeEach(() => {
    process.env.NODE_ENV = 'development';
  });

  afterEach(() => {
    if (originalNodeEnv === undefined) {
      delete process.env.NODE_ENV;
    } else {
      process.env.NODE_ENV = originalNodeEnv;
    }
    jest.restoreAllMocks();
  });

  it('logs readable context and redacts sensitive values', () => {
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    const logSpy = jest.spyOn(console, 'log').mockImplementation(() => undefined);
    jest.spyOn(console, 'table').mockImplementation(() => undefined);

    logger(new Error('Request failed'), {
      fileName: 'Request Error',
      context: {
        method: 'get',
        headers: {
          Authorization: 'Bearer secret',
          'X-Request-Id': 'request-id',
        },
        responseData: {
          apiKey: 'secret',
          message: 'Unauthorized',
        },
      },
    });

    expect(logSpy).toHaveBeenCalledWith('[Chapar] ERROR', expect.any(Error));
    expect(logSpy).toHaveBeenCalledWith('Context:', {
      method: 'get',
      headers: {
        Authorization: '[REDACTED]',
        'X-Request-Id': 'request-id',
      },
      responseData: {
        apiKey: '[REDACTED]',
        message: 'Unauthorized',
      },
    });
  });

  it('does not throw when context contains circular values', () => {
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    jest.spyOn(console, 'log').mockImplementation(() => undefined);
    jest.spyOn(console, 'table').mockImplementation(() => undefined);

    const context: Record<string, unknown> = {};
    context.circular = context;

    expect(() => logger('Request failed', { context })).not.toThrow();
  });
});
