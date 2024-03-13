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
export interface IDataLists { objects: IDatIndex[], backgrounds: IDatIndex[] }
export interface IDatIndex { id: string; type: string | number; file: string; hash?: string }
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
export interface IWeaponData extends IGameObjData<IWeaponInfo, IFrameInfo> {
  type: 'weapon';
  weapon_strength?: { [x in string]: Partial<IItrInfo> & { id: string, name: string } };
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
export interface IStageObjectInfo {
  id: string[];
  x: number;
  y?: number;
  act?: string;
  hp?: number;
  times?: number;
  ratio?: number;
  is_boss?: true;
  is_soldier?: true;
  reserve?: number;
  join?: number;
}
export interface IStagePhaseInfo {
  bound: number;
  desc: string;
  objects: IStageObjectInfo[];
  music?: string;
}
export interface IStageInfo {
  bg: string;
  id: string;
  name: string;
  phases: IStagePhaseInfo[];
  next?: string;
}