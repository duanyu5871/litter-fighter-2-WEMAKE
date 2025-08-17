
import type { IBounding, IBdyInfo, IFrameInfo, IItrInfo } from "../defines";
import type { Entity } from "../entity/Entity";

export interface ICollision {
  /**
   * 攻击方
   *
   * @type {Entity}
   * @memberof ICollision
   */
  attacker: Entity;

  /**
   * 被攻击方
   *
   * @type {Entity}
   * @memberof ICollision
   */
  victim: Entity;

  /**
   * 攻击方的itr
   *
   * @type {IItrInfo}
   * @memberof ICollision
   */
  itr: IItrInfo;

  /**
   * 被攻击方的bdy
   *
   * @type {IBdyInfo}
   * @memberof ICollision
   */
  bdy: IBdyInfo;

  /**
   * 攻击方的frame
   *
   * @type {IFrameInfo}
   * @memberof ICollision
   */
  aframe: IFrameInfo;

  /**
   * 被攻击方的frame
   *
   * @type {IFrameInfo}
   * @memberof ICollision
   */
  bframe: IFrameInfo;

  /**
   * 攻击方判定框
   *
   * @type {IBounding}
   * @memberof ICollision
   */
  a_cube: IBounding;

  /**
   * 被攻击方的判定框
   *
   * @type {IBounding}
   * @memberof ICollision
   */
  b_cube: IBounding;

  /**
   *
   *
   * @type {number}
   * @memberof ICollision
   */
  v_rest?: number;
}
