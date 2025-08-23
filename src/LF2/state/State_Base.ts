import { INextFrame, ItrKind, type IFrameInfo } from "../defines";
import { ICollision } from "../base/ICollision";
import type { Entity } from "../entity/Entity";
export class State_Base {
  on_frame_changed?(e: Entity, frame: IFrameInfo, prev_frame: IFrameInfo): void;
  state: number | string = "";
  pre_update?(e: Entity): void;
  update(e: Entity): void { }
  enter?(e: Entity, prev_frame: IFrameInfo): void;
  leave?(e: Entity, next_frame: IFrameInfo): void;
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
