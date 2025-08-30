import { BotCtrlState } from "../../controller/BotCtrlState";
import { IEntityData, EntityGroup, ArmorEnum, Defines, StateEnum, GameKey as GK } from "../../defines";
import { BotCtrlVal } from "../../defines/BotCtrlVal";
import { EntityVal } from "../../defines/EntityVal";
import { IAiData } from "../../defines/IAiData";
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


  const ai: IAiData = data.base.ai = {
    actions: {},
    frames: {},
    states: {}
  }
  for (const id of standing_frame_ids) ai.frames![id] = ['shaking_dja', 'd^a', 'd^j', 'd>j', 'd>a']
  for (const id of walking_frame_ids) ai.frames![id] = ['shaking_dja', 'd^a', 'd^j', 'd>j', 'd>a']
  for (const id of running_frame_ids) ai.frames![id] = ['shaking_dja', 'd^a', 'd^j', 'd>j', 'd>a']
  ai.states![StateEnum.Injured] = ['injured_dja']
  ai.states![StateEnum.BrokenDefend] = ['injured_dja']
  ai.states![StateEnum.Attacking] = ['shaking_dja']

  ai.actions['injured_dja'] = {
    desire: Defines.calc_desire(0.08),
    expression: new CondMaker<BotCtrlVal | EntityVal>()
      .add(EntityVal.MP, '>', 25)
      .done(),
    keys: [GK.d, GK.j, GK.a]
  }
  ai.actions['shaking_dja'] = {
    desire: Defines.calc_desire(0.08),
    expression: new CondMaker<BotCtrlVal | EntityVal>()
      .add(EntityVal.MP, '>', 25)
      .and(EntityVal.Shaking, '>', 0)
      .done(),
    keys: [GK.d, GK.j, GK.a]
  }
  ai.actions['d>a'] = {
    desire: Defines.calc_desire(0.04),
    status: [BotCtrlState.Chasing],
    expression: new CondMaker<BotCtrlVal | EntityVal>()
      .add(EntityVal.MP, '>', 25)
      .done(),
    keys: [GK.d, 'F', GK.a]
  }
  ai.actions['d>j'] = {
    desire: Defines.calc_desire(0.02),
    status: [BotCtrlState.Chasing],
    e_ray: [{ x: 1, z: 0, min_x: 200 }],
    expression: new CondMaker<BotCtrlVal | EntityVal>()
      .add(EntityVal.MP, '>', 125)
      .done(),
    keys: [GK.d, 'F', GK.j]
  }
  ai.actions['d^j'] = {
    desire: Defines.calc_desire(0.02),
    status: [BotCtrlState.Chasing],
    e_ray: [{ x: 1, z: 0, min_x: -120, max_x: 120, max_d: 10000 }],
    expression: new CondMaker<BotCtrlVal | EntityVal>()
      .add(EntityVal.MP, '>', 100)
      .done(),
    keys: [GK.d, GK.U, GK.j]
  }
  ai.actions['d^a'] = {
    desire: Defines.calc_desire(0.05),
    status: [BotCtrlState.Chasing],
    e_ray: [{ x: 1, z: 0, min_x: 0, max_x: 120 }],
    expression: new CondMaker<BotCtrlVal | EntityVal>().done(),
    keys: [GK.d, GK.U, GK.a]
  }
  return data;
}
