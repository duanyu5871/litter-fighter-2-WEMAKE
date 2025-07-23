import Sequence from "./Sequence";
import { Animation } from "./Animation";

export class Delay extends Animation {
  owner: Sequence;
  constructor(owner: Sequence, duration: number) {
    super()
    this.owner = owner;
    this.duration = duration;
  }
  override calc(): this {
    this.value = this.owner.value;
    return this;
  }
}
