export const isString = (val: any) => {
  return typeof val === 'string';
};

export const isFunction = (val: any) => {
  return typeof val === 'function';
};

export const isNil = (val: any) => {
  return val === undefined || val === null;
};
