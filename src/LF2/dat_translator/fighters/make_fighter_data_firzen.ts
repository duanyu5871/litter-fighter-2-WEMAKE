import {
  EntityGroup,
  IEntityData,
  StateEnum
} from "../../defines";
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

  BotBuilder.make(data).actions(
    // d^a
    bot_ball_dfj(50, bot_ball_dfj.DESIRE),

    // d^j
    bot_explosion_duj(250, bot_explosion_duj.DESIRE, -500, 500, 500),

    // ball cancell
    bot_ball_cancelling('cancel_d>j'),

    // disaster
    bot_explosion_dua(100, bot_explosion_dua.DESIRE, -700, 700, 500),

    // disaster + ...a
    bot_chasing_action('d^a+a', ['a'], void 0, bot_chasing_action.DESIRE)
  ).states(
    [StateEnum.Attacking],
    ['cancel_d>j', 'd^a+a']
  ).frames(
    [
      ...frames.standings,
      ...frames.walkings,
    ],
    [bot_ball_dfj.ID, 'd^a', bot_explosion_duj.ID]
  )
  return data;
}
