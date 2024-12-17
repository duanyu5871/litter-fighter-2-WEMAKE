import { IBgData } from "./IBgData";
import { ICharacterFrameIndexes } from "./ICharacterFrameIndexes";
import { IEntityInfo } from "./IEntityInfo";
import { IFrameInfo } from "./IFrameInfo";
import { IItrInfo } from "./IItrInfo";
import { INextFrame } from "./INextFrame";
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
export * from './IEntityInfo';
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

export * from './IBdyInfo';
export * from './IBgData';
export * from './IBgInfo';
export * from './IBgLayerInfo';
export * from './IBpointInfo';
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

export interface IBaseData<I = any> {
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

export interface IEntityData<I extends IEntityInfo = IEntityInfo> extends IBaseData<I> {
  type: 'entity' | 'character' | 'weapon' | 'ball';
  on_dead?: TNextFrame;
  frames: Record<string, IFrameInfo>;
}

export interface ICharacterData extends IEntityData<IEntityInfo> {
  type: 'character';
  indexes: ICharacterFrameIndexes;
}
export interface IWeaponStrengthInfo extends Partial<IItrInfo> {
  id: string;
  name: string;
}
export interface IWeaponData extends IEntityData<IWeaponInfo> {
  type: 'weapon';
  weapon_strength?: { [x in string]?: IWeaponStrengthInfo };
  indexes: IWeaponFrameIndexes;
}
export interface IBallData extends IEntityData<IEntityInfo> {
  type: 'ball';
}
export type TFrameIdPair = {
  [-1]: string,
  1: string,
}
export type TFrameIdListPair = {
  [-1]: string[],
  1: string[],
}
