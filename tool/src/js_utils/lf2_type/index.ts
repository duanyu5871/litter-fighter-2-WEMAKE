import { IBgInfo } from "./IBgInfo";
import { IBgLayerInfo } from "./IBgLayerInfo";
import { IFramePictureInfo } from "./IFramePictureInfo";
import { IItrInfo } from "./IItrInfo";
import { ITexturePieceInfo } from "./ITexturePieceInfo";
import { ITexturePieceInfos } from "./ITexturePieceInfos";

export type TFrameId = string | number
export type TTODO = any;
export type TFace = -1 | 1;
export type TTrend = -1 | 0 | 1;
export type BOOL = 1 | 0;
export interface IDataLists { objects: IDatIndex[], backgrounds: IDatIndex[] }
export interface IDatIndex { id: string | number; type: string | number; file: string; }
export interface IEntityPictureInfo {
  id: string | number;
  begin: number;
  end: number;
  path: string;
  w: number;
  h: number;
  row: number;
  col: number;
}
export interface INextFrameFlags {

  /**
   * 下一帧的持续时间策略
   * @date 2/23/2024 - 1:38:03 PM
   *
   * @type {?(string | number)} 'i': 继承上一帧剩余事件; number: 将会覆盖下一帧自带的wait
   */
  wait?: string | number;

  /**
   * 下帧转向
   * @date 2/23/2024 - 1:37:05 PM
   *
   * @type {?number} 1=向后转, 2=按键控制转向, 3=固定向左，4=固定向右
   */
  turn?: number;
}

export interface IHoldKeyCollection {
  a?: TNextFrame;
  d?: TNextFrame;
  j?: TNextFrame;
  U?: TNextFrame;
  D?: TNextFrame;
  L?: TNextFrame;
  R?: TNextFrame;
  B?: TNextFrame;
  F?: TNextFrame;
}
export interface IHitKeyCollection {
  sequences?: {
    [x in string]?: TNextFrame;
  }

  /** 攻击键 */
  a?: TNextFrame;

  /** 跳跃键 */
  j?: TNextFrame;

  /** 防御键 */
  d?: TNextFrame;

  /** 正向键 */
  F?: TNextFrame;

  /** 反向键 */
  B?: TNextFrame;

  /** 上方向键 */
  U?: TNextFrame;

  /** 下方向键 */
  D?: TNextFrame;

  L?: TNextFrame;
  R?: TNextFrame;

  /** 双击跳跃键 */
  aa?: TNextFrame

  /** 双击跳跃键 */
  jj?: TNextFrame;

  /** 双击防御键 */
  dd?: TNextFrame;

  /** 双击正向键 */
  FF?: TNextFrame;

  /** 双击反向键 */
  BB?: TNextFrame;

  /** 双击上方向键 */
  UU?: TNextFrame;

  /** 双击下方向键 */
  DD?: TNextFrame;
}
export interface INextFrame {
  id: TFrameId | TFrameId[];
  flags?: INextFrameFlags;
  condition?: string | ((e: any) => boolean);
}
export type TNextFrame = INextFrame | INextFrame[]

export * from './IBgInfo';
export * from './IBgLayerInfo';
export * from './IFramePictureInfo';
export * from './IItrInfo';
export * from './ITexturePieceInfo';
export * from './ITexturePieceInfos';

export interface IFrameInfo {
  id: TFrameId;
  name: string;
  pic: number | IFramePictureInfo | ITexturePieceInfos;
  state: number;
  wait: number;
  next: TNextFrame;
  dvx?: number;
  dvy?: number;
  dvz?: number;
  centerx: number;
  centery: number;
  sound?: string;
  mp?: number;
  hp?: number;
  hold?: IHoldKeyCollection;
  hit?: IHitKeyCollection;
  bdy?: IBdyInfo[];
  itr?: IItrInfo[];
  wpoint?: IWpointInfo;
  bpoint?: IBpointInfo;
  opoint?: IOpointInfo[];
  cpoint?: ICpointInfo;
}

export interface IBallFrameInfo extends IFrameInfo {
  no_shadow?: number;
  on_disappearing?: TNextFrame;
  on_rebounding?: TNextFrame;
  on_be_hit?: TNextFrame;
  on_hitting?: TNextFrame;
  on_dead?: TNextFrame;
  speedz?: number;
}

export interface ICpointInfo {
  kind: 1 | 2;
  x: number;
  y: number;
  vaction: number;
  injury: number;
  hurtable: 0 | 1;
  decrease: number;
  throwvx?: number
  throwvy?: number
  throwvz?: number
  throwinjury?: number
  fronthurtact: TFrameId
  backhurtact: TFrameId
  dircontrol: TFace;
  cover: number;
}
export interface IOpointInfo {
  kind: number;
  x: number;
  y: number;
  action: number;
  dvx?: number;
  dvy?: number;
  dvz?: number;
  oid: number;
  facing: number;
}
export interface IBpointInfo {
  x: number;
  y: number;
}
export interface IWpointInfo {
  kind: number;
  x: number;
  y: number;
  weaponact: number;
  attacking: number;
  cover: number;
  dvx?: number;
  dvy?: number;
  dvz?: number;
}
export interface IBdyInfo {
  friendly_fire?: number;
  kind: number
  x: number
  y: number
  w: number
  h: number
  indicator_info?: {
    1: ITexturePieceInfo;
    [-1]: ITexturePieceInfo
  }
}
export interface IGameObjInfo {
  files: Record<TFrameId, IEntityPictureInfo>;
}
export interface ICharacterInfo extends IGameObjInfo {
  name: string;
  head: string;
  small: string;
  indexes: ICharacterFrameIndexes;
  jump_height: number;
  jump_distance: number;
  jump_distancez: number;
  dash_height: number;
  dash_distance: number;
  dash_distancez: number;
  rowing_height: number;
  rowing_distance: number;
}
export interface IWeaponInfo extends IGameObjInfo {
  weapon_hp: number;
  weapon_drop_hurt: number,
  weapon_hit_sound: string;
  weapon_drop_sound: string;
  weapon_broken_sound: string;
}
export interface IBallInfo extends IGameObjInfo {
  hp: number;
  weapon_hit_sound: string;
  weapon_drop_sound: string;
  weapon_broken_sound: string;
}
export interface IBaseData<I = any> {
  id: string | number;
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

export interface IBgData extends IBaseData<IBgInfo> {
  type: 'background';
  layers: IBgLayerInfo[];
}

export interface IGameObjData<
  I extends IGameObjInfo = IGameObjInfo,
  F extends IFrameInfo = IFrameInfo,
> extends IBaseData<I> {
  frames: Record<TFrameId, F>;
}

export interface IEntityData extends IGameObjData<IGameObjInfo, IFrameInfo> {
  type: 'entity';
}
export interface ICharacterData extends IGameObjData<ICharacterInfo, IFrameInfo> {
  type: 'character';
}
export interface IWeaponData extends IGameObjData<IWeaponInfo, IFrameInfo> {
  type: 'weapon';
  weapon_strength?: TTODO;
}
export interface IBallData extends IGameObjData<IBallInfo, IBallFrameInfo> {
  type: 'ball';
}
export interface ICharacterFrameIndexes {
  landing_2: number;
  standing: TFrameId;
  running: TFrameId;
  heavy_obj_run: TFrameId;
  landing_1: TFrameId;
  caughts: TFrameId[];
  catch_atk: TFrameId;
  catch: TFrameId[];
  throw_enemy: TFrameId;
  drink: TFrameId;
  l_weapen_thw: TFrameId;
  jump_weapen_atk: TFrameId;
  h_weapen_thw: TFrameId;
  air_weapon_thw: TFrameId;
  air_quick_rise: TFrameId[];
  dizzy: TFrameId;
  dash_weapen_atk: TFrameId;
  run_weapen_atk: TFrameId;
  weapen_atk: TFrameId[];
  picking_heavy: TFrameId;
  picking_light: TFrameId;
  broken_defend: TFrameId;
  defend_hit: TFrameId;
  in_the_air: TFrameId[];
  super_punch: TFrameId;
  falling: TFrameIdListPair,
  bouncing: TFrameIdListPair,
  critical_hit: TFrameIdListPair
  injured: TFrameIdPair,
  grand_injured: TFrameIdListPair,
  lying: TFrameIdPair,
  fire: TFrameId[],
  ice: TFrameId,
}
export type TFrameIdPair = {
  [-1]: TFrameId,
  1: TFrameId,
}
export type TFrameIdListPair = {
  [-1]: TFrameId[],
  1: TFrameId[],
}