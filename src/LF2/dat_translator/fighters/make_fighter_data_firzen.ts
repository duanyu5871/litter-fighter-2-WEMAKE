import { BotCtrlState } from "../../controller/BotCtrlState";
import { IEntityData, EntityGroup, Defines, GameKey as GK } from "../../defines";
import { BotCtrlVal } from "../../defines/BotCtrlVal";
import { EntityVal } from "../../defines/EntityVal";
import { IAiData } from "../../defines/IAiData";
import { arithmetic_progression, ensure } from "../../utils";
import { add_entity_groups } from "../add_entity_to_group";
import { CondMaker } from "../CondMaker";


export const standing_frame_ids = arithmetic_progression(0, 3, 1).map(v => '' + v)
export const walking_frame_ids = arithmetic_progression(0, 5, 1).map(v => 'walking_' + v)
export const runing_frame_ids = arithmetic_progression(0, 3, 1).map(v => 'running_' + v)

export function make_fighter_data_firzen(data: IEntityData) {
  add_entity_groups(data.base, EntityGroup.Boss);
  data.base.ce = 2;


  const ai: IAiData = data.base.ai = {
    actions: {},
    frames: {}
  }
  for (const id of standing_frame_ids) ai.frames![id] = ['d>j']
  for (const id of walking_frame_ids) ai.frames![id] = ['d>j']

  ai.actions['d>j'] = {
    desire: Defines.calc_desire(0.05),
    status: [BotCtrlState.Chasing],
    e_ray: [{ x: 1, z: 0, min_x: 200 }],
    expression: new CondMaker<BotCtrlVal | EntityVal>()
      .add(EntityVal.MP, '>', 50)
      .done(),
    keys: [GK.Defend, 'F', GK.Jump]
  }
  return data;
}
