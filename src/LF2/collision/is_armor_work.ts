import { ICollision } from "../base";
import { ItrEffect, Defines, ArmorEnum, SparkEnum, StateEnum } from "../defines";


export function is_armor_work(collision: ICollision): boolean {
  const { victim, bframe, attacker } = collision;
  const { armor } = victim;
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
  if (bframe.state === StateEnum.Attacking && armor?.fulltime === false) {
    return false;
  }
  if (!armor || victim.toughness <= 0) return false;
  const { itr } = collision;
  const { effect } = itr;
  if (!armor.fireproof && (
    effect === ItrEffect.Fire ||
    effect === ItrEffect.MFire1 ||
    effect === ItrEffect.MFire2 ||
    effect === ItrEffect.FireExplosion
  )) return false;

  if (!armor.antifreeze && (
    effect === ItrEffect.Ice2 ||
    effect === ItrEffect.Ice
  )) return false;

  const { bdefend = Defines.DEFAULT_BREAK_DEFEND_VALUE } = itr;
  if (bdefend >= Defines.DEFAULT_FORCE_BREAK_DEFEND_VALUE) return false;

  const { a_cube, b_cube } = collision;
  const { fall_value_max } = victim;
  const { type, hit_sounds, dead_sounds = hit_sounds } = armor;
  const { fall = Defines.DEFAULT_ITR_FALL } = itr;
  let decrease_value = 0;
  switch (type) {
    case ArmorEnum.Fall: decrease_value = fall; break;
    case ArmorEnum.Defend: decrease_value = bdefend; break;
  }
  victim.toughness -= decrease_value;
  const [x, y, z] = victim.spark_point(a_cube, b_cube);
  const spark_type = fall >= fall_value_max - Defines.DEFAULT_FALL_VALUE_DIZZY ?
    SparkEnum.SlientCriticalHit :
    SparkEnum.SlientHit;
  victim.world.spark(x, y, z, spark_type);
  const sounds = victim.toughness > 0 ? hit_sounds : dead_sounds;
  if (sounds) for (const s of sounds) victim.lf2.sounds.play(s, x, y, z);
  victim.shaking = itr.shaking ?? collision.attacker.world.itr_shaking;
  victim.velocities.length = 1;
  victim.velocity_0.x = 0;
  victim.velocity_0.y = 0;
  victim.velocity_0.z = 0;
  return true;
}
