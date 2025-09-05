import { BotVal, GameKey, IEntityData } from "../../defines";
import { arithmetic_progression } from "../../utils";
import { bot_ball_continuation } from "./bot_ball_continuation";
import { bot_ball_dfa } from "./bot_ball_dfa";
import { bot_ball_dfj } from "./bot_ball_dfj";
import { bot_explosion_duj } from "./bot_explosion_duj";
import { BotBuilder } from "./BotBuilder";
import { frames } from "./frames";

/**
 *
 * @export
 * @param {IEntityData} data
 * @return {*} 
 */
export function make_fighter_data_firen(data: IEntityData) {
  BotBuilder.make(data).set_actions(
    // d>a
    bot_ball_dfa(75, 1 / 30, 50),

    // d>a+a
    bot_ball_continuation("d>a+a", 0.8, 75),

    // d>j
    bot_ball_dfj(75, 1 / 30, 50, 1000)(e => {
      e.e_ray?.push(
        { ...e.e_ray![0], z: 0.2 },
        { ...e.e_ray![0], z: -0.2 }
      );
      return e;
    }),

    // cancel_d>j
    bot_ball_dfj(0, 1 / 30, 0, 1000)((action, cond) => {
      action.action_id = 'cancel_d>j'
      const ray = action.e_ray![0]
      ray.reverse = true
      action.e_ray?.push(
        { ...ray, z: 0.2 },
        { ...ray, z: -0.2 }
      );
      action.expression = cond.or(BotVal.EnemyDiffX, "<", -100).done();
      action.keys = [GameKey.Jump]
      return action;
    }),

    // dvj
    bot_ball_dfj(75, 1 / 30, 50, 200)(action => {
      action.action_id = 'dvj'
      action.e_ray?.push(
        { ...action.e_ray![0], z: 0.05 },
        { ...action.e_ray![0], z: -0.1 }
      );
      action.keys = [GameKey.Defend, GameKey.Down, GameKey.Jump]
      return action;
    }),

    // cancel_dvj
    bot_ball_dfj(0, 1 / 30, 50, 200)((action) => {
      action.action_id = 'cancel_dvj'
      const ray = action.e_ray![0]
      ray.reverse = true
      action.e_ray?.push(
        { ...ray, z: 0.05 },
        { ...ray, z: -0.05 }
      );
      action.keys = [GameKey.Jump]
      return action;
    }),

    // d^j
    bot_explosion_duj(300, 1 / 60, -110, 110, 900),

  ).set_frames(
    [
      ...frames.standings,
      ...frames.walkings
    ],
    ['d>a', 'd>j', 'd^j', 'dvj']
  ).set_frames(
    arithmetic_progression(255, 261, 1),
    ["cancel_d>j"]
  ).set_frames(
    arithmetic_progression(267, 275, 1),
    ["cancel_dvj"]
  ).set_frames(
    arithmetic_progression(235, 252, 1),
    ["d>a+a"]
  );
  return data;
}
