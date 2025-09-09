import {
  EntityGroup,
  IEntityData,
  StateEnum
} from "../../defines";
import { ensure } from "../../utils";
import { bot_ball_dfa } from "./bot_ball_dfa";
import { bot_ball_dfj } from "./bot_ball_dfj";
import { bot_chasing_skill_action } from "./bot_chasing_skill_action";
import { BotBuilder } from "./BotBuilder";
import { frames } from "./frames";

export function make_fighter_data_bat(data: IEntityData) {
  data.base.group = ensure(data.base.group, EntityGroup.Boss);

  BotBuilder.make(data).set_actions(
    // laser_eyes
    bot_ball_dfa(25, 1 / 30),
    // fast_punch
    bot_ball_dfj(50, 1 / 30, 50, 120),
    // bats
    bot_chasing_skill_action('d^j', void 0, 200, 0.05),
    // catching + fast_punch
    bot_chasing_skill_action('dva', void 0)
  ).set_states(
    [StateEnum.Catching],
    ['dva']
  ).set_frames([
    ...frames.standings,
    ...frames.walkings,
    ...frames.runnings
  ], ['d^j', 'd>j', 'd>a'])
  return data;
}
