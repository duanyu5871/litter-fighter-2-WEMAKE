import { IBallFrameInfo } from "./IBallFrameInfo";
import { IBallInfo } from "./IBallInfo";
import { IBgData } from "./IBgData";
import { ICharacterFrameIndexes } from "./ICharacterFrameIndexes";
import { ICharacterFrameInfo } from "./ICharacterFrameInfo";
import { ICharacterInfo } from "./ICharacterInfo";
import { IFrameInfo } from "./IFrameInfo";
import { IItrInfo } from "./IItrInfo";
import { INextFrame } from "./INextFrame";
import { IWeaponFrameIndexes } from "./IWeaponFrameIndexes";
import { IWeaponInfo } from "./IWeaponInfo";
export type TTODO = any;
export type TFace = -1 | 1;
export type TTrend = -1 | 0 | 1;
export type BOOL = 1 | 0;
export * from './IDataLists'
export * from './IDatIndex'


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
  begin: number;
  end: number;
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
}

export type TNextFrame = INextFrame | INextFrame[]

export * from './IBallFrameInfo';
export * from './IBallInfo';
export * from './IBdyInfo';
export * from './IBgInfo';
export * from './IBgLayerInfo';
export * from './IBpointInfo';
export * from './ICharacterFrameInfo';
export * from './ICharacterInfo';
export * from './ICpointInfo';
export * from './IFrameInfo';
export * from './IFramePictureInfo';
export * from './IItrInfo';
export * from './INextFrame';
export * from './IOpointInfo';
export * from './ITexturePieceInfo';
export * from './ITexturePieceInfos';
export * from './IWeaponInfo';
export * from './IWpointInfo';
export * from './IBgData';

export interface IGameObjInfo {
  files: Record<string, IEntityPictureInfo>;
}
export interface IBaseData<I = any> {
  get is_base_data(): true;
  id: string;
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
export interface ICharacterData extends IGameObjData<ICharacterInfo, ICharacterFrameInfo> {
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
export * from './IStageObjectInfo'
export * from './IStagePhaseInfo'
export * from './IStageInfo'