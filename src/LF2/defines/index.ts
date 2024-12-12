import { IBallFrameInfo } from "./IBallFrameInfo";
import { IBallInfo } from "./IBallInfo";
import { IBgData } from "./IBgData";
import { ICharacterFrameIndexes } from "./ICharacterFrameIndexes";
import { ICharacterInfo } from "./ICharacterInfo";
import { IFrameInfo } from "./IFrameInfo";
import { IItrInfo } from "./IItrInfo";
import { INextFrame } from "./INextFrame";
import { IOpointInfo } from "./IOpointInfo";
import { IWeaponFrameIndexes } from "./IWeaponFrameIndexes";
import { IWeaponInfo } from "./IWeaponInfo";
export type TTODO = any;
export type TFace = -1 | 1;
export type TTrend = -1 | 0 | 1;
export type BOOL = 1 | 0;
export * from './defines';
export * from './GameKey';
export * from './IDataLists';
export * from './IDatIndex';
export * from './IHitKeyCollection';
export * from "./IStageInfo";

/**
 * 实体图片信息
 * 
 * TODO 补充说明
 *
 * @export
 * @interface IEntityPictureInfo
 */
export interface IEntityPictureInfo {
  id: string;

  path: string;

  /**
   * 行数
   * 
   * @type {number}
   */
  row: number;

  /**
   * 列数
   * 
   * @type {number}
   */
  col: number;

  /**
   * 格宽
   *
   * @type {number}
   */
  cell_w: number;

  /**
   * 格高
   *
   * @type {number}
   */
  cell_h: number;

  variants?: string[];
}

export type TNextFrame = INextFrame | INextFrame[]

export * from './IBallFrameInfo';
export * from './IBallInfo';
export * from './IBdyInfo';
export * from './IBgData';
export * from './IBgInfo';
export * from './IBgLayerInfo';
export * from './IBpointInfo';
export * from './ICharacterInfo';
export * from './ICpointInfo';
export * from './IFrameInfo';
export * from './IFramePictureInfo';
export * from './IItrInfo';
export * from './INextFrame';
export * from './IOpointInfo';
export * from './IStageInfo';
export * from './IStageObjectInfo';
export * from './IStagePhaseInfo';
export * from './ITexturePieceInfo';
export * from './IWeaponInfo';
export * from './IWpointInfo';

export interface IGameObjInfo {
  name: string;

  /** 所属组 */
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
  catch_time?: number

  /**
   * 物体的弹性
   * 目前仅用于武器，当武器接触到地面时，有如下速度变化：
   * 
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
export interface IBaseData<I = any> {
  get is_base_data(): true;
  id: string;
  /**
   * @see {IDataMap}
   */
  type: string;
  base: I;
}
export interface IDataMap {
  'background': IBgData;
  'entity': IEntityData;
  'character': ICharacterData;
  'weapon': IWeaponData;
  'ball': IBallData;
}

export interface IGameObjData<
  I extends IGameObjInfo = IGameObjInfo,
  F extends IFrameInfo = IFrameInfo,
> extends IBaseData<I> {
  frames: Record<string, F>;
  get is_game_obj_data(): true;
}

export interface IEntityData extends IGameObjData<IGameObjInfo, IFrameInfo> {
  type: 'entity';
  get is_entity_data(): true;
}
export interface ICharacterData extends IGameObjData<ICharacterInfo, IFrameInfo> {
  type: 'character';
  indexes: ICharacterFrameIndexes;
  get is_character_data(): true;
}
export interface IWeaponStrengthInfo extends Partial<IItrInfo> {
  id: string;
  name: string;
}
export interface IWeaponData extends IGameObjData<IWeaponInfo, IFrameInfo> {
  type: 'weapon';
  weapon_strength?: { [x in string]?: IWeaponStrengthInfo };
  indexes: IWeaponFrameIndexes;
  get is_weapon_data(): true;
}
export interface IBallData extends IGameObjData<IBallInfo, IBallFrameInfo> {
  type: 'ball';
  get is_ball_data(): true;
}
export type TFrameIdPair = {
  [-1]: string,
  1: string,
}
export type TFrameIdListPair = {
  [-1]: string[],
  1: string[],
}
