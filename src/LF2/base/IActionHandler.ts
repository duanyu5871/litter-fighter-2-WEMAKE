import { ICollision } from ".";
import { IAction_NextFrame, IAction_SetProp, IAction_Sound } from "../defines";
import { ActionType } from "../defines/ActionType";
import { IAction_BrokenDefend } from "../defines/IAction_BrokenDefend";
import { IAction_Defend } from "../defines/IAction_Defend";

export interface IActionHandler {
  [ActionType.Sound]: (action: IAction_Sound, collision: ICollision) => any;
  [ActionType.NextFrame]: (action: IAction_NextFrame, collision: ICollision) => any;
  [ActionType.SetProp]: (action: IAction_SetProp, collision: ICollision) => any;
  [ActionType.BrokenDefend]: (action: IAction_BrokenDefend, collision: ICollision) => any;
  [ActionType.Defend]: (action: IAction_Defend, collision: ICollision) => any;
}
