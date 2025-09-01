import { BotVal, EntityVal } from "../../defines";
import { IBotAction } from "../../defines/IBotAction";
import { CondMaker } from "../CondMaker";


export interface IEditBotAction {
  (o: IBotAction, cond?: CondMaker<BotVal | EntityVal>): IBotAction;
}
export interface IEditBotActionFunc {
  (e?: IEditBotAction): IBotAction
}