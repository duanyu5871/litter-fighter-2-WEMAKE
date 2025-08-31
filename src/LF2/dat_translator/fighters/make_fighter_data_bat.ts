import { BotCtrlState } from "../../controller/BotCtrlState";
import {
  BotVal,
  Defines,
  EntityGroup,
  EntityVal,
  GameKey as GK,
  IBotData,
  IEntityData
} from "../../defines";
import { add_entity_groups } from "../add_entity_to_group";
import { CondMaker } from "../CondMaker";
import { BotBuilder } from "./BotBuilder";
import { running_frame_ids } from "./running_frame_ids";
import { standing_frame_ids } from "./standing_frame_ids";
import { walking_frame_ids } from "./walking_frame_ids";
export function make_fighter_data_bat(data: IEntityData) {
  add_entity_groups(data.base, EntityGroup.Boss);
  BotBuilder.make(data).actions({
    action_id: 'd>a',
    desire: Defines.calc_desire(0.04),
    status: [BotCtrlState.Chasing],
    expression: new CondMaker<BotVal | EntityVal>()
      .add(EntityVal.MP, '>', 25)
      .done(),
    keys: [GK.d, 'F', GK.a]
  }, {
    action_id: 'd>j',
    desire: Defines.calc_desire(0.02),
    status: [BotCtrlState.Chasing],
    e_ray: [{ x: 1, z: 0, min_x: 200 }],
    expression: new CondMaker<BotVal | EntityVal>()
      .add(EntityVal.MP, '>', 125)
      .done(),
    keys: [GK.d, 'F', GK.j]
  }, {
    action_id: 'd^j',
    desire: Defines.calc_desire(0.02),
    status: [BotCtrlState.Chasing],
    e_ray: [{ x: 1, z: 0, min_x: -120, max_x: 120, max_d: 10000 }],
    expression: new CondMaker<BotVal | EntityVal>()
      .add(EntityVal.MP, '>', 100)
      .done(),
    keys: [GK.d, GK.U, GK.j]
  }, {
    action_id: 'dva',
    desire: Defines.calc_desire(0.05),
    status: [BotCtrlState.Chasing],
    e_ray: [{ x: 1, z: 0, min_x: 0, max_x: 120 }],
    expression: new CondMaker<BotVal | EntityVal>().done(),
    keys: [GK.d, GK.U, GK.a]
  }).frames([
    ...standing_frame_ids,
    ...walking_frame_ids,
    ...running_frame_ids
  ], ['shaking_dja', 'd^a', 'd^j', 'd>j', 'd>a'])
  return data;
}
