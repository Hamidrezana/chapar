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
} from '../types';

class Chapar<BaseUrl extends BaseUrlType = BaseUrlType> {
  public baseUrl?: BaseUrl;
  private agent: AxiosInstance;
  private successStatusCode = [200, 201];
  public onError?: OnErrorCallbackType;

  constructor({ baseUrl, onError }: ChaparConstructorArgs<BaseUrl>) {
    this.baseUrl = baseUrl;
    this.onError = onError;
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

  createUrl({ url, queries = [], args = [] }: CreateUrlArgs<BaseUrl>): string {
    let finalUrl = [url, ...args].join('/');

    queries.forEach((query, i) => {
      if (queries[i].value) {
        if (i === 0) {
          finalUrl += '?';
        }
        finalUrl += `${query.key}=${query.value}`;
        if (i !== queries.length - 1) {
          finalUrl += '&';
        }
      }
    });
    return finalUrl;
  }

  async sendChapar<Result = any, Response = any, Body = Record<string, any>>(
    url: string,
    configs: SendChaparArgs<Body, Response, Result, BaseUrl> = { method: 'get', headers: {} },
  ): Promise<SendChaparReturnType<Result>> {
    const { method, body, headers, urlProps, dto } = configs;
    let response: AxiosResponse<ChaparResponse<Response>>;
    const finalUrl = urlProps ? this.createUrl({ url, ...urlProps }) : url;
    try {
      const config: AxiosRequestConfig = {
        headers,
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
}

export default Chapar;
