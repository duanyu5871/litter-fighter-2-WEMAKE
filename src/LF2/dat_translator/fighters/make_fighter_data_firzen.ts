import {
  EntityGroup,
  IEntityData,
  StateEnum
} from "../../defines";
import { probability } from "../../defines/probability";
import { add_entity_groups } from "../add_entity_to_group";
import { bot_ball_cancelling } from "./bot_ball_cancelling";
import { bot_ball_dfj } from "./bot_ball_dfj";
import { bot_chasing_action } from "./bot_chasing_action";
import { bot_explosion_dua } from "./bot_explosion_dua";
import { bot_explosion_duj } from "./bot_explosion_duj";
import { BotBuilder } from "./BotBuilder";
import { frames } from "./frames";


export function make_fighter_data_firzen(data: IEntityData) {
  add_entity_groups(data.base, EntityGroup.Boss);
  data.base.ce = 2;

  BotBuilder.make(data).set_actions(
    // d^a
    bot_ball_dfj(50, 1 / 30),

    // d^j
    bot_explosion_duj(250, 1 / 30, -500, 500, 500),

    // ball cancell
    bot_ball_cancelling('cancel_d>j'),

    // disaster
    bot_explosion_dua(100, 1 / 30, -700, 700, 500),

    // disaster + ...a
    bot_chasing_action('d^a+a', ['a'], void 0, probability(2, 0.1))
  ).set_states(
    [StateEnum.Attacking],
    ['cancel_d>j', 'd^a+a']
  ).set_frames(
    [
      ...frames.standings,
      ...frames.walkings,
    ],
    [bot_ball_dfj.ID, bot_explosion_dua.ID, bot_explosion_duj.ID]
  )
  return data;
}
