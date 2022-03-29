/* eslint-disable @typescript-eslint/no-explicit-any */

export interface Query {
  key: string;
  value: string | null;
}

export type MultipleBaseUrlType = Record<string, string>;
export type BaseUrlType = string | MultipleBaseUrlType;

export interface CreateUrlArgs<TBaseUrlType = string> {
  url: string;
  baseUrlType?: Extract<TBaseUrlType, MultipleBaseUrlType | undefined> extends never
    ? TBaseUrlType
    : keyof TBaseUrlType;
  args?: Array<string>;
  queries?: Array<Query>;
}

export interface SetupAgentArgs {
  baseUrl: string;
}

export interface SetupInterceptorArgs {
  on401Callback: $VoidFunc;
}

/**
 * @template T => Chapar body
 * @template R => Chapar Response
 * @template D => Transformed Data
 */
export interface SendChaparArgs<T = any, R = any, D = any, TCreateUrlArgs = string> {
  method?: 'get' | 'post' | 'put';
  body?: T;
  setToken?: boolean;
  headers?: Record<string, any>;
  urlProps?: Pick<CreateUrlArgs<TCreateUrlArgs>, 'baseUrlType' | 'args' | 'queries'>;
  dto?: (payload: R) => $NullType<D>;
}

export interface Response<T = any> {
  success: boolean;
  data: T;
  message?: string;
}

export interface SendChaparReturnType<T = any> {
  success: boolean;
  data: $NullType<T>;
  message?: string;
}

export type ChaparFunc<T> = Promise<SendChaparReturnType<T>>;
