import {
  EntityGroup,
  IEntityData,
  StateEnum
} from "../../defines";
import { add_entity_groups } from "../add_entity_to_group";
import { bot_ball_dfa } from "./bot_ball_dfa";
import { bot_ball_dfj } from "./bot_ball_dfj";
import { bot_chasing_skill_action } from "./bot_chasing_skill_action";
import { BotBuilder } from "./BotBuilder";
import { frames } from "./frames";

export function make_fighter_data_bat(data: IEntityData) {
  add_entity_groups(data.base, EntityGroup.Boss);

  BotBuilder.make(data).actions(
    // laser_eyes
    bot_ball_dfa(25),
    // fast_punch
    bot_ball_dfj(50, bot_ball_dfj.DESIRE, bot_ball_dfj.MIN_X, 200),
    // bats
    bot_chasing_skill_action('d^j', void 0, 200, 0.05),
    // catching + fast_punch
    bot_chasing_skill_action('dva', void 0)
  ).states(
    [StateEnum.Catching],
    ['dva']
  ).frames([
    ...frames.standings,
    ...frames.walkings,
    ...frames.runnings
  ], ['d^j', bot_ball_dfj.ID, bot_ball_dfa.ID])
  return data;
}
