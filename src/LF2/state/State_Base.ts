import type { IBdyInfo, IFrameInfo, IItrInfo, TNextFrame } from "../defines";
import type Entity from "../entity/Entity";
import type { ICube } from "../World";
export enum WhatNext {
  Interrupt = 1,
  Continue = 0,
}
export class State_Base {
  state: number | string = '';
  update(e: Entity): void { };
  enter?(e: Entity, prev_frame: IFrameInfo): void;
  leave?(e: Entity, next_frame: IFrameInfo): void;
  on_landing?(e: Entity): void;
  get_gravity(e: Entity): number { return e.world.gravity }

  before_collision?(
    attacker: Entity, target: Entity,
    itr: IItrInfo, bdy: IBdyInfo,
    a_cube: ICube, b_cube: ICube
  ): WhatNext;

  on_collision?(
    attacker: Entity, target: Entity,
    itr: IItrInfo, bdy: IBdyInfo,
    a_cube: ICube, b_cube: ICube
  ): void;

  before_be_collided?(
    attacker: Entity, target: Entity,
    itr: IItrInfo, bdy: IBdyInfo,
    a_cube: ICube, b_cube: ICube
  ): WhatNext;

  on_be_collided?(
    attacker: Entity, target: Entity,
    itr: IItrInfo, bdy: IBdyInfo,
    a_cube: ICube, b_cube: ICube
  ): void;

  get_auto_frame?(e: Entity): IFrameInfo | undefined;

  get_sudden_death_frame?(e: Entity): TNextFrame | undefined;

  get_caught_end_frame?(e: Entity): TNextFrame | undefined;

  find_frame_by_id?(e: Entity, id: string | undefined): IFrameInfo | undefined
}
export default State_Base;