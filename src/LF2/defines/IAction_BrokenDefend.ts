import { ActionType } from "./ActionType";
import { IAction_Base } from "./IAction_Base";
import type { TNextFrame } from "./INextFrame";

export interface IAction_BrokenDefend extends IAction_Base {
  type: ActionType.BrokenDefend;
  data: TNextFrame;
}
