import { BotVal, Defines, EntityVal, GameKey, IEntityData, StateEnum } from "../../defines";
import { probability } from "../../defines/probability";
import { arithmetic_progression } from "../../utils";
import { bot_ball_continuation } from "./bot_ball_continuation";
import { bot_ball_dfa } from "./bot_ball_dfa";
import { bot_ball_dfj } from "./bot_ball_dfj";
import { bot_chasing_action } from "./bot_chasing_action";
import { bot_chasing_skill_action } from "./bot_chasing_skill_action";
import { bot_explosion_dua } from "./bot_explosion_dua";
import { bot_uppercut_dva } from "./bot_uppercut_dva";
import { BotBuilder } from "./BotBuilder";
import { frames } from "./frames";


export function make_fighter_data_dennis(data: IEntityData) {
  BotBuilder.make(data).actions(
    // d>a
    bot_ball_dfa(40, 1 / 30, 50),

    // d>a+a
    bot_ball_continuation("d>a+a", 0.8, GameKey.a)((action, cond) => {
      action.expression = cond?.and(EntityVal.MP, '>=', 40)!.done()
      return action
    }),

    // dva
    bot_uppercut_dva(75, 1 / 60, bot_uppercut_dva.MIN_X, bot_uppercut_dva.MAX_X),


    // d>j
    bot_ball_dfj(75, 1 / 60, 50, 300)(e => {
      e.e_ray?.push(
        { ...e.e_ray![0], z: 0.3 },
        { ...e.e_ray![0], z: -0.3 }
      )
      return e;
    }),

    // run_atk+dva
    bot_uppercut_dva(75, probability(6, 0.2), bot_uppercut_dva.MIN_X, bot_uppercut_dva.MAX_X)(e => {
      e.action_id = 'run_atk+dva'
      return e
    }),
    // run_atk+d>j
    bot_ball_dfj(75, probability(6, 0.2), 10, 100)(e => {
      e.action_id = 'run_atk+d>j'
      e.e_ray?.push(
        { ...e.e_ray![0], z: 0.3 },
        { ...e.e_ray![0], z: -0.3 }
      )
      return e;
    }),

    // cancel_d>j
    bot_chasing_action("cancel_d>j", [GameKey.j], 0, 0.1)((action, cond) => {
      action.expression = cond?.or(BotVal.EnemyDiffX, "<", -100).done()
      return action;
    }),

    // d^a
    bot_explosion_dua(100, 1 / 60, bot_explosion_dua.MAX_X, 2000, 1000),

    // catching_d>j
    bot_chasing_skill_action('d>j', 'catching_d>j', 75),

    // catching_dva
    bot_chasing_skill_action('dva', 'catching_dva', 75),

  ).states(
    [StateEnum.Catching],
    ['catching_d>j', 'catching_dva', 'd^a']
  ).frames(
    [
      ...frames.standings,
      ...frames.walkings
    ],
    ['d>a', 'dua', 'dva', 'd>j']
  ).frames(
    [...frames.punchs],
    ['dva', 'd>j']
  ).frames(
    [88, 89],
    ['run_atk+dva', 'run_atk+d>j']
  ).frames(
    arithmetic_progression(235, 262, 1),
    ["d>a+a"]
  ).frames(
    arithmetic_progression(280, 290, 1),
    ["cancel_d>j"]
  );
  return data;
}

