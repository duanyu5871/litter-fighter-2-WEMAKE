import { BotCtrlState } from "../../controller/BotCtrlState";
import { BotVal, Defines, EntityVal, GameKey as GK } from "../../defines";
import { IBotAction } from "../../defines/IBotAction";
import { pow } from "../../utils";
import { CondMaker } from "../CondMaker";
const DESIRE = 0.016666 as const;
const MIN_X = -120 as const;
const MAX_X = 120 as const;
const Z_LEN = 100 as const;
const ID = 'd^a' as const
/**
 * 矩形范围，检测成功将会按下D^Aa
 *
 * @export
 * @param {number} min_mp 至少需要多少mp
 * @param {number} [desire=0.05] 欲望值
 * @param {number} [min_x=-120] 后方距离 
 * @param {number} [max_x=120] 前方距离
 * @param {number} [z_len=120] Z轴范围
 * @return {IBotAction}
 */
export function bot_explosion_dua(
  min_mp: number,
  desire: number = DESIRE,
  min_x: number = MIN_X,
  max_x: number = MAX_X,
  z_len: number = Z_LEN
): IBotAction {
  return {
    action_id: ID,
    desire: Defines.desire(desire),
    status: [BotCtrlState.Chasing],
    e_ray: [{ x: 1, z: 0, min_x, max_x, max_d: pow(z_len, 2) }],
    expression: new CondMaker<BotVal | EntityVal>()
      .add(EntityVal.MP, '>=', min_mp)
      .done(),
    keys: [GK.d, GK.U, GK.a]
  };
}
bot_explosion_dua.ID = ID
bot_explosion_dua.DESIRE = DESIRE
bot_explosion_dua.MIN_X = MIN_X
bot_explosion_dua.MAX_X = MAX_X
bot_explosion_dua.Z_LEN = Z_LEN