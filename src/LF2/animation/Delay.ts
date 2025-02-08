import Sequence from "./Sequence";
import { IBase } from "./IBase";

export class Delay implements IBase {
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
  calc(): this {
    return this;
  }
  end(): void { }
}
