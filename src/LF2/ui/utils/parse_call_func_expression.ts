export interface IParseResult {
  name: string;
  args: string[];
  enabled: boolean;
}
export function parse_call_func_expression(text: string): IParseResult | null {
  const result = text.match(/(!?)(.*)\((.*)\)/);
  if (!result) return null;
  const [, first, name, args] = result.map(v => v.trim());
  if (!name) return null;
  if (!args) return {
    name,
    args: [],
    enabled: first !== '!'
  }
  return {
    name,
    args: args.split(",").map(v => v.trim()),
    enabled: first !== '!'
  }
}
