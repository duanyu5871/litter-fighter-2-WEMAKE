import { ItrKind, type IFrameInfo, type TNextFrame } from "../defines";
import type Entity from "../entity/Entity";
import { ICollision } from "../entity/ICollision";
export enum WhatNext {
  OnlyState = 3,
  OnlyEntity = 2,
  SkipAll = 1,
  Continue = 0,
}
export class State_Base {
  state: number | string = '';
  update(e: Entity): void { };
  enter?(e: Entity, prev_frame: IFrameInfo): void;
  leave?(e: Entity, next_frame: IFrameInfo): void;
  on_landing?(e: Entity): void;
  get_gravity(e: Entity): number { return e.world.gravity }

  before_collision(collision: ICollision): WhatNext {
    switch (collision.itr.kind) {
      case ItrKind.Block:
        return WhatNext.SkipAll;
    }
    return WhatNext.Continue
  }

  on_collision?(collision: ICollision): void;


  /**
   * 被攻击前被调用
   * 
   * - 如果需要修改实体的帧，应该使用next_frame，否则将影响后续的碰撞判断
   * 
   * @param {ICollision} collision 碰撞信息
   * 
   * @returns {WhatNext} 后续处理方式：
   *    - 返回WhatNext.Interrupt，target.on_be_collided的后续逻辑将被跳过
   *    - 返回WhatNext.Continue，target.on_be_collided的后续逻辑将继续执行
   */
  before_be_collided(collision: ICollision): WhatNext {
    switch (collision.itr.kind) {
      case ItrKind.Block:
        return WhatNext.OnlyEntity;
    }
    return WhatNext.Continue
  }

  on_be_collided?(collision: ICollision): void;

  get_auto_frame?(e: Entity): IFrameInfo | undefined;

  get_sudden_death_frame?(e: Entity): TNextFrame | undefined;

  get_caught_end_frame?(e: Entity): TNextFrame | undefined;

  find_frame_by_id?(e: Entity, id: string | undefined): IFrameInfo | undefined
}
export default State_Base;