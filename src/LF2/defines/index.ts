import { IBallFrameInfo } from "./IBallFrameInfo";
import { IBgData } from "./IBgData";
import { ICharacterFrameIndexes } from "./ICharacterFrameIndexes";
import { ICharacterInfo } from "./ICharacterInfo";
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

export * from './IBallFrameInfo';
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
  I extends IEntityInfo = IEntityInfo,
  F extends IFrameInfo = IFrameInfo,
> extends IBaseData<I> {
  frames: Record<string, F>;
  get is_game_obj_data(): true;
}

export interface IEntityData extends IGameObjData<IEntityInfo, IFrameInfo> {
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
export interface IBallData extends IGameObjData<IEntityInfo, IBallFrameInfo> {
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
