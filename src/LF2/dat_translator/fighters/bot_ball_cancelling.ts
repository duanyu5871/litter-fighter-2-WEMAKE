import { Defines, GK, LGK, IBotAction, BotStateEnum } from "../../defines";
import { CondMaker } from "../CondMaker";
import { IEditBotActionFunc } from "./IEditBotAction";
/**
 * 停止循环的动作（BALL类）
 * 
 * 默认判定: 当目标不在正前方
 * 默认按键：跳跃
 * 
 * @export
 * @param {string} action_id
 * @param {number} [desire=0.1]
 * @param {(...('F' | 'B' | LGK)[])} keys
 * @return {IEditBotActionFunc} 
 */
export function bot_ball_cancelling(action_id: string, desire: number = 0.1, ...keys: ('F' | 'B' | LGK)[]): IEditBotActionFunc {
  return (fn) => {
    const cond = new CondMaker();
    const ret: IBotAction = {
      action_id: action_id,
      desire: Defines.desire(desire),
      status: [BotStateEnum.Chasing],
      e_ray: [{ x: 1, z: 0, reverse: true }],
      keys: keys.length ? keys : [GK.j]
    };
    return fn ? fn(ret, cond) : ret;
  }

}

