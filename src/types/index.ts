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
export type BaseUrlTypeExtractor<BaseUrl> = Extract<
  BaseUrl,
  MultipleBaseUrlType | undefined
> extends never
  ? BaseUrl
  : keyof BaseUrl;

export interface ChaparConstructorArgs<BaseUrl> {
  baseUrl?: BaseUrl;
  onError?: OnErrorCallbackType;
  authToken?: AuthToken;
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

export interface SetupInterceptorArgs {
  on400Callback?: (res: SendChaparReturnType) => void;
  on401Callback?: (res: SendChaparReturnType) => void;
  on404Callback?: (res: SendChaparReturnType) => void;
  on500Callback?: (res: SendChaparReturnType) => void;
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
}

export interface SendChaparReturnType<Data = AnyType> {
  success: boolean;
  statusCode?: number;
  data: $NullType<Data>;
  message?: string;
}

export type ChaparFunc<T> = Promise<SendChaparReturnType<T>>;
export type AuthTokenFunc = () => string;
export type AuthToken = string | AuthTokenFunc;
