import { IExpression } from "./IExpression";
import { TNextFrame } from "./INextFrame";
import { IPos } from "./IPos";

export interface IAction_Base {
  test?: string;
  tester?: IExpression<any>;
}
export interface IAction_Sound extends IAction_Base {
  type: 'sound';
  path: string[];
  pos?: IPos;
}
export interface IAction_NextFrame extends IAction_Base {
  type: 'next_frame';
  data: TNextFrame;
}
export interface IAction_SetProp extends IAction_Base {
  type: 'set_prop';
  prop_name: string;
  prop_value: any;
}
export interface IAction_Defend extends IAction_Base {
  type: 'defend';
  data: TNextFrame;
}
export interface IAction_BrokenDefend extends IAction_Base {
  type: 'broken_defend';
  data: TNextFrame;
}
export type TAction = IAction_Sound | IAction_NextFrame | IAction_SetProp |
  IAction_Defend | IAction_BrokenDefend