import { GameKey as GK, IEntityData, StateEnum } from "../../defines";
import { probability } from "../../defines/probability";
import { arithmetic_progression } from "../../utils";
import { bot_ball_continuation } from "./bot_ball_continuation";
import { bot_ball_dfa } from "./bot_ball_dfa";
import { bot_uppercut_dua } from "./bot_uppercut_dua";
import { BotBuilder } from "./BotBuilder";
import { frames } from "./frames";


export function make_fighter_data_jack(data: IEntityData) {
  BotBuilder.make(data).set_actions(
    // d>a
    bot_ball_dfa(40, 1 / 30, 50),

    // d>a+d>a
    bot_ball_continuation("d>a+d>a", probability(3, 0.8), 40, GK.d, 'F', GK.a),

    // d^a
    bot_uppercut_dua(225, bot_uppercut_dua.DESIRE, bot_uppercut_dua.MIN_X, bot_uppercut_dua.MAX_X),
  ).set_states(
    [StateEnum.Rowing, StateEnum.Catching],
    ["d^a"]
  ).set_frames(
    [
      ...frames.standings,
      ...frames.walkings
    ],
    ["d^a", "d>a"]
  ).set_frames(
    frames.punchs,
    ["d^a"]
  ).set_frames(
    arithmetic_progression(240, 247, 1),
    ["d>a+d>a"]
  );
  return data;
}
