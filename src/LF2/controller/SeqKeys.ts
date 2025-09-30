import type { LGK } from "../defines";

export class SeqKeys {
  private _idx = 0;
  private _hit: 0 | 1 = 0;
  private _a_time: number = 0;
  private _b_time: number = 0;
  private readonly keys: LGK[];
  private readonly times: number[] = []
  get idx() { return this._idx }
  get hit(): 0 | 1 {
    return this._hit;
  }
  constructor(keys: LGK[]) {
    this.keys = keys;
  }
  test(key: LGK, time: number): 0 | 1 {
    if (this.hit) return 1;
    const len = this.keys.length;
    if (!len) return this._hit = 0;
    if (this.keys[this._idx] !== key) return this.reset();
    if (!this._idx) this._a_time = time;
    else this._b_time = time;
    if (this._b_time - this._a_time > len * 15) return this.reset();

    // all hit
    ++this._idx;
    if (this._idx === this.keys.length) return this._hit = 1;
    return 0;

  }
  reset(): 0 | 1 {
    this._a_time = 0;
    this._b_time = -1;
    this._idx = 0;
    this.times.length = 0;
    return this._hit = 0;
  }
}
