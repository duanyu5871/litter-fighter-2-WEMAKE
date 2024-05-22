export default class Timeout {
  static set(handler: (() => void) | string, timeout?: number, ...args: any[]) {
    return window.setTimeout(handler, timeout, ...args);
  };
  static del(timer_id: number): void {
    return window.clearTimeout(timer_id);
  };
  private constructor() { }
}
