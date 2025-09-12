import { Defines, INextFrame, ItrKind, StateEnum, type IFrameInfo } from "../defines";
import { ICollision } from "../base/ICollision";
import type { Entity } from "../entity/Entity";
import { make_smoke } from "./make_smoke";
export class State_Base {
  on_frame_changed?(e: Entity, frame: IFrameInfo, prev_frame: IFrameInfo): void;
  state: number | string = "";
  pre_update?(e: Entity): void;
  update(e: Entity): void {
    switch (this.state) {
      case StateEnum.Burning:
      case StateEnum.BurnRun:
        e.apply_opoints([make_smoke(e)])
        break;
    }
  }
  enter?(e: Entity, prev_frame: IFrameInfo): void;
  leave(e: Entity, next_frame: IFrameInfo): void {
    switch (this.state) {
      case StateEnum.HealSelf:
        e.healing = Defines.STATE_HEAL_SELF_HP;
        break;
    }
  }
  on_landing?(e: Entity): void;
  get_gravity(e: Entity): number {
    return e.world.gravity;
  }

  on_be_collided?(collision: ICollision): void;

  get_auto_frame?(e: Entity): IFrameInfo | undefined;

  get_sudden_death_frame?(e: Entity): INextFrame | undefined;

  get_caught_end_frame?(e: Entity): INextFrame | undefined;

  find_frame_by_id?(e: Entity, id: string | undefined): IFrameInfo | undefined;
}
export default State_Base;
