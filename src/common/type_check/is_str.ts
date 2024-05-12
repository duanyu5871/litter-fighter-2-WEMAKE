export const is_str = (v: any): v is string => typeof v === 'string';
export const not_empty_str = (v: any): v is string => v && is_str(v);
export const not_blank_str = (v: any): v is string => is_str(v) && v.trim().length > 0;

