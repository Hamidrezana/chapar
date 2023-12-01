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
export type CheckStatusFuncType<Response> = (statusCode: number, response: Response) => boolean;
export type BaseUrlTypeExtractor<BaseUrl> = Extract<
  BaseUrl,
  MultipleBaseUrlType | undefined
> extends never
  ? BaseUrl
  : keyof BaseUrl;

export interface ChaparConstructorArgs<BaseUrl, Response = ChaparResponse<AnyType>> {
  baseUrl?: BaseUrl;
  authToken?: AuthToken;
  timeout?: number;
  authorizationKey?: string;
  successKey?: keyof Response;
  dataKey?: keyof Response;
  messageKey?: keyof Response;
  onError?: OnErrorCallbackType;
  checkStatusFunc?: CheckStatusFuncType<Response>;
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
> {
  method?: 'get' | 'post' | 'put' | 'delete' | 'patch';
  body?: Body;
  setToken?: boolean;
  headers?: Record<string, AnyType>;
  baseUrlType?: BaseUrlTypeExtractor<BaseUrl>;
  dto?: (payload: Response) => $NullType<Result>;
  onUploadProgress?: (data: Response) => void;
}

export interface SendChaparReturnType<Data> {
  success: boolean;
  statusCode?: number;
  data: $NullType<Data>;
  message?: string;
}

export type ChaparFunc<Data> = Promise<SendChaparReturnType<Data>>;
export type AuthTokenFunc = () => string;
export type AuthToken = string | AuthTokenFunc;
