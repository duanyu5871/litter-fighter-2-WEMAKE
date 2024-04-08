export const read_func_args_2 = (str: string, func_name: string): RegExpMatchArray | null => {
  const reg = new RegExp(func_name + "\\((.+),(.+)\\)");
  const result = str.match(reg);
  if (!result) return null;
  return result;
};
