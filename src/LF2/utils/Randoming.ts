import { LF2 } from "../LF2";

export class Randoming<T> {
  protected lf2: LF2;
  protected src: T[];
  protected cur: T[]
  constructor(src: T[], lf2: LF2) {
    this.lf2 = lf2;
    this.src = src;
    this.cur = [...src];
  }
  take(): T {
    if (!this.cur.length) this.cur = [...this.src]
    return this.lf2.random_take(this.cur)!
  }
}
