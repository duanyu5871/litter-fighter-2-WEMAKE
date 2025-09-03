import { BotCtrlState } from "../../controller/BotCtrlState";
import {
  IEntityData, EntityGroup, ArmorEnum, Defines, StateEnum, GameKey as GK,
  BotVal, EntityVal, IBotData
} from "../../defines";
import { add_entity_groups } from "../add_entity_to_group";
import { CondMaker } from "../CondMaker";
import { bot_ball_dfj } from "./bot_ball_dfj";
import { bot_chasing_action } from "./bot_chasing_action";
import { bot_chasing_skill_action } from "./bot_chasing_skill_action";
import { bot_explosion_duj } from "./bot_explosion_duj";
import { bot_uppercut_dua } from "./bot_uppercut_dua";
import { BotBuilder } from "./BotBuilder";
import { frames } from "./frames";

export function make_fighter_data_julian(data: IEntityData) {
  add_entity_groups(data.base, EntityGroup.Boss);
  data.base.ce = 3;
  data.base.armor = {
    fireproof: 1,
    antifreeze: 1,
    hit_sounds: ["data/002.wav.mp3"],
    type: ArmorEnum.Fall,
    toughness: Defines.DEFAULT_FALL_VALUE_MAX - Defines.DEFAULT_FALL_VALUE_DIZZY,
  };

  BotBuilder.make(data).actions(
    // ball
    bot_chasing_skill_action('d>a', void 0, 25, 1 / 30),

    // ball + ...a
    bot_chasing_action('d>a+a', ['a'], void 0, 0.5),

    // super-ball
    bot_ball_dfj(125, 1 / 30),

    // explosion
    bot_explosion_duj(100, 1 / 30, -120, 120, 100),

    // uppercut
    bot_uppercut_dua(-1, 1 / 30), {
    action_id: 'injured_dja',
    desire: Defines.desire(0.08),
    expression: new CondMaker<BotVal | EntityVal>()
      .add(EntityVal.MP, '>', 25)
      .done(),
    keys: [GK.d, GK.j, GK.a]
  }, {
    action_id: 'shaking_dja',
    desire: Defines.desire(0.08),
    expression: new CondMaker<BotVal | EntityVal>()
      .add(EntityVal.MP, '>', 25)
      .and(EntityVal.Shaking, '>', 0)
      .done(),
    keys: [GK.d, GK.j, GK.a]
  }).frames([
    ...frames.standings,
    ...frames.walkings,
    ...frames.runnings
  ], [
    'shaking_dja',
    'd^a',
    'd^j',
    'd>j',
    'd>a'
  ]).frames([
    ...frames.punchs,
  ], [
    'd^a', 'shaking_dja'
  ]).states(
    [StateEnum.Attacking],
    ['shaking_dja', 'd>a+a']
  )

  return data;
}
