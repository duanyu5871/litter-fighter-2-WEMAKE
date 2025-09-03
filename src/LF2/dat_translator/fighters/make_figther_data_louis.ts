import { IEntityData, ArmorEnum, EntityVal } from "../../defines";
import { CondMaker } from "../CondMaker";
import { bot_ball_dfa } from "./bot_ball_dfa";
import { bot_ball_dfj } from "./bot_ball_dfj";
import { bot_chasing_skill_action } from "./bot_chasing_skill_action";
import { bot_uppercut_dua } from "./bot_uppercut_dua";
import { bot_uppercut_duj } from "./bot_uppercut_duj";
import { BotBuilder } from "./BotBuilder";
import { frames } from "./frames";

/**
 *
 * @todo
 * @export
 * @param {IEntityData} data
 * @return {IEntityData} 
 */
export function make_figther_data_louis(data: IEntityData): IEntityData {
  data.base.armor = {
    hit_sounds: ["data/085.wav.mp3"],
    type: ArmorEnum.Defend,
    fulltime: false,
    toughness: 30,
  };
  for (const k in data.frames) {
    const ja = data.frames[k].hit?.sequences?.["ja"];
    if (!ja || !("id" in ja) || ja.id !== "300") continue;
    ja.expression = new CondMaker()
      .add(EntityVal.HP_P, "<=", 33)
      .or(EntityVal.LF2_NET_ON, "==", 1)
      .done();
  }
  BotBuilder.make(data).actions(
    // d>a
    bot_ball_dfa(150, void 0, 120, 400),
    // d>j
    bot_ball_dfj(50, void 0, 120, 250),
    // d^j
    bot_uppercut_duj(100, 1 / 30, -10, 120),
    // dja
    bot_chasing_skill_action('dja', void 0, void 0, 0.01)((e, c) => {
      e.expression = c?.and(EntityVal.HP_P, '<', 33).done()
      return e;
    })
  ).frames(
    [
      ...frames.standings,
      ...frames.walkings,
    ],
    ['d^j', 'd>a', 'd>j', 'dja']
  ).frames(
    [
      ...frames.punchs,
    ],
    ['d^j']
  )
  return data;
}
