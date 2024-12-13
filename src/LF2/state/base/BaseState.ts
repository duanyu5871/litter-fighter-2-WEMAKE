import type { IBdyInfo, IFrameInfo, IItrInfo, TNextFrame } from "../../defines";
import type Entity from "../../entity/Entity";
import type { ICube } from "../../World";
export enum WhatNext {
  Interrupt = 1,
  Continue = 0,
}
export class BaseState<E extends Entity = Entity, F extends IFrameInfo = IFrameInfo> {
  state: number = -1;
  update(e: E): void { };
  enter?(e: E, prev_frame: F): void;
  leave?(e: E, next_frame: F): void;
  on_landing(e: E): void { };
  get_gravity(e: E): number { return e.world.gravity }

  before_collision?(
    attacker: E, target: Entity,
    itr: IItrInfo, bdy: IBdyInfo,
    a_cube: ICube, b_cube: ICube
  ): WhatNext;

  on_collision?(
    attacker: E, target: Entity,
    itr: IItrInfo, bdy: IBdyInfo,
    a_cube: ICube, b_cube: ICube
  ): void;

  before_be_collided?(
    attacker: Entity, target: E,
    itr: IItrInfo, bdy: IBdyInfo,
    a_cube: ICube, b_cube: ICube
  ): WhatNext;

  on_be_collided?(
    attacker: Entity, target: E,
    itr: IItrInfo, bdy: IBdyInfo,
    a_cube: ICube, b_cube: ICube
  ): void;

  get_auto_frame?(e: E): F | undefined;

  get_sudden_death_frame?(e: E): TNextFrame;

  get_caught_end_frame?(e: E): TNextFrame;

  find_frame_by_id?(e: E, id: string | undefined): F | undefined
}
export default BaseState;