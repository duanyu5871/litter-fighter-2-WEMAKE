export enum CollisionVal {
  /**
   * 攻击者类型
   */
  AttackerType = "attacker_type",

  /**
   * 被攻击者类型
   */
  VictimType = "victim_type",

  /** 
   * 被攻击者是否为当前跟踪对象 
   */
  VictimIsChasing = "victim_is_chasing",

  ItrEffect = "itr_effect",
  ItrKind = "itr_kind",
  SameFacing = "same_facing",
  AttackerState = "attacker_state",
  VictimState = "victim_state",
  AttackerHasHolder = "attacker_has_holder",
  VictimHasHolder = "victim_has_holder",
  AttackerHasHolding = "attacker_has_holding",
  VictimHasHolding = "victim_has_holding",
  SameTeam = "same_team",
  AttackerOID = "attacker_oid",
  VictimOID = "victim_oid",
  BdyKind = "bdy_kind",
  VictimFrameId = "victim_frame_id",
  VictimFrameIndex_ICE = "victim_frame_index_ice",
  ItrFall = "itr_fall",
  AttackerThrew = "attacker_threw",
  VictimThrew = "victim_threw",
  VictimIsFreezableBall = "victim_freezable_ball",
  AttackerIsFreezableBall = "attacker_freezable_ball",
  ArmorWork = "armor_work",
  V_FrameBehavior = "v_frame_behavior",
  NoItrEffect = "no_itr_effect",
  A_HP_P = "a_hp_p",
  V_HP_P = "v_hp_p",
  LF2_NET_ON = "lf2_net_on",
  BdyHitFlag = "bdy_hit_flag",
  ItrHitFlag = "itr_hit_flag",
  BdyCode = "bdy_code",
  ItrCode = "itr_code",
}
export const C_Val = CollisionVal;
export type C_Val = CollisionVal;