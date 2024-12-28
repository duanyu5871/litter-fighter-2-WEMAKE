export enum EntityVal {
  /**
   * X轴运动趋势
   * 当X轴速度为0时，有trend_x==0，
   * 速度与朝向一致时，有trend_x==1，
   * 速度与朝向不一致时，有trend_x==-1，
   */
  TrendX = "trend_x",

  PressFB = "press_F_B",
  PressUD = "press_U_D",
  PressLR = "press_L_R",

  /** 角色手持的武器类型 */
  WeaponType = "weapon_type",

  /**
   * 剩余血量占比(0~100)
   */
  HP_P = "hp_p",

  LF2_NET_ON = "lf2_net_on",
  HERO_FT_ON = "hero_ft_on",
  GIM_INK_ON = "gim_ink_on",
  HAS_TRANSFROM_DATA = "has_transform_data",

  Catching = "catching",
  CAUGHT = "caught",

  /**
   * 角色是否应该使用重击
   */
  RequireSuperPunch = "super_punch",

  HitByCharacter = "hit_by_character",
  HitByWeapon = "hit_by_weapon",
  HitByBall = "hit_by_ball",
  HitByState = "hit_by_state",

  HitByItrKind = "hit_by_itr_kind",
  HitByItrEffect = "hit_by_itr_effect",

  HitOnCharacter = "hit_on_character",
  HitOnWeapon = "hit_on_weapon",
  HitOnBall = "hit_on_ball",
  HitOnState = "hit_on_state",
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
