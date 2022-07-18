import { AnyType } from '../types';

export const isString = (val: AnyType) => {
  return typeof val === 'string';
};

export const isFunction = (val: AnyType) => {
  return typeof val === 'function';
};

export const isNil = (val: AnyType) => {
  return val === undefined || val === null;
};
