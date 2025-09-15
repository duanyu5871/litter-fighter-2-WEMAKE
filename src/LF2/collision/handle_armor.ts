import { ICollision } from "../base";
import { ArmorEnum, Defines, ItrEffect, SparkEnum, StateEnum } from "../defines";
import { floor } from "../utils";
import { handle_injury } from "./handle_injury";
import { handle_rest } from "./handle_rest";

/**
 * 护甲逻辑
 *
 * @export
 * @param {ICollision} collision 碰撞信息
 * @return {boolean} 护甲是否有效
 */
export function handle_armor(collision: ICollision): boolean {
  const { victim, attacker } = collision;
  const { armor } = victim;

  /* 无护甲 或 护甲耐久为0 */
  if (!armor || victim.toughness <= 0)
    return false;

  /* 受击帧护甲无效 */
  const { bframe } = collision
  if (
    bframe.state === StateEnum.Caught ||
    bframe.state === StateEnum.Injured ||
    bframe.state === StateEnum.Falling ||
    bframe.state === StateEnum.Frozen ||
    bframe.state === StateEnum.Lying ||
    bframe.state === StateEnum.Tired ||
    bframe.state === StateEnum.Defend ||
    bframe.state === StateEnum.BrokenDefend ||
    bframe.state === StateEnum.Burning
  ) {
    return false;
  }

  /* 非全时护甲时，站立、行走、奔跑、跳跃、跑跳以外的帧无效 */
  if (armor?.fulltime === false && (
    StateEnum.Standing !== bframe.state &&
    StateEnum.Walking !== bframe.state &&
    StateEnum.Running !== bframe.state &&
    StateEnum.Jump !== bframe.state &&
    StateEnum.Dash !== bframe.state
  )) {
    return false;
  }
  const { itr } = collision;
  const { effect } = itr;

  /* 判断是否防火 */
  if (!armor.fireproof && (
    effect === ItrEffect.Fire ||
    effect === ItrEffect.MFire1 ||
    effect === ItrEffect.MFire2 ||
    effect === ItrEffect.FireExplosion
  )) return false;

  /* 判断是否防冰 */
  if (!armor.antifreeze && (
    effect === ItrEffect.Ice2 ||
    effect === ItrEffect.Ice
  )) return false;

  /* 判断是否强制破防 */
  const { bdefend = 0 } = itr;
  if (bdefend >= Defines.DEFAULT_FORCE_BREAK_DEFEND_VALUE) return false;

  const { aframe } = collision;
  if (aframe.state === StateEnum.Ball_3006) return false;

  const { a_cube, b_cube } = collision;
  const {
    type,
    hit_sounds,
    injury_ratio = Defines.DEFAULT_ARMOR_INJURY_RATIO,
    motionless_ratio = Defines.DEFAULT_ARMOR_MOTIONLESS_RATIO,
    shaking_ratio = Defines.DEFAULT_ARMOR_SHAKING_RATIO,
    dead_sounds = hit_sounds
  } = armor;
  const { fall = Defines.DEFAULT_ITR_FALL, injury = 0 } = itr;
  let decrease_value = 0;
  switch (type) {
    case ArmorEnum.Fall: decrease_value = fall; break;
    case ArmorEnum.Defend: decrease_value = bdefend; break;
    case ArmorEnum.Times: decrease_value = 1; break;
    case ArmorEnum.Injury: decrease_value = injury; break;
  }
  victim.toughness -= decrease_value;
  const [x, y, z] = victim.spark_point(a_cube, b_cube);
  const spark_type = fall >= Defines.DEFAULT_FALL_VALUE_CRITICAL ?
    SparkEnum.SlientCriticalHit :
    SparkEnum.SlientHit;
  victim.world.spark(x, y, z, spark_type);
  const sounds = victim.toughness > 0 ? hit_sounds : dead_sounds;
  if (sounds) for (const s of sounds) victim.lf2.sounds.play(s, x, y, z);
  const {
    shaking = victim.world.itr_shaking,
    motionless = victim.world.itr_motionless
  } = itr
  attacker.motionless = floor(motionless_ratio * motionless);
  victim.shaking = floor(shaking_ratio * shaking);
  victim.velocities.length = 1;
  victim.velocity_0.x = 0;
  victim.velocity_0.y = 0;
  victim.velocity_0.z = 0;
  handle_rest(collision)
  handle_injury(collision, injury_ratio)
  return true;
}
