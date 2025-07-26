import { Periodic } from "./Periodic";

export class Sine extends Periodic {
  constructor(...args: ConstructorParameters<typeof Periodic>) { super(...args) }
  readonly method = (v: number) => {
    return (this.height * (Math.sin(v * 2 * Math.PI / 1000) + 1) / 2) + this.bottom
  }
}
