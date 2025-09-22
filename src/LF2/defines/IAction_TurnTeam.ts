import { ActionType } from "./ActionType";
import { IAction_Base } from "./IAction_Base";


export interface IAction_TurnTeam extends IAction_Base {
  type: ActionType.V_TURN_TEAM;
  data: '';
}
