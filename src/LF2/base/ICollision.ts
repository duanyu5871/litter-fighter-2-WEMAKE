import type { IBdyInfo, IFrameInfo, IItrInfo } from "../defines";
import type { IBounding } from "../defines/IBounding";
import type { Entity } from "../entity/Entity";

export interface ICollision {
  /**
   * 攻击方
   *
   * @type {Entity}
   * @memberof ICollisionInfo
   */
  attacker: Entity;

  /**
   * 被攻击方
   *
   * @type {Entity}
   * @memberof ICollisionInfo
   */
  victim: Entity;

  /**
   * 攻击方的itr
   *
   * @type {IItrInfo}
   * @memberof ICollisionInfo
   */
  itr: IItrInfo;

  /**
   * 被攻击方的bdy
   *
   * @type {IBdyInfo}
   * @memberof ICollisionInfo
   */
  bdy: IBdyInfo;

  /**
   * 攻击方的frame
   *
   * @type {IFrameInfo}
   * @memberof ICollisionInfo
   */
  aframe: IFrameInfo;

  /**
   * 被攻击方的frame
   *
   * @type {IFrameInfo}
   * @memberof ICollisionInfo
   */
  bframe: IFrameInfo;

  /**
   * 攻击方判定框
   *
   * @type {IBounding}
   * @memberof ICollisionInfo
   */
  a_cube: IBounding;

  /**
   * 被攻击方的判定框
   *
   * @type {IBounding}
   * @memberof ICollisionInfo
   */
  b_cube: IBounding;

  /**
   *
   *
   * @type {number}
   * @memberof ICollisionInfo
   */
  v_rest?: number;
}
