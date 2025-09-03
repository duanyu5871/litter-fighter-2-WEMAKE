import { BotVal, Defines, EntityVal, GameKey, IEntityData, StateEnum } from "../../defines";
import { probability } from "../../defines/probability";
import { arithmetic_progression } from "../../utils";
import { bot_ball_continuation } from "./bot_ball_continuation";
import { bot_ball_dfa } from "./bot_ball_dfa";
import { bot_ball_dfj } from "./bot_ball_dfj";
import { bot_chasing_skill_action } from "./bot_chasing_skill_action";
import { bot_explosion_dua } from "./bot_explosion_dua";
import { bot_uppercut_dva } from "./bot_uppercut_dva";
import { BotBuilder } from "./BotBuilder";
import { frames } from "./frames";


export function make_fighter_data_dennis(data: IEntityData) {
  BotBuilder.make(data).actions(
    // d>a
    bot_ball_dfa(75, bot_ball_dfa.DESIRE, 50, 200),

    // d>a+a
    bot_ball_continuation("d>a+a", bot_ball_dfa.DESIRE, GameKey.a)((action, cond) => {
      action.expression = cond?.and(EntityVal.MP, '>=', 75)!.done()
      return action
    }),

    // d>j
    bot_ball_dfj(150, bot_ball_dfj.DESIRE, 50, 200),

    // catching_d>j
    bot_chasing_skill_action('d>j', 'catching_d>j', 150),

    // dva
    bot_uppercut_dva(75, bot_uppercut_dva.DESIRE, bot_uppercut_dva.MIN_X, bot_uppercut_dva.MAX_X),

    // dva+a
    bot_uppercut_dva(75, 1, bot_uppercut_dva.MIN_X, bot_uppercut_dva.MAX_X)((action, cond) => {
      action.action_id = 'dva+a';
      action.expression = cond!.and(BotVal.EnemyY, '<=', 0).done()
      action.keys = [GameKey.a];
      return action;
    }),

    // dva+j
    bot_uppercut_dva(
      150, 
      probability(4, 0.5),
      0.5,
      bot_uppercut_dva.MAX_X
    )((action, cond) => {
      action.action_id = 'dva+j';
      action.keys = [GameKey.j];
      action.expression = cond!.and(BotVal.EnemyY, '>', 0).done()
      return action;
    }),

    // "d^j"
    bot_uppercut_dva(0, bot_uppercut_dva.DESIRE, bot_uppercut_dva.MAX_X, bot_uppercut_dva.MIN_X + bot_uppercut_dva.MAX_X)((action) => {
      action.action_id = "d^j";
      action.keys = [GameKey.d, GameKey.U, GameKey.j];
      return action;
    }),

    // "d^j+a"
    bot_uppercut_dva(150, 1, bot_uppercut_dva.MIN_X, bot_uppercut_dva.MAX_X)((action) => {
      action.action_id = "d^j+a";
      action.keys = [GameKey.a];
      return action;
    }),
  ).states(
    [StateEnum.Rowing],
    [bot_ball_dfj.ID]
  ).states(
    [StateEnum.Catching],
    ['catching_d>j']
  ).frames(
    [
      ...frames.standings,
      ...frames.walkings,
      ...frames.runnings
    ],
    ['d^j', bot_ball_dfj.ID, bot_ball_dfa.ID, bot_uppercut_dva.ID]
  ).frames(
    [
      ...frames.punchs
    ],
    [bot_uppercut_dva.ID]
  ).frames(
    arithmetic_progression(235, 250, 1),
    ["d>a+a"]
  ).frames(
    // jump_sword: ground_part
    [...arithmetic_progression(260, 265, 1), ...arithmetic_progression(277, 282, 1)],
    ["dva+a", "dva+j"]
  ).frames(
    // jump_sword: jump_part
    arithmetic_progression(266, 267, 1),
    ["d^j+a"]
  );
  return data;
}
