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
  MetaDataDtoFuncType,
} from '../types';
import Utils from '../utils';

class Chapar<
  BaseUrl extends BaseUrlType = BaseUrlType,
  MetaDataResponse = AnyType,
  MetaData = AnyType,
> {
  public baseUrl?: BaseUrl;
  private agent: AxiosInstance;
  public authToken?: AuthToken;
  private authorizationKey: string;
  private successStatusCode = [200, 201];
  public onError?: OnErrorCallbackType;
  public metaDataDto?: MetaDataDtoFuncType<MetaDataResponse, MetaData>;

  constructor({
    baseUrl,
    authToken,
    authorizationKey,
    timeout,
    onError,
    metaDataDto,
  }: ChaparConstructorArgs<BaseUrl, MetaDataResponse, MetaData>) {
    this.baseUrl = baseUrl;
    this.authToken = authToken;
    this.authorizationKey = authorizationKey || 'Authorization';
    this.agent = axios.create({
      baseURL: Utils.TypeUtils.isString(baseUrl) ? (baseUrl as string) : undefined,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: (timeout || 5) * 1000,
    });
    this.metaDataDto = metaDataDto;
    this.onError = onError;
  }

  setupInterceptors({
    on400Callback,
    on401Callback,
    on404Callback,
    on500Callback,
  }: SetupInterceptorArgs<AnyType, AnyType>) {
    this.agent.interceptors.response.use(
      response => {
        return response;
      },
      error => {
        const statusCode = error?.response?.status;
        const res: SendChaparReturnType<AnyType, AnyType> = {
          success: false,
          data: null,
          metaData: null,
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

  async sendChapar<Result = AnyType, Response = AnyType, Body = Record<string, AnyType>>(
    url: string | CreateUrlArgs<BaseUrl>,
    configs: SendChaparArgs<Body, Response, Result, BaseUrl>,
  ): Promise<SendChaparReturnType<Result, MetaData>> {
    const { method, body, headers, setToken, baseUrlType, dto } = {
      ...{ method: 'get', headers: {} },
      ...configs,
    };

    let response: AxiosResponse<ChaparResponse<Response>>;
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
      const isSuccess = !!(this.isSuccessStatus(response.status) || response.data.success);
      const finalData: Response = response.data.data || (response.data as unknown as Response);
      return {
        success: isSuccess,
        statusCode: response.status,
        data: dto ? dto(finalData) : (finalData as unknown as Result),
        message: response.data.message,
        metaData:
          response.data.metaData && this.metaDataDto
            ? this.metaDataDto?.(response.data.metaData)
            : null,
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
        statusCode: error.response?.status,
        data: null,
        metaData: null,
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
