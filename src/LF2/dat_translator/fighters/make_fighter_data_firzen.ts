import { BotCtrlState } from "../../controller/BotCtrlState";
import {
  BotVal, Defines, EntityGroup, EntityVal, GameKey as GK, IBotData, IEntityData,
  StateEnum
} from "../../defines";
import { add_entity_groups } from "../add_entity_to_group";
import { CondMaker } from "../CondMaker";
import { standing_frame_ids } from "./standing_frame_ids";
import { walking_frame_ids } from "./walking_frame_ids";


export function make_fighter_data_firzen(data: IEntityData) {
  add_entity_groups(data.base, EntityGroup.Boss);
  data.base.ce = 2;


  const bot: IBotData = data.base.bot = {
    actions: {},
    frames: {},
    states: {}
  }
  bot.frames![
    '' + [
      '' + standing_frame_ids,
      '' + walking_frame_ids,
    ]
  ] = ['d>j', 'd^a', 'd^j']

  bot.states![StateEnum.Attacking] = ['cancel_d>j', 'd^a+a']
  bot.actions['d^a+a'] = {
    desire: Defines.calc_desire(0.05),
    keys: [GK.a]
  }
  bot.actions['cancel_d>j'] = {
    desire: Defines.calc_desire(0.01),
    status: [BotCtrlState.Chasing],
    e_ray: [{ x: 1, z: 0, reverse: true }],
    keys: [GK.j]
  }
  bot.actions['d>j'] = {
    desire: Defines.calc_desire(0.02),
    status: [BotCtrlState.Chasing],
    e_ray: [{ x: 1, z: 0, min_x: 200 }],
    expression: new CondMaker<BotVal | EntityVal>()
      .add(EntityVal.MP, '>', 50)
      .done(),
    keys: [GK.d, 'F', GK.j]
  }
  bot.actions['d^j'] = {
    desire: Defines.calc_desire(0.02),
    status: [BotCtrlState.Chasing],
    expression: new CondMaker<BotVal | EntityVal>()
      .add(EntityVal.MP, '>', 250)
      .done(),
    keys: [GK.d, GK.U, GK.j]
  }
  bot.actions['d^a'] = {
    desire: Defines.calc_desire(0.04),
    status: [BotCtrlState.Chasing],
    expression: new CondMaker<BotVal | EntityVal>()
      .add(EntityVal.MP, '>', 100)
      .done(),
    keys: [GK.d, GK.U, GK.a]
  }
  return data;
}
