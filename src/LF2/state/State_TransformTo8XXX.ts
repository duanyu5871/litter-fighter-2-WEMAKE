import { new_team } from "../base";
import { Builtin_FrameId, EntityEnum } from "../defines";
import type { Entity } from "../entity/Entity";
import { Factory } from "../entity/Factory";
import { round } from "../utils/math/base";
import State_Base from "./State_Base";
export default class State_TransformTo8XXX extends State_Base {
  override enter(e: Entity): void {
    if (typeof this.state !== "number") return;
    const oid = "" + (this.state - 8000);
    const data = e.lf2.datas.find(oid);
    const old_data = e.data

    if (data) {
      e.transform(data);
      e.team = e.lastest_collided?.attacker.team || new_team();
      e.position.set(
        round(e.position.x),
        round(e.position.y),
        round(e.position.z)
      );
      e.variant = 1;
    }
    e.enter_frame(e.find_auto_frame());
    const new_type = e.data.type
  
    if (old_data.type !== new_type && new_type === EntityEnum.Fighter) {
      e.world.callbacks.emit("on_fighter_add")(e) // so stupid
    }
  }
}
