import { AxiosError } from 'axios';

export type QueryType = Record<string, string | number | null | undefined>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyType = any;
export interface ChaparResponse<Data = AnyType, MetaData = AnyType> {
  success: boolean;
  data: Data;
  metaData?: MetaData;
  message?: string;
}

export type MultipleBaseUrlType = Record<string, string>;
export type BaseUrlType = string | MultipleBaseUrlType;
export type OnErrorCallbackType = <Data>(err: AxiosError<ChaparResponse<Data>>) => void;
export type MetaDataDtoFuncType<Data = AnyType, Return = AnyType> = (data: Data) => Return;
export type BaseUrlTypeExtractor<BaseUrl> = Extract<
  BaseUrl,
  MultipleBaseUrlType | undefined
> extends never
  ? BaseUrl
  : keyof BaseUrl;

export interface ChaparConstructorArgs<BaseUrl, MetaDataResponse = AnyType, MetaData = AnyType> {
  baseUrl?: BaseUrl;
  authToken?: AuthToken;
  timeout?: number;
  authorizationKey?: string;
  onError?: OnErrorCallbackType;
  metaDataDto?: MetaDataDtoFuncType<MetaDataResponse, MetaData>;
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

export interface SetupInterceptorArgs<Data, MetaData> {
  on400Callback?: (res: SendChaparReturnType<Data, MetaData>) => void;
  on401Callback?: (res: SendChaparReturnType<Data, MetaData>) => void;
  on404Callback?: (res: SendChaparReturnType<Data, MetaData>) => void;
  on500Callback?: (res: SendChaparReturnType<Data, MetaData>) => void;
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

export interface SendChaparReturnType<Data, MetaData> {
  success: boolean;
  statusCode?: number;
  data: $NullType<Data>;
  metaData: $NullType<MetaData>;
  message?: string;
}

export type ChaparFunc<Data, MetaData> = Promise<SendChaparReturnType<Data, MetaData>>;
export type AuthTokenFunc = () => string;
export type AuthToken = string | AuthTokenFunc;
