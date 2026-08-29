import {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios';

export type QueryType = Record<string, string | number | null | undefined>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyType = any;
export type ChaparMethod = 'get' | 'post' | 'put' | 'delete' | 'patch';
type AxiosEnvironment = NonNullable<AxiosRequestConfig['env']>;
export type ChaparAxiosEnvironment = Omit<AxiosEnvironment, 'fetch' | 'Request' | 'Response'> & {
  fetch?: (input: AnyType, init?: AnyType) => Promise<AnyType>;
  Request?: AxiosEnvironment['Request'] | null;
  Response?: AxiosEnvironment['Response'] | null;
};

export interface ChaparResponse<Data = AnyType> {
  success: boolean;
  data: Data;
  message?: string;
}

export type MultipleBaseUrlType = Record<string, string>;
export type BaseUrlType = string | MultipleBaseUrlType;
export type OnErrorCallbackType<Response = AnyType> = (
  err: AxiosError<Response>,
  extraData?: AnyType,
) => void;
export type OnFailCallbackType<Response> = (response: Response, extraData?: AnyType) => void;
export type OnResponseFulfilled<Response> = (response: AxiosResponse<Response>) => void;
export type OnResponseRejected<Response> = (error: AxiosError<Response>) => void;
export type OnRequestFulfilled = (config: InternalAxiosRequestConfig) => void;
export type OnRequestRejected = (error: Error) => void;
export type CheckStatusFuncType<Response> = (statusCode: number, response: Response) => boolean;
export type MetaDataFnType<Response, MData> = (response: Response) => MData;
export type BaseUrlTypeExtractor<BaseUrl> = Extract<
  BaseUrl,
  MultipleBaseUrlType | undefined
> extends never
  ? BaseUrl
  : keyof BaseUrl;

export interface DefaultConfigs {
  callOnFail: boolean;
}

export interface ChaparConstructorArgs<
  BaseUrl,
  Response = ChaparResponse<AnyType>,
  MData = AnyType,
> {
  baseUrl?: BaseUrl;
  agent?: AxiosInstance;
  adapter?: AxiosRequestConfig['adapter'];
  env?: ChaparAxiosEnvironment;
  authToken?: AuthToken;
  timeout?: number;
  authorizationKey?: string;
  throwError?: boolean;
  successKey?: keyof Response;
  headers?: Record<string, AnyType>;
  dataKey?: keyof Response;
  messageKey?: keyof Response;
  defaultConfigs?: Partial<DefaultConfigs>;
  onError?: OnErrorCallbackType<Response>;
  checkStatusFunc?: CheckStatusFuncType<Response>;
  metaDataFn?: MetaDataFnType<Response, MData>;
  onFail?: OnFailCallbackType<Response>;
  beforeRequest?: VoidFunction;
  afterRequest?: VoidFunction;
}

export interface CreateUrlArgs<BaseUrl = string> {
  url: string;
  baseUrlType?: BaseUrlTypeExtractor<BaseUrl>;
  args?: Array<string>;
  queries?: QueryType;
}

export interface SetupAgentArgs {
  baseUrl: string;
}

export interface SetupInterceptorArgs<Data> {
  onResponseFulfilled?: OnResponseFulfilled<Data>;
  onResponseRejected?: OnResponseRejected<Data>;
  onRequestFulfilled?: OnRequestFulfilled;
  onRequestRejected?: OnRequestRejected;
  on400Callback?: (result: SendChaparReturnType<Data>) => void;
  on401Callback?: (result: SendChaparReturnType<Data>) => void;
  on403Callback?: (result: SendChaparReturnType<Data>) => void;
  on404Callback?: (result: SendChaparReturnType<Data>) => void;
  on500Callback?: (result: SendChaparReturnType<Data>) => void;
}

export interface SendChaparArgs<
  Body = AnyType,
  Response = AnyType,
  Result = AnyType,
  BaseUrl = string,
  MData = AnyType,
> {
  method?: ChaparMethod;
  body?: Body;
  setToken?: boolean;
  headers?: Record<string, AnyType>;
  baseUrlType?: BaseUrlTypeExtractor<BaseUrl>;
  throwError?: boolean;
  callOnFail?: boolean;
  callTimingFn?: boolean;
  dto?: (payload: Response, metaData?: MData) => $NullType<Result>;
  onUploadProgress?: (data: Response) => void;
}

export interface SendChaparReturnType<Data, MData = AnyType> {
  success: boolean;
  statusCode?: number;
  data: $NullType<Data>;
  metaData: $NullType<MData>;
  message?: string;
}

export type ChaparFunc<Data, MData> = Promise<SendChaparReturnType<Data, MData>>;
export type AuthTokenFunc = () => string;
export type AuthToken = string | AuthTokenFunc;
