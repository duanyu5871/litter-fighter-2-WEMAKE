export const take = (fields: any, key: string) => {
  if (!fields) return;
  const ret = fields[key];
  delete fields[key];
  return ret;
};
