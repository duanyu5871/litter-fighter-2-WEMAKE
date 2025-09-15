import { ActionType } from "./ActionType";
import { IAction_Base } from "./IAction_Base";

export interface IAction_SetProp extends IAction_Base {
  type: ActionType.SetProp;
  prop_name: string;
  prop_value: any;
}
