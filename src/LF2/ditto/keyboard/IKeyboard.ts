import type { NoEmitCallbacks } from "../../base/NoEmitCallbacks";
import { IKeyboardCallback } from "./IKeyboardCallback";
export interface IKeyboard {
  readonly callback: NoEmitCallbacks<IKeyboardCallback>;
  axes(index: number): readonly number[];
  dispose(): void;
}
