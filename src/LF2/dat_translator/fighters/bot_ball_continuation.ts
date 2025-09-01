import { BotCtrlState } from "../../controller/BotCtrlState";
import { Defines, GameKey as GK } from "../../defines";
import { CondMaker } from "../CondMaker";
import { IEditBotActionFunc } from "./IEditBotAction";


export function bot_ball_continuation(action_id: string, desire: number = 0.1, key: GK = GK.a): IEditBotActionFunc {
  return (edit) => {
    const ret = {
      action_id: action_id,
      desire: Defines.desire(desire),
      status: [BotCtrlState.Chasing],
      e_ray: [{ x: 1, z: 0 }],
      keys: [key]
    }
    return edit ? edit(ret, new CondMaker) : ret;
  }
}
