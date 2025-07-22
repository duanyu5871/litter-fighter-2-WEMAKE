import Sequence from "./Sequence";
import { IAnimation } from "./IBase";

export class Delay implements IAnimation {
  duration: number;
  time: number = 0;
  reverse: boolean = false;
  owner: Sequence;
  get value(): number {
    return this.owner.value;
  }
  constructor(owner: Sequence, duration: number) {
    this.owner = owner;
    this.duration = duration;
  }
  update(dt: number): this { return this }
  calc(): this { return this; }
  end(): this { return this }
}
