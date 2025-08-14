import { IComponentInfo } from "../IComponentInfo";

export function parse_call_func_expression(text: string): Required<IComponentInfo> | null {
  const result = text.match(/(<.*>)?(!?)(.*)\((.*)\)/);
  if (!result) return null;
  const [, id = '', first, name, args] = result.map(v => v?.trim());
  if (!name) return null;
  if (!args) {
    return {
      id: id.substring(1, id.length - 1),
      name,
      args: [],
      enabled: first !== '!',
      properties: {}
    }
  }
  return {
    id: id.substring(1, id.length - 1),
    name,
    args: args.split(",").map(v => v.trim()),
    enabled: first !== '!',
    properties: {}
  }
}
