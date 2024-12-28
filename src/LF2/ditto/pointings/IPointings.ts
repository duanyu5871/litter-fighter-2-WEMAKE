import type { NoEmitCallbacks } from "../../base/NoEmitCallbacks";
import { type IPointingsCallback } from "./IPointingsCallback";

export interface IPointings {
  get callback(): NoEmitCallbacks<IPointingsCallback>;
  dispose(): void;
}
