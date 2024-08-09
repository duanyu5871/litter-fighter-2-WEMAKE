export const __Timeout = {
  add(handler: () => void, timeout?: number, ...args: any[]) {
    return window.setTimeout(handler, timeout, ...args);
  },
  del(timer_id: number): void {
    return window.clearTimeout(timer_id);
  },
}
