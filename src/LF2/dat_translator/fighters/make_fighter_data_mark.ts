import { BotVal, GK, IEntityData } from "../../defines";
import { arithmetic_progression } from "../../utils";
import { foreach } from "../../utils/container_help/foreach";
import { bot_ball_dfa } from "./bot_ball_dfa";
import { bot_ball_dfj } from "./bot_ball_dfj";
import { bot_chasing_action } from "./bot_chasing_action";
import { BotBuilder } from "./BotBuilder";
import { frames } from "./frames";

export function make_fighter_data_mark(data: IEntityData) {
  BotBuilder.make(data).set_actions(
    // d>a
    bot_ball_dfa(0, void 0, 0, 80, 0.1)(a => {
      foreach(a.e_ray, r => r.max_d = 1600)
      return a
    }),
    // d>a+a
    bot_chasing_action('d>a+a', [GK.a], 0, 1 / 15),

    // d>j
    bot_ball_dfj(50, void 0, 20, 200, 0.1)(a => {
      foreach(a.e_ray, r => r.max_d = 1600)
      return a
    }),

    // cancel_d>j
    bot_ball_dfj(0, void 0, 0, 1000)((action, cond) => {
      action.action_id = 'cancel_d>j'
      const ray = action.e_ray![0]
      ray.reverse = true
      action.e_ray?.push(
        { ...ray, z: 0.2 },
        { ...ray, z: -0.2 }
      );
      action.expression = cond.or(BotVal.EnemyDiffX, "<", -100).done();
      action.keys = [GK.Jump]
      return action;
    }),
  ).set_frames(
    [
      ...frames.standings,
      ...frames.walkings
    ],
    ["d>j", "d>a"]
  ).set_frames(
    frames.punchs,
    ["d>j", "d>a"]
  ).set_frames(
    arithmetic_progression(240, 244),
    ["cancel_d>j"]
  ).set_frames(
    arithmetic_progression(85, 89),
    ["d>a+a"]
  );
  return data;
}



