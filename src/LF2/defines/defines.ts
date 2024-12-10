import { ICharacterData, IGameObjData, IWeaponData } from ".";
import { GameKey } from "./GameKey";
import { IBgData } from "./IBgData";
import type { IItrInfo } from "./IItrInfo";
import { IStageInfo } from "./IStageInfo";

export namespace Defines {
  export enum BallBehavior {
    _01 = 1,//= 追敵人的center(因為敵人站在地面，所以會下飄)
    _02 = 2,//= 水平追敵
    _03 = 3,//= 加速法追敵(追縱力較差)
    _04 = 4,//= 天使之祝福(別的dat檔用了無效)
    _05 = 5,//= 天使之祝福的開始(會追我方的人物很久)
    _06 = 6,//= 惡魔之審判的開始(視敵人數目而增加，基本上是一個)
    _07 = 7,//= 惡魔之審判,殃殞天降(可以做出打到地面的追蹤波)
    _08 = 8,//= 吸血蝙蝠的開始(視敵人數目而增加，基本數值是三個，別的dat檔用了無效)
    _09 = 9,//= 殃殞天降的開始(視敵人數目而增加，基本數值是四個)
    _10 = 10,//= 加速(從慢變快)
    _11 = 11,//= 極地火山
    _12 = 12,//= 吸血蝙蝠
    _13 = 13,//= 連環重炮的開始
    _14 = 14,//= 連環重炮
  }
  export const OLD_SCREEN_WIDTH = 794;
  export const OLD_SCREEN_HEIGHT = 550;
  export const DAFUALT_HP = 500;
  export const DAFAULT_MP = 500;
  export const DEFAULT_FALL_VALUE = 140
  export const DEFAULT_DEFEND_VALUE = 120
  export const DEFAULT_ITR_SHAKEING = 6;
  export const DEFAULT_ITR_MOTIONLESS = 6;


  /**
   * 默认最大回蓝速度, 血越少，回蓝越快（线性）
   *
   * @type {number}
   */
  export const DAFAULT_MP_RECOVERY_MAX_SPEED: number = 2;

  /**
   * 默认最大回蓝速度, 血越多，回蓝越慢（线性）
   *
   * @type {number}
   */
  export const DAFAULT_MP_RECOVERY_MIN_SPEED: number = 0.5;


  export const DAFAULT_HP_RECOVERY_SPEED = 0.2;

  export const VOID_STAGE: IStageInfo = {
    bg: "VOID",
    id: "VOID_STAGE",
    name: "VOID_STAGE",
    phases: []
  }
  export const VOID_BG: IBgData = {
    type: 'background',
    is_base_data: true,
    is_bg_data: true,
    layers: [],
    id: 'VOID_BG',
    base: {
      name: 'VOID_BG',
      shadow: '',
      shadowsize: [0, 0],
      left: 0,
      right: 794,
      far: -468,
      near: -216,
    }
  }
  export enum ValWord {
    /**
     * X轴运动趋势
     * 当X轴速度为0时，有trend_x==0，
     * 速度与朝向一致时，有trend_x==1，
     * 速度与朝向不一致时，有trend_x==-1，
     */
    TrendX = 'trend_x',


    PressFB = 'press_F_B',
    PressUD = 'press_U_D',
    PressLR = 'press_L_R',

    /** 角色手持的武器类型 */
    WeaponType = 'weapon_type',

    /** 
     * 剩余血量占比(0~100)
     */
    HP_P = 'hp_p',

    LF2_NET_ON = 'lf2_net_on',
    HERO_FT_ON = "hero_ft_on",
    GIM_INK_ON = "gim_ink_on",
    HAS_TRANSFROM_DATA = "has_transform_data"
  }
  export enum FrameId {
    None = "",
    Auto = "auto",
    Self = "self",
    Gone = "gone",
    Invisible_Min = "1100", // 1100 ~ 1299 隐身
    Invisible_Max = "1299", // 1100 ~ 1299 隐身
  }
  export enum WeaponType {
    None = 0,

    /** 
     * 棍棒
     * 
     * 丢出方式：
     *    奔跑,空中: 前 + 攻击
     */
    Stick = 1,

    /** 重物类 */
    Heavy = 2,

    /** 
     * 小刀类。
     * 丢出方式：
     *    奔跑,空中,站立: 前 + 攻击
     */
    Knife = 3,

    /** 
     * 棒球类
     */
    Baseball = 4,

    /**
     * 饮料
     * 
     * 丢出方式：
     *    奔跑,空中: 前 + 攻击
     */
    Drink = 5,
  }
  export enum FacingFlag {
    Left = -1,
    None = 0,
    Right = 1,
    Backward = 2,
    ByController = 3,
    SameAsCatcher = 4,
    OpposingCatcher = 5,
  }
  export enum State {
    Any = -1,
    _0 = 0, Standing = 0,
    _1 = 1, Walking = 1,
    _2 = 2, Running = 2,
    _3 = 3, Attacking = 3,
    _4 = 4, Jump = 4,
    _5 = 5, Dash = 5,
    _6 = 6, Rowing = 6,
    _7 = 7, Defend = 7,
    _8 = 8, BrokenDefend = 8,
    _9 = 9, Catching = 9,
    _10 = 10, Caught = 10,
    _11 = 11, Injured = 11,
    _12 = 12, Falling = 12,
    _13 = 13, Frozen = 13,
    _14 = 14, Lying = 14,
    _15 = 15, Normal = 15,
    _16 = 16, Tired = 16,
    _17 = 17, drink = 17,
    _18 = 18, Burning = 18,
    _19 = 19, BurnRun = 19,

    NextAsLanding = 100,
    Z_Moveable = 301,

    Teleport_ToNearestEnemy = 400,
    Teleport_ToFarthestAlly = 401,

    Weapon_InTheSky = 1000,
    Weapon_OnHand = 1001,
    Weapon_Throwing = 1002,
    Weapon_Rebounding = 1003,
    Weapon_OnGround = 1004,

    HeavyWeapon_InTheSky = 2000,//= 重型武器在空中(heavy weapon-in the sky))
    HeavyWeapon_OnHand = 2001,//= 重型武器在手中
    HeavyWeapon_Throwing = 2002,//= 重型武器在地上
    HeavyWeapon_OnGround = 2004,//= 與itr kind2作用

    Ball_Flying = 3000,
    Ball_Hitting = 3001,
    Ball_Flying4 = 3002,
    Ball_Rebounding = 3003,
    Ball_Disappear = 3004,
    Ball_Sturdy = 3005,
    Ball_PunchThrough = 3006,

    TransformTo_Min = 8001,
    _8001 = 8001,

    TransformTo_Max = 8999,
    _8999 = 8999,

    TurnIntoLouisEX = 9995,
    Gone = 9998,

    Weapon_Brokens = 9999,
    _9999 = 9999,

    /**
     * 被存在变过的人时，此才允许进入state为500的frame。
     * rudolf抓人变身后，才能dja，你懂的。
     * 
     * 但现在Wemake中，改为has_transform_data判断。
     */
    TransformToCatching_Begin = 500,
    _500 = 500,


    /** 
     * 变成最后一次曾经变过的人（rudolf的变身效果）
     */
    TransformToCatching_End = 501,
    _501 = 501,

    /**
     * LF2的Louis爆甲
     * 但现在Wemake中，爆甲是通过opoint实现的。
     */
    LouisCastOff = 9996,
    _9996 = 9996,

    TransformToLouisEx = 9996,
    _9995 = 9995,
  }
  export enum EntityEnum {
    Character = 'character',
    Weapon = 'weapon',
    Ball = 'ball',
  }
  export enum ItrKind {
    /** */
    Normal = 0,

    /** 
     * 当角色1的itr与角色2的bdy碰撞，且角色2的frame.state为16(Tired)时
     * 角色1捉起角色2
     * 角色1进入抓人动作
     * 角色2进入被抓动作
     * 
     * @see {Defines.State.Tired}
     * @see {IItrInfo['catchingact']} 角色1进入抓人动作
     * @see {IItrInfo['caughtact']} 角色2进入被抓动作
     */
    Catch = 1,

    /** 
     * 当角色的itr与武器的bdy碰撞，
     * 且武器的frame.state为1004(Weapon_OnGround)或2004(HeavyWeapon_OnGround)时
     * 
     * 角色此时应捡起武器，且进入捡武器的动作。
     * 
     * @see {Defines.State.Weapon_OnGround}
     * @see {Defines.State.HeavyWeapon_OnGround}
     */
    Pick = 2,

    /** 
     * 当角色1的itr与角色2的bdy碰撞
     * 角色1捉起角色2
     * 角色1进入抓人动作
     * 角色2进入被抓动作
     * 
     * 强制抓人
     * 
     * @see {IItrInfo['catchingact']} 角色1进入抓人动作
     * @see {IItrInfo['caughtact']} 角色2进入被抓动作
     */
    ForceCatch = 3,

    /** 被丢出时，此itr才生效 */
    CharacterThrew = 4,

    SuperPunchMe = 6, // 敵人靠近按A時是重击

    /** 
     * 当角色的itr与武器的bdy碰撞，且武器的frame.state为1004(Weapon_OnGround)时
     * 
     * 角色此时立刻应捡起武器
     * 
     * @see {Defines.State.Weapon_OnGround}
     */
    PickSecretly = 7,

    Heal = 8,         // injury数值变成治療多少hp，动作跳至dvx ?

    DeadWhenHit = 9,  // 打中敵人自己hp歸0(如John的防護罩) |
    MagicFlute = 10,  // henry魔王之樂章效果
    Block = 14,       // 阻擋
    Fly = 15,         // 飛起 ??
    Ice = 16,         // 結冰
    // 1???=被你打到會跳到第???个frame(如人質的kind)
  }

  export enum BdyKind {
    GotoMin = 1000,
    GotoMax = 1999,
  }

  export enum ItrEffect {
    Normal = 0,   // 拳击
    Sharp = 1,    // 利器攻击
    Fire = 2,     // 著火
    Ice = 3,      // 結冰
    Through = 4,  // 穿過敵人(僅能打中type 1.2.3.4.5.6的物件) |
    None = 5,     // (或以上) |沒效果，也打不中任何東西
    MFire1 = 20,  // 定身火 ??
    MFire2 = 21,  // 定身火 ??
    MFire3 = 22,  // 定身火 ??
    MIce = 30,    // 定身冰 ??
  }
  export enum CPointKind {
    Attacker = 1,
    Victim = 2,
  }
  export enum Cheats {
    LF2_NET = 'LF2_NET',
    HERO_FT = 'HERO_FT',
    GIM_INK = 'GIM_INK'
  }

  export const CheatKeys: Record<Cheats, string> = {
    [Cheats.LF2_NET]: "lf2.net",
    [Cheats.HERO_FT]: "herofighter.com",
    [Cheats.GIM_INK]: "gim.ink"
  }
  export const CheatSounds: Record<Cheats, string> = {
    [Cheats.LF2_NET]: "data/m_pass.wav.mp3",
    [Cheats.HERO_FT]: "data/m_end.wav.mp3",
    [Cheats.GIM_INK]: "data/093_r.wav.mp3"
  }
  export interface ICheatInfo {
    keys: string;
    sound: string;
  }

  export const Sounds = {
    StagePass: "data/m_pass.wav.mp3",
    BattleEnd: "data/m_end.wav.mp3"
  } as const


  /**
   * 按键“双击”判定间隔，单位（帧数）
   * 
   * 当同个按键在“双击判定间隔”之内按下两次，
   * 且中途未按下其对应冲突按键，视为“双击”。
   * 
   * @type {number}
   */
  export const DOUBLE_CLICK_INTERVAL: number = 30;

  /**
   * 按键“按下”/“双击”的判定持续帧，单位：帧数
   * 
   * 当某按键被“按下”（不松开），接下来的数帧（数值key_hit_duration）内，均判定为“按下”。
   * 此时若存在对应的“按键‘按下’跳转动作”，且满足跳转条件，角色将会进入对应的“按键‘按下’跳转动作”。
   * 
   * 当某双击后，接下来的数帧（数值key_hit_duration）内，均判定为“双击”。
   * 此时若存在对应的“按键‘双击’跳转动作”，且满足跳转条件，角色将会进入对应的“按键‘双击’跳转动作”。
   *
   * @type {number}
   */
  export const KEY_HIT_DURATION: number = 20
  export const GRAVITY: number = 0.38;
  export const FRICTION_FACTOR: number = 0.95//0.894427191;
  export const FRICTION: number = 0.2;

  export enum Difficulty {
    Easy = 1,
    Normal = 2,
    Difficult = 3,
    Crazy = 4,
  }
  export const DifficultyLabels: Record<Difficulty, string> = {
    [Difficulty.Easy]: "Easy",
    [Difficulty.Normal]: "Normal",
    [Difficulty.Difficult]: "Difficult",
    [Difficulty.Crazy]: "Crazy!"
  }
  export interface ITeamInfo {
    name: string;
    txt_color: string;
    txt_shadow_color: string;
  }
  export enum TeamEnum {
    Independent = '',
    Team_1 = '1',
    Team_2 = '2',
    Team_3 = '3',
    Team_4 = '4',
  }
  export interface ITeamInfoMap {
    [TeamEnum.Independent]: ITeamInfo;
    [TeamEnum.Team_1]: ITeamInfo;
    [TeamEnum.Team_2]: ITeamInfo;
    [TeamEnum.Team_3]: ITeamInfo;
    [TeamEnum.Team_4]: ITeamInfo;
    [x: string | number]: ITeamInfo | undefined;
  }
  export const Teams = [
    Defines.TeamEnum.Independent,
    Defines.TeamEnum.Team_1,
    Defines.TeamEnum.Team_2,
    Defines.TeamEnum.Team_3,
    Defines.TeamEnum.Team_4,
  ]
  export const TeamInfoMap: ITeamInfoMap = {
    [TeamEnum.Independent]: {
      name: 'Independent',
      txt_color: '#ffffff',
      txt_shadow_color: '#000000',
    },
    [TeamEnum.Team_1]: {
      name: 'Team 1',
      txt_color: '#4f9bff',
      txt_shadow_color: '#001e46',
    },
    [TeamEnum.Team_2]: {
      name: 'Team 2',
      txt_color: '#ff4f4f',
      txt_shadow_color: '#460000',
    },
    [TeamEnum.Team_3]: {
      name: 'Team 3',
      txt_color: '#3cad0f',
      txt_shadow_color: '#154103',
    },
    [TeamEnum.Team_4]: {
      name: 'Team 4',
      txt_color: '#ffd34c',
      txt_shadow_color: '#9a5700',
    },
  }
  export const is_character_data = (v: any): v is ICharacterData =>
    v.is_character_data === true
  export const is_weapon_data = (v: any): v is IWeaponData =>
    v.is_weapon_data === true
  export const is_bg_data = (v: any): v is IBgData =>
    v.is_bg_data === true
  export const is_game_obj_data = (v: any): v is IGameObjData =>
    v.is_game_obj_data === true

  export namespace BuiltIn {
    export enum Imgs {
      RFACE = 'sprite/RFACE.png',
      CM5 = 'sprite/CM5.png',
      CM4 = 'sprite/CM4.png',
      CM3 = 'sprite/CM3.png',
      CM2 = 'sprite/CM2.png',
      CM1 = 'sprite/CM1.png',
      CMA = 'sprite/CMA.png',
      CHARACTER_THUMB = 'sprite/CHARACTER_THUMB.png',
    }
    export enum Dats {
      Spark = 'data/spark.json',
    }
    export enum Broadcast {
      ResetGPL = 'reset_gpl',
      UpdateRandom = 'update_random',
      StartGame = 'start_game',
      SwitchStage = 'switch_stage',
      SwitchBackground = 'switch_background'
    }
  }

  export type TKeys = Record<GameKey, string>
  const default_keys_map = new Map<string, TKeys>([
    ['1', { L: 'a', R: 'd', U: 'w', D: 's', a: 'j', j: 'k', d: 'l' }],
    ['2', { L: 'arrowleft', R: 'arrowright', U: 'arrowup', D: 'arrowdown', a: '0', j: '.', d: 'enter' }],
    ['3', { L: '', R: '', U: '', D: '', a: '', j: '', d: '' }],
    ['4', { L: '', R: '', U: '', D: '', a: '', j: '', d: '' }],
    ['_', { L: '', R: '', U: '', D: '', a: '', j: '', d: '' }]
  ])

  export function get_default_keys(player_id: string): TKeys {
    return default_keys_map.get(player_id) || default_keys_map.get('_')!;
  }
}
export default Defines;