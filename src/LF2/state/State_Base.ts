import type { IFrameInfo, TNextFrame } from "../defines";
import type Entity from "../entity/Entity";
import { ICollisionInfo } from "../entity/ICollisionInfo";
export enum WhatNext {
  SkipState = 3,
  SkipEntity = 2,
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

  before_collision?(collision: ICollisionInfo): WhatNext;

  on_collision?(collision: ICollisionInfo): void;


  /**
   * 被攻击前被调用
   * 
   * - 如果需要修改实体的帧，应该使用next_frame，否则将影响后续的碰撞判断
   * 
   * @param {ICollisionInfo} collision 碰撞信息
   * 
   * @returns {WhatNext} 后续处理方式：
   *    - 返回WhatNext.Interrupt，target.on_be_collided的后续逻辑将被跳过
   *    - 返回WhatNext.Continue，target.on_be_collided的后续逻辑将继续执行
   */
  before_be_collided?(collision: ICollisionInfo): WhatNext;

  on_be_collided?(collision: ICollisionInfo): void;

  get_auto_frame?(e: Entity): IFrameInfo | undefined;

  get_sudden_death_frame?(e: Entity): TNextFrame | undefined;

  get_caught_end_frame?(e: Entity): TNextFrame | undefined;

  find_frame_by_id?(e: Entity, id: string | undefined): IFrameInfo | undefined
}
export default State_Base;