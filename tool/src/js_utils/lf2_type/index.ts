import { IBallFrameInfo } from "./IBallFrameInfo";
import { IBgInfo } from "./IBgInfo";
import { IBgLayerInfo } from "./IBgLayerInfo";
import { ICharacterFrameInfo } from "./ICharacterFrameInfo";
import { ICharacterInfo } from "./ICharacterInfo";
import { IFrameInfo } from "./IFrameInfo";
import type { Defines } from "./defines";
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
  id?: string | string[];
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
   * @type {Defines.FacingFlag} 
   */
  facing?: number;
  condition?: string | ((e: any) => boolean);
}
export type TNextFrame = INextFrame | INextFrame[]

export * from './IBallFrameInfo';
export * from './IBdyInfo';
export * from './IBgInfo';
export * from './IBgLayerInfo';
export * from './IBpointInfo';
export * from './ICharacterFrameInfo';
export * from './ICpointInfo';
export * from './IFrameInfo';
export * from './IFramePictureInfo';
export * from './IItrInfo';
export * from './IOpointInfo';
export * from './ITexturePieceInfo';
export * from './ITexturePieceInfos';
export * from './IWpointInfo';
export * from './ICharacterInfo';

export interface IGameObjInfo {
  files: Record<string, IEntityPictureInfo>;
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
  frames: Record<string, F>;
}

export interface IEntityData extends IGameObjData<IGameObjInfo, IFrameInfo> {
  type: 'entity';
}
export interface ICharacterData extends IGameObjData<ICharacterInfo, ICharacterFrameInfo> {
  type: 'character';
  indexes: ICharacterFrameIndexes;
}
export interface IWeaponData extends IGameObjData<IWeaponInfo, IFrameInfo> {
  type: 'weapon';
  weapon_strength?: TTODO;
}
export interface IBallData extends IGameObjData<IBallInfo, IBallFrameInfo> {
  type: 'ball';
}
export interface ICharacterFrameIndexes {
  landing_2: string;
  standing: string;
  running: string;
  heavy_obj_run: string;
  landing_1: string;
  caughts: string[];
  catch_atk: string;
  catch: string[];
  throw_enemy: string;
  drink: string;
  l_weapen_thw: string;
  jump_weapen_atk: string;
  h_weapen_thw: string;
  air_weapon_thw: string;
  air_quick_rise: string[];
  dizzy: string;
  dash_weapen_atk: string;
  run_weapen_atk: string;
  weapen_atk: string[];
  picking_heavy: string;
  picking_light: string;
  broken_defend: string;
  defend_hit: string;
  in_the_air: string[];
  super_punch: string;
  falling: TFrameIdListPair,
  bouncing: TFrameIdListPair,
  critical_hit: TFrameIdListPair
  injured: TFrameIdPair,
  grand_injured: TFrameIdListPair,
  lying: TFrameIdPair,
  fire: string[],
  ice: string,
}
export type TFrameIdPair = {
  [-1]: string,
  1: string,
}
export type TFrameIdListPair = {
  [-1]: string[],
  1: string[],
}