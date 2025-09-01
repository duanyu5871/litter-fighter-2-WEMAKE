import { BotCtrlState } from "../../controller/BotCtrlState";
import { BotVal, Defines, EntityVal, GameKey as GK } from "../../defines";
import { IBotAction } from "../../defines/IBotAction";
import { CondMaker } from "../CondMaker";
const DESIRE = 1 / 60;
const MIN_X = 80;
const MAX_X = 120;
export const ID = 'd^a'
/**
 * 矩形范围，检测成功将会按下D^A
 *
 * @export
 * @param {number} min_mp 至少需要多少mp
 * @param {number} [desire=0.05] 欲望值
 * @param {number} [min_x=90] 最小距离 
 * @param {number} [max_x=120] 最大距离
 * @return {IBotAction}
 */
export function bot_uppercut_dua(
  min_mp: number,
  desire: number = DESIRE,
  min_x: number = MIN_X,
  max_x: number = MAX_X
): IBotAction {
  return {
    action_id: ID,
    desire: Defines.desire(desire),
    status: [BotCtrlState.Chasing],
    e_ray: [{ x: 1, z: 0, min_x, max_x }],
    expression: new CondMaker<BotVal | EntityVal>()
      .add(EntityVal.MP, '>=', min_mp)
      .done(),
    keys: [GK.d, GK.U, GK.a]
  };
}
bot_uppercut_dua.ID = ID
bot_uppercut_dua.DESIRE = DESIRE
bot_uppercut_dua.MIN_X = MIN_X
bot_uppercut_dua.MAX_X = MAX_X