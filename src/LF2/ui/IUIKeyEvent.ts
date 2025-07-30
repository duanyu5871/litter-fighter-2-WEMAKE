import type { TLooseGameKey } from "../defines";
import type { IUIEvent } from "./UIEvent";

export interface IUIKeyEvent extends IUIEvent {
  player: string;
  key: TLooseGameKey;
}

