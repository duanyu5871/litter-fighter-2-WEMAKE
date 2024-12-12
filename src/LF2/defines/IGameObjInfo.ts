import type { IEntityPictureInfo } from ".";
import type { Defines } from "./defines";
import type { IOpointInfo } from "./IOpointInfo";


export interface IEntityInfo {
  name: string;

  /**
   * 所属组
   *
   * @see {Defines.EntityGroup}
   */
  group?: string[];

  files: Record<string, IEntityPictureInfo>;
  depth_test?: boolean;
  depth_write?: boolean;
  render_order?: number;
  fall_value?: number;
  defend_value?: number;

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
   * @see Defines.DEFAULT_MP 默认值
   * @type {?number}
   */
  mp?: number;

  /**
   * MP最大恢复速度（每帧）
   * 血量越低，MP恢复速度 越接近MP最大恢复速度
   *
   * @see Defines.DEFAULT_MP_RECOVERY_MAX_SPEED 默认值
   * @type {?number}
   */
  mp_r_max_spd?: number;

  /**
   * MP最小恢复速度（每帧）
   * 血量越高，MP恢复速度 越接近MP最大恢复速度
   *
   * @see Defines.DEFAULT_MP_RECOVERY_MIN_SPEED 默认值
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
  catch_time?: number;

  /**
   * 物体的弹性
   * - 目前仅用于武器，当武器接触到地面时，有如下速度变化：
   * - ```vy = -vy * bounce```
   *
   * @type {number}
   */
  bounce?: number;

  /**
   * 物体的碎片信息（目前仅用于武器）
   * 当物体的血量归0时，将根据brokens创建一系列物品。
   * 武器的碎片用这个实现。
   * 也许也能用来实现更可怕的效果。
   *
   * @type {?IOpointInfo[]}
   */
  brokens?: IOpointInfo[];
}
