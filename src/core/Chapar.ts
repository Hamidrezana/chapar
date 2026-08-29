import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { logger } from '../libs/Logger';
import ChaparError from '../models/ChaparError';
import {
  ChaparMethod,
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
  private timeout: number;
  public authToken?: AuthToken;
  private authorizationKey: string;
  private successKey: keyof Response;
  private messageKey: keyof Response;
  private dataKey: keyof Response;
  private throwError: boolean;
  private defaultConfigs?: Partial<DefaultConfigs>;
  private successStatusCode = [200, 201];
  public headers?: Record<string, AnyType>;
  public onError?: OnErrorCallbackType<Response>;
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
    this.headers = {
      'Content-Type': 'application/json',
      ...(args.headers || {}),
    };
    this.timeout = (args.timeout || 5) * 1000;
    this.agent =
      args.agent ||
      axios.create({
        adapter: args.adapter,
        env: args.env as AxiosRequestConfig['env'],
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

  setupInterceptors(cbs: SetupInterceptorArgs<Response>) {
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

    this.agent.interceptors.response.use(
      response => {
        cbs.onResponseFulfilled?.(response as AxiosResponse<Response>);
        return response;
      },
      err => {
        const error = err as AxiosError<Response>;
        cbs.onResponseRejected?.(error);
        this.handleResponseStatus(error, cbs);
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
      method = 'get',
      body,
      headers = {},
      setToken,
      baseUrlType,
      throwError,
      callOnFail,
      callTimingFn,
      onUploadProgress,
      dto,
    } = configs;

    const finalUrl = this.createUrl(url, baseUrlType);
    const requestConfig = this.createRequestConfig(
      method,
      finalUrl,
      body,
      headers,
      setToken,
      onUploadProgress,
    );

    try {
      if (callTimingFn) {
        this.beforeRequest?.();
      }

      const response = await this.executeRequest(requestConfig);
      return this.createResponseResult<Result, ApiResponse>(response, dto, callOnFail, extraData);
    } catch (err) {
      return this.createErrorResult<Result>(err, throwError, extraData);
    } finally {
      if (callTimingFn) {
        this.afterRequest?.();
      }
    }
  }

  private createRequestConfig<Body>(
    method: ChaparMethod,
    url: string,
    body: Body | undefined,
    headers?: Record<string, AnyType>,
    setToken?: boolean,
    onUploadProgress?: (data: AnyType) => void,
  ): AxiosRequestConfig<Body> {
    const authorizationHeader = this.createAuthorizationHeader(setToken);

    return {
      method,
      url,
      data: method === 'get' ? undefined : body,
      headers: { ...(this.headers || {}), ...authorizationHeader, ...(headers || {}) },
      timeout: this.timeout,
      onUploadProgress,
    };
  }

  private createAuthorizationHeader(setToken?: boolean): Record<string, string> {
    if (!setToken) return {};

    const token = this.getAuthToken();
    return token ? { [this.authorizationKey]: token } : {};
  }

  private executeRequest(config: AxiosRequestConfig): Promise<AxiosResponse<Response>> {
    return this.agent.request<Response>(config);
  }

  private createResponseResult<Result, ApiResponse>(
    response: AxiosResponse<Response>,
    dto: SendChaparArgs<AnyType, ApiResponse, Result, BaseUrl, MData>['dto'],
    callOnFail?: boolean,
    extraData?: AnyType,
  ): SendChaparReturnType<Result, MData> {
    const isSuccess = this.isSuccess(response.status, response.data);
    if (!isSuccess && this.shouldCallOnFail(callOnFail)) {
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
  }

  private createErrorResult<Result>(
    err: unknown,
    throwError?: boolean,
    extraData?: AnyType,
  ): SendChaparReturnType<Result, MData> {
    const error = err as AxiosError<Response>;
    this.onError?.(error, extraData);
    logger(err, {
      fileName: 'Request Error',
      context: {
        method: error.config?.method,
        url: error.config?.url,
        timeout: error.config?.timeout,
        headers: error.config?.headers,
        statusCode: error.response?.status,
        statusText: error.response?.statusText,
        responseData: error.response?.data,
      },
    });

    if (this.shouldThrowError(throwError)) {
      throw new ChaparError({
        message: error.response?.data?.[this.messageKey] as unknown as string,
        statusCode: error.response?.status,
      });
    }

    return {
      success: false,
      statusCode: error.response?.status,
      data: null,
      metaData: null,
    };
  }

  private handleResponseStatus(
    error: AxiosError<Response>,
    cbs: SetupInterceptorArgs<Response>,
  ): void {
    const statusCode = error.response?.status;
    const result: SendChaparReturnType<AnyType> = {
      success: false,
      statusCode,
      data: null,
      metaData: null,
      message: error.response?.data?.[this.messageKey] as unknown as string,
    };

    switch (statusCode) {
      case 400:
        cbs.on400Callback?.(result);
        break;
      case 401:
        cbs.on401Callback?.(result);
        break;
      case 403:
        cbs.on403Callback?.(result);
        break;
      case 404:
        cbs.on404Callback?.(result);
        break;
      case 500:
        cbs.on500Callback?.(result);
        break;
    }
  }

  private shouldCallOnFail(callOnFail?: boolean): boolean {
    return !!((this.defaultConfigs?.callOnFail && callOnFail !== false) || callOnFail);
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
