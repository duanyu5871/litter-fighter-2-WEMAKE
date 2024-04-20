export const not_zero = (v: any): v is number => (typeof v === 'number' && !!v);
