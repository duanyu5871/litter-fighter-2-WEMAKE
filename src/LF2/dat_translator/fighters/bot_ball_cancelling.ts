import { BotCtrlState } from "../../controller/BotCtrlState";
import { Defines, GameKey as GK } from "../../defines";

export function bot_ball_cancelling(action_id: string, desire: number = 0.1, key: GK = GK.j) {
  return {
    action_id: action_id,
    desire: Defines.calc_desire(desire),
    status: [BotCtrlState.Chasing],
    e_ray: [{ x: 1, z: 0, reverse: true }],
    keys: [key]
  };
}

