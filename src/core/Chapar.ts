import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
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
  AnyType,
  BaseUrlTypeExtractor,
  MultipleBaseUrlType,
  CheckStatusFuncType,
} from '../types';
import Utils from '../utils';

class Chapar<BaseUrl extends BaseUrlType = BaseUrlType, Response = ChaparResponse> {
  public baseUrl?: BaseUrl;
  private agent: AxiosInstance;
  public authToken?: AuthToken;
  private authorizationKey: string;
  private successKey: keyof Response;
  private messageKey: keyof Response;
  private dataKey: keyof Response;
  private successStatusCode = [200, 201];
  public onError?: OnErrorCallbackType;
  public checkStatusFuncType?: CheckStatusFuncType<Response>;

  constructor({
    baseUrl,
    authToken,
    authorizationKey,
    dataKey,
    messageKey,
    successKey,
    timeout,
    onError,
    checkStatusFunc,
  }: ChaparConstructorArgs<BaseUrl, Response>) {
    this.baseUrl = baseUrl;
    this.authToken = authToken;
    this.authorizationKey = authorizationKey || 'Authorization';
    this.messageKey = messageKey || ('message' as keyof Response);
    this.dataKey = dataKey || ('data' as keyof Response);
    this.successKey = successKey || ('success' as keyof Response);
    this.agent = axios.create({
      baseURL: Utils.TypeUtils.isString(baseUrl) ? (baseUrl as string) : undefined,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: (timeout || 5) * 1000,
    });
    this.onError = onError;
    this.checkStatusFuncType = checkStatusFunc;
  }

  setupInterceptors({
    on400Callback,
    on401Callback,
    on404Callback,
    on500Callback,
  }: SetupInterceptorArgs<AnyType>) {
    this.agent.interceptors.response.use(
      response => {
        return response;
      },
      error => {
        const statusCode = error?.response?.status;
        const res: SendChaparReturnType<AnyType> = {
          success: false,
          data: null,
          message: error?.response?.data?.message,
        };
        switch (statusCode) {
          case 400:
            on400Callback?.(res);
            break;
          case 401:
            on401Callback?.(res);
            break;
          case 404:
            on404Callback?.(res);
            break;
          case 500:
            on500Callback?.(res);
            break;
        }

        return Promise.reject(error);
      },
    );
  }

  createUrl(
    urlProps: string | CreateUrlArgs<BaseUrl>,
    baseUrlType?: BaseUrlTypeExtractor<BaseUrl>,
  ): string {
    let finalBaseUrlType: BaseUrlType;
    if (typeof this.baseUrl === 'string') {
      finalBaseUrlType = this.baseUrl;
    } else if (baseUrlType) {
      finalBaseUrlType = (this.baseUrl as MultipleBaseUrlType)?.[baseUrlType as string] as string;
    } else {
      finalBaseUrlType = Object.values(this.baseUrl || {})?.[0];
    }

    if (typeof urlProps === 'string') return `${finalBaseUrlType}/${urlProps}`;
    const { url, queries = {}, args = [] } = urlProps;
    const basicUrl = [url, ...args].join('/');
    const queriesParams: Array<string> = [];
    Object.keys(queries || {}).forEach(q => {
      if (!Utils.TypeUtils.isNil(queries[q])) {
        queriesParams.push(`${encodeURIComponent(q)}=${encodeURIComponent(queries[q] as string)}`);
      }
    });

    if (queriesParams.length > 0) {
      return `${finalBaseUrlType || ''}/${basicUrl}?${queriesParams.join('&')}`;
    }
    return `${finalBaseUrlType}/${basicUrl}`;
  }

  async sendChapar<Result = AnyType, ApiResponse = AnyType, Body = Record<string, AnyType>>(
    url: string | CreateUrlArgs<BaseUrl>,
    configs: SendChaparArgs<Body, ApiResponse, Result, BaseUrl>,
  ): Promise<SendChaparReturnType<Result>> {
    const { method, body, headers, setToken, baseUrlType, dto } = {
      ...{ method: 'get', headers: {} },
      ...configs,
    };

    let response: AxiosResponse<Response>;
    const finalUrl = this.createUrl(url, baseUrlType);
    const finalHeaders = headers || {};
    if (setToken) {
      const token = this.getAuthToken();
      if (token) {
        finalHeaders[this.authorizationKey] = token;
      }
    }
    try {
      const config: AxiosRequestConfig = {
        headers: finalHeaders,
      };
      switch (method) {
        case 'post':
        case 'put':
        case 'patch':
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
      const isSuccess = this.isSuccess(response.status, response.data);
      const finalData: ApiResponse =
        (response.data[this.dataKey] as unknown as ApiResponse) ||
        (response.data as unknown as ApiResponse);
      return {
        success: isSuccess,
        statusCode: response.status,
        data: dto ? dto(finalData) : (finalData as unknown as Result),
        message: response.data[this.messageKey] as unknown as string,
      };
    } catch (err) {
      const error = err as AxiosError<ChaparResponse<ApiResponse>>;
      this.onError?.(error);
      logger(err, {
        fileName: 'Request Error',
        description: JSON.stringify(error?.config),
      });
      return {
        success: false,
        statusCode: error.response?.status,
        data: null,
      };
    }
  }

  private isSuccess(statusCode: number, response: Response) {
    if (this.checkStatusFuncType && Utils.TypeUtils.isFunction(this.checkStatusFuncType)) {
      return this.checkStatusFuncType(statusCode, response);
    }
    return !!(this.successStatusCode.includes(statusCode) || response[this.successKey]);
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
