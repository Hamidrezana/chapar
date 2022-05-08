/* eslint-disable @typescript-eslint/no-explicit-any */

import { AxiosError } from 'axios';

export type QueryType = Record<string, string | number | null | undefined>;

export interface ChaparResponse<Data = any> {
  success: boolean;
  data: Data;
  message?: string;
}

export type MultipleBaseUrlType = Record<string, string>;
export type BaseUrlType = string | MultipleBaseUrlType;
export type OnErrorCallbackType = <Data>(err: AxiosError<ChaparResponse<Data>>) => void;

export interface ChaparConstructorArgs<BaseUrl> {
  baseUrl?: BaseUrl;
  onError?: OnErrorCallbackType;
  authToken?: AuthToken;
}

export interface CreateUrlArgs<BaseUrl = string> {
  url: string;
  baseUrlType?: Extract<BaseUrl, MultipleBaseUrlType | undefined> extends never
    ? BaseUrl
    : keyof BaseUrl;
  args?: Array<string>;
  queries?: QueryType;
}

export interface SetupAgentArgs {
  baseUrl: string;
}

export interface SetupInterceptorArgs {
  on401Callback: $VoidFunc;
}

export interface SendChaparArgs<Body = any, Response = any, Result = any> {
  method?: 'get' | 'post' | 'put' | 'delete';
  body?: Body;
  setToken?: boolean;
  headers?: Record<string, any>;
  dto?: (payload: Response) => $NullType<Result>;
}

export interface SendChaparReturnType<Data = any> {
  success: boolean;
  data: $NullType<Data>;
  message?: string;
}

export type ChaparFunc<T> = Promise<SendChaparReturnType<T>>;
export type AuthTokenFunc = () => string;
export type AuthToken = string | AuthTokenFunc;
