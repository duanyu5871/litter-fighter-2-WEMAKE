import { BotCtrlState } from "../../controller/BotCtrlState";
import {
  BotVal,
  Defines,
  EntityGroup,
  EntityVal,
  GameKey as GK,
  IBotData,
  IEntityData,
  StateEnum
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
    desire: Defines.calc_desire(0.05),
    status: [BotCtrlState.Chasing],
    e_ray: [{ x: 1, z: 0, min_x: 200 }],
    expression: new CondMaker<BotVal | EntityVal>()
      .add(EntityVal.MP, '>', 25)
      .done(),
    keys: [GK.d, 'F', GK.a]
  }, {
    // punch
    action_id: 'd>j',
    desire: Defines.calc_desire(0.05),
    status: [BotCtrlState.Chasing],
    e_ray: [{ x: 1, z: 0, min_x: 100, max_x: 300 }],
    expression: new CondMaker<BotVal | EntityVal>()
      .add(EntityVal.MP, '>', 50)
      .done(),
    keys: [GK.d, 'F', GK.j]
  }, {
    // bat
    action_id: 'd^j',
    desire: Defines.calc_desire(0.05),
    status: [BotCtrlState.Chasing],
    expression: new CondMaker<BotVal | EntityVal>()
      .add(EntityVal.MP, '>', 200)
      .done(),
    keys: [GK.d, GK.U, GK.j]
  }, {
    // catching
    action_id: 'dva',
    desire: Defines.calc_desire(0.05),
    status: [BotCtrlState.Chasing],
    expression: new CondMaker<BotVal | EntityVal>().done(),
    keys: [GK.d, GK.D, GK.a]
  }).states(
    [StateEnum.Catching],
    ['dva']
  ).frames([
    ...standing_frame_ids,
    ...walking_frame_ids,
    ...running_frame_ids
  ], ['d^j', 'd>j', 'd>a'])
  return data;
}
