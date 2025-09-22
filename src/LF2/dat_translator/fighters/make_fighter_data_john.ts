import { EntityVal as E_Val, GK, IEntityData } from "../../defines";
import { bot_ball_dfa } from "./bot_ball_dfa";
import { bot_ball_dfj } from "./bot_ball_dfj";
import { bot_chasing_action } from "./bot_chasing_action";
import { bot_idle_action } from "./bot_idle_action";
import { BotBuilder } from "./BotBuilder";
import { frames } from "./frames";


export function make_fighter_data_john(data: IEntityData) {
  BotBuilder.make(data).set_actions(
    // d>a
    bot_ball_dfa(75, void 0, 100, 10000),
    // d>j
    bot_ball_dfj(100, void 0, 100, 10000),
    // d^a
    bot_chasing_action('d^a', [GK.Defend, GK.Up, GK.Attack], 250),
    // dvj
    bot_idle_action('dvj', [GK.Defend, GK.Down, GK.Jump], 350)((a, c) => {
      a.expression = c.add(E_Val.HpRecoverable, '>', '10').done()
      return a;
    }),
    // d^j
    bot_idle_action('d^j', [GK.Defend, GK.Up, GK.Jump], 350),

  ).set_frames(
    [
      ...frames.standings,
      ...frames.walkings
    ],
    ['d>a', 'd>j', 'd^a', 'd^j', 'dvj']
  );
  return data;
}
