import { LF2 } from "../LF2";

export class Randoming<T> {
  protected lf2: LF2;
  protected src: Readonly<T[]>;
  protected cur: T[]
  protected taken: T | null = null;
  constructor(src: T[], lf2: LF2) {
    this.lf2 = lf2;
    this.src = src;
    this.cur = [...src];
  }
  set_src(src: Readonly<T[]>) {
    this.src = src;
    return this;
  }
  take(): T {
    if (!this.cur.length) {
      this.cur = this.src.length > 1 ? this.src.filter(v => v != this.taken) : [...this.src];
    }
    this.taken = this.lf2.random_take(this.cur)!
    return this.taken;
  }
}
