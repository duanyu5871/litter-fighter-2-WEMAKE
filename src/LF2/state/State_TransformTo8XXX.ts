import { new_team } from "../base";
import { Builtin_FrameId } from "../defines";
import type { Entity } from "../entity/Entity";
import { Factory } from "../entity/Factory";
import State_Base from "./State_Base";
export default class State_TransformTo8XXX extends State_Base {
  override enter(e: Entity): void {
    if (typeof this.state !== "number") return;
    const oid = "" + (this.state - 8000);
    const data = e.lf2.datas.find(oid);
    if (data) {
      e.data = data;
      e.team = e.lastest_collided?.attacker.team || new_team();
      e.ctrl = Factory.inst.get_ctrl(data.id, e.ctrl?.player_id ?? "", e);
      e.position.set(
        Math.round(e.position.x),
        Math.round(e.position.y),
        Math.round(e.position.z)
      );
      e.variant = 1;
    }
    e.enter_frame({ id: Builtin_FrameId.Auto });
  }
}
