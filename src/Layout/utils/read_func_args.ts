export const read_func_args = (str: string, func_name: string, min_arg_count: number = -1): string[] | null => {
  const reg = new RegExp(func_name + "\\((.*)\\)");
  const result = str.match(reg);
  if (!result) return null;
  const [, args_str] = result;
  const args = args_str.split(',')
  if (min_arg_count >= 0 && min_arg_count > args.length) return null;
  return args;
};
export function read_call_func_expression(text: string): [string, string[]] | [undefined, undefined] {
  const result = text.match(/(.*)\((.*)\)/);
  if (!result) return [void 0, void 0];
  const [, func_name, args_str] = result;
  const args = args_str.split(',')
  return [func_name, args];
}