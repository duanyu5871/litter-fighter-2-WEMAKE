import { ActionType } from "./ActionType";
import { IAction_Base } from "./IAction_Base";
import type { TNextFrame } from "./INextFrame";

export interface IAction_Defend extends IAction_Base {
  type: ActionType.Defend;
  data: TNextFrame;
}
