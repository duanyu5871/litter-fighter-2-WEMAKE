import { BotVal, Defines, EntityVal, GameKey, IEntityData, StateEnum } from "../../defines";
import { probability } from "../../defines/probability";
import { arithmetic_progression } from "../../utils";
import { bot_ball_continuation } from "./bot_ball_continuation";
import { bot_ball_dfa } from "./bot_ball_dfa";
import { bot_ball_dfj } from "./bot_ball_dfj";
import { bot_chasing_action } from "./bot_chasing_action";
import { bot_chasing_skill_action } from "./bot_chasing_skill_action";
import { bot_explosion_dua } from "./bot_explosion_dua";
import { bot_uppercut_dua } from "./bot_uppercut_dua";
import { bot_uppercut_dva } from "./bot_uppercut_dva";
import { BotBuilder } from "./BotBuilder";
import { frames } from "./frames";


export function make_fighter_data_woody(data: IEntityData) {
  BotBuilder.make(data).set_actions(
    // d>a
    bot_ball_dfa(125, 1 / 30, 50)(e => {
      const ray = e.e_ray![0]
      ray.z = 0.1;
      e.e_ray?.push({ ...ray, z: -ray.z })
      return e;
    }),

    // d>j
    bot_ball_dfj(200, 1 / 30, 50, 200)(e => {
      const ray = e.e_ray![0]
      e.e_ray?.push(
        { ...ray, z: 0.2 },
        { ...ray, z: -0.2 }
      )
      return e;
    }),

    // c_d>j
    bot_ball_dfj(200, 0.3, 50, 200)(e => {
      e.action_id = 'c_d>j'
      const ray = e.e_ray![0]
      e.e_ray?.push(
        { ...ray, z: 0.2 },
        { ...ray, z: -0.2 }
      )
      return e;
    }),

    // d^a
    bot_uppercut_dua(0, void 0, bot_uppercut_dua.MIN_X, bot_uppercut_dua.MAX_X),

    // d^j
    bot_chasing_skill_action('d^j', void 0, 50, 0.01),

    // dvj
    bot_chasing_skill_action('dvj', void 0, 50, 0.01),

    // catching_d^a
    bot_chasing_skill_action('d^a', 'catching_d^a', 0),

    // dva
    bot_uppercut_dva(0, void 0, 80, bot_uppercut_dua.MAX_X),

  ).set_states(
    [StateEnum.Catching],
    ['catching_d^a']
  ).set_frames(
    [
      ...frames.standings,
      ...frames.walkings
    ],
    ['d>a', 'd^a', 'dva', 'd>j', 'd^j', 'dvj']
  ).set_states(
    [StateEnum.Jump],
    ['d^j', 'dvj']
  ).set_frames(
    [...frames.rowings],
    ['dva']
  ).set_frames(
    [286, 287, 288, 301, 302, 303, 271],
    ['c_d>j', 'd^a']
  ).set_frames(
    [215, 219],
    ['c_d>j', 'd^a']
  );
  return data;
}
