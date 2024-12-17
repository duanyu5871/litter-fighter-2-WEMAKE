import type { IBdyInfo, IFrameInfo, IItrInfo, TNextFrame } from "../../defines";
import type Entity from "../../entity/Entity";
import type { ICube } from "../../World";
export enum WhatNext {
  Interrupt = 1,
  Continue = 0,
}
export class BaseState<E extends Entity = Entity> {
  state: number = -1;
  update(e: E): void { };
  enter?(e: E, prev_frame: IFrameInfo): void;
  leave?(e: E, next_frame: IFrameInfo): void;
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

  get_auto_frame?(e: E): IFrameInfo | undefined;

  get_sudden_death_frame?(e: E): TNextFrame | undefined;

  get_caught_end_frame?(e: E): TNextFrame | undefined;

  find_frame_by_id?(e: E, id: string | undefined): IFrameInfo | undefined
}
export default BaseState;