import { Cls } from "../ui/read_info_value";

export function is_instance_of<T>(value: any, type: Cls<T>): value is T {
  return typeof type.prototype === "function" && value instanceof type;
}
