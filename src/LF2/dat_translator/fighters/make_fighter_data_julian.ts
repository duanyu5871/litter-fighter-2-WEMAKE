import { BotCtrlState } from "../../controller/BotCtrlState";
import {
  IEntityData, EntityGroup, ArmorEnum, Defines, StateEnum, GameKey as GK,
  BotVal, EntityVal, IBotData
} from "../../defines";
import { add_entity_groups } from "../add_entity_to_group";
import { CondMaker } from "../CondMaker";
import { running_frame_ids } from "./running_frame_ids";
import { standing_frame_ids } from "./standing_frame_ids";
import { walking_frame_ids } from "./walking_frame_ids";

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


  const bot: IBotData = data.base.bot = {
    actions: {},
    frames: {},
    states: {}
  }
  bot.frames![
    '' + [
      '' + standing_frame_ids,
      '' + walking_frame_ids,
      '' + running_frame_ids
    ]
  ] = ['shaking_dja', 'd^a', 'd^j', 'd>j', 'd>a']

  bot.states![[StateEnum.Injured, StateEnum.BrokenDefend].join() as any] = ['injured_dja']
  bot.states![StateEnum.Attacking] = ['shaking_dja']

  bot.actions['injured_dja'] = {
    desire: Defines.calc_desire(0.08),
    expression: new CondMaker<BotVal | EntityVal>()
      .add(EntityVal.MP, '>', 25)
      .done(),
    keys: [GK.d, GK.j, GK.a]
  }
  bot.actions['shaking_dja'] = {
    desire: Defines.calc_desire(0.08),
    expression: new CondMaker<BotVal | EntityVal>()
      .add(EntityVal.MP, '>', 25)
      .and(EntityVal.Shaking, '>', 0)
      .done(),
    keys: [GK.d, GK.j, GK.a]
  }
  bot.actions['d>a'] = {
    desire: Defines.calc_desire(0.04),
    status: [BotCtrlState.Chasing],
    expression: new CondMaker<BotVal | EntityVal>()
      .add(EntityVal.MP, '>', 25)
      .done(),
    keys: [GK.d, 'F', GK.a]
  }
  bot.actions['d>j'] = {
    desire: Defines.calc_desire(0.02),
    status: [BotCtrlState.Chasing],
    e_ray: [{ x: 1, z: 0, min_x: 200 }],
    expression: new CondMaker<BotVal | EntityVal>()
      .add(EntityVal.MP, '>', 125)
      .done(),
    keys: [GK.d, 'F', GK.j]
  }
  bot.actions['d^j'] = {
    desire: Defines.calc_desire(0.02),
    status: [BotCtrlState.Chasing],
    e_ray: [{ x: 1, z: 0, min_x: -120, max_x: 120, max_d: 10000 }],
    expression: new CondMaker<BotVal | EntityVal>()
      .add(EntityVal.MP, '>', 100)
      .done(),
    keys: [GK.d, GK.U, GK.j]
  }
  bot.actions['d^a'] = {
    desire: Defines.calc_desire(0.05),
    status: [BotCtrlState.Chasing],
    e_ray: [{ x: 1, z: 0, min_x: 0, max_x: 120 }],
    expression: new CondMaker<BotVal | EntityVal>().done(),
    keys: [GK.d, GK.U, GK.a]
  }
  return data;
}
