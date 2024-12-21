import type { GameKey } from "./GameKey";
import type { IBgData } from "./IBgData";
import type { IStageInfo } from "./IStageInfo";

export namespace Defines {
  export enum OpointSpreading {
    Normal = 0,
    Bat = 1,
  }

  export enum FrameBehavior {
    _01 = 1,//= 追敌人的center(因为敌人站在地面，所以会下飘)
    _02 = 2,//= 水平追敌
    _03 = 3,//= 加速法追敌(追纵力较差)
    _04 = 4,//= 天使之祝福(别的dat档用了无效)
    _05 = 5,//= 天使之祝福的开始(会追我方的人物很久)
    _06 = 6,//= 恶魔之审判的开始(视敌人数目而增加，基本上是一个)
    _07 = 7,//= 恶魔之审判,殃殒天降(可以做出打到地面的追踪波)

    /**
     * 用于：
     * * [X] LF2
     * * [X] WEMAKE
     * 
     * 吸血蝙蝠的开始
     * 
     * - LF2中：
     *    - ball类的frame的hit_FA=8时，将会生成id: 225的对象。
     *    - 生成与敌人相当数量的对象，但不少于三个。
     *    - 仅限于id: 225
     * 
     * - WEMAKE中：
     *    - 此值不会有任何作用（但依旧保留）
     *    - 生成将通过opoint被实现
     */
    BatStart = 8, _08 = 8,


    _09 = 9,//= 殃殒天降的开始(视敌人数目而增加，基本数值是四个)
    _10 = 10,//= 加速(从慢变快)
    _11 = 11,//= 极地火山
    _12 = 12,//= 吸血蝙蝠

    /**
     * 用于：
     * * [X] LF2
     * * [X] WEMAKE
     * 
     * 连环重炮的开始
     * 
     * - LF2中：
     *    ball类的frame的hit_FA=13时，将会生成一个JulianBall。
     * 
     * - WEMAKE中：
     *    - 此值不会有任何作用（但依旧保留）
     *    - 生成将通过opoint被实现
     */
    JulianBallStart = 13, _13 = 13,

    /**
     * 连环重炮
     */
    JulianBall = 14, _14 = 14,
  }
  export const OLD_SCREEN_WIDTH = 794;
  export const OLD_SCREEN_HEIGHT = 550;
  export const DAFUALT_HP = 500;
  export const DEFAULT_MP = 500;
  export const DEFAULT_MILK_MP = 249;
  export const DEFAULT_BEER_MP = 154;
  export const DEFAULT_FALL_VALUE_MAX = 140
  export const DEFAULT_DEFEND_VALUE_MAX = 120
  export const DEFAULT_ITR_SHAKEING = 6;
  export const DEFAULT_ITR_MOTIONLESS = 6;
  export const DAFUALT_CATCH_TIME = 680;
  export const DEFAULT_ITR_FALL = 40
  export const DEFAULT_FALL_VALUE_DIZZY = 40;

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
    phases: []
  }
  export const VOID_BG: IBgData = {
    type: 'background',
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
    HAS_TRANSFROM_DATA = "has_transform_data",

    Catching = "catching",
    CAUGHT = "caught",

    /**
     * 角色是否应该使用重击
     */
    RequireSuperPunch = 'super_punch',

    HitByCharacter = 'hit_by_character',
    HitByWeapon = 'hit_by_weapon',
    HitByBall = 'hit_by_ball',
    HitByState = 'hit_by_state',

    HitByItrKind = 'hit_by_itr_kind',
    HitByItrEffect = 'hit_by_itr_effect',

    HitOnCharacter = 'hit_on_character',
    HitOnWeapon = 'hit_on_weapon',
    HitOnBall = 'hit_on_ball',
    HitOnState = 'hit_on_state',
    /** 
     * 击中物品的数量
     */
    HitOnSth = "hit_on_something",
    HP = "hp",
    MP = "mp",
    VX = "vx",
    VY = "vy",
    VZ = "vz",
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
  export enum State {
    _Entity_Base = -1,
    _Character_Base = -2,
    _Weapon_Base = -3,
    _Ball_Base = -4,


    Standing = 0, _0 = 0,
    Walking = 1, _1 = 1,
    Running = 2, _2 = 2,
    _3 = 3, Attacking = 3,
    _4 = 4, Jump = 4,
    _5 = 5, Dash = 5,
    _6 = 6, Rowing = 6,


    /** 
     * [LF2 & WEMAKE]
     * 防御状态
     * 
     * 此状态下：
     *    - 防御值不会恢复
     * 
     * @see {Entity.self_update}
     */
    Defend = 7, _7 = 7,

    /** 
     * [LF2 & WEMAKE]
     * 破防
     * 
     * 此状态下：
     *    - 防御值不会恢复
     * 
     * @see {Entity.self_update}
     */
    BrokenDefend = 8, _8 = 8,

    _9 = 9, Catching = 9,
    _10 = 10, Caught = 10,
    _11 = 11, Injured = 11,
    _12 = 12, Falling = 12,
    _13 = 13, Frozen = 13,
    _14 = 14, Lying = 14,

    Normal = 15, _15 = 15,
    _16 = 16, Tired = 16,

    /**
     * 消耗手中物品
     */
    Drink = 17, _17 = 17,
    _18 = 18, Burning = 18,

    /**
     * 原版中：此state，支持根据上下键与dvz控制角色Z轴移动，比如Firen的D>J。
     * 
     * WEMAKE中，实现方式有所变动：
     *    改成上下键与speedz配合，控制角色Z轴移动速度。
     *    speedz可用于任意帧中。
     */
    BurnRun = 19, _19 = 19,


    /** 
     * 此状态下，在空中时(position.y > 0)，wait结束不会进入到next中.
     * 
     * 但会在落地(position.y == 0)时进入next
     */
    NextAsLanding = 100, _100 = 100,

    /**
     * 原版中：此state，用于支持根据上下键与dvz控制角色Z轴移动，比如Deep的D>J。
     * 
     * WEMAKE中，实现方式有所变动：
     *    改成上下键与speedz配合，控制角色Z轴移动速度。
     *    speedz可用于任意帧中。
     */
    Z_Moveable = 301, _301 = 301,

    TeleportToNearestEnemy = 400,
    TeleportToFarthestAlly = 401,

    Weapon_InTheSky = 1000,
    Weapon_OnHand = 1001,
    Weapon_Throwing = 1002,
    Weapon_Rebounding = 1003,
    Weapon_OnGround = 1004,

    HeavyWeapon_InTheSky = 2000,
    HeavyWeapon_OnHand = 2001,
    HeavyWeapon_Throwing = 2002,//= 重型武器在地上
    HeavyWeapon_OnGround = 2004,//= 与itr kind2作用

    Ball_Flying = 3000, _3000 = 3000,
    Ball_Hitting = 3001, _3001 = 3001,
    Ball_Hit = 3002, _3002 = 3002,
    Ball_Rebounding = 3003, _3003 = 3003,
    Ball_Disappear = 3004, _3004 = 3004,
    Ball_3005 = 3005, _3005 = 3005,
    Ball_3006 = 3006, _3006 = 3006,

    TransformTo_Min = 8001, _8001 = 8001,

    TransformTo_Max = 8999, _8999 = 8999,

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
     * 原LF2的Louis爆甲
     * 但现在Wemake中，爆甲是通过opoint实现的。
     */
    LouisCastOff = 9996, _9996 = 9996,

    TransformToLouisEx = 9996,
    _9995 = 9995,
  }

  export enum EntityEnum {
    Character = 'character',
    Weapon = 'weapon',
    Ball = 'ball',
  }

  export enum EntityGroup {
    /** 
     * 隐藏角色 
     */
    Hidden = 'hidden',

    /** 
     * 常规角色 
     * 属于此组的角色才可被随机到
     */
    Regular = '1000',

    /** 
     * 最杂的杂鱼 
     * 默认只有30和31的角色
     */
    _3000 = '3000',


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
  }


  export enum BdyKind {
    /**
     * [LF2][WEMAKE]
     */
    Normal = 0,

    /**
     * [LF2][WEMAKE]
     * 
     * - 原版lf2中
     *    - kind: 10xx是id为300的“人质”专用的，被攻击时跳至xx帧，
     * 且仅有特定类型才能击中此bdy。以此实现被攻击后跳转的逻辑。
     * 
     * - WEMAKE中：
     *    - kind: 1XXX, 被攻击时调至，被攻击时跳至“XXX”帧。
     */
    GotoMin = 1000,

    /**
     * 参见GotoMin
     * 
     * @see {BdyKind.GotoMin}
     */
    GotoMax = 1999,

    /**
     * [WEMAKE ONLY]
     * 这是WEMAKE新增的kind，用于代替原版frame.state为Defend“防御动作”的bdy
     * 处于此状态的物体, 正面迎接伤害时，扣除防御值(defend_value -= itr.bdefend)
     *    - 当itr.bdefend >= 100，则视为被直接击中
     *    - 当defend_value>0：
     *      - 若bdy.hit_act存在，则进入bdy.hit_act;
     *      - 若bdy.hit_act不存在，则视为被直接击中
     *    - 当defend_value<=0：
     *      - 若bdy.break_act存在，则进入bdy.break_act;
     *      - 若bdy.break_act不存在，则视为被直接击中
     */
    Defend = 2000,
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
  export const KEY_HIT_DURATION: number = 20;
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

  export enum BuiltIn_Imgs {
    RFACE = 'sprite/RFACE.png',
    CM5 = 'sprite/CM5.png',
    CM4 = 'sprite/CM4.png',
    CM3 = 'sprite/CM3.png',
    CM2 = 'sprite/CM2.png',
    CM1 = 'sprite/CM1.png',
    CMA = 'sprite/CMA.png',
    CHARACTER_THUMB = 'sprite/CHARACTER_THUMB.png',
  }
  export enum BuiltIn_Dats {
    Spark = 'data/spark.json',
  }
  export enum BuiltIn_Broadcast {
    ResetGPL = 'reset_gpl',
    UpdateRandom = 'update_random',
    StartGame = 'start_game',
    SwitchStage = 'switch_stage',
    SwitchBackground = 'switch_background'
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