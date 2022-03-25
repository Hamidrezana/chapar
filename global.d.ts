/* eslint-disable @typescript-eslint/no-explicit-any */

export {};

declare global {
  type $Without<T, K extends keyof any> = T extends any ? Pick<T, Exclude<keyof T, K>> : never;
  type $DeepPartial<T> = { [P in keyof T]?: $DeepPartial<T[P]> };
  type $NullType<T> = T | null;
  type $NullUndefinedType<T> = T | null | undefined;
  type $VoidFunc = () => void;
  type $MapType<T> = Record<number | string, T>;
}
