import { IAction_BrokenDefend } from "./IAction_BrokenDefend";
import { IAction_Defend } from "./IAction_Defend";
import { IAction_NextFrame } from "./IAction_NextFrame";
import { IAction_SetProp } from "./IAction_SetProp";
import { IAction_Sound } from "./IAction_Sound";

export type TAction =
  IAction_Sound |
  IAction_NextFrame |
  IAction_SetProp |
  IAction_Defend |
  IAction_BrokenDefend

