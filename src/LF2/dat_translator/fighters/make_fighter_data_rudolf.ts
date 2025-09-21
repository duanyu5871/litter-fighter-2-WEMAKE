import { BuiltIn_OID, Defines, IEntityData } from "../../defines";
import { bot_ball_dfa } from "./bot_ball_dfa";
import { bot_ball_dfj } from "./bot_ball_dfj";
import { BotBuilder } from "./BotBuilder";
import { frames } from "./frames";

/**
 *
 * @todo
 * @export
 * @param {IEntityData} data
 * @return {IEntityData}
 */
export function make_fighter_data_rudolf(data: IEntityData): IEntityData {
  for (const k in data.frames) {
    data.frames[k].opoint?.forEach((opoint) => {
      if (opoint.oid === BuiltIn_OID.Rudolf) {
        opoint.hp = opoint.max_hp = 20;
        opoint.mp = opoint.max_mp = 150;
      }
    });
  }
  BotBuilder.make(data).set_dataset({
    w_atk_m_x: 50,
    w_atk_b_x: 300,
    w_atk_f_x: 300,
    r_desire_max: Defines.AI_R_DESIRE_MAX * 2,
    r_desire_min: Defines.AI_R_DESIRE_MIN * 2
  }).set_actions(
    // d>a_1
    bot_ball_dfa(100, void 0, 120, 300)((a, c) => {
      a.action_id = 'd>a_1'
      a.e_ray![0].max_d = 40000;
      return a;
    }),
    // d>a_2
    bot_ball_dfa(100, void 0, 300, 500)((a, c) => {
      a.action_id = 'd>a_2'
      a.e_ray![0].max_d = 160000;
      return a;
    }),
    // d>a_2
    bot_ball_dfj(0, void 0, 79, 120)
  ).set_frames(
    [
      ...frames.standings,
      ...frames.walkings,
    ],
    ['d>a_1', 'd>a_2', 'd>j']
  )
  return data;
}
