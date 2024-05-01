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
export interface IEntityPictureInfo {
  id: string;
  begin: number;
  end: number;
  path: string;
  w: number;
  h: number;
  row: number;
  col: number;
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
}

export interface IEntityData extends IGameObjData<IGameObjInfo, IFrameInfo> {
  type: 'entity';
}
export interface ICharacterData extends IGameObjData<ICharacterInfo, ICharacterFrameInfo> {
  type: 'character';
  indexes: ICharacterFrameIndexes;
}
export interface IWeaponStrengthInfo extends Partial<IItrInfo> {
  id: string;
  name: string;
}
export interface IWeaponData extends IGameObjData<IWeaponInfo, IFrameInfo> {
  type: 'weapon';
  weapon_strength?: { [x in string]?: IWeaponStrengthInfo };
  indexes: IWeaponFrameIndexes;
}
export interface IBallData extends IGameObjData<IBallInfo, IBallFrameInfo> {
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
export * from './IStageObjectInfo'
export * from './IStagePhaseInfo'
export * from './IStageInfo'