import { min, floor, max } from "../../utils";

export class Times {
  value = 0;
  readonly min: number;
  readonly max: number;
  constructor(_min: number = 0, _max: number = Number.MAX_SAFE_INTEGER) {
    this.min = min(floor(_min), floor(_max));
    this.max = max(floor(_min), floor(_max));
  }
  reset() {
    return this.value = this.min;
  }
  is_end() {
    return this.value === this.max;
  }
  add() {
    if (this.max === this.min) this.value = this.min;
    else this.value = this.value === this.max ? this.min : this.value + 1;
  }
}
