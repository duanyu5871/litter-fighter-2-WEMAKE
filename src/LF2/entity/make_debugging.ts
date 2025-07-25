import Ditto from "../ditto";
export interface IDebugging {
  __debugging?: boolean;
  debug(func: string, ...args: any[]): void
  warn(func: string, ...args: any[]): void
  log(func: string, ...args: any[]): void
}
export function make_debugging(obj: IDebugging) {
  const { TAG } = Object.getPrototypeOf(obj).constructor;
  obj.debug = (func: string, ...args: any[]) => obj.__debugging && Ditto.Debug(`[${TAG}::${func}]`, ...args);
  obj.warn = (func: string, ...args: any[]) => Ditto.Warn(`[${TAG}::${func}]`, ...args);
}
