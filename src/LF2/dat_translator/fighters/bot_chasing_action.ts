import { BotStateEnum, BotVal, Defines, EntityVal, IBotAction, LGK } from "../../defines";
import { CondMaker } from "../CondMaker";
import { IEditBotActionFunc } from "./IEditBotAction";

const DESIRE = 0.033333 as const;
export function bot_chasing_action(
  action_id: string,
  keys: ("F" | "B" | LGK)[],
  min_mp: number = -1,
  desire: number = DESIRE
): IEditBotActionFunc {
  return (fn) => {
    const cond = new CondMaker<BotVal | EntityVal>()
    if (min_mp > 0) cond.add(EntityVal.MP, '>=', min_mp)
    const ret: IBotAction = {
      action_id: action_id,
      desire: Defines.desire(desire),
      status: [BotStateEnum.Chasing],
      expression: min_mp > 0 ? cond.done() : void 0,
      keys: keys
    }
    return fn ? fn(ret, cond) : ret;
  };
}

bot_chasing_action.DESIRE = DESIRE