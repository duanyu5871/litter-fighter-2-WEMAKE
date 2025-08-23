import { Defines } from "./defines";
import Ditto from "./ditto";
import { IWorldDataset } from "./IWorldDataset";
import { make_private_properties } from "./make_private_properties";

export class WorldDataset implements IWorldDataset {
  static readonly TAG: string = 'WorldDataset';
  /** 
   * 被击中的对象晃动多少帧
   *
   * @type {number}
   * @memberof World
   */
  itr_shaking: number = Defines.DEFAULT_ITR_SHAKING;

  /**
   * 击中敌人的对象停顿多少帧
   *
   * @type {number}
   * @memberof World
   */
  itr_motionless: number = Defines.DEFAULT_ITR_MOTIONLESS;

  /**
   * dvx缩放系数
   *
   * @type {number}
   * @memberof World
   */
  fvx_f: number = Defines.DEFAULT_FVX_F;

  /**
   * dvy缩放系数
   *
   * @type {number}
   * @memberof World
   */
  fvy_f: number = Defines.DEFAULT_FVY_F;

  /**
   * dvz缩放系数
   *
   * @type {number}
   * @memberof World
   */
  fvz_f: number = Defines.DEFAULT_FVZ_F;
  ivy_f: number = 1;
  ivz_f: number = 1;
  ivx_f: number = 1;
  ivy_d: number = 5;
  ivx_d: number = 4;
  cvy_d: number = 3;
  cvx_d: number = 2;

  /**
   * X轴丢人初速度系数
   *
   * @type {number}
   */
  tvx_f: number = Defines.DEFAULT_TVX_F;

  /**
   * Y轴丢人初速度系数
   *
   * @type {number}
   */
  tvy_f: number = Defines.DEFAULT_TVY_F;

  /**
   * Z轴丢人初速度系数
   *
   * @type {number}
   */
  tvz_f: number = Defines.DEFAULT_TVZ_F;

  /**
   * 角色进入场地时的闪烁无敌时间
   *
   * @type {number}
   */
  begin_blink_time: number = Defines.DEFAULT_BEGIN_BLINK_TIME;

  /**
   * 倒地起身后的闪烁无敌时间
   *
   * @type {number}
   */
  lying_blink_time: number = Defines.DEFAULT_LYING_BLINK_TIME;

  /**
   * “非玩家槽角色”死亡时后的闪烁时间
   * 
   * 闪烁完成后，非玩家槽角色应当被移除
   *
   * @type {number}
   * @memberof World
   */
  gone_blink_time: number = Defines.DEFAULT_GONE_BLINK_TIME;
  vrest_offset: number = 0;
  arest_offset: number = 0;
  arest_offset_2: number = 0;

  /**
   * “帧等待数”偏移值
   * 
   * @note
   * “帧等待数”会在每次更新中减一
   * 每一帧会在“帧等待数”归零时，尝试进入下一帧。
   * 
   * 有：“帧等待数” = “帧本身的帧等待数” + “帧等待数”偏移值
   * 
   * @see {IFrameInfo.wait} 帧本身的“帧等待数”
   * 
   * @type {number}
   * @memberof World
   */
  frame_wait_offset: number = 0;

  cha_bc_spd: number = Defines.CHARACTER_BOUNCING_SPD;
  cha_bc_tst_spd: number = Defines.CHARACTER_BOUNCING_TEST_SPD;
  hp_recoverability: number = Defines.HP_RECOVERABILITY;
  hp_recovery_spd: number = Defines.HP_RECOVERY_SPD;
  hp_healing_spd: number = Defines.HP_HEALING_SPD;

  /**
   * 按键“双击”判定间隔，单位（帧数）
   *
   * 当同个按键在“双击判定间隔”之内按下两次，
   * 且中途未按下其对应冲突按键，视为“双击”。
   *
   */
  double_click_interval: number = Defines.DOUBLE_CLICK_INTERVAL;

  /**
   * 按键“按下”/“双击”的判定持续帧，单位：帧数
   *
   * 当某按键被“按下”（不松开），接下来的数帧（数值key_hit_duration）内，均判定为“按下”。
   * 此时若存在对应的“按键‘按下’跳转动作”，且满足跳转条件，角色将会进入对应的“按键‘按下’跳转动作”。
   *
   * 当某双击后，接下来的数帧（数值key_hit_duration）内，均判定为“双击”。
   * 此时若存在对应的“按键‘双击’跳转动作”，且满足跳转条件，角色将会进入对应的“按键‘双击’跳转动作”。
   */
  key_hit_duration: number = Defines.KEY_HIT_DURATION;
  friction_factor: number = Defines.FRICTION_FACTOR;
  /**
   * 地面摩擦X 在地面的物体，每帧X速度将±=此值,向0靠近
   *
   * @type {number}
   * @memberof WorldDataset
   */
  friction_x: number = Defines.FRICTION_X;
  /**
   * 地面摩擦Z 在地面的物体，每帧Z速度将±=此值,向0靠近
   *
   * @type {number}
   * @memberof WorldDataset
   */
  friction_z: number = Defines.FRICTION_Z;
  screen_w: number = Defines.MODERN_SCREEN_WIDTH;
  screen_h: number = Defines.MODERN_SCREEN_HEIGHT;
  gravity: number = Defines.GRAVITY;
  sync_render: number = 0;
  constructor() {
    make_private_properties(`${WorldDataset.TAG}::constructor`, this, (...args) => this.on_dataset_change?.(...args))
  }
  on_dataset_change?: (k: string, curr: any, prev: any) => void
}