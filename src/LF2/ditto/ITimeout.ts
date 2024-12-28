export interface ITimeout {
  add(handler: () => void, timeout?: number, ...args: any[]): number;
  del(timer_id: number): void;
}
