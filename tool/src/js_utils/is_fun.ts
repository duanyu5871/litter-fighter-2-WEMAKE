export const is_fun = (v: any): v is (() => void) => typeof v === 'function';
