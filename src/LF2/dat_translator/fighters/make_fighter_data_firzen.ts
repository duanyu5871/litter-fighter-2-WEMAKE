import { BotCtrlState } from "../../controller/BotCtrlState";
import { Defines, EntityGroup, GameKey as GK, IEntityData, StateEnum } from "../../defines";
import { BotCtrlVal } from "../../defines/BotCtrlVal";
import { EntityVal } from "../../defines/EntityVal";
import { IAiData } from "../../defines/IAiData";
import { add_entity_groups } from "../add_entity_to_group";
import { CondMaker } from "../CondMaker";
import { standing_frame_ids } from "./standing_frame_ids";
import { walking_frame_ids } from "./walking_frame_ids";


export function make_fighter_data_firzen(data: IEntityData) {
  add_entity_groups(data.base, EntityGroup.Boss);
  data.base.ce = 2;


  const ai: IAiData = data.base.ai = {
    actions: {},
    frames: {},
    states: {}
  }
  for (const id of standing_frame_ids) ai.frames![id] = ['d>j', 'd^a', 'd^j']
  for (const id of walking_frame_ids) ai.frames![id] = ['d>j', 'd^a', 'd^j']
  ai.states![StateEnum.Attacking] = ['cancel_d>j']
  ai.actions['cancel_d>j'] = {
    desire: Defines.calc_desire(0.01),
    status: [BotCtrlState.Chasing],
    e_ray: [{ x: 1, z: 0, reverse: true }],
    keys: [GK.j]
  }
  ai.actions['d>j'] = {
    desire: Defines.calc_desire(0.02),
    status: [BotCtrlState.Chasing],
    e_ray: [{ x: 1, z: 0, min_x: 200 }],
    expression: new CondMaker<BotCtrlVal | EntityVal>()
      .add(EntityVal.MP, '>', 50)
      .done(),
    keys: [GK.d, 'F', GK.j]
  }
  ai.actions['d^j'] = {
    desire: Defines.calc_desire(0.02),
    status: [BotCtrlState.Chasing],
    expression: new CondMaker<BotCtrlVal | EntityVal>()
      .add(EntityVal.MP, '>', 250)
      .done(),
    keys: [GK.d, GK.U, GK.j]
  }
  ai.actions['d^a'] = {
    desire: Defines.calc_desire(0.04),
    status: [BotCtrlState.Chasing],
    expression: new CondMaker<BotCtrlVal | EntityVal>()
      .add(EntityVal.MP, '>', 100)
      .done(),
    keys: [GK.d, GK.U, GK.a]
  }
  return data;
}
