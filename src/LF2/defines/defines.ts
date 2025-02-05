import type { GameKey } from "./GameKey";
import type { IBgData } from "./IBgData";
import type { INextFrame } from "./INextFrame";
import type { IStageInfo } from "./IStageInfo";
import type { IPairByFace } from "./IPairByFace";
import { State as _State } from "./State";
export interface TFrameIdPair extends IPairByFace<string> { }
export interface TFrameIdListPair extends IPairByFace<string[]> { }
export type TTODO = any;
export type TFace = -1 | 1;
export type TTrend = -1 | 0 | 1;
export type BOOL = 1 | 0;
export namespace Defines {
  export const CLASSIC_SCREEN_WIDTH = 794;
  export const CLASSIC_SCREEN_HEIGHT = 550;
  export const DEFAULT_HP = 500;
  export const DEFAULT_MP = 500;
  export const DEFAULT_MILK_MP = 249;
  export const DEFAULT_BEER_MP = 154;
  export const DEFAULT_FALL_VALUE_MAX = 140;
  export const DEFAULT_DEFEND_VALUE_MAX = 120;
  export const DEFAULT_ITR_SHAKING = 4;
  export const DEFAULT_ITR_MOTIONLESS = 4;
  export const DEFAULT_CATCH_TIME = 680;
  export const DEFAULT_ITR_FALL = 40;
  export const DEFAULT_FALL_VALUE_DIZZY = 40;
  export const DAFUALT_QUBE_LENGTH = 24;
  export const DEFAULT_RESTING_MAX = 30;

  /**
   * 直接破防值
   */
  export const DEFAULT_FORCE_BREAK_DEFEND_VALUE = 200;

  /**
   * 默认最大回蓝速度, 血越少，回蓝越快（线性）
   *
   * @type {number}
   */
  export const DEFAULT_MP_RECOVERY_MAX_SPEED: number = 1;

  /**
   * 默认最大回蓝速度, 血越多，回蓝越慢（线性）
   *
   * @type {number}
   */
  export const DEFAULT_MP_RECOVERY_MIN_SPEED: number = 0.25;

  export const DEFAULT_HP_RECOVERY_SPEED = 0.2;

  export const VOID_STAGE: IStageInfo = {
    bg: "VOID",
    id: "VOID_STAGE",
    name: "VOID_STAGE",
    phases: [],
  };
  export const VOID_BG: IBgData = {
    type: "background",
    layers: [],
    id: "VOID_BG",
    base: {
      name: "VOID_BG",
      shadow: "",
      shadowsize: [0, 0],
      left: 0,
      right: 794,
      far: -468,
      near: -216,
    },
  };

  export enum FrameId {
    None = "",
    Auto = "auto",
    Self = "self",
    Gone = "gone",
    Invisible_Min = "1100", // 1100 ~ 1299 隐身
    Invisible_Max = "1299", // 1100 ~ 1299 隐身
  }
  export const NEXT_FRAME_GONE: Readonly<INextFrame> = {
    id: Defines.FrameId.Gone,
  };
  export const NEXT_FRAME_AUTO: Readonly<INextFrame> = {
    id: Defines.FrameId.Auto,
  };
  export const NEXT_FRAME_SELF: Readonly<INextFrame> = {
    id: Defines.FrameId.Self,
  };
  export enum WeaponType {
    None = 0,

    /**
     * 棍棒
     *
     * - 丢出方式：
     *    - 奔跑: 前 + 攻击
     *    - 空中: 前 + 攻击
     */
    Stick = 1,

    /** 重物类 */
    Heavy = 2,

    /**
     * 小刀类。
     * - 丢出方式：
     *    - 奔跑: 前 + 攻击
     *    - 空中: 前 + 攻击
     *    - 站立: 前 + 攻击
     */
    Knife = 3,

    /**
     * 棒球类
     */
    Baseball = 4,

    /**
     * 饮料
     *
     * - 丢出方式：
     *    - 奔跑: 前 + 攻击
     *    - 空中: 前 + 攻击
     *    - 冲跳: 前 + 攻击
     */
    Drink = 5,
  }

  /**
   * 朝向控制
   *
   * @export
   * @enum {number}
   */
  export enum FacingFlag {
    None = 0,

    /** 向左 */
    Left = -1,

    /** 向右 */
    Right = 1,

    Backward = 2,

    /**
     * 跟随控制器
     *
     * - entity.controller.LR == -1时，向左
     * - entity.controller.LR == 1时，向右
     * - 否则维持原方向
     * @see {BaseController.LR}
     * @see {Entity.controller}
     */
    Ctrl = 3,

    SameAsCatcher = 4,

    OpposingCatcher = 5,

    /**
     * 反向跟随控制器
     *
     * - entity.controller.LR == -1时，向右
     * - entity.controller.LR == 1时，向左
     * - 否则维持原方向
     * @see {BaseController.LR}
     * @see {Entity.controller}
     */
    AntiCtrl = 6,
  }

  export const State = _State;
  export type State = typeof _State;

  export enum EntityGroup {
    /**
     * 隐藏角色
     */
    Hidden = "hidden",

    /**
     * 常规角色
     * 属于此组的角色才可被随机到
     */
    Regular = "1000",

    /**
     * 最杂的杂鱼
     * 默认只有30和31的角色
     */
    _3000 = "3000",

    /**
     * 对战模式常规武器
     * 对战模式应当掉落属于这组的武器
     */
    VsRegularWeapon = "VsRegularWeapon",

    /**
     * 闯关常规武器
     * 闯关模式应当掉落属于这组的武器
     */
    StageRegularWeapon = "StageRegularWeapon",

    FreezableBall = "FreezableBall"
  }

  export enum CPointKind {
    /**
     * 抓人的
     */
    Attacker = 1,

    /**
     * 被抓的
     */
    Victim = 2,
  }

  export enum Cheats {
    LF2_NET = "LF2_NET",
    HERO_FT = "HERO_FT",
    GIM_INK = "GIM_INK",
  }

  export const CheatKeys: Record<Cheats, string> = {
    [Cheats.LF2_NET]: "lf2.net",
    [Cheats.HERO_FT]: "herofighter.com",
    [Cheats.GIM_INK]: "gim.ink",
  };

  export const CheatSounds: Record<Cheats, string> = {
    [Cheats.LF2_NET]: "data/m_pass.wav.mp3",
    [Cheats.HERO_FT]: "data/m_end.wav.mp3",
    [Cheats.GIM_INK]: "data/093_r.wav.mp3",
  };

  export interface ICheatInfo {
    keys: string;
    sound: string;
  }

  export const Sounds = {
    StagePass: "data/m_pass.wav.mp3",
    BattleEnd: "data/m_end.wav.mp3",
  } as const;

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
  export const KEY_HIT_DURATION: number = 20;
  export const GRAVITY: number = 0.5; // 0.38;
  export const FRICTION_FACTOR: number = 1; // 0.894427191;
  export const FRICTION: number = 0.35; // 0.35 // 0.65; // 0.2
  export const CHARACTER_BOUNCING_SPD: number = 2;
  export const CHARACTER_BOUNCING_TEST_SPD: number = -2.6;
  export const HP_RECOVERABILITY = 0.66;
  export const HP_RECOVERY_SPD = 0.05;
  export const HP_HEALING_SPD = 0.5;

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
    [Difficulty.Crazy]: "Crazy!",
  };
  export interface ITeamInfo {
    name: string;
    txt_color: string;
    txt_shadow_color: string;
  }
  export enum TeamEnum {
    Independent = "",
    Team_1 = "1",
    Team_2 = "2",
    Team_3 = "3",
    Team_4 = "4",
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
  ];
  export const TeamInfoMap: ITeamInfoMap = {
    [TeamEnum.Independent]: {
      name: "Independent",
      txt_color: "#ffffff",
      txt_shadow_color: "#000000",
    },
    [TeamEnum.Team_1]: {
      name: "Team 1",
      txt_color: "#4f9bff",
      txt_shadow_color: "#001e46",
    },
    [TeamEnum.Team_2]: {
      name: "Team 2",
      txt_color: "#ff4f4f",
      txt_shadow_color: "#460000",
    },
    [TeamEnum.Team_3]: {
      name: "Team 3",
      txt_color: "#3cad0f",
      txt_shadow_color: "#154103",
    },
    [TeamEnum.Team_4]: {
      name: "Team 4",
      txt_color: "#ffd34c",
      txt_shadow_color: "#9a5700",
    },
  };

  export enum BuiltIn_Imgs {
    RFACE = "sprite/RFACE.png",
    CM5 = "sprite/CM5.png",
    CM4 = "sprite/CM4.png",
    CM3 = "sprite/CM3.png",
    CM2 = "sprite/CM2.png",
    CM1 = "sprite/CM1.png",
    CMA = "sprite/CMA.png",
    CHARACTER_THUMB = "sprite/CHARACTER_THUMB.png",
  }
  export enum BuiltIn_Dats {
    Spark = "data/spark.json",
  }
  export enum BuiltIn_Broadcast {
    ResetGPL = "reset_gpl",
    UpdateRandom = "update_random",
    StartGame = "start_game",
    SwitchStage = "switch_stage",
    SwitchBackground = "switch_background",
  }
  export enum BuiltIn_OID {
    Template = "0",
    Julian = "52",
    Firzen = "51",
    LouisEX = "50",
    Bat = "38",
    Justin = "39",
    Knight = "37",
    Jan = "36",
    Monk = "35",
    Sorcerer = "34",
    Jack = "33",
    Mark = "32",
    Hunter = "31",
    Bandit = "30",
    Deep = "1",
    John = "2",
    Henry = "4",
    Rudolf = "5",
    Louis = "6",
    Firen = "7",
    Freeze = "8",
    Dennis = "9",
    Woody = "10",
    Davis = "11",
    Weapon0 = "100",
    Weapon_Stick = "100",
    Weapon2 = "101",
    Weapon_Hoe = "101",
    Weapon4 = "120",
    Weapon_Knife = "120",
    Weapon5 = "121",
    Weapon_baseball = "121",
    Weapon6 = "122",
    Weapon_milk = "122",
    Weapon1 = "150",
    Weapon_Stone = "150",
    Weapon3 = "151",
    Weapon_WoodenBox = "151",
    Weapon8 = "123",
    Weapon_Beer = "123",
    Weapon9 = "124",
    Weapon_Boomerang = "124",
    Weapon10 = "217",
    Weapon_LouisArmourA = "217",
    Weapon11 = "218",
    Weapon_LouisArmourB = "218",
    Criminal = "300",
    JohnBall = "200",
    HenryArrow1 = "201",
    RudolfWeapon = "202",
    DeepBall = "203",
    HenryWind = "204",
    DennisBall = "205",
    WoodyBall = "206",
    DavisBall = "207",
    HenryArrow2 = "208",
    FreezeBall = "209",
    FirenBall = "210",
    FirenFlame = "211",
    FreezeColumn = "212",
    Weapon7 = "213",
    Weapon_IceSword = "213",
    JohnBiscuit = "214",
    DennisChase = "215",
    JackBall = "216",
    JanChaseh = "219",
    JanChase = "220",
    FirzenChasef = "221",
    FirzenChasei = "222",
    FirzenBall = "223",
    BatBall = "224",
    BatChase = "225",
    JustinBall = "226",
    JulianBall = "228",
    JulianBall2 = "229",
    Etc = "998",
    BrokenWeapon = "999",
  }

  export type TKeys = Record<GameKey, string>;
  const default_keys_map = new Map<string, TKeys>([
    ["1", { L: "a", R: "d", U: "w", D: "s", a: "j", j: "k", d: "l" }],
    [
      "2",
      {
        L: "arrowleft",
        R: "arrowright",
        U: "arrowup",
        D: "arrowdown",
        a: "0",
        j: ".",
        d: "enter",
      },
    ],
    ["3", { L: "", R: "", U: "", D: "", a: "", j: "", d: "" }],
    ["4", { L: "", R: "", U: "", D: "", a: "", j: "", d: "" }],
    ["_", { L: "", R: "", U: "", D: "", a: "", j: "", d: "" }],
  ]);

  export function get_default_keys(player_id: string): TKeys {
    return default_keys_map.get(player_id) || default_keys_map.get("_")!;
  }
}
export default Defines;