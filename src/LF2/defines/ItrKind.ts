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

  /** 
   * 武器挥动 
   */
  WeaponSwing = 5,

  /**
   * 敌人靠近按A时是重击
   */
  SuperPunchMe = 6,

  /**
   * 当角色的itr与武器的bdy碰撞，且武器的frame.state为1004(Weapon_OnGround)时
   *
   * 角色此时立刻应捡起武器
   *
   * @see {Defines.State.Weapon_OnGround}
   */
  PickSecretly = 7,

  Heal = 8,// injury数值变成治疗多少hp，动作跳至dvx ?

  /*
   * 用于：
   * * [X] LF2
   * * [X] WEMAKE
   *
   * - 原版：
   *    - 打中敌人自己hp归0(如John的防护罩)
   *    - 反弹state3000与3002的ball
   */
  JohnShield = 9, _9 = 9,

  MagicFlute = 10,// henry魔王之乐章效果
  Block = 14,// 阻挡
  Fly = 15,// 飞起 ??
  Ice = 16

}
