
export enum StateEnum {
  _Entity_Base = -1, _Character_Base = -2, _Weapon_Base = -3, _Ball_Base = -4,

  Standing = 0, _0 = 0,
  Walking = 1, _1 = 1,
  Running = 2, _2 = 2, _3 = 3,
  Attacking = 3, _4 = 4,
  Jump = 4, _5 = 5,
  Dash = 5, _6 = 6,
  Rowing = 6,

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

  _9 = 9,
  Catching = 9, _10 = 10,
  Caught = 10, _11 = 11,
  Injured = 11, _12 = 12,
  Falling = 12, _13 = 13,
  Frozen = 13, _14 = 14,
  Lying = 14,

  Normal = 15, _15 = 15, _16 = 16,
  Tired = 16,

  /**
   * 消耗手中物品
   */
  Drink = 17, _17 = 17,

  /**
   *
   */
  Burning = 18, _18 = 18,

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

  Weapon_Brokens = 9999, _9999 = 9999,

  /**
   * 被存在变过的人时，此才允许进入state为500的frame。
   * rudolf抓人变身后，才能dja，你懂的。
   *
   * 但现在Wemake中，改为has_transform_data判断。
   */
  TransformToCatching_Begin = 500, _500 = 500,

  /**
   * 变成最后一次曾经变过的人（rudolf的变身效果）
   */
  TransformToCatching_End = 501, _501 = 501,

  /**
   * 原LF2的Louis爆甲
   * 但现在Wemake中，爆甲是通过opoint实现的。
   */
  LouisCastOff = 9996, _9996 = 9996,

  TransformToLouisEx = 9996, _9995 = 9995
}
