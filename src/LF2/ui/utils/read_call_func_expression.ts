export function read_call_func_expression(
  text: string
): [string, string[]] | [null, null] {
  const result = text.match(/(.*)\((.*)\)/);
  if (!result) return [null, null];
  const [, func_name, args_str] = result.map(v => v.trim());
  if (!func_name) return [null, null];
  if (!args_str) return [func_name, []]
  const args: string[] = args_str.split(",").map(v => v.trim())
  return [func_name, args];
}
