import { ICharacterData, IWeaponData } from ".";
import { IBgData } from "./IBgData";
import { IStageInfo } from "./IStageInfo";

export namespace Defines {
  export const OLD_SCREEN_WIDTH = 794;
  export const OLD_SCREEN_HEIGHT = 550;
  export const HP = 500;
  export const MP = 500;

  export const MP_RECOVERY_MAX_SPEED = 0.8;
  export const MP_RECOVERY_MIN_SPEED = 0.2;
  export const HP_RECOVERY_SPEED = 0.2;

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
    TrendX = 'trend_x',
    PressFB = 'press_F_B',
    PressUD = 'press_U_D',
    WeaponType = 'weapon_type',
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
    Stick = 1,// 棍棒类。
    Heavy = 2,// 重物类，双手举起丢出
    Knife = 3,// 小刀类，与棍棒类几乎一致，但站立时前A会丢出。
    Baseball = 4,// 棒球类，只能丢。
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
    Standing = 0,
    Walking = 1,
    Running = 2,
    Attacking = 3,
    Jump = 4,
    Dash = 5,
    Defend = 7,
    BrokenDefend = 8,
    Catching = 9,
    Caught = 10,
    Injured = 11,
    Falling = 12,
    Frozen = 13,
    Lying = 14,
    Normal = 15,
    Tired = 16,

    // 15,
    Burning = 18,

    BurnRun = 19,
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

    TurnIntoMin = 8001,// 
    TurnIntoMax = 8999,// 
    TurnIntoLouisEX = 9995,
    Gone = 9998,
  }
  export enum EntityEnum {
    Character = 'character',
    Weapon = 'weapon',
    Ball = 'ball',
  }
  export enum ItrKind {
    /** */
    Normal = 0,

    /** 捉住暈眩(state 16) 的人 */
    Catch = 1,

    /** 捡起武器 */
    Pick = 2,

    /** 强行抓人 */
    ForceCatch = 3,

    /** 被丢出时，此itr才生效 */
    CharacterThrew = 4,

    SuperPunchMe = 6, // 敵人靠近按A時是重击

    /** 捡起武器，但动作不变 */
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
    Hidden = 'Hidden',
    Fn = 'Fn',
  }
  export const CheatKeys: Record<Cheats, string> = {
    [Cheats.Hidden]: "lf2.net",
    [Cheats.Fn]: "herofighter.com"
  }
  export const CheatSounds: Record<Cheats, string> = {
    [Cheats.Hidden]: "data/m_pass.wav.ogg",
    [Cheats.Fn]: "data/m_end.wav.ogg"
  }
  export interface ICheatInfo {
    keys: string;
    sound: string;
  }

  export const Sounds = {
    StagePass: "data/m_pass.wav.ogg",
    BattleEnd: "data/m_end.wav.ogg"
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
  export const GRAVITY: number = 0.4;
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

  export enum BuiltInImg {
    RFACE = 'sprite/RFACE.png',
    CM5 = 'sprite/CM5.png',
    CM4 = 'sprite/CM4.png',
    CM3 = 'sprite/CM3.png',
    CM2 = 'sprite/CM2.png',
    CM1 = 'sprite/CM1.png',
  }
} 