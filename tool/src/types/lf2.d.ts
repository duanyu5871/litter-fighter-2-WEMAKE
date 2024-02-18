declare type TFrameId = string | number
declare type TTODO = any;

declare type TFace = -1 | 1;
declare type TTrend = -1 | 0 | 1;
declare type BOOL = 1 | 0;
interface IDataLists { objects: IDatIndex[], backgrounds: IDatIndex[] }
interface IDatIndex { id: string | number; type: string | number; file: string; }
declare interface IEntityPictureInfo {
  id: string | number;
  begin: number;
  end: number;
  path: string;
  w: number;
  h: number;
  row: number;
  col: number;
}
declare interface INextFrameFlags {

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

declare interface IHoldKeyCollection {
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
declare interface IHitKeyCollection {
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
declare interface INextFrame {
  id: TFrameId | TFrameId[];
  flags?: INextFrameFlags;
  condition?: string | ((e: any) => boolean);
}
declare type TNextFrame = INextFrame | INextFrame[]

declare interface ITexturePieceInfo {
  /** 纹理ID */
  tex: number | string;

  pw: number;

  ph: number;

  /** 纹理裁剪起点（x），-1 ~ 1 */
  x: number;

  /** 纹理裁剪起点（y），0 ~ 1 */
  y: number;

  /** 纹理裁剪宽度比，0 ~ 1 */
  w: number;

  /** 
   * 纹理裁剪高度比
   * 正常范围：0 ~ 1
   */
  h: number;

  /**
   * 纹理中心点（x）
   */
  cx: number;

  /**
   * 纹理中心点（y）
   */
  cy: number;
}
declare interface ITexturePieceInfos {
  /** 纹理数据 */
  1: ITexturePieceInfo;
  /** 纹理数据（镜像） */
  [-1]: ITexturePieceInfo;
}
declare interface IFramePictureInfo {
  /** 纹理ID */
  tex: number | string;
  /** 精灵图裁剪起点X坐标（像素） */
  x: number;
  /** 精灵图裁剪起点Y坐标（像素） */
  y: number;
  /** 精灵图宽度（像素） */
  w: number;
  /** 精灵图高度（像素） */
  h: number;
}

declare interface IFrameInfo {
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
  opoint?: IOpointInfo;
  cpoint?: TTODO;
}

declare interface ICpointInfo {
  kind: 1 | 2;
  x: number;
  y: number;
  vaction: number;
  aaction: TFrameId;
  taction: TFrameId;
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
}
declare interface IOpointInfo {
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
declare interface IBpointInfo {
  x: number;
  y: number;
}
declare interface IWpointInfo {
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
declare interface IBdyInfo {
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

declare interface IItrInfo {
  kind: number
  x: number
  y: number
  w: number
  h: number
  dvx?: number
  dvy?: number
  fall?: number
  vrest?: number
  arest?: number
  bdefend?: number
  injury?: number
  effect?: number
  indicator_info?: {
    1: ITexturePieceInfo;
    [-1]: ITexturePieceInfo
  }
}
declare interface IGameObjInfo {
  files: Record<TFrameId, IEntityPictureInfo>;
}
declare interface ICharacterInfo extends IGameObjInfo {
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
declare interface IWeaponInfo extends IGameObjInfo {
  weapon_hp: number;
  weapon_drop_hurt: number,
  weapon_hit_sound: string;
  weapon_drop_sound: string;
  weapon_broken_sound: string;
}
declare interface IProjecttileInfo extends IGameObjInfo {
  weapon_hit_sound: string;
  weapon_drop_sound: string;
  weapon_broken_sound: string;
}
declare interface IBaseData<I = any> {
  id: string | number;
  type: string;
  base: I;
}
declare interface IDataMap {
  'background': IBackgroundData;
  'entity': IEntityData;
  'character': ICharacterData;
  'weapon': IWeaponData;
  'projecttile': IProjecttileData;
}

declare interface IBackgroundInfo {
  name: string;
  width: number;
  zboundary: [number, number];
  shadow: string;
  shadowsize: [number, number];
}
declare interface IBgLayerInfo {
  file: string;
  transparency: 1 | 0;
  width: number;
  height: number;
  x: number;
  y: number;
  color: number;
  loop?: number;
  cc?: number;
  c1?: number;
  c2?: number;
}
declare interface IBackgroundData extends IBaseData<IBackgroundInfo> {
  type: 'background';
  layers: IBgLayerInfo[];
}

declare interface IGameObjData<I extends IGameObjInfo = IGameObjInfo> extends IBaseData<I> {
  frames: Record<TFrameId, IFrameInfo>;
}

declare interface IEntityData extends IGameObjData<IGameObjInfo> {
  type: 'entity';
}
declare interface ICharacterData extends IGameObjData<ICharacterInfo> {
  type: 'character';
}
declare interface IWeaponData extends IGameObjData<IWeaponInfo> {
  type: 'weapon';
  weapon_strength?: TTODO;
}
declare interface IProjecttileData extends IGameObjData<IProjecttileInfo> {
  type: 'projecttile';
}
declare interface ICharacterFrameIndexes {
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
  jump_weapen_atk: TFrameId;
  weapen_atk: TFrameId[];
  picking_heavy: TFrameId;
  picking_light: TFrameId;
  broken_defend: TFrameId;
  defend_hit: TFrameId;
  in_the_air: TFrameId[];
  super_punch: TFrameId;
  falling: {
    [-1]: TFrameId[],
    [1]: TFrameId[],
  },
  injured: {
    [-1]: TFrameId,
    [1]: TFrameId,
  },
  grand_injured: {
    [-1]: TFrameId[],
    [1]: TFrameId[],
  },
  lying: {
    [-1]: TFrameId,
    [1]: TFrameId,
  }
}

