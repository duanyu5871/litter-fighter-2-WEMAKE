import { IEntityData, EntityGroup, EntityVal } from "../../defines";
import { arithmetic_progression } from "../../utils";
import { add_entity_groups } from "../add_entity_to_group";
import { bot_ball_continuation } from "./bot_ball_continuation";
import { bot_ball_dfa } from "./bot_ball_dfa";
import { bot_ball_dfj } from "./bot_ball_dfj";
import { bot_chasing_skill_action } from "./bot_chasing_skill_action";
import { bot_uppercut_duj } from "./bot_uppercut_duj";
import { bot_uppercut_dva } from "./bot_uppercut_dva";
import { BotBuilder } from "./BotBuilder";
import { frames } from "./frames";

/**
 * @param data 
 * @returns 
 */
export function make_figther_data_louisex(data: IEntityData): IEntityData {

  add_entity_groups(data.base, EntityGroup.Boss);
  BotBuilder.make(data).set_actions(
    // d>a
    bot_ball_dfa(100, 1 / 30, 150, 400),
    // `d>a+a`
    bot_ball_continuation(`d>a+a`, 0.5, 100),
    // d^j
    bot_uppercut_dva(0, 1 / 30, -10, 120),
  ).set_frames(
    [
      ...frames.standings,
      ...frames.walkings,
    ],
    ['d>a', 'dva']
  ).set_frames(
    [...frames.punchs],
    ['dva']
  ).set_frames(
    arithmetic_progression(260, 269, 1),
    ['d>a+a']
  ).set_dataset({
    w_atk_f_x: 150,
    w_atk_b_x: 150,
    j_atk_f_x: 160,
    j_atk_b_x: 160,
  });
  return data;
}
