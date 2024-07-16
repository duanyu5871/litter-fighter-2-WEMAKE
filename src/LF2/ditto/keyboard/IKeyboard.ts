/* auto re-export */
import type NoEmitCallbacks from "../../base/NoEmitCallbacks";
import { IKeyboardCallback } from "./IKeyboardCallback";
export interface IKeyboard {
  readonly callback: NoEmitCallbacks<IKeyboardCallback>;
  dispose(): void;
}
