import { new_team } from "../base";
import { Defines } from "../defines/defines";
import type Entity from "../entity/Entity";
import { Factory } from "../entity/Factory";
import { is_character } from "../entity/type_check";
import State_Base from "./State_Base";

export default class State_TransformTo8XXX extends State_Base {
  override enter(e: Entity): void {
    const oid = '' + (this.state - 8000);
    const data = e.lf2.datas.find(oid);
    if (data) {
      const creator = Factory.inst.get_entity_creator(data.type);
      if (creator) {
        const new_entity = creator(e.world, data);
        if (!e.lastest_collided) debugger;
        new_entity.team = e.lastest_collided?.attacker.team || new_team();
        if (is_character(new_entity)) {
          const creator = Factory.inst.get_ctrl_creator(data.id)
          new_entity.controller = creator?.(e.controller?.player_id ?? '', new_entity)
        }
        new_entity.position.set(e.position.x, e.position.y, e.position.z);
        new_entity.variant = 1;
        new_entity.reserve = e.reserve;
        new_entity.attach();
      }
    }
    e.enter_frame({ id: Defines.FrameId.Gone })
  }
}
