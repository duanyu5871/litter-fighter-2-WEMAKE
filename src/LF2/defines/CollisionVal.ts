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
  ArmorWork = "armor_work"
}
