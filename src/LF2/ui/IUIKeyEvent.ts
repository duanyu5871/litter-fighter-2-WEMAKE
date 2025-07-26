import { TLooseGameKey } from "../defines";
import { IUIEvent } from "./UIEvent";

export interface IUIKeyEvent extends IUIEvent {
  player: string;
  key: TLooseGameKey;
}
