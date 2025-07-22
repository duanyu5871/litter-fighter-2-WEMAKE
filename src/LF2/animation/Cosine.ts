import { Periodic } from "./Periodic";

export class Cosine extends Periodic {
  readonly method = (v: number) => {
    return (this.height * (Math.cos(this.offset + v * 2 * Math.PI / 1000) + 1) / 2) + this.bottom
  }
}
