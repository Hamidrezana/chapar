/* eslint-disable @typescript-eslint/no-explicit-any */
import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import Utils from '../utils';
import { logger } from '../libs/Logger';
import {
  Response,
  BaseUrlType,
  CreateUrlArgs,
  SendChaparArgs,
  SetupInterceptorArgs,
  SendChaparReturnType,
} from '../types';

class Chapar<TBaseUrlType extends BaseUrlType = BaseUrlType> {
  private agent: AxiosInstance;
  private successStatusCode = [200, 201];

  constructor(public baseUrl?: TBaseUrlType) {
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

  createUrl({ url, queries = [], args = [] }: CreateUrlArgs<TBaseUrlType>): string {
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

  /**
   * @template T => Final Data (Result)
   * @template R => Chapar Response (Response)
   * @template B => Chapar Body (Body)
   */
  async sendChapar<T = any, R = any, B = Record<string, any>>(
    url: string,
    configs: SendChaparArgs<B, R, T, TBaseUrlType> = { method: 'get', headers: {} },
  ): Promise<SendChaparReturnType<T>> {
    const { method, body, headers, urlProps, dto } = configs;
    let response: AxiosResponse<Response<R>>;
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
        case 'get':
        default:
          response = await this.agent.get(finalUrl, config);
          break;
      }
      const isSuccess = !!(this.isSuccessStatus(response.status) || response.data.success);
      const finalData: R = response.data.data || (response.data as unknown as R);
      return {
        success: isSuccess,
        data: dto ? dto(finalData) : (finalData as unknown as T),
        message: response.data.message,
      };
    } catch (err) {
      const error = err as AxiosError<Response<R>>;
      // if (error?.response?.data.message) {
      //   showSnackbar({ message: error.response?.data.message, variant: 'error' });
      // }
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
