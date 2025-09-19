import { min, floor, max } from "../../utils";

export class Times {
  value: number = 0;
  min: number = 0;
  max: number = 0;
  constructor(_min: number = 0, _max: number = Number.MAX_SAFE_INTEGER) {
    this.min = min(floor(_min), floor(_max));
    this.max = max(floor(_min), floor(_max));
  }
  reset() {
    return this.value = this.min;
  }
  end() {
    return this.value === this.max;
  }
  add() {
    if (this.max === this.min) this.value = this.min;
    else this.value = this.value === this.max ? this.min : this.value + 1;
    return this.value === this.max
  }
}
