
import type { IBdyInfo, IBounding, IFrameInfo, IItrInfo } from "../defines";
import type { Entity } from "../entity/Entity";

export interface ICollision {
  /**
   * 攻击方
   *
   * @type {Entity}
   * @memberof ICollision
   */
  readonly attacker: Entity;

  /**
   * 被攻击方
   *
   * @type {Entity}
   * @memberof ICollision
   */
  readonly victim: Entity;

  /**
   * 攻击方的itr
   *
   * @type {IItrInfo}
   * @memberof ICollision
   */
  readonly itr: Readonly<IItrInfo>;

  /**
   * 被攻击方的bdy
   *
   * @type {IBdyInfo}
   * @memberof ICollision
   */
  readonly bdy: Readonly<IBdyInfo>;

  /**
   * 攻击方的frame
   *
   * @type {IFrameInfo}
   * @memberof ICollision
   */
  readonly aframe: Readonly<IFrameInfo>;

  /**
   * 被攻击方的frame
   *
   * @type {IFrameInfo}
   * @memberof ICollision
   */
  readonly bframe: Readonly<IFrameInfo>;

  /**
   * 攻击方判定框
   *
   * @type {IBounding}
   * @memberof ICollision
   */
  readonly a_cube: Readonly<IBounding>;

  /**
   * 被攻击方的判定框
   *
   * @type {IBounding}
   * @memberof ICollision
   */
  readonly b_cube: Readonly<IBounding>;

  /**
   *
   *
   * @type {number}
   * @memberof ICollision
   */
  v_rest?: number;
}
