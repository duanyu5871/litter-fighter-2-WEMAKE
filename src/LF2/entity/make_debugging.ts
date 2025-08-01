import Ditto from "../ditto";
export interface IDebugging {
  id?: string;
  __debugging?: boolean;
  debug(func: string, ...args: any[]): void
  warn(func: string, ...args: any[]): void
  log(func: string, ...args: any[]): void
}
export function make_debugging(obj: IDebugging) {
  const cls = Object.getPrototypeOf(obj).constructor;
  obj.debug = (func: string, ...args: any[]) => {
    if (!obj.__debugging) return;
    const { id } = obj;
    if (id)
      Ditto.Debug(`[D]<${id}>[${cls.TAG}::${func}]`, ...args)
    else
      Ditto.Debug(`[D][${cls.TAG}::${func}]`, ...args);
  };
  obj.warn = (func: string, ...args: any[]) => {
    const { id } = obj;
    if (id)
      Ditto.Warn(`[W]<${id}>[${cls.TAG}::${func}]`, ...args)
    else
      Ditto.Warn(`[W][${cls.TAG}::${func}]`, ...args);
  };
  obj.log = (func: string, ...args: any[]) => {
    const { id } = obj;
    if (id)
      Ditto.Log(`[I]<${id}>[${cls.TAG}::${func}]`, ...args)
    else
      Ditto.Log(`[I][${cls.TAG}::${func}]`, ...args);
  };
}
