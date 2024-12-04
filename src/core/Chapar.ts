import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { logger } from '../libs/Logger';
import ChaparError from '../models/ChaparError';
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
  MetaDataFnType,
  OnFailCallbackType,
  DefaultConfigs,
} from '../types';
import Utils from '../utils';

class Chapar<
  BaseUrl extends BaseUrlType = BaseUrlType,
  Response = ChaparResponse,
  MData = AnyType,
> {
  public baseUrl?: BaseUrl;
  private agent: AxiosInstance;
  public authToken?: AuthToken;
  private authorizationKey: string;
  private successKey: keyof Response;
  private messageKey: keyof Response;
  private dataKey: keyof Response;
  private throwError: boolean;
  private defaultConfigs?: Partial<DefaultConfigs>;
  private successStatusCode = [200, 201];
  public headers?: Record<string, AnyType>;
  public onError?: OnErrorCallbackType;
  public checkStatusFuncType?: CheckStatusFuncType<Response>;
  public metaDataFn?: MetaDataFnType<Response, MData>;
  public onFail?: OnFailCallbackType<Response>;
  public beforeRequest?: VoidFunction;
  public afterRequest?: VoidFunction;

  constructor(args: ChaparConstructorArgs<BaseUrl, Response, MData>) {
    this.baseUrl = args.baseUrl;
    this.authToken = args.authToken;
    this.authorizationKey = args.authorizationKey || 'Authorization';
    this.messageKey = args.messageKey || ('message' as keyof Response);
    this.dataKey = args.dataKey || ('data' as keyof Response);
    this.successKey = args.successKey || ('success' as keyof Response);
    this.agent = axios.create({
      baseURL: Utils.TypeUtils.isString(args.baseUrl) ? (args.baseUrl as string) : undefined,
      headers: {
        'Content-Type': 'application/json',
        ...(args.headers || {}),
      },
      timeout: (args.timeout || 5) * 1000,
    });
    this.throwError = !!args.throwError;
    this.defaultConfigs = args.defaultConfigs;
    this.onError = args.onError;
    this.checkStatusFuncType = args.checkStatusFunc;
    this.metaDataFn = args.metaDataFn;
    this.onFail = args.onFail;
    this.beforeRequest = args.beforeRequest;
    this.afterRequest = args.afterRequest;
  }

  setupInterceptors(cbs: SetupInterceptorArgs<AnyType>) {
    this.agent.interceptors.request.use(
      config => {
        cbs.onRequestFulfilled?.(config);
        return config;
      },
      error => {
        cbs.onRequestRejected?.(error);
        return Promise.reject(error);
      },
    );
    this.agent.interceptors.response.use<AxiosResponse<Response>>(
      response => {
        cbs.onResponseFulfilled?.(response);
        return response;
      },
      error => {
        cbs.onResponseRejected?.(error.toJSON());
        const statusCode = error?.response?.status;
        const res: SendChaparReturnType<AnyType> = {
          success: false,
          data: null,
          metaData: null,
          message: error?.response?.data?.[this.messageKey],
        };
        switch (statusCode) {
          case 400:
            cbs.on400Callback?.(res);
            break;
          case 401:
            cbs.on401Callback?.(res);
            break;
          case 403:
            cbs.on403Callback?.(res);
            break;
          case 404:
            cbs.on404Callback?.(res);
            break;
          case 500:
            cbs.on500Callback?.(res);
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
    extraData?: AnyType,
  ): Promise<SendChaparReturnType<Result, MData>> {
    const {
      method,
      body,
      headers,
      setToken,
      baseUrlType,
      throwError,
      callOnFail,
      callTimingFn,
      onUploadProgress,
      dto,
    } = {
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
        onUploadProgress,
      };
      if (callTimingFn) {
        this.beforeRequest?.();
      }
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
      if (!isSuccess && ((this.defaultConfigs?.callOnFail && callOnFail !== false) || callOnFail)) {
        this.onFail?.(response.data, extraData);
      }
      const finalData: ApiResponse =
        (response.data[this.dataKey] as unknown as ApiResponse) ||
        (response.data as unknown as ApiResponse);

      const metaData = this.metaDataFn?.(response.data);
      return {
        success: isSuccess,
        statusCode: response.status,
        data: dto ? dto(finalData, metaData) : (finalData as unknown as Result),
        metaData: metaData || null,
        message: response.data[this.messageKey] as unknown as string,
      };
    } catch (err) {
      const error = err as AxiosError<ChaparResponse<ApiResponse>>;
      this.onError?.(error, extraData);
      logger(err, {
        fileName: 'Request Error',
        description: JSON.stringify(error?.config),
      });
      if (this.shouldThrowError(throwError)) {
        throw new ChaparError({
          message: error.response?.data.message,
          statusCode: error.response?.status,
        });
      }
      return {
        success: false,
        statusCode: error.response?.status,
        data: null,
        metaData: null,
      };
    } finally {
      if (callTimingFn) {
        this.afterRequest?.();
      }
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

  private shouldThrowError(th?: boolean) {
    return !!th || !!this.throwError;
  }
}

export default Chapar;
