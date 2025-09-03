import { IEntityData, EntityGroup, EntityVal } from "../../defines";
import { add_entity_groups } from "../add_entity_to_group";
import { bot_ball_dfa } from "./bot_ball_dfa";
import { bot_ball_dfj } from "./bot_ball_dfj";
import { bot_chasing_skill_action } from "./bot_chasing_skill_action";
import { bot_uppercut_duj } from "./bot_uppercut_duj";
import { BotBuilder } from "./BotBuilder";
import { frames } from "./frames";


export function make_figther_data_louisex(data: IEntityData): IEntityData {

  add_entity_groups(data.base, EntityGroup.Boss);
  BotBuilder.make(data).set_actions(
    // d>a
    bot_ball_dfa(150, 1 / 30, 120, 400),
    // d>j
    bot_ball_dfj(50, void 0, 120, 250),
    // d^j
    bot_uppercut_duj(100, 1 / 30, -10, 120),
    // dja
    bot_chasing_skill_action('dja', void 0, void 0, 0.01)((e, c) => {
      e.expression = c?.and(EntityVal.HP_P, '<', 33).done();
      return e;
    })
  ).set_frames(
    [
      ...frames.standings,
      ...frames.walkings,
    ],
    ['d^j', 'd>a', 'd>j', 'dja']
  ).set_frames(
    [
      ...frames.punchs,
    ],
    ['d^j']
  ).set_dataset({
    w_atk_f_x: 100,
    j_atk_f_x: 120,
  });
  return data;
}
