import { BotCtrlState } from "../../controller/BotCtrlState";
import { GameKey, Defines, BotVal, EntityVal, TLooseGameKey } from "../../defines";
import { IBotAction } from "../../defines/IBotAction";
import { CondMaker } from "../CondMaker";

const DESIRE = 1 / 60;
export function bot_chasing_action(
  action_id: string,
  keys: ("F" | "B" | TLooseGameKey)[],
  min_mp: number = -1,
  desire: number = DESIRE
): IBotAction {
  return {
    action_id: action_id,
    desire: Defines.desire(desire),
    status: [BotCtrlState.Chasing],
    expression: min_mp > 0 ?
      new CondMaker<BotVal | EntityVal>()
        .add(EntityVal.MP, '>=', min_mp)
        .done() : void 0,
    keys: keys
  };
}

bot_chasing_action.DESIRE = DESIRE