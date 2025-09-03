import { BotCtrlState } from "../../controller/BotCtrlState";
import { BotVal, Defines, EntityVal, GameKey as GK } from "../../defines";
import { IBotAction } from "../../defines/IBotAction";
import { CondMaker } from "../CondMaker";
import { IEditBotActionFunc } from "./IEditBotAction";

const DESIRE = 0.016666 as const;
const MIN_X = 120 as const;
const ID = 'd>a' as const
/**
 * 前向检测，检测成功将会按下D>A
 *
 * @export
 * @param {number} min_mp 至少需要多少mp
 * @param {number} [desire=0.05] 欲望值
 * @param {number} [min_x=120] 最小x，与敌人x距离小于此值将不会触发
 * @param {number} [max_x] 最大x，与敌人x距离大于此值将不会触发
 * @return {IBotAction}
 */
export function bot_ball_dfa(
  min_mp: number,
  desire: number = DESIRE,
  min_x: number = MIN_X,
  max_x?: number
): IEditBotActionFunc {
  return (fn) => {
    const cond = new CondMaker<BotVal | EntityVal>()
    if (min_mp > 0) cond.add(EntityVal.MP, '>=', min_mp)
    const ret: IBotAction = {
      action_id: ID,
      desire: Defines.desire(desire),
      status: [BotCtrlState.Chasing],
      e_ray: [{ x: 1, z: 0, min_x, max_x }],
      expression: min_mp > 0 ? cond.done() : void 0,
      keys: [GK.d, 'F', GK.a]
    }
    return fn ? fn(ret, cond) : ret
  };
}

bot_ball_dfa.ID = ID
bot_ball_dfa.DESIRE = DESIRE
bot_ball_dfa.MIN_X = MIN_X
