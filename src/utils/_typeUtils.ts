export const isString = (val: any) => {
  return typeof val === 'string';
};

export const isNil = (val: any) => {
  return val === undefined || val === null;
};
