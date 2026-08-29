import axios, {
  AxiosAdapter,
  AxiosError,
  AxiosHeaders,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios';
import Chapar from '../src';

describe('Axios adapter support', () => {
  it('uses a custom Axios adapter with native Axios interceptors', async () => {
    const transport = jest.fn(async (config: InternalAxiosRequestConfig) => ({
      config,
      data: { success: true, data: { id: 1 } },
      headers: new AxiosHeaders(),
      status: 200,
      statusText: 'OK',
    })) as AxiosAdapter;
    const onResponseFulfilled = jest.fn();
    const chapar = new Chapar({
      baseUrl: 'https://api.example.com',
      adapter: transport,
    });

    chapar.setupInterceptors({
      onRequestFulfilled: config => {
        config.headers.set('X-Intercepted', 'yes');
      },
      onResponseFulfilled,
    });
    const response = await chapar.sendChapar<{ id: number }>('items', {});

    const requestConfig = (transport as jest.Mock).mock.calls[0][0] as InternalAxiosRequestConfig;
    expect(requestConfig.headers.get('X-Intercepted')).toBe('yes');
    expect(response.data).toEqual({ id: 1 });
    expect(onResponseFulfilled).toHaveBeenCalledTimes(1);
  });

  it('runs Axios rejection and status interceptors', async () => {
    const transport: AxiosAdapter = async config => {
      const response: AxiosResponse = {
        config,
        data: { success: false, data: null, message: 'Unauthorized' },
        headers: new AxiosHeaders(),
        status: 401,
        statusText: 'Unauthorized',
      };
      throw new AxiosError(
        'Request failed with status code 401',
        AxiosError.ERR_BAD_REQUEST,
        config,
        undefined,
        response,
      );
    };
    const onResponseRejected = jest.fn();
    const on401Callback = jest.fn();
    const chapar = new Chapar({ baseUrl: 'https://api.example.com', adapter: transport });

    chapar.setupInterceptors({ onResponseRejected, on401Callback });
    const response = await chapar.sendChapar('private', {});

    expect(response).toEqual(
      expect.objectContaining({ success: false, statusCode: 401, data: null }),
    );
    expect(onResponseRejected).toHaveBeenCalledTimes(1);
    expect(on401Callback).toHaveBeenCalledWith(
      expect.objectContaining({ statusCode: 401, message: 'Unauthorized' }),
    );
  });

  it('supports a custom Fetch implementation through the Axios Fetch adapter', async () => {
    const customFetch = jest.fn(async () => ({
      status: 200,
      statusText: 'OK',
      headers: { 'content-type': 'application/json' },
      text: async () => JSON.stringify({ success: true, data: { id: 1 } }),
    }));
    const onResponseFulfilled = jest.fn();
    const chapar = new Chapar({
      baseUrl: 'https://api.example.com',
      adapter: 'fetch',
      env: {
        fetch: customFetch,
        Request: null,
        Response: null,
      },
    });

    chapar.setupInterceptors({ onResponseFulfilled });
    const response = await chapar.sendChapar<{ id: number }>('items', {});

    expect(customFetch).toHaveBeenCalledWith(
      'https://api.example.com/items',
      expect.objectContaining({ method: 'GET' }),
    );
    expect(response.data).toEqual({ id: 1 });
    expect(onResponseFulfilled).toHaveBeenCalledTimes(1);
  });

  it('accepts a preconfigured Axios instance', async () => {
    const transport = jest.fn(async (config: InternalAxiosRequestConfig) => ({
      config,
      data: { success: true, data: { source: 'agent' } },
      headers: new AxiosHeaders(),
      status: 200,
      statusText: 'OK',
    })) as AxiosAdapter;
    const agent = axios.create({ adapter: transport });
    const chapar = new Chapar({ baseUrl: 'https://api.example.com', agent });

    const response = await chapar.sendChapar<{ source: string }>('items', {});

    expect(response.data).toEqual({ source: 'agent' });
    expect(transport).toHaveBeenCalledTimes(1);
  });
});
