import type { IBdyInfo, IFrameInfo, IItrInfo } from '../defines';
import type { ICube } from '../World';
import type Entity from './Entity';

export interface ICollisionInfo {

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
   * @type {ICube}
   * @memberof ICollisionInfo
   */
  a_cube: ICube;

  /**
   * 被攻击方的判定框
   *
   * @type {ICube}
   * @memberof ICollisionInfo
   */
  b_cube: ICube;

  /**
   *
   *
   * @type {number}
   * @memberof ICollisionInfo
   */
  remain?: number;
}
