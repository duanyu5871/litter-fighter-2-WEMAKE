import { Builtin_FrameId } from "./Builtin_FrameId";
import { CheatType } from "./CheatType";
import { Difficulty } from "./Difficulty";
import type { GameKey } from "./GameKey";
import type { IBgData } from "./IBgData";
import type { INextFrame } from "./INextFrame";
import type { IPairByFace } from "./IPairByFace";
import type { IStageInfo } from "./IStageInfo";
import { TeamEnum as _TeamEnum } from "./TeamEnum";
export interface TFrameIdPair extends IPairByFace<string> { }
export interface TFrameIdListPair extends IPairByFace<string[]> { }
export type TTODO = any;
export type TFace = -1 | 1;
export type TTrend = -1 | 0 | 1;
export type BOOL = 1 | 0;
export namespace Defines {
  export const TeamEnum = _TeamEnum;
  export type TeamEnum = _TeamEnum;
  export const CLASSIC_SCREEN_WIDTH = 794;
  export const CLASSIC_SCREEN_HEIGHT = 550;
  export const MODERN_SCREEN_WIDTH = 794;
  export const MODERN_SCREEN_HEIGHT = 450;

  export const DEFAULT_HP = 500;
  export const DEFAULT_MP = 500;
  export const DEFAULT_MILK_MP = 249;
  export const DEFAULT_BEER_MP = 154;
  export const DEFAULT_FALL_VALUE_MAX = 140;
  export const DEFAULT_DEFEND_VALUE_MAX = 120;

  /**
   * 默认值：被击中的对象晃动多少帧
   *
   * @type {number}
   */
  export const DEFAULT_ITR_SHAKING: number = 4;

  /**
   * 默认值：击中敌人的对象停顿多少帧
   *
   * @type {number}
   * @memberof World
   */
  export const DEFAULT_ITR_MOTIONLESS: number = 4;
  export const DEFAULT_CATCH_TIME: number = 680;
  export const DEFAULT_ITR_FALL: number = 40;

  /**
   * 默认值：当角色fall_value低于DEFAULT_FALL_VALUE_DIZZY时，角色应当进入眩晕状态
   *
   * @type {number}
   * @memberof World
   */
  export const DEFAULT_FALL_VALUE_DIZZY: number = 40;

  export const DAFUALT_QUBE_LENGTH: number = 24;
  export const DEFAULT_RESTING_MAX: number = 30;
  export const DEFAULT_TOUGHNESS_RESTING_MAX: number = 30;

  /**
   * 默认值：角色进入场地时的闪烁无敌时间
   *
   * @type {number}
   */
  export const DEFAULT_BEGIN_BLINK_TIME: number = 144;

  /**
   * 默认值：倒地起身后的闪烁无敌时间
   *
   * @type {number}
   */
  export const DEFAULT_LYING_BLINK_TIME: number = 32;

  /**
   * 默认值：“非玩家角色”死亡时后的闪烁时间
   *
   * @type {number}
   */
  export const DEFAULT_GONE_BLINK_TIME: number = 56;


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
  /**
   * 默认值：dvx缩放系数
   *
   * @type {number}
   * @memberof World
   */
  export const DEFAULT_FVX_F: number = 1;

  /**
   * 默认值：dvy缩放系数
   *
   * @type {number}
   * @memberof World
   */
  export const DEFAULT_FVY_F: number = 1;

  /**
   * 默认值：dvz缩放系数
   *
   * @type {number}
   * @memberof World
   */
  export const DEFAULT_FVZ_F: number = 1;

  /**
   * 默认值：X轴丢人初速度缩放系数
   *
   * @type {number}
   */
  export const DEFAULT_TVX_F: number = 1;

  /**
   * 默认值：Y轴丢人初速度缩放系数
   *
   * @type {number}
   */
  export const DEFAULT_TVY_F: number = 1.3;

  /**
   * 默认值：Z轴丢人初速度缩放系数
   *
   * @type {number}
   */
  export const DEFAULT_TVZ_F: number = 1;


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
  export const VOID_STAGE: IStageInfo = {
    bg: VOID_BG.id,
    id: "VOID_STAGE",
    name: "VOID_STAGE",
    phases: [],
  };

  export const NEXT_FRAME_GONE: Readonly<INextFrame> = {
    id: Builtin_FrameId.Gone,
  };
  export const NEXT_FRAME_AUTO: Readonly<INextFrame> = {
    id: Builtin_FrameId.Auto,
  };
  export const NEXT_FRAME_SELF: Readonly<INextFrame> = {
    id: Builtin_FrameId.Self,
  };

  export const CheatKeys: Record<CheatType, string> = {
    [CheatType.LF2_NET]: "lf2.net",
    [CheatType.HERO_FT]: "herofighter.com",
    [CheatType.GIM_INK]: "gim.ink",
  };

  export const CheatTypeSounds: Record<CheatType, string> = {
    [CheatType.LF2_NET]: "data/m_pass.wav.mp3",
    [CheatType.HERO_FT]: "data/m_end.wav.mp3",
    [CheatType.GIM_INK]: "data/093_r.wav.mp3",
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
  export const FRICTION_X: number = 0.35; // 0.35 // 0.65; // 0.2
  export const FRICTION_Z: number = 0.35; // 0.35 // 0.65; // 0.2
  export const CHARACTER_BOUNCING_SPD: number = 2;
  export const CHARACTER_BOUNCING_TEST_SPD: number = -2.6;
  export const HP_RECOVERABILITY = 0.66;
  export const HP_RECOVERY_SPD = 0.05;
  export const HP_HEALING_SPD = 0.5;


  export const DifficultyLabels: Record<Difficulty, string> = {
    [Difficulty.Easy]: "easy",
    [Difficulty.Normal]: "normal",
    [Difficulty.Difficult]: "difficult",
    [Difficulty.Crazy]: "crazy",
  };
  export interface ITeamInfo {
    name: string;
    txt_color: string;
    txt_shadow_color: string;
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
    SwitchBackground = "switch_background"
  }
  export enum BuiltIn_Sounds {
    Cancel = "cancel",
    End = "end",
    Join = "join",
    Ok = "ok",
    Pass = "pass",
  }
  export type TBuiltIn_Sounds = BuiltIn_Sounds | "cancel" | "end" | "join" | "ok" | "pass"


  export type TKeys = Record<GameKey, string>;
  export const default_keys_map: ReadonlyMap<string, TKeys> = new Map<string, TKeys>([
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
  export const SHORT_KEY_CODES: { [x in string]?: string } = {
    ARROWUP: "↑",
    ARROWDOWN: "↓",
    ARROWLEFT: "←",
    ARROWRIGHT: "→",
    DELETE: "DEL",
    PAGEDOWN: "PG↓",
    PAGEUP: "PG↑",
  }

  export const DEFAULT_BREAK_DEFEND_VALUE = 32;
}

export default Defines;