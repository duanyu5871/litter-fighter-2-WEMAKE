import { Periodic } from "./Periodic";

export class Tangent extends Periodic {
  readonly method = (v: number) => Math.tan(v * 2 * Math.PI / 1000);
}
