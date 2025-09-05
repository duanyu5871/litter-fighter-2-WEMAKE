import { BotCtrlState } from "../../controller/BotCtrlState";
import { Defines, EntityVal, GameKey as GK, TLooseGameKey } from "../../defines";
import { IBotAction } from "../../defines/IBotAction";
import { CondMaker } from "../CondMaker";
import { IEditBotActionFunc } from "./IEditBotAction";


export function bot_ball_continuation(
  action_id: string,
  desire: number = 0.1,
  mp: number = 0,
  ...keys: ("F" | "B" | TLooseGameKey)[]
): IEditBotActionFunc {
  return (edit) => {
    const cond = new CondMaker()
    if (mp > 0) cond.add(EntityVal.MP, '>=', mp)
    const ret: IBotAction = {
      action_id: action_id,
      desire: Defines.desire(desire),
      status: [BotCtrlState.Chasing],
      expression: mp > 0 ? cond.done() : void 0,
      e_ray: [{ x: 1, z: 0 }],
      keys: keys.length ? keys : [GK.Attack]
    }
    return edit ? edit(ret, cond) : ret;
  }
}
