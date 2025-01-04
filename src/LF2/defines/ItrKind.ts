import type { IItrInfo } from "./IItrInfo";
export enum ItrKind {
  /**
   * 拳击
   * 可配合effect
   *
   * 用于：
   * * [X] LF2
   * * [X] WEMAKE
   */
  Normal = 0,
  _0 = 0,

  /**
   * 抓起眩晕的角色
   *
   * 当角色1的itr与角色2的bdy碰撞，且角色2的frame.state为16(Tired)时
   * 角色1捉起角色2
   * 然后角色1进入抓人动作
   * 然后角色2进入被抓动作
   *
   * 用于：
   * * [X] LF2
   * * [X] WEMAKE
   *
   * @see {Defines.State.Tired}
   * @see {IItrInfo.catchingact} 角色1进入抓人动作
   * @see {IItrInfo.caughtact} 角色2进入被抓动作
   */
  Catch = 1,

  /**
   * 捡起武器，且进入捡武器的动作
   *
   * 当角色的itr与武器的bdy碰撞，
   * 且武器的frame.state为1004(Weapon_OnGround)或2004(HeavyWeapon_OnGround)时
   *
   * 用于：
   * * [X] LF2
   * * [X] WEMAKE
   *
   * WEMAKE中，该碰撞判定通过IItrInfo.test设置。
   *
   * @see {IItrInfo.test}
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
   * 用于：
   * * [X] LF2
   * * [X] WEMAKE
   *
   * @see {IItrInfo.catchingact} 角色1进入抓人动作
   * @see {IItrInfo.caughtact} 角色2进入被抓动作
   */
  ForceCatch = 3,

  /**
   * 被丢出时，此itr才生效
   *
   * 用于：
   * * [X] LF2
   * * [X] WEMAKE
   */
  CharacterThrew = 4,

  /**
   * 武器挥动
   *
   * 用于：
   * * [X] LF2
   * * [X] WEMAKE
   */
  WeaponSwing = 5,

  /**
   * 敌人按A使用重击
   *
   * 用于：
   * * [X] LF2
   * * [X] WEMAKE
   */
  SuperPunchMe = 6,

  /**
   * 立刻捡起武器
   *
   * 当角色的itr与武器的bdy碰撞，且武器的frame.state为1004(Weapon_OnGround)时
   *
   * 用于：
   * * [X] LF2
   * * [X] WEMAKE
   *
   * WEMAKE中，该碰撞判定通过IItrInfo.test设置。
   *
   * @see {IItrInfo.test}
   * @see {Defines.State.Weapon_OnGround}
   */
  PickSecretly = 7,

  /**
   * 
   * 用于：
   * * [X] LF2
   * * [X] WEMAKE
   * 
   * 治疗
   * 
   * - 原版：
   *    - injury数值变成治疗多少hp，动作跳至dvx ?
   *    - 可治疗队友
   * 
   * - WEMAKE：
   *    - injury数值变成治疗多少hp
   *    - 可治疗队友：通过friendly_fire实现
   *    - 动作跳转：通过hit_act实现
   */
  Heal = 8, 

  /**
   * 用于：
   * * [X] LF2
   * * [X] WEMAKE
   *
   * - 原版：
   *    - 打中敌人自己hp归0(如John的防护罩)
   *    - 反弹state3000与3002的ball
   */
  JohnShield = 9,
  _9 = 9,

  /**
   *  henry d^j
   *
   *  用于：
   *  * [X] LF2
   *  * [X] WEMAKE
   */
  MagicFlute = 10,
  MagicFlute2 = 11,

  Block = 14, // 阻挡

  /**
   *  freeze d^j 飞起来的效果
   *
   *  用于：
   *  * [X] LF2
   *  * [X] WEMAKE
   *
   */
  Whirlwind = 15,
  _15 = 15,

  Freeze = 16,
  _16 = 16,
}
