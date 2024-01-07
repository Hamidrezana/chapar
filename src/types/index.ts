import { AxiosError } from 'axios';

export type QueryType = Record<string, string | number | null | undefined>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyType = any;
export interface ChaparResponse<Data = AnyType> {
  success: boolean;
  data: Data;
  message?: string;
}

export type MultipleBaseUrlType = Record<string, string>;
export type BaseUrlType = string | MultipleBaseUrlType;
export type OnErrorCallbackType = <Data>(err: AxiosError<ChaparResponse<Data>>) => void;
export type OnUnsuccessCallbackType<Response> = (response: Response) => void;
export type CheckStatusFuncType<Response> = (statusCode: number, response: Response) => boolean;
export type MetaDataFnType<Response, MData> = (response: Response) => MData;
export type BaseUrlTypeExtractor<BaseUrl> = Extract<
  BaseUrl,
  MultipleBaseUrlType | undefined
> extends never
  ? BaseUrl
  : keyof BaseUrl;

export interface ChaparConstructorArgs<
  BaseUrl,
  Response = ChaparResponse<AnyType>,
  MData = AnyType,
> {
  baseUrl?: BaseUrl;
  authToken?: AuthToken;
  timeout?: number;
  authorizationKey?: string;
  throwError?: boolean;
  successKey?: keyof Response;
  dataKey?: keyof Response;
  messageKey?: keyof Response;
  onError?: OnErrorCallbackType;
  checkStatusFunc?: CheckStatusFuncType<Response>;
  metaDataFn?: MetaDataFnType<Response, MData>;
  onUnsuccess?: OnUnsuccessCallbackType<Response>;
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
  on400Callback?: (res: SendChaparReturnType<Data>) => void;
  on401Callback?: (res: SendChaparReturnType<Data>) => void;
  on404Callback?: (res: SendChaparReturnType<Data>) => void;
  on500Callback?: (res: SendChaparReturnType<Data>) => void;
}

export interface SendChaparArgs<
  Body = AnyType,
  Response = AnyType,
  Result = AnyType,
  BaseUrl = string,
  MData = AnyType,
> {
  method?: 'get' | 'post' | 'put' | 'delete' | 'patch';
  body?: Body;
  setToken?: boolean;
  headers?: Record<string, AnyType>;
  baseUrlType?: BaseUrlTypeExtractor<BaseUrl>;
  throwError?: boolean;
  callOnUnsuccess?: boolean;
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
