import { IFrameInfo } from "../defines";
import type { Entity } from "../entity/Entity";
import State_Base from "./State_Base";

export default class WeaponState_Base extends State_Base {
  override get_auto_frame(e: Entity): IFrameInfo | undefined {
    const { frames, indexes } = e.data;
    if (e.position.y > 0) {
      const fid = e.lf2.random_get(indexes?.in_the_skys);
      return fid ? frames[fid] : void 0
    }
    return indexes?.on_ground ? frames[indexes.on_ground] : void 0;
  }

  override update(e: Entity): void {
    e.handle_ground_velocity_decay();
  }
}
