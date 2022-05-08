/* eslint-disable @typescript-eslint/no-explicit-any */
import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import Utils from '../utils';
import { logger } from '../libs/Logger';
import {
  ChaparResponse,
  BaseUrlType,
  CreateUrlArgs,
  SendChaparArgs,
  SetupInterceptorArgs,
  SendChaparReturnType,
  ChaparConstructorArgs,
  OnErrorCallbackType,
  AuthToken,
  AuthTokenFunc,
} from '../types';

class Chapar<BaseUrl extends BaseUrlType = BaseUrlType> {
  public baseUrl?: BaseUrl;
  private agent: AxiosInstance;
  private successStatusCode = [200, 201];
  public onError?: OnErrorCallbackType;
  public authToken?: AuthToken;

  constructor({ baseUrl, authToken, onError }: ChaparConstructorArgs<BaseUrl>) {
    this.baseUrl = baseUrl;
    this.onError = onError;
    this.authToken = authToken;
    this.agent = axios.create({
      baseURL: Utils.TypeUtils.isString(baseUrl) ? (baseUrl as string) : undefined,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10000 * 5,
    });
  }

  setupInterceptors({ on401Callback }: SetupInterceptorArgs) {
    this.agent.interceptors.response.use(
      response => {
        return response;
      },
      error => {
        if (error?.response?.status === 401) {
          on401Callback?.();
        }

        return Promise.reject(error);
      },
    );
  }

  createUrl({ url, queries = {}, args = [] }: CreateUrlArgs<BaseUrl>): string {
    const basicUrl = [url, ...args].join('/');
    const queriesParams = [];
    for (let q in queries) {
      if (Utils.TypeUtils.isNil(queries[q])) continue;
      queriesParams.push(encodeURIComponent(q) + '=' + encodeURIComponent(queries[q]!));
    }
    if (queriesParams.length > 0) {
      return `${basicUrl}?${queriesParams.join('&')}`;
    }
    return basicUrl;
  }

  async sendChapar<Result = any, Response = any, Body = Record<string, any>>(
    url: string | CreateUrlArgs<BaseUrl>,
    configs: SendChaparArgs<Body, Response, Result> = { method: 'get', headers: {} },
  ): Promise<SendChaparReturnType<Result>> {
    const { method, body, headers, setToken, dto } = configs;
    let response: AxiosResponse<ChaparResponse<Response>>;
    const finalUrl = typeof url === 'string' ? url : this.createUrl(url);
    const finalHeaders = headers || {};
    if (setToken) {
      const token = this.getAuthToken();
      if (token) {
        finalHeaders.Authorization = token;
      }
    }
    try {
      const config: AxiosRequestConfig = {
        headers: finalHeaders,
      };
      switch (method) {
        case 'post':
        case 'put':
          response = await this.agent[method](finalUrl, body, config);
          break;
        case 'delete':
          response = await this.agent.delete(finalUrl, {
            data: body,
            ...config,
          });
          break;
        case 'get':
        default:
          response = await this.agent.get(finalUrl, config);
          break;
      }
      const isSuccess = !!(this.isSuccessStatus(response.status) || response.data.success);
      const finalData: Response = response.data.data || (response.data as unknown as Response);
      return {
        success: isSuccess,
        data: dto ? dto(finalData) : (finalData as unknown as Result),
        message: response.data.message,
      };
    } catch (err) {
      const error = err as AxiosError<ChaparResponse<Response>>;
      this.onError?.(error);
      logger(err, {
        fileName: 'Request Error',
        description: JSON.stringify(error?.config),
      });
      return {
        success: false,
        data: null,
      };
    }
  }

  private isSuccessStatus(statusCode: number) {
    return this.successStatusCode.includes(statusCode);
  }

  private getAuthToken(): string | undefined {
    if (Utils.TypeUtils.isString(this.authToken)) {
      return this.authToken as string;
    }
    if (Utils.TypeUtils.isFunction(this.authToken)) {
      return (this.authToken as AuthTokenFunc)();
    }
    return undefined;
  }
}

export default Chapar;
