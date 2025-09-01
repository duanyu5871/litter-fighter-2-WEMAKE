import { BotCtrlState } from "../../controller/BotCtrlState";
import { GameKey as GK, Defines } from "../../defines";


export function bot_ball_continuation(action_id: string, desire: number = 0.1, key: GK = GK.a) {
  return {
    action_id: action_id,
    desire: Defines.calc_desire(desire),
    status: [BotCtrlState.Chasing],
    e_ray: [{ x: 1, z: 0 }],
    keys: [key]
  };
}
