import { new_team } from "../base";
import { Builtin_FrameId } from "../defines";
import type Entity from "../entity/Entity";
import { Factory } from "../entity/Factory";
import State_Base from "./State_Base";
export default class State_TransformTo8XXX extends State_Base {
  override enter(e: Entity): void {
    if (typeof this.state !== "number") return;
    const oid = "" + (this.state - 8000);
    const data = e.lf2.datas.find(oid);
    if (data) {
      const creator = Factory.inst.get_entity_creator(data.type);
      if (creator) {
        const new_entity = creator(e.world, data);
        if (!e.lastest_collided) debugger;
        new_entity.team = e.lastest_collided?.attacker.team || new_team();
        new_entity.ctrl = Factory.inst.get_ctrl(
          data.id,
          e.ctrl?.player_id ?? "",
          new_entity,
        );
        new_entity.position.set(
          Math.round(e.position.x),
          Math.round(e.position.y),
          Math.round(e.position.z)
        );
        new_entity.variant = 1;
        new_entity.reserve = e.reserve;
        new_entity.attach();
      }
    }
    e.enter_frame({ id: Builtin_FrameId.Gone });
  }
}
