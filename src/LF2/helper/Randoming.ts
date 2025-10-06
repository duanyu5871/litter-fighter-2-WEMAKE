import { LF2 } from "../LF2";

export class Randoming<T> {
  protected lf2: LF2;
  protected _src: Readonly<T[]>;
  protected cur: T[]
  protected taken: T | null = null;
  protected duplicate: boolean;
  get src() { return this._src }
  constructor(src: T[], lf2: LF2, duplicate: boolean = false) {
    this.lf2 = lf2;
    this._src = src;
    this.cur = [...src];
    this.duplicate = duplicate;
  }
  set_src(src: Readonly<T[]>) {
    this._src = src;
    return this;
  }
  take(): T {
    if (!this.cur.length) {
      this.cur = this._src.length > 1 ? this._src.filter(v => v != this.taken) : [...this._src];
    }
    if (this.duplicate)
      this.taken = this.lf2.random_get(this.cur)!
    else
      this.taken = this.lf2.random_take(this.cur)!
    return this.taken;
  }
}
