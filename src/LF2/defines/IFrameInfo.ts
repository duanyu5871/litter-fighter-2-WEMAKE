import { TNextFrame } from ".";
import type { INextFrame } from "../defines/INextFrame";
import type { Defines } from './defines';
import { IBdyInfo } from "./IBdyInfo";
import { IBpointInfo } from "./IBpointInfo";
import { ICpointInfo } from "./ICpointInfo";
import { IFramePictureInfo } from "./IFramePictureInfo";
import { IHitKeyCollection } from "./IHitKeyCollection";
import { IHoldKeyCollection } from "./IHoldKeyCollection";
import { IItrInfo } from "./IItrInfo";
import { IOpointInfo } from "./IOpointInfo";
import { IRectPair } from "./IRectPair";
import { IWpointInfo } from "./IWpointInfo";
import type { SpeedMode } from './SpeedMode';

export interface IFrameInfo {
  id: string;
  name: string;
  pic?: IFramePictureInfo;
  state: number;
  wait: number;

  /**
   * wait end, what next?
   *
   * @type {TNextFrame}
   */
  next: TNextFrame;
  dvx?: number;
  dvy?: number;
  dvz?: number;

  /** @see {SpeedMode} */
  vxm?: number;
  /** @see {SpeedMode} */
  vym?: number;
  /** @see {SpeedMode} */
  vzm?: number;

  centerx: number;
  centery: number;
  sound?: string;

  /**
   * 此frame消耗的血量，每帧都会扣
   * 
   * 原版的角色消耗mp与hp见INextFrame
   * 
   * @see {INextFrame}
   */
  hp?: number;

  hold?: IHoldKeyCollection;
  hit?: IHitKeyCollection;
  bdy?: IBdyInfo[];
  itr?: IItrInfo[];
  wpoint?: IWpointInfo;
  bpoint?: IBpointInfo;
  opoint?: IOpointInfo[];
  cpoint?: ICpointInfo;
  indicator_info?: IRectPair;
  invisible?: number;
  no_shadow?: number;

  /**
   * x轴速度，当按着左或右，此值生效
   */
  speedx?: number;
  /** @see {SpeedMode} */
  speedxm?: number;

  /**
   * z轴速度，当按着上或下，此值生效
   */
  speedz?: number;
  /** @see {SpeedMode} */
  speedzm?: number;

  /**
   * 起跳标志（角色专用）
   * 
   * 从state为```Defines.State.Jump```的frame，
   * 跳至state为```Defines.State.Jump```的frame时，
   * 若前（frame.jump_flag == 1）且后（frame.jump_flag == 0）或空。
   * 此时将会计算跳跃速度，让角色跳起来。
   *  
   * @see {Defines.State.Jump}
   * @type {?number}
   */
  jump_flag?: number;

  /**
   * 死亡后跳转
   * 
   * hp从正数降至小于等于0时，跳转至on_dead中符合条件的帧
   * 
   * @type {?TNextFrame}
   */
  on_dead?: TNextFrame;

  on_exhaustion?: TNextFrame;


  /**
   * Description placeholder
   *
   * @type {?TNextFrame}
   */
  on_landing?: TNextFrame;


  /**
   * 原ball的hit_Fa
   *
   * @type {?number}
   * @see {Defines.FrameBehavior}
   */
  behavior?: number;
}
