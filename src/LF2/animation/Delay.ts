import { Animation } from "./Animation";

export class Delay extends Animation {
  constructor(value: number, duration?: number) {
    super()
    this.value = value;
    if (duration != void 0) this.duration = duration;
  }
  override calc(): this { return this; }
}
