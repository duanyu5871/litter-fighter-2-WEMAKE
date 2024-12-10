import { IGameObjInfo } from ".";
import type Defines from "./defines";
export interface IArmorInfo {
  hit_sound?: string;
  fireproof?: number;
  antifreeze?: number;
  toughness: number;
  type: string; // hp? times? fall? defend?
}
export interface ICharacterInfo extends IGameObjInfo {
  ce?: number;
  armor?: IArmorInfo;
  name: string;
  /** 角色头像 */
  head: string;
  /** 角色缩略图 */
  small: string;
  jump_height: number;
  jump_distance: number;
  jump_distancez: number;
  dash_height: number;
  dash_distance: number;
  dash_distancez: number;
  rowing_height: number;
  rowing_distance: number;
  fall_value: number;
  defend_value: number;

  /**
   * 默认角色血量
   * 在一些模式下，此数值可能会被覆盖
   * 
   * @see Defines.DAFUALT_HP 默认值
   * @type {?number}
   */
  hp?: number;

  /**
   * 默认角色蓝量
   * 在一些模式下，此数值可能会被覆盖
   * 
   * @see Defines.DAFAULT_MP 默认值
   * @type {?number}
   */
  mp?: number;

  /**
   * MP最大恢复速度（每帧）
   * 血量越低，MP恢复速度 越接近MP最大恢复速度
   * 
   * @see Defines.DAFAULT_MP_RECOVERY_MAX_SPEED 默认值
   * @type {?number}
   */
  mp_r_max_spd?: number;

  /**
   * MP最小恢复速度（每帧）
   * 血量越高，MP恢复速度 越接近MP最大恢复速度
   * 
   * @see Defines.DAFAULT_MP_RECOVERY_MIN_SPEED 默认值
   * @type {?number}
   */
  mp_r_min_spd?: number;

  /**
   * 是否为隐藏角色
   * 默认否
   *
   * @type {?boolean}
   */
  // hidden?: boolean;

  /**
   * 角色抓人能抓多久
   * 
   * @see {Defines.DAFUALT_CATCH_TIME} 默认值
   * @type {?number}
   */
  catch_time?: number
}
