export default class Interval {
  static set(handler: (() => void) | string, timeout?: number, ...args: any[]) {
    return window.setInterval(handler, timeout, ...args)
  };
  static del(timer_id: number): void {
    return window.clearInterval(timer_id)
  };
  private constructor() { }
}
