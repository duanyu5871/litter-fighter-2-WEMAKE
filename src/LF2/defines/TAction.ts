import { IAction_BrokenDefend } from "./IAction_BrokenDefend";
import { IAction_Defend } from "./IAction_Defend";
import { IAction_Fusion } from "./IAction_Fusion";
import { IAction_NextFrame } from "./IAction_NextFrame";
import { IAction_ReboundVX } from "./IAction_ReboundVX";
import { IAction_SetProp } from "./IAction_SetProp";
import { IAction_Sound } from "./IAction_Sound";
import { IAction_TurnFace } from "./IAction_TurnFace";
import { IAction_TurnTeam } from "./IAction_TurnTeam";

export type TAction =
  IAction_Sound |
  IAction_NextFrame |
  IAction_SetProp |
  IAction_Defend |
  IAction_BrokenDefend |
  IAction_ReboundVX |
  IAction_TurnFace |
  IAction_TurnTeam |
  IAction_Fusion;
