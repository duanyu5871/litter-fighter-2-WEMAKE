import { ICollision } from ".";
import { IAction_NextFrame, IAction_SetProp, IAction_Sound, TNextFrame } from "../defines";
import { ActionType } from "../defines/ActionType";
import { IAction_BrokenDefend } from "../defines/IAction_BrokenDefend";
import { IAction_Defend } from "../defines/IAction_Defend";

export interface IActionHandler {
  [ActionType.A_Sound]: (action: IAction_Sound, collision: ICollision) => any;
  [ActionType.A_NextFrame]: (action: { data: TNextFrame }, collision: ICollision) => any;
  [ActionType.A_SetProp]: (action: IAction_SetProp, collision: ICollision) => any;
  [ActionType.A_BrokenDefend]: (action: IAction_BrokenDefend, collision: ICollision) => any;
  [ActionType.A_Defend]: (action: IAction_Defend, collision: ICollision) => any;
  [ActionType.V_Sound]: (action: IAction_Sound, collision: ICollision) => any;
  [ActionType.V_NextFrame]: (action: { data: TNextFrame }, collision: ICollision) => any;
  [ActionType.V_SetProp]: (action: IAction_SetProp, collision: ICollision) => any;
  [ActionType.V_BrokenDefend]: (action: IAction_BrokenDefend, collision: ICollision) => any;
  [ActionType.V_Defend]: (action: IAction_Defend, collision: ICollision) => any;
}
